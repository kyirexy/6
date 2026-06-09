'use client';

import { useRef } from 'react';
import { CardData, CARD_TYPE_CONFIG } from '@/lib/types';
import CardSection from './CardSection';
import Conclusion from './Conclusion';
import PitfallRating from './PitfallRating';
import ExportButton from './ExportButton';

interface CardRendererProps {
  cardData: CardData;
  showExport?: boolean;
  className?: string;
}

export default function CardRenderer({ cardData, showExport = true, className = '' }: CardRendererProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const config = CARD_TYPE_CONFIG[cardData.card_type] || CARD_TYPE_CONFIG.general;

  return (
    <div className={`animate-slide-up ${className}`}>
      {/* Export button */}
      {showExport && (
        <div className="flex justify-end mb-4">
          <ExportButton
            targetRef={cardRef}
            filename={`${cardData.title || 'videocapsule'}-card`}
          />
        </div>
      )}

      {/* Card */}
      <div
        ref={cardRef}
        className={`glass-card card-accent-border accent-${cardData.card_type} overflow-hidden`}
      >
        {/* Card header */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{config.emoji}</span>
              <div>
                <span
                  className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium mb-1.5"
                  style={{
                    background: `${config.accent}20`,
                    color: config.accent,
                  }}
                >
                  {config.label}
                </span>
                <h2 className="text-xl font-bold text-foreground leading-tight">
                  {cardData.title}
                </h2>
              </div>
            </div>
          </div>

          {/* Pitfall rating */}
          <div className="mt-4">
            <PitfallRating rating={cardData.pitfall_rating} />
          </div>
        </div>

        {/* Divider */}
        <div className="mx-6 border-t border-card-border" />

        {/* Card sections */}
        <div className="p-6 space-y-6">
          {cardData.sections.map((section, index) => (
            <CardSection
              key={index}
              section={section}
              index={index}
              accentColor={config.accent}
            />
          ))}
        </div>

        {/* Conclusion */}
        {cardData.conclusion && (
          <div className="px-6 pb-6">
            <Conclusion text={cardData.conclusion} accentColor={config.accent} />
          </div>
        )}

        {/* Source URL */}
        {cardData.source_url && (
          <div className="px-6 pb-6">
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
    </div>
  );
}
