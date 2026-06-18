'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import InputBar from '@/components/InputBar';
import SampleLinks from '@/components/SampleLinks';
import CardRenderer from '@/components/CardRenderer';
import PipelineProgress from '@/components/PipelineProgress';
import { useExtraction } from '@/lib/hooks/ExtractionContext';
import { getPlanStats } from '@/lib/api';
import MobileDownloadButton from '@/components/MobileDownloadButton';
import { X, CheckSquare } from 'lucide-react';

export default function HomePage() {
  const { isLoading, error, cardData, progressSteps, startExtraction, clearCard, dismissError } = useExtraction();
  const [fillUrl, setFillUrl] = useState<string | null>(null);
  const [planReminder, setPlanReminder] = useState(false);
  const [planReminderDue, setPlanReminderDue] = useState(0);

  // Restore cardData on full page reload (context survives tab switches already).
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem('vc-home-card');
      if (cached && !cardData) {
        startExtraction(''); // no-op, just checking — the real restore is handled by context re-init
      }
    } catch {}
  }, []);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const lastDismiss = localStorage.getItem('vc-plan-reminder-dismissed');
    if (lastDismiss === today) return;
    getPlanStats().then((res) => {
      if (res.success && res.data && res.data.due_today > 0) {
        setPlanReminder(true);
        setPlanReminderDue(res.data.due_today);
      }
    });
  }, []);

  const dismissReminder = () => {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem('vc-plan-reminder-dismissed', today);
    setPlanReminder(false);
  };

  const handleSubmit = useCallback((url: string) => {
    startExtraction(url);
  }, [startExtraction]);

  return (
    <div className="flex flex-col items-center pb-24 md:pb-32">
      {/* Ambient glow orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
        <div className="emerald-orb w-[500px] h-[500px] -top-40 -left-40 opacity-60" />
        <div className="emerald-orb w-[400px] h-[400px] top-1/3 -right-32 opacity-40" style={{ animationDelay: '-4s' }} />
        <div className="emerald-orb w-[350px] h-[350px] bottom-20 left-1/4 opacity-30" style={{ animationDelay: '-8s' }} />
      </div>

      {/* PU7: Plan reminder banner */}
      {planReminder && (
        <div className="relative z-20 w-full max-w-2xl mx-auto px-2 md:px-0 mb-4 animate-slide-up">
          <div className="flex items-start gap-3 p-3 md:p-4 rounded-2xl bg-accent-emerald/10 border border-accent-emerald/20">
            <CheckSquare size={18} className="text-accent-emerald flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">你今天有 {planReminderDue} 项计划任务到期</p>
              <p className="text-xs text-foreground-muted mt-0.5">打开计划页面查看详情</p>
            </div>
            <Link href="/plans" className="flex-shrink-0 text-xs font-medium text-accent-emerald hover:underline px-2 py-1">查看</Link>
            <button type="button" onClick={dismissReminder} className="flex-shrink-0 p-1 rounded-lg text-foreground-muted/40 hover:text-foreground-muted" aria-label="关闭提醒">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Mobile download button — desktop-only */}
      <div className="relative z-10 w-full hidden md:block">
        <MobileDownloadButton />
      </div>

      {/* Hero section */}
      <section className={`relative z-10 text-center px-4 transition-all duration-500 ${
        isLoading ? 'pt-3 pb-2 md:pt-8 md:pb-6' : 'pt-4 pb-3 md:pt-24 md:pb-16 lg:pt-28 lg:pb-20'
      }`}>
        <div className="animate-fade-up-blur">
          <div className="hidden md:flex items-center justify-center mb-6">
            <span className="eyebrow">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse" />AI 视频知识提取
            </span>
          </div>
          <div className="flex items-center justify-center gap-3 mb-2 md:mb-5">
            <span className="text-3xl md:text-6xl lg:text-7xl drop-shadow-[0_0_30px_rgba(16,185,129,0.2)]">🫒</span>
          </div>
          <h1 className="text-2xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-1.5 md:mb-4 tracking-tight text-balance leading-[1.1]">知萃</h1>
          <p className="text-foreground-secondary text-sm md:text-xl max-w-lg mx-auto leading-relaxed text-pretty">短视频一键萃成结构化知识卡</p>
          <p className="hidden md:block text-foreground-muted text-sm md:text-base max-w-md mx-auto mt-2">知萃 KnowBrew · AI 萃取视频干货</p>
        </div>
      </section>

      {/* Input section */}
      <section className="relative z-10 w-full mb-6 md:mb-8">
        <InputBar onSubmit={handleSubmit} isLoading={isLoading} error={error} fillUrl={fillUrl} onFillComplete={() => setFillUrl(null)} />
      </section>

      {/* Loading state: pipeline progress */}
      {isLoading && (
        <section className="relative z-10 w-full max-w-xl mx-auto mb-10 animate-fade-in">
          <div className="glass-card p-6 md:p-8">
            <PipelineProgress steps={progressSteps} />
          </div>
        </section>
      )}

      {/* Sample links */}
      {!cardData && !isLoading && (
        <section className="relative z-10 w-full mb-10 md:mb-14">
          <SampleLinks onFill={setFillUrl} isLoading={isLoading} />
        </section>
      )}

      {/* Features hint — desktop-only */}
      {!cardData && !isLoading && (
        <section className="relative z-10 w-full max-w-3xl mx-auto px-2 hidden md:block">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5 mb-4 md:mb-5">
            <FeatureCard emoji="🍳" title="食谱提取" desc="从烹饪视频中提取完整食谱，步骤清晰可操作" accent="var(--accent-orange)" delay={0} />
            <FeatureCard emoji="💡" title="知识洞察" desc="从讲座中提炼核心观点，三行字掌握精髓" accent="var(--accent-emerald)" delay={1} />
          </div>
          <FeatureCardWide emoji="📚" title="历史解读" desc="从纪录片中梳理历史脉络，关键事件一目了然" accent="var(--accent-amber)" delay={2} />
        </section>
      )}

      {/* Card display */}
      {cardData && (
        <section className="relative z-10 w-full max-w-2xl mx-auto">
          <CardRenderer cardData={cardData} showExport={true} showToolbar={true} noteId={cardData.id} />
          {cardData.card_type === 'plan' && cardData.plan_id && (
            <div className="mt-5 animate-fade-in">
              <Link href={`/plans?id=${cardData.plan_id}`}
                className="flex items-center gap-3 p-4 rounded-2xl bg-accent-indigo/10 border border-accent-indigo/20 hover:bg-accent-indigo/15 transition-colors group">
                <span className="text-2xl">📋</span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold text-foreground">已为你建立执行计划</span>
                  <span className="block text-xs text-foreground-muted mt-0.5">AI 已将视频中的步骤拆解为可执行的任务清单</span>
                </span>
                <span className="flex-shrink-0 text-sm font-medium text-accent-indigo group-hover:underline">查看计划 →</span>
              </Link>
            </div>
          )}
        </section>
      )}

      {/* Error state */}
      {error && !isLoading && !cardData && (
        <section className="relative z-10 w-full max-w-xl mx-auto mb-10">
          <div className="glass-card p-5 md:p-6 border-accent-rose/20">
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0">⚠️</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground mb-1">提取失败</p>
                <p className="text-xs text-foreground-muted leading-relaxed mb-3">{error}</p>
                <button onClick={dismissError} className="text-xs font-medium text-accent-emerald hover:underline">关闭</button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function FeatureCard({ emoji, title, desc, accent, delay }: { emoji: string; title: string; desc: string; accent: string; delay: number }) {
  return (
    <div className="glass-card p-5 md:p-6 animate-fade-up-blur" style={{ animationDelay: `${delay * 100}ms` }}>
      <span className="text-2xl mb-3 block">{emoji}</span>
      <h3 className="text-sm font-semibold text-foreground mb-1.5">{title}</h3>
      <p className="text-xs text-foreground-muted leading-relaxed">{desc}</p>
    </div>
  );
}

function FeatureCardWide({ emoji, title, desc, accent, delay }: { emoji: string; title: string; desc: string; accent: string; delay: number }) {
  return (
    <div className="glass-card p-5 md:p-6 animate-fade-up-blur" style={{ animationDelay: `${delay * 100}ms` }}>
      <div className="flex items-start gap-4">
        <span className="text-2xl">{emoji}</span>
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-1.5">{title}</h3>
          <p className="text-xs text-foreground-muted leading-relaxed">{desc}</p>
        </div>
      </div>
    </div>
  );
}
