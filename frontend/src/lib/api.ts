import { ApiResponse, CardData, Note, NoteDetail, PaginatedResponse, VideoInfo } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.detail || errorData.message || `Request failed with status ${response.status}`,
      };
    }

    const json = await response.json();
    // Backend returns {success, data, error} envelope — unwrap it.
    if (json && typeof json === 'object' && 'success' in json) {
      return { success: json.success, data: json.data, error: json.error };
    }
    return { success: true, data: json };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

export async function extractVideo(url: string): Promise<ApiResponse<CardData>> {
  return request<CardData>('/api/extract', {
    method: 'POST',
    body: JSON.stringify({ url }),
  });
}

/** SSE progress event emitted by /api/extract/stream */
export interface ProgressEvent {
  step: string;
  message: string;
  status: 'active' | 'done' | 'error';
  data?: CardData;
}

/**
 * Stream-extract a video with live progress events via SSE.
 *
 * Calls ``onProgress`` for each pipeline step event.
 * Resolves with the final ``ApiResponse<CardData>`` when the stream finishes.
 */
export async function extractVideoStream(
  url: string,
  onProgress: (event: ProgressEvent) => void,
): Promise<ApiResponse<CardData>> {
  const encoded = encodeURIComponent(url);

  try {
    const response = await fetch(`${API_BASE}/api/extract/stream?url=${encoded}`, {
      headers: { Accept: 'text/event-stream' },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.detail || `Request failed with status ${response.status}`,
      };
    }

    const reader = response.body?.getReader();
    if (!reader) {
      return { success: false, error: 'Stream not supported' };
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let finalData: CardData | undefined;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');

      // Keep last partial line in buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;

        try {
          const json = JSON.parse(trimmed.slice(6));
          const event: ProgressEvent = json;

          onProgress(event);

          if (event.step === 'done' && event.data) {
            finalData = event.data;
          }
          if (event.step === 'error') {
            return { success: false, error: event.message };
          }
        } catch {
          // Skip malformed lines
        }
      }
    }

    if (finalData) {
      return { success: true, data: finalData };
    }
    return { success: false, error: 'Stream ended without result' };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

export async function getVideoInfo(url: string): Promise<ApiResponse<VideoInfo>> {
  return request<VideoInfo>('/api/video/info', {
    method: 'POST',
    body: JSON.stringify({ url }),
  });
}

export async function listNotes(page: number = 1, perPage: number = 12): Promise<ApiResponse<PaginatedResponse<Note>>> {
  return request<PaginatedResponse<Note>>(`/api/notes?page=${page}&per_page=${perPage}`);
}

export async function getNote(id: string): Promise<ApiResponse<NoteDetail>> {
  return request<NoteDetail>(`/api/notes/${id}`);
}
