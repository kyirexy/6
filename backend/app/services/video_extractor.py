"""
Video extraction service.

Wraps the existing DouyinProcessor from the douyin-mcp-server project so the
backend can parse Douyin share links, download videos, and extract transcripts.
"""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Any

# ---------------------------------------------------------------------------
# Make the existing douyin-mcp-server scripts importable
# ---------------------------------------------------------------------------
_SCRIPTS_DIR = Path(__file__).resolve().parents[2] / ".." / "douyin-mcp-server" / "douyin-video" / "scripts"
_SCRIPTS_DIR = _SCRIPTS_DIR.resolve()
if str(_SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(_SCRIPTS_DIR))

from douyin_downloader import DouyinProcessor  # noqa: E402


def parse_video_info(url: str) -> dict[str, Any]:
    """Return video_id, title, and download_url for a Douyin share link.

    Does NOT require an API key -- only fetches the web page.
    """
    processor = DouyinProcessor(api_key="")
    info: dict = processor.parse_share_url(url)
    return {
        "video_id": info["video_id"],
        "title": info["title"],
        "download_url": info["url"],
    }


def extract_transcript(url: str, api_key: str) -> str:
    """Full pipeline: parse -> download -> extract audio -> transcribe.

    Parameters
    ----------
    url:
        A Douyin share link (or text containing one).
    api_key:
        SiliconFlow API key used for the ASR endpoint.

    Returns
    -------
    str
        The transcribed text.
    """
    processor = DouyinProcessor(api_key=api_key)
    video_info = processor.parse_share_url(url)

    # Download video to temp dir
    video_path = processor.download_video(video_info, show_progress=False)

    # Extract audio
    audio_path = processor.extract_audio(video_path, show_progress=False)

    # Transcribe (supports automatic splitting for long audio)
    text = processor.extract_text_from_audio(audio_path, show_progress=False)

    # Cleanup
    processor.cleanup_files(video_path, audio_path)

    return text


def fallback_local_asr(url: str) -> str:
    """Offline ASR fallback using yt-dlp + faster-whisper.

    Not yet implemented -- placeholder for future work.
    """
    raise NotImplementedError(
        "本地 ASR 回退功能（yt-dlp + faster-whisper）尚未实现，"
        "请配置 SiliconFlow API_KEY 使用在线语音识别。"
    )
