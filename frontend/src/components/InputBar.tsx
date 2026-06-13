'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Link2, Loader2, AlertCircle, X } from 'lucide-react';

interface InputBarProps {
  onSubmit: (url: string) => void;
  isLoading?: boolean;
  error?: string | null;
  /** External URL to fill into the input (e.g. from sample links). Cleared after fill. */
  fillUrl?: string | null;
  onFillComplete?: () => void;
}

export default function InputBar({ onSubmit, isLoading = false, error, fillUrl, onFillComplete }: InputBarProps) {
  const [url, setUrl] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Fill from external source (e.g. sample link click)
  useEffect(() => {
    if (fillUrl) {
      setUrl(fillUrl);
      // Scroll input into view on mobile
      inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      inputRef.current?.focus();
      onFillComplete?.();
    }
  }, [fillUrl, onFillComplete]);

  // Paste detection
  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const pasted = e.clipboardData.getData('text');
      if (pasted && isValidUrl(pasted)) {
        setUrl(pasted);
        e.preventDefault();
        onSubmit(pasted);
      }
    },
    [onSubmit],
  );

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

  const handleClear = () => {
    setUrl('');
    inputRef.current?.focus();
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-2 md:px-0">
      <form onSubmit={handleSubmit} className="relative">
        {/* Outer glow ring on focus */}
        <div className="glass-input input-glow flex items-center gap-2.5 md:gap-3 px-4 py-3.5 md:px-5 md:py-4 relative overflow-hidden group">
          {/* Inner emerald glow on focus */}
          <div className="absolute inset-0 bg-gradient-to-r from-accent-emerald/[0.02] via-transparent to-accent-emerald/[0.02] opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <Link2
            size={18}
            className="text-foreground-muted flex-shrink-0 md:w-5 md:h-5 transition-colors duration-300 group-focus-within:text-accent-emerald/60"
          />
          <input
            ref={inputRef}
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onPaste={handlePaste}
            onKeyDown={handleKeyDown}
            placeholder="粘贴视频链接，提取知识卡片..."
            className="relative flex-1 bg-transparent outline-none text-foreground placeholder:text-foreground-muted text-base min-w-0"
            disabled={isLoading}
          />
          {url && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="relative p-1.5 rounded-full text-foreground-muted hover:text-foreground-secondary hover:bg-white/[0.06] transition-all duration-300 cursor-pointer flex-shrink-0"
              aria-label="清除输入"
            >
              <X size={16} />
            </button>
          )}
          <button
            type="submit"
            disabled={!url.trim() || isLoading}
            className="relative btn-primary btn-magnetic flex items-center gap-2 px-4 py-2.5 md:px-5 text-sm min-h-[44px] md:min-h-[40px] flex-shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span className="hidden sm:inline">提取中</span>
              </>
            ) : (
              <span>提取</span>
            )}
          </button>
        </div>
      </form>

      {/* Error display: inline with premium treatment */}
      {error && (
        <div className="mt-4 flex items-start gap-2.5 p-4 md:p-5 rounded-xl bg-accent-rose/[0.06] border border-accent-rose/[0.12] animate-fade-in backdrop-blur-sm">
          <AlertCircle
            size={16}
            className="text-accent-rose flex-shrink-0 mt-0.5"
          />
          <p className="text-sm text-foreground-secondary leading-relaxed text-pretty">
            {error}
          </p>
        </div>
      )}

      {/* Supported platforms hint */}
      <p className="mt-4 md:mt-5 text-center text-foreground-muted text-xs tracking-wide">
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
