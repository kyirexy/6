'use client';

import { TrendingUp, Quote, Target, BarChart3, Flag } from 'lucide-react';
import type { PlanField } from '@/lib/types';

interface PlanDynamicFieldProps {
  field: PlanField;
}

const ICON_MAP: Record<string, typeof TrendingUp> = {
  goal: Target,
  metrics: BarChart3,
  checkpoints: Flag,
  hero_quote: Quote,
};


export default function PlanDynamicField({ field }: PlanDynamicFieldProps) {
  const Icon = ICON_MAP[field.name] || null;
  const value = field.value;

  const renderValue = () => {
    switch (field.type) {
      case 'progress':
        if (typeof value === 'number') {
          const pct = Math.min(100, Math.max(0, value));
          return (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-lg font-bold text-foreground tabular-nums">{pct}%</span>
              </div>
              <div className="h-2 rounded-full bg-card-bg overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-accent-emerald to-accent-indigo transition-all duration-700" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        }
        return null;

      case 'quote':
        if (typeof value === 'string') {
          return (
            <div className="relative pl-3 border-l-2 border-accent-emerald/30 italic text-sm text-foreground-secondary leading-relaxed">
              {value}
            </div>
          );
        }
        return null;

      case 'checklist':
        if (Array.isArray(value)) {
          return (
            <ul className="space-y-1.5">
              {value.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground-secondary">
                  <span className="text-accent-emerald mt-0.5 flex-shrink-0">✓</span>
                  <span>{String(item)}</span>
                </li>
              ))}
            </ul>
          );
        }
        return <p className="text-sm text-foreground-secondary">—</p>;

      case 'list':
        if (Array.isArray(value)) {
          return (
            <ul className="space-y-1.5">
              {value.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground-secondary">
                  <span className="block w-1 h-1 rounded-full bg-foreground-muted mt-2 flex-shrink-0" />
                  <span>{String(item)}</span>
                </li>
              ))}
            </ul>
          );
        }
        return <p className="text-sm text-foreground-secondary">—</p>;

      case 'number':
        return (
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-foreground tabular-nums">{value != null ? String(value) : '—'}</span>
          </div>
        );

      case 'date':
        return <p className="text-sm font-medium text-foreground-secondary">{value ? String(value) : '—'}</p>;

      case 'text':
      default:
        if (typeof value === 'string') {
          return <p className="text-sm text-foreground-secondary leading-relaxed text-pretty">{value}</p>;
        }
        return <p className="text-sm text-foreground-muted">—</p>;
    }
  };

  return (
    <div className="bg-card-bg border border-card-border rounded-2xl p-4 md:p-5 hover:border-foreground-muted/20 transition-colors">
      <span className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wide flex items-center gap-1.5 mb-2">
        {Icon && <Icon size={12} />}
        {field.label}
      </span>
      {renderValue()}
    </div>
  );
}
