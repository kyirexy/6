'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Loader2, Inbox } from 'lucide-react';
import { listNotes } from '@/lib/api';
import { Note, CARD_TYPE_CONFIG, PaginatedResponse } from '@/lib/types';
import Link from 'next/link';

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<Note> | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async (p: number) => {
    setIsLoading(true);
    setError(null);

    const result = await listNotes(p, 12);

    if (result.success && result.data) {
      setNotes(result.data.items);
      setPagination(result.data);
    } else {
      setError(result.error || '加载失败');
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchNotes(page);
  }, [page, fetchNotes]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && (!pagination || newPage <= pagination.total_pages)) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">知识库</h1>
        <p className="text-foreground-secondary text-sm">
          已保存的知识卡片，随时回顾
        </p>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-4">
            <Loader2 size={32} className="animate-spin text-accent-emerald" />
            <p className="text-foreground-muted text-sm">加载中...</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <p className="text-foreground-secondary mb-4">{error}</p>
            <button
              onClick={() => fetchNotes(page)}
              className="btn-primary px-6 py-2 text-sm"
            >
              重试
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && notes.length === 0 && (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <Inbox size={48} className="mx-auto mb-4 text-foreground-muted" />
            <p className="text-foreground-secondary mb-2">还没有知识卡片</p>
            <p className="text-foreground-muted text-sm mb-6">去首页粘贴视频链接开始提取吧</p>
            <Link href="/" className="btn-primary inline-block px-6 py-2 text-sm">
              去提取
            </Link>
          </div>
        </div>
      )}

      {/* Notes grid */}
      {!isLoading && notes.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note, index) => (
              <NoteCard key={note.id} note={note} index={index} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.total_pages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-10">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="glass-input p-2 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-foreground-secondary text-sm">
                {page} / {pagination.total_pages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= pagination.total_pages}
                className="glass-input p-2 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function NoteCard({ note, index }: { note: Note; index: number }) {
  const config = CARD_TYPE_CONFIG[note.card_type] || CARD_TYPE_CONFIG.general;

  return (
    <Link
      href={`/notes/${note.id}`}
      className="glass-card card-accent-border accent-${note.card_type} p-5 block no-underline animate-fade-in hover:scale-[1.02] transition-transform"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'both' }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{config.emoji}</span>
          <span
            className="px-2 py-0.5 rounded-full text-xs font-medium"
            style={{ background: `${config.accent}20`, color: config.accent }}
          >
            {config.label}
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }, (_, i) => (
            <span
              key={i}
              className={i < note.pitfall_rating ? 'star-filled text-xs' : 'star-empty text-xs'}
            >
              ⭐
            </span>
          ))}
        </div>
      </div>

      <h3 className="text-sm font-semibold text-foreground mb-2 line-clamp-2 leading-snug">
        {note.title}
      </h3>

      <p className="text-xs text-foreground-secondary line-clamp-3 leading-relaxed mb-3">
        {note.excerpt || note.conclusion}
      </p>

      <div className="flex items-center justify-between">
        <time className="text-xs text-foreground-muted">
          {formatDate(note.created_at)}
        </time>
      </div>
    </Link>
  );
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}
