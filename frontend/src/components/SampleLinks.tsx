'use client';

import { useState } from 'react';
import { ChevronDown, Play, ExternalLink } from 'lucide-react';

interface SampleLink {
  title: string;
  desc: string;
  url: string;
}

interface SampleGroup {
  label: string;
  emoji: string;
  links: SampleLink[];
}

const SAMPLE_GROUPS: SampleGroup[] = [
  {
    label: 'VibeCoding 基础入门',
    emoji: '🚀',
    links: [
      {
        title: '什么是 Vibe Coding？',
        desc: '用最通俗的语言解释氛围编程的核心原理与三步操作流程',
        url: 'https://www.iesdouyin.com/share/video/7628696225475214811',
      },
      {
        title: '一套 Vibe Coding 工作流吃干抹净 AI',
        desc: '"让AI做主力，你做总导演"——12字原则深度讲解',
        url: 'https://www.iesdouyin.com/share/video/7589968106043362586',
      },
    ],
  },
  {
    label: 'VibeCoding 实战案例',
    emoji: '💻',
    links: [
      {
        title: '单词背诵工具开发实操',
        desc: '从0到1用VibeCoding开发可上线的单词背诵网站',
        url: 'https://www.iesdouyin.com/share/video/7644499130202492211',
      },
      {
        title: '用代码还原鱼群形态',
        desc: 'Boids鱼群算法——AI将数学公式转化为3D视觉效果',
        url: 'https://www.iesdouyin.com/share/video/7642345931534322985',
      },
      {
        title: '给女朋友做的梦幻AI相册',
        desc: '42轮对话开发个性化AI相册，Gemini+DeepSeek',
        url: 'https://www.iesdouyin.com/share/video/7642254289469073777',
      },
    ],
  },
  {
    label: 'VibeCoding 避坑进阶',
    emoji: '⚠️',
    links: [
      {
        title: 'AI编程代码越改越烂？5招拿捏',
        desc: '破解"死亡螺旋"，5个实用技巧避免越修越烂',
        url: 'https://www.iesdouyin.com/share/video/7645161416617430278',
      },
      {
        title: '一块好玩的水墨屏',
        desc: '用VibeCoding快速开发水墨屏应用的创意项目',
        url: 'https://www.iesdouyin.com/share/video/7644946231135472070',
      },
    ],
  },
  {
    label: '权威公开课 & AI工具',
    emoji: '🎓',
    links: [
      {
        title: '清华大学《Vibe Coding氛围编程》公开课',
        desc: '清华官方出品，系统讲解氛围编程思想与工具',
        url: 'https://www.iesdouyin.com/share/video/7543581458393337103',
      },
      {
        title: '抖音AI创作功能全解析',
        desc: '一键成片、数字人、文案生成等官方AI工具介绍',
        url: 'https://www.iesdouyin.com/share/video/7633402358088682758',
      },
    ],
  },
];

interface SampleLinksProps {
  onFill: (url: string) => void;
  isLoading: boolean;
}

export default function SampleLinks({ onFill, isLoading }: SampleLinksProps) {
  const [expanded, setExpanded] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set([0]));

  const toggleGroup = (i: number) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-2 md:px-0">
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-2 py-2 text-xs text-foreground-muted
                   hover:text-foreground-secondary transition-colors duration-200 group"
      >
        <span className="h-px flex-1 bg-card-border max-w-16 group-hover:max-w-24 transition-all duration-300" />
        <span className="flex items-center gap-1.5">
          🧪 示例视频链接
          <ChevronDown
            size={12}
            className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
          />
        </span>
        <span className="h-px flex-1 bg-card-border max-w-16 group-hover:max-w-24 transition-all duration-300" />
      </button>

      {/* Sample links panel */}
      {expanded && (
        <div className="mt-3 space-y-3 animate-fade-in">
          {SAMPLE_GROUPS.map((group, gi) => {
            const isGroupOpen = expandedGroups.has(gi);
            return (
              <div
                key={gi}
                className="rounded-xl bg-card-bg border border-card-border overflow-hidden"
              >
                {/* Group header */}
                <button
                  type="button"
                  onClick={() => toggleGroup(gi)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-left
                             hover:bg-white/[0.02] transition-colors duration-200"
                >
                  <span className="text-sm">{group.emoji}</span>
                  <span className="text-xs font-semibold text-foreground flex-1">
                    {group.label}
                  </span>
                  <span className="text-[10px] text-foreground-muted tabular-nums">
                    {group.links.length} 个
                  </span>
                  <ChevronDown
                    size={12}
                    className={`text-foreground-muted transition-transform duration-300 ${
                      isGroupOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Group links */}
                {isGroupOpen && (
                  <div className="border-t border-card-border divide-y divide-card-border">
                    {group.links.map((link, li) => (
                      <button
                        key={li}
                        type="button"
                        disabled={isLoading}
                        onClick={() => onFill(link.url)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left
                                   hover:bg-accent-emerald/[0.04] transition-colors duration-200
                                   disabled:opacity-50 disabled:cursor-not-allowed group/link"
                      >
                        <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-accent-emerald/[0.08]
                                        flex items-center justify-center
                                        group-hover/link:bg-accent-emerald/[0.15] transition-colors">
                          <Play size={11} className="text-accent-emerald" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-foreground truncate
                                        group-hover/link:text-accent-emerald transition-colors">
                            {link.title}
                          </p>
                          <p className="text-[11px] text-foreground-muted truncate mt-0.5">
                            {link.desc}
                          </p>
                        </div>
                        <ExternalLink
                          size={11}
                          className="text-foreground-muted/40 flex-shrink-0
                                     group-hover/link:text-accent-emerald/60 transition-colors"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
