'use client';

import { type StyleCardProps, CARD_TYPE_CONFIG } from '@/lib/types';
import CardSection from '../CardSection';
import Conclusion from '../Conclusion';
import PitfallRating from '../PitfallRating';
import TranscriptViewer from '../TranscriptViewer';

export default function CreativeCard({ cardData, density, cardRef }: StyleCardProps) {
  const config = CARD_TYPE_CONFIG[cardData.card_type] || CARD_TYPE_CONFIG.general;

  return (
    <div className="creative-card" ref={cardRef}>
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: `linear-gradient(160deg, ${config.accent}08 0%, var(--card-bg) 30%, var(--card-bg) 70%, ${config.accent}06 100%)`,
          border: `1px solid ${config.accent}15`,
        }}
      >
        {/* Large decorative glow orbs */}
        <div
          className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-[0.08] pointer-events-none blur-3xl"
          style={{ background: config.accent }}
        />
        <div
          className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full opacity-[0.05] pointer-events-none blur-3xl"
          style={{ background: config.accent }}
        />

        {/* Floating accent particles */}
        <div className="absolute top-8 right-8 w-2 h-2 rounded-full opacity-30 pointer-events-none"
          style={{ background: config.accent, animation: 'floatOrb 6s ease-in-out infinite' }} />
        <div className="absolute bottom-12 right-12 w-1.5 h-1.5 rounded-full opacity-20 pointer-events-none"
          style={{ background: config.accent, animation: 'floatOrb 8s ease-in-out infinite 2s' }} />

        {/* Header — large emoji centered */}
        <div className="relative px-6 pt-8 pb-5 md:px-8 md:pt-10 md:pb-6 text-center">
          <span className="block text-5xl md:text-6xl mb-4 drop-shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            {config.emoji}
          </span>
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase mb-3"
            style={{
              background: `${config.accent}15`,
              color: config.accent,
              border: `1px solid ${config.accent}25`,
            }}
          >
            {config.label}
          </span>
          <h2 className="text-xl md:text-2xl font-bold text-foreground leading-snug text-balance max-w-xl mx-auto">
            {cardData.title}
          </h2>
        </div>

        {/* Decorative divider */}
        <div className="px-6 md:px-8">
          <div
            className="h-px w-full"
            style={{
              background: `linear-gradient(90deg, transparent, ${config.accent}40, ${config.accent}20, transparent)`,
            }}
          />
        </div>

        {/* Pitfall rating */}
        {density !== 'low' && (
          <div className="px-6 py-4 md:px-8 md:py-5">
            <PitfallRating rating={cardData.pitfall_rating} size="lg" />
          </div>
        )}

        {/* Sections */}
        {density !== 'low' && cardData.sections.length > 0 && (
          <div className="px-6 pb-6 md:px-8 md:pb-8 space-y-6">
            {cardData.sections.map((section, index) => (
              <CardSection key={index} section={section} index={index} accentColor={config.accent} />
            ))}
          </div>
        )}

        {/* Conclusion — gradient box */}
        {cardData.conclusion && (
          <div className="px-6 pb-6 md:px-8 md:pb-8">
            <div
              className="rounded-2xl p-[1.5px]"
              style={{
                background: `linear-gradient(135deg, ${config.accent}40, ${config.accent}15 40%, ${config.accent}30 60%, ${config.accent}10)`,
              }}
            >
              <div
                className="rounded-[13px] p-5 md:p-6"
                style={{ background: `${config.accent}06` }}
              >
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span style={{ color: config.accent }}>✦</span>
                  3行字终极结论
                </h3>
                <div className="space-y-2.5">
                  {cardData.conclusion.split('\n').filter(Boolean).map((line, i) => (
                    <p key={i} className="text-sm text-foreground-secondary leading-relaxed text-pretty">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pitfall for low density */}
        {density === 'low' && (
          <div className="px-6 pb-6 md:px-8 md:pb-8">
            <PitfallRating rating={cardData.pitfall_rating} size="md" />
          </div>
        )}

        {/* Source URL */}
        {cardData.source_url && (
          <div className="px-6 pb-5 md:px-8 md:pb-6">
            <a
              href={cardData.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-foreground-muted hover:text-foreground-secondary transition-colors duration-300 underline underline-offset-2"
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
