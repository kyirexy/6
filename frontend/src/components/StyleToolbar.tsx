'use client';

import { useSettings } from '@/lib/hooks/SettingsContext';
import { CARD_STYLE_CONFIG, DENSITY_CONFIG, type CardStyle, type DensityLevel } from '@/lib/types';
import { Monitor, Zap } from 'lucide-react';

interface StyleToolbarProps {
  styleOverride: CardStyle | null;
  densityOverride: DensityLevel | null;
  onStyleOverride: (style: CardStyle | null) => void;
  onDensityOverride: (density: DensityLevel | null) => void;
}

export default function StyleToolbar({
  styleOverride,
  densityOverride,
  onStyleOverride,
  onDensityOverride,
}: StyleToolbarProps) {
  const { settings } = useSettings();

  const effectiveStyle = styleOverride ?? settings.cardStyle;
  const effectiveDensity = densityOverride ?? settings.density;

  const isOverriding = styleOverride !== null || densityOverride !== null;

  return (
    <div className="style-toolbar mb-5">
      {/* Style row */}
      <div className="flex items-center gap-2 mb-3">
        <Monitor size={13} className="text-foreground-muted flex-shrink-0" />
        <span className="text-[11px] font-medium text-foreground-muted uppercase tracking-wide mr-1">
          风格
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {Object.values(CARD_STYLE_CONFIG).map((meta) => {
            const isActive = effectiveStyle === meta.key;
            const isGlobal = meta.key === settings.cardStyle;
            return (
              <button
                key={meta.key}
                type="button"
                onClick={() => {
                  if (meta.key === settings.cardStyle) {
                    onStyleOverride(null); // back to global
                  } else {
                    onStyleOverride(meta.key);
                  }
                }}
                className={`style-chip inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium
                  transition-all duration-200 whitespace-nowrap
                  ${isActive
                    ? 'bg-accent-emerald text-white shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                    : 'bg-card-bg border border-card-border text-foreground-secondary hover:text-foreground hover:border-foreground-muted/30'
                  }`}
                title={meta.description}
              >
                <span className="text-sm leading-none">{meta.icon}</span>
                <span>{meta.label}</span>
                {isActive && !isGlobal && (
                  <span className="text-[10px] opacity-80">*</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Density row */}
      <div className="flex items-center gap-2">
        <Zap size={13} className="text-foreground-muted flex-shrink-0" />
        <span className="text-[11px] font-medium text-foreground-muted uppercase tracking-wide mr-1">
          密度
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {(Object.entries(DENSITY_CONFIG) as [DensityLevel, typeof DENSITY_CONFIG[DensityLevel]][]).map(
            ([key, meta]) => {
              const isActive = effectiveDensity === key;
              const isGlobal = key === settings.density;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    if (key === settings.density) {
                      onDensityOverride(null);
                    } else {
                      onDensityOverride(key);
                    }
                  }}
                  className={`style-chip inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium
                    transition-all duration-200 whitespace-nowrap
                    ${isActive
                      ? 'bg-accent-emerald text-white shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                      : 'bg-card-bg border border-card-border text-foreground-secondary hover:text-foreground hover:border-foreground-muted/30'
                    }`}
                  title={meta.description}
                >
                  <span>{meta.label}</span>
                  {isActive && !isGlobal && (
                    <span className="text-[10px] opacity-80">*</span>
                  )}
                </button>
              );
            },
          )}
        </div>
      </div>

      {/* Reset hint when overriding */}
      {isOverriding && (
        <p className="mt-2 text-[11px] text-foreground-muted">
          标记 * 的为当前笔记临时覆盖。点击已选中的选项可恢复全局默认。
        </p>
      )}
    </div>
  );
}
