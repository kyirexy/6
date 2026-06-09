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

    Downloads audio via yt-dlp, then transcribes locally with faster-whisper.
    This path is used when the primary SiliconFlow/DashScope ASR fails.
    """
    import tempfile
    import subprocess
    from pathlib import Path

    # Step 1: Extract video info to get the download URL
    processor = DouyinProcessor(api_key="")
    video_info = processor.parse_share_url(url)
    video_url = video_info["url"]

    # Step 2: Download audio using yt-dlp (or direct download + ffmpeg)
    temp_dir = Path(tempfile.mkdtemp())
    audio_path = temp_dir / "audio.mp3"

    try:
        # Download video first, then extract audio with ffmpeg
        video_path = temp_dir / "video.mp4"
        import requests as req
        headers = {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) '
                          'AppleWebKit/605.1.15 (KHTML, like Gecko) '
                          'EdgiOS/121.0.2277.107 Version/17.0 Mobile/15E148 Safari/604.1'
        }
        resp = req.get(video_url, headers=headers, stream=True)
        resp.raise_for_status()
        with open(video_path, 'wb') as f:
            for chunk in resp.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)

        # Extract audio with ffmpeg
        import ffmpeg as ff
        (
            ff.input(str(video_path))
            .output(str(audio_path), acodec='libmp3lame', q=0)
            .run(capture_stdout=True, capture_stderr=True, overwrite_output=True)
        )

        # Step 3: Transcribe with faster-whisper
        from faster_whisper import WhisperModel
        model = WhisperModel("tiny", device="cpu", compute_type="int8")
        segments, _ = model.transcribe(str(audio_path), language="zh", beam_size=5)
        text = "".join(seg.text for seg in segments)

        if not text.strip():
            raise RuntimeError("faster-whisper 未识别到任何文本")

        return text

    finally:
        # Cleanup temp files
        import shutil
        shutil.rmtree(temp_dir, ignore_errors=True)
