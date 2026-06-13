'use client';

import { type StyleCardProps, CARD_TYPE_CONFIG } from '@/lib/types';
import PitfallRating from '../PitfallRating';
import TranscriptViewer from '../TranscriptViewer';

export default function MagazineCard({ cardData, density, cardRef }: StyleCardProps) {
  const config = CARD_TYPE_CONFIG[cardData.card_type] || CARD_TYPE_CONFIG.general;

  return (
    <div className="magazine-card" ref={cardRef}>
      <div className="bg-card-bg border border-card-border rounded-xl overflow-hidden">
        {/* Magazine header — wide accent bar */}
        <div
          className="h-1.5 w-full"
          style={{ background: `linear-gradient(90deg, ${config.accent}, ${config.accent}60)` }}
        />

        <div className="px-6 pt-6 pb-0 md:px-8 md:pt-8">
          {/* Eyebrow + title */}
          <span
            className="text-[11px] font-semibold uppercase tracking-[0.12em]"
            style={{ color: config.accent }}
          >
            {config.label} · {config.emoji}
          </span>
          <h2 className="mt-2 text-xl md:text-2xl font-bold text-foreground leading-tight text-balance max-w-3xl">
            {cardData.title}
          </h2>

          {/* Pitfall inline */}
          <div className="mt-4 pb-5 border-b border-card-border">
            <PitfallRating rating={cardData.pitfall_rating} size="sm" />
          </div>
        </div>

        {/* Conclusion — large pull-quote style */}
        {cardData.conclusion && (
          <div className="px-6 py-5 md:px-8 md:py-6 border-b border-card-border">
            <div className="space-y-3">
              {cardData.conclusion.split('\n').filter(Boolean).map((line, i) => (
                <p
                  key={i}
                  className="text-base md:text-lg text-foreground leading-relaxed font-medium text-pretty italic"
                  style={{ color: i === 0 ? config.accent : undefined }}
                >
                  {i === 0 && (
                    <span
                      className="inline-block text-5xl md:text-6xl font-serif leading-none mr-1 align-middle"
                      style={{ color: config.accent, marginTop: '-0.15em' }}
                    >
                      “
                    </span>
                  )}
                  {line}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Sections — two-column on desktop */}
        {density !== 'low' && cardData.sections.length > 0 && (
          <div className="px-6 py-5 md:px-8 md:py-6 border-b border-card-border">
            <div className="magazine-columns grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              {cardData.sections.map((section, i) => (
                <div key={i} className="magazine-section">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
                    <span
                      className="inline-flex items-center justify-center w-6 h-6 rounded text-xs"
                      style={{ background: `${config.accent}15` }}
                    >
                      {section.emoji || '📌'}
                    </span>
                    {section.title}
                  </h3>
                  <p className="text-sm text-foreground-secondary leading-relaxed whitespace-pre-line text-pretty">
                    {section.content.replace(/\*\*(.+?)\*\*/g, '$1')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Source */}
        {cardData.source_url && (
          <div className="px-6 py-3 md:px-8 md:py-4 bg-card-bg">
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
