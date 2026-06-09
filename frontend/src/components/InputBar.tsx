'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Link2, Loader2, AlertCircle } from 'lucide-react';

interface InputBarProps {
  onSubmit: (url: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export default function InputBar({ onSubmit, isLoading = false, error }: InputBarProps) {
  const [url, setUrl] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Paste detection
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text');
    if (pasted && isValidUrl(pasted)) {
      setUrl(pasted);
      e.preventDefault();
      onSubmit(pasted);
    }
  }, [onSubmit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (trimmed && !isLoading) {
      onSubmit(trimmed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="glass-input flex items-center gap-3 px-5 py-4 group focus-within:border-accent-emerald focus-within:shadow-[0_0_0_3px_var(--input-focus)]">
          <Link2 size={20} className="text-foreground-muted flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onPaste={handlePaste}
            onKeyDown={handleKeyDown}
            placeholder="粘贴视频链接，提取知识卡片..."
            className="flex-1 bg-transparent outline-none text-foreground placeholder:text-foreground-muted text-base"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!url.trim() || isLoading}
            className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>提取中</span>
              </>
            ) : (
              <span>提取</span>
            )}
          </button>
        </div>
      </form>

      {/* Error display */}
      {error && (
        <div className="mt-4 flex items-start gap-3 p-4 rounded-xl bg-accent-rose/10 border border-accent-rose/20 animate-fade-in">
          <AlertCircle size={18} className="text-accent-rose flex-shrink-0 mt-0.5" />
          <p className="text-sm text-foreground-secondary">{error}</p>
        </div>
      )}

      {/* Supported platforms hint */}
      <p className="mt-4 text-center text-foreground-muted text-xs">
        支持 YouTube、Bilibili、抖音等主流视频平台
      </p>
    </div>
  );
}

function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
