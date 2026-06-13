'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { type StyleCardProps, CARD_TYPE_CONFIG } from '@/lib/types';
import PitfallRating from '../PitfallRating';
import TranscriptViewer from '../TranscriptViewer';

export default function CompactListCard({ cardData, density, cardRef }: StyleCardProps) {
  const config = CARD_TYPE_CONFIG[cardData.card_type] || CARD_TYPE_CONFIG.general;
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());

  const toggleSection = (index: number) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <div className="compact-card" ref={cardRef}>
      <div className="bg-card-bg border border-card-border rounded-xl overflow-hidden">
        {/* Compact header bar */}
        <div
          className="px-4 py-3 md:px-5 md:py-3.5 flex items-center gap-3"
          style={{ borderBottom: `1px solid var(--card-border)` }}
        >
          <span className="text-xl flex-shrink-0">{config.emoji}</span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded"
                style={{ color: config.accent, background: `${config.accent}12` }}
              >
                {config.label}
              </span>
            </div>
            <h2 className="text-sm md:text-base font-semibold text-foreground truncate">
              {cardData.title}
            </h2>
          </div>
          <PitfallRating rating={cardData.pitfall_rating} size="sm" />
        </div>

        {/* Conclusion — always visible, compact */}
        {cardData.conclusion && (
          <div
            className="px-4 py-3 md:px-5 md:py-3.5"
            style={{ borderBottom: `1px solid var(--card-border)` }}
          >
            <div className="space-y-1">
              {cardData.conclusion.split('\n').filter(Boolean).map((line, i) => (
                <p key={i} className="text-xs md:text-sm text-foreground-secondary leading-relaxed">
                  <span
                    className="inline-block w-1 h-1 rounded-full mr-2 align-middle"
                    style={{ background: config.accent }}
                  />
                  {line}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Collapsible sections */}
        {density !== 'low' && cardData.sections.length > 0 && (
          <div className="divide-y divide-card-border">
            {cardData.sections.map((section, i) => {
              const isOpen = expandedSections.has(i);
              return (
                <div key={i} className="compact-accordion">
                  <button
                    type="button"
                    onClick={() => toggleSection(i)}
                    className="w-full px-4 py-2.5 md:px-5 md:py-3 flex items-center gap-2.5 text-left hover:bg-card-bg transition-colors duration-200"
                  >
                    <span className="text-base flex-shrink-0">{section.emoji || '📌'}</span>
                    <span className="text-xs md:text-sm font-medium text-foreground flex-1 truncate">
                      {section.title}
                    </span>
                    <ChevronDown
                      size={14}
                      className="text-foreground-muted flex-shrink-0 transition-transform duration-300"
                      style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-3 md:px-5 md:pb-4 pl-11 md:pl-12">
                      <p className="text-xs md:text-sm text-foreground-secondary leading-relaxed whitespace-pre-line text-pretty">
                        {section.content.replace(/\*\*(.+?)\*\*/g, '$1')}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Source link */}
        {cardData.source_url && (
          <div
            className="px-4 py-2.5 md:px-5 md:py-3"
            style={{ borderTop: `1px solid var(--card-border)` }}
          >
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
