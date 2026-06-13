"""
API route definitions for VideoCapsule.
"""

from __future__ import annotations

import json
import traceback
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.note import Note
from app.services import ai_juicer, note_service, video_extractor

router = APIRouter()


# ---------------------------------------------------------------------------
# Request / Response schemas
# ---------------------------------------------------------------------------

class Envelope(BaseModel):
    """Standard response envelope."""
    success: bool
    data: Any = None
    error: str | None = None


class VideoURLRequest(BaseModel):
    url: str = Field(..., min_length=1, description="Douyin share link or text containing one")


class ExtractRequest(BaseModel):
    url: str = Field(..., min_length=1, description="Douyin share link or text containing one")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _ok(data: Any) -> dict:
    return {"success": True, "data": data, "error": None}


def _err(msg: str) -> dict:
    return {"success": False, "data": None, "error": msg}


# ---------------------------------------------------------------------------
# Content type display labels (for progress messages)
# ---------------------------------------------------------------------------

_TYPE_LABELS: dict[str, str] = {
    "recipe": "食谱",
    "insight": "洞察",
    "history": "历史",
    "product": "产品",
    "general": "通用知识",
}


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get("/api/health")
def health_check() -> dict:
    """Simple liveness probe."""
    return _ok({"status": "ok", "service": "videocapsule"})


@router.post("/api/video/info")
def get_video_info(body: VideoURLRequest) -> dict:
    """Parse a Douyin link and return video metadata without downloading."""
    try:
        info = video_extractor.parse_video_info(body.url)
        return _ok(info)
    except Exception as exc:
        return _err(f"解析视频链接失败: {exc}")


@router.post("/api/extract")
def extract(body: ExtractRequest, db: Session = Depends(get_db)) -> dict:
    """Full pipeline: parse -> transcribe -> AI -> save -> return note."""
    try:
        # 1. Parse video metadata
        video_info = video_extractor.parse_video_info(body.url)

        # 2. Extract transcript (with fallback)
        transcript = None

        # Try primary ASR (SiliconFlow/DashScope)
        if settings.API_KEY:
            try:
                transcript = video_extractor.extract_transcript(body.url, settings.API_KEY)
            except Exception as asr_err:
                traceback.print_exc()
                # Fall through to local ASR

        # Fallback: local yt-dlp + faster-whisper
        if not transcript or not transcript.strip():
            try:
                transcript = video_extractor.fallback_local_asr(body.url)
            except Exception as fallback_err:
                return _err(
                    f"语音识别失败。在线ASR错误，在本ASR降级也失败: {fallback_err}"
                )

        if not transcript or not transcript.strip():
            return _err("未能从视频中提取到文本内容。")

        # 3. AI processing
        content_type = ai_juicer.detect_content_type(transcript)
        ai_result = ai_juicer.generate_card(
            transcript=transcript,
            content_type=content_type,
            video_title=video_info["title"],
        )

        # 4. Save to database
        note = note_service.create_note(db, video_info, transcript, ai_result)

        return _ok(note.to_dict())

    except NotImplementedError as exc:
        return _err(str(exc))
    except Exception as exc:
        # Log the full traceback on the server for debugging.
        traceback.print_exc()
        return _err(f"处理失败: {exc}")


@router.get("/api/extract/stream")
def extract_stream(
    url: str = Query(..., min_length=1, description="Douyin share link"),
    db: Session = Depends(get_db),
):
    """Full pipeline with SSE progress events.

    Returns ``text/event-stream`` with one event per pipeline step.
    Each event is a JSON line::

        data: {"step":"parse","message":"...","status":"active"}

    Final event has ``step: "done"`` with ``data`` containing the note.
    """
    def _event(step: str, message: str, status: str = "active", data: Any = None) -> str:
        payload: dict[str, Any] = {"step": step, "message": message, "status": status}
        if data is not None:
            payload["data"] = data
        return f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"

    async def _generate():
        try:
            # Step 1: Parse video metadata
            yield _event("parse", "正在解析视频链接...", "active")
            try:
                video_info = video_extractor.parse_video_info(url)
                yield _event("parse", f"解析完成：{video_info.get('title', '未知标题')}", "done")
            except NotImplementedError as exc:
                yield _event("parse", f"解析失败: {exc}", "error")
                yield _event("error", str(exc), "error")
                return
            except Exception as exc:
                traceback.print_exc()
                yield _event("parse", f"解析失败: {exc}", "error")
                yield _event("error", str(exc), "error")
                return

            # Step 2: Extract transcript
            yield _event("transcribe", "正在提取视频文案...", "active")
            transcript: str | None = None

            if settings.API_KEY:
                try:
                    transcript = video_extractor.extract_transcript(url, settings.API_KEY)
                except Exception:
                    traceback.print_exc()

            if not transcript or not transcript.strip():
                try:
                    yield _event("transcribe", "在线 ASR 未成功，切换到本地识别...", "active")
                    transcript = video_extractor.fallback_local_asr(url)
                except Exception as fallback_err:
                    yield _event("transcribe", f"文案提取失败: {fallback_err}", "error")
                    yield _event("error", f"语音识别失败: {fallback_err}", "error")
                    return

            if not transcript or not transcript.strip():
                yield _event("transcribe", "未能从视频中提取到文本内容", "error")
                yield _event("error", "未能从视频中提取到文本内容。", "error")
                return

            char_count = len(transcript)
            yield _event("transcribe", f"文案提取完成，共 {char_count} 字", "done")

            # Step 3: AI processing
            yield _event("ai", "AI 正在识别内容类型...", "active")
            content_type = ai_juicer.detect_content_type(transcript)
            type_label = _TYPE_LABELS.get(content_type, content_type)
            yield _event("ai", f"识别为「{type_label}」类型，正在生成知识卡片...", "active")

            ai_result = ai_juicer.generate_card(
                transcript=transcript,
                content_type=content_type,
                video_title=video_info["title"],
            )
            section_count = len(ai_result.get("sections", []))
            yield _event("ai", f"AI 卡片生成完成，共 {section_count} 个章节", "done")

            # Step 4: Save to database
            yield _event("save", "正在保存笔记...", "active")
            note = note_service.create_note(db, video_info, transcript, ai_result)
            yield _event("save", "保存成功", "done")

            # Done
            yield _event("done", "提取完成", "done", note.to_dict())

        except Exception as exc:
            traceback.print_exc()
            yield _event("error", f"处理失败: {exc}", "error")

    return StreamingResponse(
        _generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/api/notes")
def list_notes(
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
) -> dict:
    """Return a paginated list of saved notes."""
    notes, total = note_service.list_notes(db, page=page, per_page=per_page)
    total_pages = max(1, (total + per_page - 1) // per_page)
    return _ok({
        "items": [n.to_dict() for n in notes],
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": total_pages,
    })


@router.get("/api/notes/{note_id}")
def get_note(note_id: str, db: Session = Depends(get_db)) -> dict:
    """Fetch a single note by ID."""
    note = note_service.get_note(db, note_id)
    if note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    return _ok(note.to_dict())
