"""
Local ASR service using FunASR (Alibaba DAMO Academy).

Provides high-quality Chinese speech recognition without external API calls.
Supports punctuation restoration and inverse text normalization.

Usage:
    from app.services.local_asr import transcribe_file, transcribe_bytes

Models downloaded automatically on first use (~900MB total):
    - speech_paraformer-large_asr_nat-zh-cn-16k-common-vocab8404-pytorch (ASR)
    - ct-punc (punctuation)
    - fsmn-vad (voice activity detection)
"""

from __future__ import annotations

import logging
import os
import tempfile
from pathlib import Path
from typing import Optional

import numpy as np

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Global model cache (loaded once, reused across calls)
# ---------------------------------------------------------------------------
_model = None
_vad_model = None
_punc_model = None

# Set modelscope cache dir to project-local folder
_CACHE_DIR = Path(__file__).resolve().parents[2] / ".modelcache"
os.environ.setdefault("MODELSCOPE_CACHE", str(_CACHE_DIR))


def _ensure_ffmpeg_path():
    """Find ffmpeg binary and add to PATH if not already available."""
    import shutil
    if shutil.which("ffmpeg"):
        return

    # Try imageio-ffmpeg bundled binary
    try:
        import imageio_ffmpeg
        ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
        if os.path.exists(ffmpeg_exe):
            ffmpeg_dir = os.path.dirname(ffmpeg_exe)
            if ffmpeg_dir not in os.environ.get("PATH", ""):
                os.environ["PATH"] = ffmpeg_dir + os.pathsep + os.environ.get("PATH", "")
                logger.info("Added ffmpeg to PATH: %s", ffmpeg_exe)
    except Exception:
        pass


def _load_models():
    """Load FunASR models lazily on first use."""
    global _model, _vad_model, _punc_model

    if _model is not None:
        return

    _ensure_ffmpeg_path()

    logger.info("Loading FunASR models (first time may download ~900MB)...")

    from funasr import AutoModel

    # Main ASR model - Paraformer-large for Chinese
    _model = AutoModel(
        model="paraformer-zh",
        vad_model="fsmn-vad",
        punc_model="ct-punc",
        device="cpu",  # Use "cuda" if GPU available
        disable_update=True,
    )

    logger.info("FunASR models loaded successfully")


def transcribe_file(audio_path: str | Path, language: str = "zh") -> str:
    """Transcribe an audio file to text.

    Parameters
    ----------
    audio_path : str or Path
        Path to the audio file (mp3, wav, m4a, etc.)
    language : str
        Language code (default: "zh" for Chinese)

    Returns
    -------
    str
        Transcribed text with punctuation.
    """
    _load_models()

    audio_path = str(audio_path)
    logger.info("Transcribing: %s", audio_path)

    result = _model.generate(input=audio_path)

    if not result or not result[0]:
        return ""

    # Extract text from result
    text = ""
    if isinstance(result[0], dict):
        text = result[0].get("text", "")
    elif isinstance(result[0], str):
        text = result[0]
    else:
        text = str(result[0])

    logger.info("Transcription complete: %d chars", len(text))
    return text


def transcribe_bytes(audio_bytes: bytes, suffix: str = ".mp3") -> str:
    """Transcribe audio from bytes.

    Parameters
    ----------
    audio_bytes : bytes
        Raw audio data.
    suffix : str
        File extension hint (default: ".mp3")

    Returns
    -------
    str
        Transcribed text with punctuation.
    """
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as f:
        f.write(audio_bytes)
        temp_path = f.name

    try:
        return transcribe_file(temp_path)
    finally:
        os.unlink(temp_path)


def transcribe_url(audio_url: str) -> str:
    """Download audio from URL and transcribe.

    Parameters
    ----------
    audio_url : str
        URL to the audio file.

    Returns
    -------
    str
        Transcribed text with punctuation.
    """
    import requests

    logger.info("Downloading audio from: %s", audio_url)
    resp = requests.get(audio_url, timeout=120)
    resp.raise_for_status()

    # Determine suffix from content type
    content_type = resp.headers.get("content-type", "")
    suffix = ".mp3"
    if "wav" in content_type:
        suffix = ".wav"
    elif "ogg" in content_type:
        suffix = ".ogg"
    elif "m4a" in content_type:
        suffix = ".m4a"

    return transcribe_bytes(resp.content, suffix=suffix)


# ---------------------------------------------------------------------------
# Faster-Whisper fallback (if FunASR fails)
# ---------------------------------------------------------------------------

def transcribe_with_whisper(audio_path: str | Path, model_size: str = "base") -> str:
    """Fallback transcription using faster-whisper.

    Parameters
    ----------
    audio_path : str or Path
        Path to the audio file.
    model_size : str
        Whisper model size: "tiny", "base", "small", "medium", "large-v3"

    Returns
    -------
    str
        Transcribed text.
    """
    _ensure_ffmpeg_path()

    from faster_whisper import WhisperModel

    logger.info("Using faster-whisper (%s) for: %s", model_size, audio_path)

    model = WhisperModel(model_size, device="cpu", compute_type="int8")
    segments, info = model.transcribe(
        str(audio_path),
        language="zh",
        beam_size=5,
        vad_filter=True,
    )

    text = "".join(seg.text for seg in segments)
    logger.info("Whisper transcription complete: %d chars", len(text))
    return text


# ---------------------------------------------------------------------------
# Unified interface
# ---------------------------------------------------------------------------

def transcribe(
    source: str | Path | bytes,
    method: str = "funasr",
    language: str = "zh",
) -> str:
    """Unified transcription interface.

    Parameters
    ----------
    source : str, Path, or bytes
        Audio file path, URL, or raw bytes.
    method : str
        "funasr" (default) or "whisper"
    language : str
        Language code.

    Returns
    -------
    str
        Transcribed text.
    """
    if method == "whisper":
        if isinstance(source, bytes):
            with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as f:
                f.write(source)
                temp = f.name
            try:
                return transcribe_with_whisper(temp)
            finally:
                os.unlink(temp)
        return transcribe_with_whisper(source)

    # Default: FunASR
    if isinstance(source, bytes):
        return transcribe_bytes(source)
    elif isinstance(source, str) and source.startswith(("http://", "https://")):
        return transcribe_url(source)
    else:
        return transcribe_file(source)
