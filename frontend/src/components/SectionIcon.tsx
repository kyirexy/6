'use client';

/**
 * SectionIcon — maps a section's `icon` key (or, as a fallback, keywords in
 * its title) to a Lucide icon. This replaces ad-hoc emoji decoration with a
 * coherent line-icon system that reads as Material/Google-style design.
 *
 * The dispatcher is intentionally permissive: if the LLM emits an unknown key
 * we fall back to keyword detection, then to the legacy emoji, then to a
 * neutral pin. New cards always get an icon; old cards keep their emoji.
 */

import {
  Lightbulb,
  Target,
  Compass,
  Brain,
  Eye,
  ListChecks,
  Route,
  Play,
  Rocket,
  Flag,
  AlertTriangle,
  Shield,
  XCircle,
  Siren,
  TrendingUp,
  BarChart3,
  Activity,
  Sparkles,
  Users,
  Heart,
  Smile,
  MessageSquare,
  BookOpen,
  Bookmark,
  Quote,
  Pin,
  type LucideIcon,
} from 'lucide-react';

const ICON_BY_KEY: Record<string, LucideIcon> = {
  // Information / insight
  'lightbulb': Lightbulb,
  'target': Target,
  'compass': Compass,
  'brain': Brain,
  'eye': Eye,
  // Steps / action
  'list-checks': ListChecks,
  'route': Route,
  'play': Play,
  'rocket': Rocket,
  'flag': Flag,
  // Warnings
  'alert-triangle': AlertTriangle,
  'shield': Shield,
  'x-circle': XCircle,
  'siren': Siren,
  // Data / metrics
  'trending-up': TrendingUp,
  'chart-bar': BarChart3,
  'activity': Activity,
  'sparkles': Sparkles,
  // People / emotion
  'users': Users,
  'heart': Heart,
  'smile': Smile,
  'message-square': MessageSquare,
  // Neutral
  'book-open': BookOpen,
  'bookmark': Bookmark,
  'quote': Quote,
  'pin': Pin,
};

/** Keyword → icon-key fallback. Order matters: first match wins. */
const KEYWORD_RULES: Array<[RegExp, string]> = [
  [/(警示|风险|陷阱|误区|避坑|注意|危险|警告)/, 'alert-triangle'],
  [/(关系|人物|受众|用户|人群|客户)/, 'users'],
  [/(情绪|共鸣|心态|感受|情感)/, 'heart'],
  [/(数据|增长|提升|效率|指标|百分)/, 'trending-up'],
  [/(步骤|流程|清单|做法|方法|行动)/, 'list-checks'],
  [/(目标|定位|方向|战略|目的)/, 'target'],
  [/(观点|洞察|本质|逻辑|原理|核心)/, 'lightbulb'],
  [/(执行|落地|实战|实操|启动)/, 'rocket'],
  [/(误解|区分|对比|辨析)/, 'eye'],
  [/(总结|结论|启示|要点)/, 'flag'],
  [/(故事|案例|举例|经历)/, 'message-square'],
  [/(建议|推荐|提示)/, 'sparkles'],
];

/** Legacy emoji → modern icon-key. */
const EMOJI_RULES: Array<[RegExp, string]> = [
  [/[💡🧠]/u, 'lightbulb'],
  [/[🎯🔍]/u, 'target'],
  [/[⚡🚀]/u, 'rocket'],
  [/[⚠️❌🛑]/u, 'alert-triangle'],
  [/[📊📈💰]/u, 'trending-up'],
  [/[📝📋✅✓]/u, 'list-checks'],
  [/[🌐🌍]/u, 'compass'],
  [/[👥💬]/u, 'users'],
  [/[❤️💖]/u, 'heart'],
  [/[📚📖]/u, 'book-open'],
];

function pickKey(input: { icon?: string; title?: string; emoji?: string }): string {
  if (input.icon && ICON_BY_KEY[input.icon]) return input.icon;
  if (input.title) {
    for (const [pattern, key] of KEYWORD_RULES) {
      if (pattern.test(input.title)) return key;
    }
  }
  if (input.emoji) {
    for (const [pattern, key] of EMOJI_RULES) {
      if (pattern.test(input.emoji)) return key;
    }
  }
  return 'pin';
}

interface SectionIconProps {
  iconKey?: string;
  title?: string;
  emoji?: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

export default function SectionIcon({
  iconKey,
  title,
  emoji,
  size = 16,
  className = '',
  strokeWidth = 2,
}: SectionIconProps) {
  const key = pickKey({ icon: iconKey, title, emoji });
  const Icon = ICON_BY_KEY[key] || Pin;
  return <Icon size={size} className={className} strokeWidth={strokeWidth} aria-hidden="true" />;
}

export { pickKey };
