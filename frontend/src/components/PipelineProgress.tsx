'use client';

import { Check, Loader2, AlertCircle, Circle } from 'lucide-react';

export interface StepState {
  key: string;
  label: string;
  message: string;
  status: 'pending' | 'active' | 'done' | 'error';
}

const STEPS: { key: string; label: string }[] = [
  { key: 'parse', label: '解析视频' },
  { key: 'transcribe', label: '提取文案' },
  { key: 'ai', label: 'AI 榨汁' },
  { key: 'save', label: '保存笔记' },
];

interface PipelineProgressProps {
  steps: StepState[];
}

export default function PipelineProgress({ steps }: PipelineProgressProps) {
  const stepMap = new Map(steps.map((s) => [s.key, s]));

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      {/* Pulsing orb header */}
      <div className="flex items-center justify-center gap-2.5 mb-6">
        <div className="relative">
          <div className="w-2.5 h-2.5 rounded-full bg-accent-emerald animate-pulse" />
          <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-accent-emerald animate-ping opacity-40" />
        </div>
        <span className="text-sm font-medium text-foreground-secondary">
          AI 正在处理中...
        </span>
      </div>

      {/* Timeline */}
      <div className="relative">
        {STEPS.map((step, i) => {
          const state = stepMap.get(step.key);
          const status = state?.status || 'pending';
          const message = state?.message || '';
          const isLast = i === STEPS.length - 1;

          return (
            <div key={step.key} className="relative flex gap-4 pb-5 last:pb-0">
              {/* Vertical connector line */}
              {!isLast && (
                <div className="absolute left-[15px] top-9 bottom-0 w-px">
                  <div
                    className={`h-full w-px transition-colors duration-500 ${
                      status === 'done'
                        ? 'bg-accent-emerald/40'
                        : status === 'active'
                          ? 'bg-accent-emerald/20'
                          : 'bg-card-border'
                    }`}
                  />
                </div>
              )}

              {/* Status icon */}
              <div className="relative flex-shrink-0 z-10">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                    status === 'done'
                      ? 'bg-accent-emerald/15 border border-accent-emerald/30 text-accent-emerald'
                      : status === 'active'
                        ? 'bg-accent-emerald/10 border border-accent-emerald/25 text-accent-emerald'
                        : status === 'error'
                          ? 'bg-accent-rose/10 border border-accent-rose/25 text-accent-rose'
                          : 'bg-card-bg border border-card-border text-foreground-muted'
                  }`}
                >
                  {status === 'done' ? (
                    <Check size={14} />
                  ) : status === 'active' ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : status === 'error' ? (
                    <AlertCircle size={14} />
                  ) : (
                    <Circle size={12} />
                  )}
                </div>
              </div>

              {/* Label + message */}
              <div className="flex-1 min-w-0 pt-0.5">
                <p
                  className={`text-sm font-medium transition-colors duration-300 ${
                    status === 'done'
                      ? 'text-foreground'
                      : status === 'active'
                        ? 'text-foreground'
                        : status === 'error'
                          ? 'text-accent-rose'
                          : 'text-foreground-muted'
                  }`}
                >
                  {step.label}
                </p>
                {message && (
                  <p
                    className={`text-xs mt-0.5 leading-relaxed transition-colors duration-300 ${
                      status === 'error'
                        ? 'text-accent-rose/70'
                        : 'text-foreground-muted'
                    }`}
                  >
                    {message}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
