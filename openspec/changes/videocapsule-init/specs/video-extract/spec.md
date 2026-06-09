## ADDED Requirements

### Requirement: Parse video share link
The system SHALL accept a Douyin share link (short URL or full URL) and extract video metadata including video_id, title, and watermark-free download URL.

#### Scenario: Valid Douyin short link
- **WHEN** user submits `https://v.douyin.com/xxxxx/`
- **THEN** system returns video_id, title, and download_url within 10 seconds

#### Scenario: Invalid link format
- **WHEN** user submits a non-Douyin URL or malformed link
- **THEN** system returns a clear error message indicating the link is unsupported

### Requirement: Extract transcript via MCP server
The system SHALL call douyin-mcp-server's `extract_douyin_text` tool to download the video, extract audio, and perform ASR transcription.

#### Scenario: Successful transcript extraction
- **WHEN** a valid Douyin link is submitted and API_KEY is configured
- **THEN** system returns the full transcript text within 60 seconds for videos under 10 minutes

#### Scenario: Long video handling
- **WHEN** the video exceeds 1 hour or 50MB audio
- **THEN** system automatically segments the audio and transcribes each segment, then merges the results

### Requirement: Fallback to local ASR
The system SHALL automatically degrade to local yt-dlp + Faster-Whisper transcription when the MCP server extraction fails.

#### Scenario: MCP server failure triggers fallback
- **WHEN** douyin-mcp-server returns an error (network timeout, API quota exceeded, format unsupported)
- **THEN** system attempts yt-dlp audio download followed by Faster-Whisper local transcription

#### Scenario: Both paths fail
- **WHEN** both MCP server and local ASR fail
- **THEN** system returns a structured error with details of both failure reasons

### Requirement: REST API endpoints
The system SHALL expose the following FastAPI endpoints:
- `POST /api/extract` — full pipeline: parse link → extract transcript → return result
- `POST /api/video/info` — metadata only (no ASR)
- `GET /api/health` — service health check

#### Scenario: Extract endpoint request
- **WHEN** client sends `POST /api/extract` with `{"url": "https://v.douyin.com/xxx/"}`
- **THEN** system returns `{"success": true, "video_id": "...", "title": "...", "transcript": "..."}`
