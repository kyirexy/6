'use client';

import { type StyleCardProps, CARD_TYPE_CONFIG } from '@/lib/types';
import CardSection from '../CardSection';
import Conclusion from '../Conclusion';
import PitfallRating from '../PitfallRating';
import TranscriptViewer from '../TranscriptViewer';

export default function StandardCard({ cardData, density, cardRef }: StyleCardProps) {
  const config = CARD_TYPE_CONFIG[cardData.card_type] || CARD_TYPE_CONFIG.general;

  return (
    <div className="standard-card">
      {/* Double-bezel architecture */}
      <div className="bezel-outer">
        <div ref={cardRef} className={`bezel-inner accent-${cardData.card_type}`}>
          {/* Accent top bar */}
          <div
            className="h-[3px] w-full"
            style={{ background: `linear-gradient(90deg, ${config.accent}, ${config.accent}40, transparent)` }}
          />

          {/* Card header */}
          <div className="p-5 pb-4 md:p-6 md:pb-5 relative">
            {/* Subtle inner glow orb */}
            <div
              className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-[0.06] pointer-events-none blur-3xl"
              style={{ background: config.accent }}
            />

            <div className="relative flex items-start justify-between gap-3">
              <div className="flex items-start gap-3.5 min-w-0">
                <span className="text-2xl md:text-3xl flex-shrink-0 mt-0.5 drop-shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                  {config.emoji}
                </span>
                <div className="min-w-0">
                  <span
                    className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2 tracking-wide uppercase"
                    style={{
                      background: `${config.accent}15`,
                      color: config.accent,
                      border: `1px solid ${config.accent}20`,
                    }}
                  >
                    {config.label}
                  </span>
                  <h2 className="text-lg md:text-xl font-bold text-foreground leading-snug text-balance">
                    {cardData.title}
                  </h2>
                </div>
              </div>
            </div>

            {/* Pitfall rating */}
            {density !== 'low' && (
              <div className="relative mt-4 pt-3.5">
                <div className="premium-divider mb-3.5" />
                <PitfallRating rating={cardData.pitfall_rating} />
              </div>
            )}
          </div>

          {/* Card sections */}
          {density !== 'low' && cardData.sections.length > 0 && (
            <div className="px-5 pb-5 md:px-6 md:pb-6 space-y-5 md:space-y-6">
              {cardData.sections.map((section, index) => (
                <div key={index}>
                  <CardSection section={section} index={index} accentColor={config.accent} />
                  {index < cardData.sections.length - 1 && (
                    <div className="mt-5 md:mt-6">
                      <div className="premium-divider" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Conclusion — always visible */}
          {cardData.conclusion && (
            <div className="px-5 pb-4 md:px-6 md:pb-5">
              <Conclusion text={cardData.conclusion} accentColor={config.accent} />
            </div>
          )}

          {/* Pitfall for low density (after conclusion) */}
          {density === 'low' && (
            <div className="px-5 pb-5 md:px-6 md:pb-6">
              <PitfallRating rating={cardData.pitfall_rating} />
            </div>
          )}

          {/* Source URL */}
          {cardData.source_url && (
            <div className="px-5 pb-5 md:px-6 md:pb-6">
              <div className="premium-divider mb-4" />
              <a
                href={cardData.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-foreground-muted hover:text-foreground-secondary transition-colors duration-300 underline underline-offset-2 decoration-foreground-muted/30 hover:decoration-foreground-secondary/60"
              >
                查看原始视频
              </a>
            </div>
          )}
        </div>
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
