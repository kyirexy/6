'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Share2, Loader2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { getNote } from '@/lib/api';
import { NoteDetail } from '@/lib/types';
import CardRenderer from '@/components/CardRenderer';

export default function NotePageClient() {
  const params = useParams();
  const id = params.id as string;

  const [note, setNote] = useState<NoteDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchNote = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);

    const result = await getNote(id);

    if (result.success && result.data) {
      setNote(result.data);
    } else {
      setError(result.error || '加载失败');
    }

    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    fetchNote();
  }, [fetchNote]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: note?.title || 'VideoCapsule', url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // User cancelled or API not supported
    }
  };

  return (
    <div>
      {/* Back button and actions */}
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/notes"
          className="flex items-center gap-2 text-foreground-secondary hover:text-foreground transition-colors no-underline text-sm"
        >
          <ArrowLeft size={16} />
          <span>返回知识库</span>
        </Link>

        {note && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="glass-input flex items-center gap-2 px-3 py-1.5 text-sm text-foreground-secondary hover:text-foreground transition-colors cursor-pointer"
            >
              <Share2 size={14} />
              <span>{copied ? '已复制' : '分享'}</span>
            </button>
            {note.source_url && (
              <a
                href={note.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-input flex items-center gap-2 px-3 py-1.5 text-sm text-foreground-secondary hover:text-foreground transition-colors no-underline"
              >
                <ExternalLink size={14} />
                <span>原始视频</span>
              </a>
            )}
          </div>
        )}
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
              onClick={fetchNote}
              className="btn-primary px-6 py-2 text-sm"
            >
              重试
            </button>
          </div>
        </div>
      )}

      {/* Note content */}
      {note && !isLoading && (
        <div className="max-w-2xl mx-auto">
          <CardRenderer
            cardData={{
              card_type: note.card_type,
              title: note.title,
              sections: note.sections,
              conclusion: note.conclusion,
              pitfall_rating: note.pitfall_rating,
              source_url: note.source_url,
              created_at: note.created_at,
            }}
            showExport={true}
          />
        </div>
      )}
    </div>
  );
}
