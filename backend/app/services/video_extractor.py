"""
Video extraction service.

Wraps the existing DouyinProcessor from the douyin-mcp-server project so the
backend can parse Douyin share links, download videos, and extract transcripts.
"""

from __future__ import annotations

import os
import shutil
import sys
from pathlib import Path
from typing import Any


def _patch_ffmpeg_path():
    """Monkey-patch ffmpeg-python to use the correct ffmpeg binary on Windows.

    ffmpeg-python caches the ffmpeg command at import time. If ffmpeg is not in
    the system PATH (common on Windows), we need to replace it with the full
    path to the binary bundled by imageio-ffmpeg.
    """
    if shutil.which("ffmpeg"):
        return  # ffmpeg already in PATH, no patch needed

    try:
        import imageio_ffmpeg
        ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
        if not os.path.exists(ffmpeg_exe):
            return

        # Create a copy named ffmpeg.exe if the bundled binary has a different name
        ffmpeg_dir = os.path.dirname(ffmpeg_exe)
        ffmpeg_win = os.path.join(ffmpeg_dir, "ffmpeg.exe")
        if not os.path.exists(ffmpeg_win):
            shutil.copy2(ffmpeg_exe, ffmpeg_win)

        # Patch ffmpeg-python's _run module to use the full path
        import ffmpeg._run as _ffmpeg_run
        _ffmpeg_run.FFMPEG_BINARY = ffmpeg_win

        # Also patch the probe command
        try:
            import ffmpeg._probe as _ffmpeg_probe
            _ffmpeg_probe.FFPROBE_BINARY = ffmpeg_win.replace("ffmpeg", "ffprobe")
        except (ImportError, AttributeError):
            pass

    except Exception:
        pass


# Apply the patch before importing anything that uses ffmpeg
_patch_ffmpeg_path()

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
    """Offline ASR fallback using FunASR (Alibaba DAMO Academy).

    Downloads the video, extracts audio, then transcribes locally with
    FunASR's Paraformer-large model. Falls back to faster-whisper if FunASR fails.
    """
    import tempfile
    import shutil
    import subprocess
    from pathlib import Path

    from app.services.local_asr import transcribe_file, transcribe_with_whisper

    # Step 1: Extract video info to get the download URL
    processor = DouyinProcessor(api_key="")
    video_info = processor.parse_share_url(url)
    video_url = video_info["url"]

    # Step 2: Download video and extract audio
    temp_dir = Path(tempfile.mkdtemp())
    audio_path = temp_dir / "audio.mp3"

    try:
        # Download video
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

        # Extract audio using ffmpeg directly via subprocess
        ffmpeg_exe = _get_ffmpeg_path()
        cmd = [
            ffmpeg_exe, "-y",
            "-i", str(video_path),
            "-vn", "-acodec", "libmp3lame", "-q:a", "0",
            str(audio_path),
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        if result.returncode != 0:
            raise RuntimeError(f"ffmpeg 提取音频失败: {result.stderr[:200]}")

        # Step 3: Transcribe with FunASR (primary local ASR)
        try:
            text = transcribe_file(audio_path)
            if text.strip():
                return text
        except Exception as e:
            # FunASR failed, try faster-whisper as last resort
            text = transcribe_with_whisper(audio_path, model_size="base")
            if text.strip():
                return text

        raise RuntimeError("本地 ASR 未能识别到任何文本")

    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)


def _get_ffmpeg_path() -> str:
    """Get the full path to ffmpeg binary.

    Checks system PATH first, then falls back to imageio-ffmpeg bundled binary.
    """
    import shutil

    # Check system PATH
    found = shutil.which("ffmpeg")
    if found:
        return found

    # Use imageio-ffmpeg bundled binary
    import imageio_ffmpeg
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()

    # Create a copy named ffmpeg.exe if needed (imageio names it differently)
    ffmpeg_dir = os.path.dirname(ffmpeg_exe)
    ffmpeg_win = os.path.join(ffmpeg_dir, "ffmpeg.exe")
    if not os.path.exists(ffmpeg_win):
        import shutil as sh
        sh.copy2(ffmpeg_exe, ffmpeg_win)

    return ffmpeg_win
