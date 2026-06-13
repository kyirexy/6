'use client';

import { type StyleCardProps, CARD_TYPE_CONFIG } from '@/lib/types';
import PitfallRating from '../PitfallRating';
import TranscriptViewer from '../TranscriptViewer';

export default function MinimalCard({ cardData, density, cardRef }: StyleCardProps) {
  const config = CARD_TYPE_CONFIG[cardData.card_type] || CARD_TYPE_CONFIG.general;

  return (
    <div className="minimal-card" ref={cardRef}>
      {/* Clean, undecorated layout */}
      <div className="rounded-xl border border-card-border bg-card-bg overflow-hidden">
        {/* Header — compact */}
        <div className="px-5 py-4 md:px-6 md:py-5 border-b border-card-border">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">{config.emoji}</span>
            <span
              className="text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded"
              style={{ color: config.accent, background: `${config.accent}12` }}
            >
              {config.label}
            </span>
          </div>
          <h2 className="mt-2 text-base md:text-lg font-semibold text-foreground leading-snug text-balance">
            {cardData.title}
          </h2>
        </div>

        {/* Conclusion — always priority in minimal mode */}
        {cardData.conclusion && (
          <div className="px-5 py-4 md:px-6 md:py-5 border-b border-card-border">
            <h3 className="text-xs font-semibold text-foreground-muted uppercase tracking-wide mb-3">
              结论
            </h3>
            <div className="space-y-2">
              {cardData.conclusion.split('\n').filter(Boolean).map((line, i) => (
                <p key={i} className="text-sm text-foreground-secondary leading-relaxed">
                  {line}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Sections — only at medium+ density */}
        {density !== 'low' && cardData.sections.length > 0 && (
          <div className="px-5 py-4 md:px-6 md:py-5 border-b border-card-border">
            <h3 className="text-xs font-semibold text-foreground-muted uppercase tracking-wide mb-3">
              内容要点
            </h3>
            <div className="space-y-4">
              {cardData.sections.map((section, i) => (
                <div key={i}>
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-1.5">
                    <span className="text-base">{section.emoji || '📌'}</span>
                    {section.title}
                  </h4>
                  <p className="text-sm text-foreground-secondary leading-relaxed whitespace-pre-line text-pretty">
                    {section.content.replace(/\*\*(.+?)\*\*/g, '$1')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pitfall rating */}
        <div className="px-5 py-3 md:px-6 md:py-4">
          <PitfallRating rating={cardData.pitfall_rating} size="sm" />
        </div>

        {/* Source URL */}
        {cardData.source_url && (
          <div className="px-5 pb-4 md:px-6 md:pb-5">
            <a
              href={cardData.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-foreground-muted hover:text-foreground-secondary transition-colors underline underline-offset-2"
            >
              查看原始视频
            </a>
          </div>
        )}
      </div>

      {/* Transcript for high density */}
      {density === 'high' && cardData.transcript_raw && (
        <div className="mt-6">
          <TranscriptViewer transcript={cardData.transcript_raw} />
        </div>
      )}
    </div>
  );
}
