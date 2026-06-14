'use client';

import { useState, useCallback } from 'react';
import InputBar from '@/components/InputBar';
import SampleLinks from '@/components/SampleLinks';
import CardRenderer from '@/components/CardRenderer';
import PipelineProgress, { type StepState } from '@/components/PipelineProgress';
import { extractVideoStream, type ProgressEvent } from '@/lib/api';
import { CardData } from '@/lib/types';
import MobileDownloadButton from '@/components/MobileDownloadButton';

function initialSteps(): StepState[] {
  return [
    { key: 'parse', label: '解析视频', message: '', status: 'pending' },
    { key: 'transcribe', label: '提取文案', message: '', status: 'pending' },
    { key: 'ai', label: 'AI 榨汁', message: '', status: 'pending' },
    { key: 'save', label: '保存笔记', message: '', status: 'pending' },
  ];
}

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [fillUrl, setFillUrl] = useState<string | null>(null);
  const [progressSteps, setProgressSteps] = useState<StepState[]>(initialSteps());

  const handleSubmit = useCallback(async (url: string) => {
    setIsLoading(true);
    setError(null);
    setCardData(null);
    setProgressSteps(initialSteps());

    const onProgress = (event: ProgressEvent) => {
      setProgressSteps((prev) =>
        prev.map((s) =>
          s.key === event.step
            ? { ...s, message: event.message, status: event.status }
            : s,
        ),
      );
    };

    const result = await extractVideoStream(url, onProgress);

    if (result.success && result.data) {
      setCardData(result.data);
    } else {
      setError(result.error || '提取失败，请稍后重试');
    }

    setIsLoading(false);
  }, []);

  return (
    <div className="flex flex-col items-center pb-24 md:pb-32">
      {/* Ambient glow orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
        <div className="emerald-orb w-[500px] h-[500px] -top-40 -left-40 opacity-60" />
        <div className="emerald-orb w-[400px] h-[400px] top-1/3 -right-32 opacity-40" style={{ animationDelay: '-4s' }} />
        <div className="emerald-orb w-[350px] h-[350px] bottom-20 left-1/4 opacity-30" style={{ animationDelay: '-8s' }} />
      </div>

      {/* Mobile download button - always visible */}
      <div className="relative z-10 w-full">
        <MobileDownloadButton />
      </div>

      {/* Hero section — collapses while loading so the pipeline progress
          stays in view without scrolling. */}
      <section
        className={`relative z-10 text-center px-4 transition-all duration-500 ${
          isLoading
            ? 'pt-6 pb-4 md:pt-8 md:pb-6'
            : 'pt-16 pb-12 md:pt-24 md:pb-16 lg:pt-28 lg:pb-20'
        }`}
      >
        <div className="animate-fade-up-blur">
          {/* Eyebrow tag */}
          <div className="flex items-center justify-center mb-6">
            <span className="eyebrow">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse" />
              AI 视频知识提取
            </span>
          </div>

          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="text-5xl md:text-6xl lg:text-7xl drop-shadow-[0_0_30px_rgba(16,185,129,0.2)]">
              🫒
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-4 tracking-tight text-balance leading-[1.1]">
            收藏夹榨汁机
          </h1>
          <p className="text-foreground-secondary text-lg md:text-xl max-w-lg mx-auto leading-relaxed text-pretty">
            将任意视频转化为精美知识卡片
          </p>
          <p className="text-foreground-muted text-sm md:text-base max-w-md mx-auto mt-2">
            告别信息过载，只留核心干货
          </p>
        </div>
      </section>

      {/* Input section */}
      <section className="relative z-10 w-full mb-6 md:mb-8">
        <InputBar
          onSubmit={handleSubmit}
          isLoading={isLoading}
          error={error}
          fillUrl={fillUrl}
          onFillComplete={() => setFillUrl(null)}
        />
      </section>

      {/* Loading state: pipeline progress timeline.
          Rendered RIGHT AFTER the input so the user always sees AI working
          without scrolling. Sample links + feature cards are hidden during
          loading so they cannot push the progress timeline below the fold. */}
      {isLoading && (
        <section className="relative z-10 w-full max-w-xl mx-auto mb-10 animate-fade-in">
          <div className="glass-card p-6 md:p-8">
            <PipelineProgress steps={progressSteps} />
          </div>
        </section>
      )}

      {/* Sample links — hidden when card is showing OR while loading. */}
      {!cardData && !isLoading && (
        <section className="relative z-10 w-full mb-10 md:mb-14">
          <SampleLinks onFill={setFillUrl} isLoading={isLoading} />
        </section>
      )}

      {/* Features hint: varied layout (2+1 asymmetric) */}
      {!cardData && !isLoading && (
        <section className="relative z-10 w-full max-w-3xl mx-auto px-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5 mb-4 md:mb-5">
            <FeatureCard
              emoji="🍳"
              title="食谱提取"
              desc="从烹饪视频中提取完整食谱，步骤清晰可操作"
              accent="var(--accent-orange)"
              delay={0}
            />
            <FeatureCard
              emoji="💡"
              title="知识洞察"
              desc="从讲座中提炼核心观点，三行字掌握精髓"
              accent="var(--accent-emerald)"
              delay={1}
            />
          </div>
          <FeatureCardWide
            emoji="📚"
            title="历史解读"
            desc="从纪录片中梳理历史脉络，关键事件一目了然"
            accent="var(--accent-amber)"
            delay={2}
          />
        </section>
      )}

      {/* Card display */}
      {cardData && (
        <section className="relative z-10 w-full max-w-2xl mx-auto">
          <CardRenderer cardData={cardData} showExport={true} showToolbar={true} noteId={cardData.id} />
        </section>
      )}
    </div>
  );
}

function FeatureCard({
  emoji,
  title,
  desc,
  accent,
  delay,
}: {
  emoji: string;
  title: string;
  desc: string;
  accent: string;
  delay: number;
}) {
  return (
    <div
      className="bezel-outer group cursor-default animate-fade-up-blur"
      style={{ animationDelay: `${delay * 120}ms`, animationFillMode: 'both' }}
    >
      <div className="bezel-inner">
        <div className="p-5 md:p-6 relative">
          {/* Subtle inner glow */}
          <div
            className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl pointer-events-none"
            style={{ background: accent }}
          />
          <div className="relative flex items-start gap-3.5">
            <span className="text-2xl md:text-3xl flex-shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110 group-hover:rotate-3">
              {emoji}
            </span>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1.5 text-balance">{title}</h3>
              <p className="text-xs text-foreground-muted leading-relaxed text-pretty">{desc}</p>
            </div>
          </div>
          <div
            className="relative mt-4 h-0.5 w-10 rounded-full opacity-30 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:w-24 group-hover:opacity-60"
            style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCardWide({
  emoji,
  title,
  desc,
  accent,
  delay,
}: {
  emoji: string;
  title: string;
  desc: string;
  accent: string;
  delay: number;
}) {
  return (
    <div
      className="bezel-outer group cursor-default animate-fade-up-blur"
      style={{ animationDelay: `${delay * 120}ms`, animationFillMode: 'both' }}
    >
      <div className="bezel-inner">
        <div className="p-5 md:p-6 relative">
          {/* Subtle inner glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl pointer-events-none"
            style={{ background: accent }}
          />
          <div className="relative flex items-center gap-4">
            <span className="text-3xl md:text-4xl flex-shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110 group-hover:-rotate-3">
              {emoji}
            </span>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-foreground mb-1.5 text-balance">{title}</h3>
              <p className="text-xs text-foreground-muted leading-relaxed text-pretty">{desc}</p>
            </div>
            <div
              className="hidden sm:block h-12 w-1 rounded-full opacity-20 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:opacity-50 group-hover:h-16"
              style={{ background: `linear-gradient(180deg, ${accent}, transparent)` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
