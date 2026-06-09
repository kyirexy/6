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
