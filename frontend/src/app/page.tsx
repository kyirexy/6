'use client';

import { useState, useCallback } from 'react';
import { Sparkles } from 'lucide-react';
import InputBar from '@/components/InputBar';
import CardRenderer from '@/components/CardRenderer';
import { extractVideo } from '@/lib/api';
import { CardData } from '@/lib/types';

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardData, setCardData] = useState<CardData | null>(null);

  const handleSubmit = useCallback(async (url: string) => {
    setIsLoading(true);
    setError(null);
    setCardData(null);

    const result = await extractVideo(url);

    if (result.success && result.data) {
      setCardData(result.data);
    } else {
      setError(result.error || '提取失败，请稍后重试');
    }

    setIsLoading(false);
  }, []);

  return (
    <div className="min-h-[70vh] flex flex-col items-center">
      {/* Hero section */}
      <section className="text-center py-16 md:py-24">
        <div className="animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="text-5xl">🫒</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
            收藏夹榨汁机
          </h1>
          <p className="text-foreground-secondary text-lg md:text-xl max-w-lg mx-auto leading-relaxed">
            将任意视频转化为精美知识卡片
            <br />
            <span className="text-foreground-muted">告别信息过载，只留核心干货</span>
          </p>
        </div>
      </section>

      {/* Input section */}
      <section className="w-full mb-12">
        <InputBar onSubmit={handleSubmit} isLoading={isLoading} error={error} />
      </section>

      {/* Features hint (shown when no card) */}
      {!cardData && !isLoading && (
        <section className="w-full max-w-3xl mx-auto animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { emoji: '🍳', title: '食谱提取', desc: '从烹饪视频中提取完整食谱' },
              { emoji: '💡', title: '知识洞察', desc: '从讲座中提炼核心观点' },
              { emoji: '📚', title: '历史解读', desc: '从纪录片中梳理历史脉络' },
            ].map((feature) => (
              <div key={feature.title} className="glass-card p-5 text-center">
                <span className="text-3xl mb-3 block">{feature.emoji}</span>
                <h3 className="text-sm font-semibold text-foreground mb-1">{feature.title}</h3>
                <p className="text-xs text-foreground-muted">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Loading state */}
      {isLoading && (
        <section className="w-full max-w-2xl mx-auto text-center py-16 animate-fade-in">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-foreground-muted/20 border-t-accent-emerald animate-spin" />
              <Sparkles size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-accent-emerald" />
            </div>
            <div>
              <p className="text-foreground font-medium">正在提取知识卡片</p>
              <p className="text-foreground-muted text-sm mt-1">AI 正在分析视频内容...</p>
            </div>
          </div>
        </section>
      )}

      {/* Card display */}
      {cardData && (
        <section className="w-full max-w-2xl mx-auto pb-16">
          <CardRenderer cardData={cardData} showExport={true} />
        </section>
      )}
    </div>
  );
}
