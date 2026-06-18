'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { type CardData, type CardStyle, type DensityLevel } from '@/lib/types';
import { useSettings } from '@/lib/hooks/SettingsContext';
import StyleToolbar from './StyleToolbar';
import ExportButton from './ExportButton';
import StandardCard from './card-styles/StandardCard';
import MinimalCard from './card-styles/MinimalCard';
import CreativeCard from './card-styles/CreativeCard';
import MagazineCard from './card-styles/MagazineCard';
import CompactListCard from './card-styles/CompactListCard';
import HeroCard from './card-styles/HeroCard';

const STYLE_COMPONENTS: Record<CardStyle, React.ComponentType<{
  cardData: CardData;
  density: DensityLevel;
  cardRef?: React.RefObject<HTMLDivElement | null>;
}>> = {
  hero: HeroCard,
  minimal: MinimalCard,
  standard: StandardCard,
  creative: CreativeCard,
  magazine: MagazineCard,
  compact: CompactListCard,
};

interface CardRendererProps {
  cardData: CardData;
  showExport?: boolean;
  className?: string;
  noteId?: string;
  showToolbar?: boolean;
}

export default function CardRenderer({
  cardData,
  showExport = true,
  className = '',
  noteId,
  showToolbar = false,
}: CardRendererProps) {
  const { settings } = useSettings();
  const cardRef = useRef<HTMLDivElement>(null);

  // Per-note overrides (volatile — reset on unmount / different note).
  const [styleOverride, setStyleOverride] = useState<CardStyle | null>(null);
  const [densityOverride, setDensityOverride] = useState<DensityLevel | null>(null);

  const effectiveStyle = styleOverride ?? settings.cardStyle;
  const effectiveDensity = densityOverride ?? settings.density;

  const StyleComponent = STYLE_COMPONENTS[effectiveStyle];

  const isPlan = cardData.card_type === 'plan';

  return (
    <div className={`animate-slide-up ${className}`}>
      {/* PU9: Plan banner — shown above the card when content is plan-type */}
      {isPlan && (
        <div className="mb-4 flex items-center gap-3 p-3 md:p-4 rounded-2xl bg-accent-indigo/10 border border-accent-indigo/20 animate-fade-in">
          <span className="text-xl">📋</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">已为你建立执行计划</p>
            <p className="text-xs text-foreground-muted mt-0.5">下方为知识卡片，任务清单请查看计划页面</p>
          </div>
          {cardData.plan_id && (
            <Link href={`/plans?id=${cardData.plan_id}`} className="flex-shrink-0 text-xs font-medium text-accent-indigo hover:underline px-2 py-1">
              查看计划 →
            </Link>
          )}
        </div>
      )}
      {/* Top actions row: export + process link */}
      <div className="flex items-center justify-between mb-4 md:mb-5 gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          {showExport && (
            <ExportButton
              targetRef={cardRef}
              filename={`${cardData.title || 'videocapsule'}-card`}
            />
          )}
          {noteId && (
            <Link
              href={`/process?id=${noteId}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                         text-xs font-medium text-foreground-muted
                         bg-card-bg border border-card-border
                         hover:text-foreground-secondary hover:border-foreground-muted/30
                         transition-colors duration-200"
              title="查看原视频、原文案与 AI 处理过程"
            >
              <ExternalLink size={13} />
              查看原视频 + 文案
            </Link>
          )}
        </div>
        {showExport && (
          <span className="text-[11px] text-foreground-muted/60">
            导出为 PNG
          </span>
        )}
      </div>

      {/* Style toolbar */}
      {showToolbar && (
        <StyleToolbar
          styleOverride={styleOverride}
          densityOverride={densityOverride}
          onStyleOverride={setStyleOverride}
          onDensityOverride={setDensityOverride}
        />
      )}

      {/* Active style component */}
      <StyleComponent
        cardData={cardData}
        density={effectiveDensity}
        cardRef={showExport ? cardRef : undefined}
      />
    </div>
  );
}
