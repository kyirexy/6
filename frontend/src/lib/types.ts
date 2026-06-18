export type CardType = 'recipe' | 'insight' | 'history' | 'product' | 'plan' | 'general';

/** Tone of the source content — drives layout density & visual weight. */
export type ContentTone = 'emotional' | 'informational' | 'hybrid';

/** Information-density preference emitted by the LLM (per-note). */
export type ContentDensity = 'low' | 'medium' | 'high';

export interface CardSection {
  title: string;
  content: string;
  /** Lucide icon key — see SectionIcon dispatcher. Falls back to emoji. */
  icon?: string;
  /** Legacy: pre-icon-system cards stored an emoji here. */
  emoji?: string;
}

export interface CardStat {
  label: string;
  value: string;
}

export interface CardData {
  id?: string;
  card_type: CardType;
  title: string;
  sections: CardSection[];
  conclusion: string;
  pitfall_rating: number;
  source_url?: string;
  video_url?: string;
  created_at?: string;
  transcript_raw?: string | null;
  video_title?: string;
  video_id?: string;
  /** New adaptive-profile fields (server-side defaults keep older cards working). */
  tone?: ContentTone;
  density?: ContentDensity;
  hero_quote?: string;
  key_insight?: string;
  stats?: CardStat[];
  /** plan_id when the extract pipeline auto-created a Plan for this note. */
  plan_id?: string | null;
}

export interface Note {
  id: string;
  title: string;
  card_type: CardType;
  conclusion: string;
  pitfall_rating: number;
  excerpt: string;
  created_at: string;
  source_url?: string;
  tone?: ContentTone;
  density?: ContentDensity;
}

export interface NoteDetail extends Note {
  sections: CardSection[];
  transcript_raw?: string | null;
  video_title?: string;
  video_id?: string;
  video_url?: string;
  hero_quote?: string;
  key_insight?: string;
  stats?: CardStat[];
  plan_id?: string | null;
}

export interface VideoInfo {
  title: string;
  thumbnail: string;
  duration: string;
  platform: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export const CARD_TYPE_CONFIG: Record<CardType, { emoji: string; label: string; accent: string }> = {
  recipe: { emoji: '🍳', label: '食谱', accent: '#f97316' },
  insight: { emoji: '💡', label: '洞察', accent: '#10b981' },
  history: { emoji: '📚', label: '历史', accent: '#f59e0b' },
  product: { emoji: '🛒', label: '产品', accent: '#f43f5e' },
  plan: { emoji: '📋', label: '计划', accent: '#6366f1' },
  general: { emoji: '📝', label: '通用', accent: '#64748b' },
};

// ============================================================================
// Plan types
// ============================================================================

export interface PlanTask {
  id: string;
  title: string;
  done: boolean;
  scheduled_at?: string | null;
  reminder_at?: string | null;
}

export interface PlanField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'list' | 'checklist' | 'progress' | 'quote';
  value?: any;
}

export interface PlanDay {
  day: number;
  label: string;
  tasks: PlanTask[];
}

export interface PlanData {
  id: string;
  note_id?: string | null;
  title: string;
  schema_version: number;
  fields: PlanField[];
  tasks: PlanTask[];
  days: PlanDay[];
  status: 'draft' | 'active' | 'done';
  total_days?: number;
  created_at?: string;
  updated_at?: string;
}


/** Day/progress helpers for PlanData. */
export function getPlanCurrentDay(plan: PlanData): number {
  if (!plan.created_at) return 1;
  const start = new Date(plan.created_at);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - start.getTime()) / 86400000);
  return Math.max(1, diffDays + 1);
}

export function getPlanProgress(plan: PlanData): { done: number; total: number; pct: number } {
  const all = plan.days?.flatMap(d => d.tasks) || plan.tasks || [];
  const total = all.length;
  const done = all.filter(t => t.done).length;
  return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
}

export function getTodayTasks(plan: PlanData): PlanTask[] {
  const today = new Date().toISOString().slice(0, 10);
  const all = plan.days?.flatMap(d => d.tasks) || plan.tasks || [];
  return all.filter(t => !t.done && t.scheduled_at?.startsWith(today));
}
export interface PlanStats {
  open_tasks: number;
  due_today: number;
}

// ============================================================================
// Multi-style card display system types
// ============================================================================

/** Card display style presets */
export type CardStyle = 'hero' | 'minimal' | 'standard' | 'creative' | 'magazine' | 'compact';

/** Information density levels */
export type DensityLevel = 'low' | 'medium' | 'high';

/** User settings shape persisted to localStorage */
export interface UserSettings {
  cardStyle: CardStyle;
  density: DensityLevel;
}

/** Per-note override (volatile component state, not persisted) */
export interface NoteOverrides {
  style: CardStyle | null;
  density: DensityLevel | null;
}

/** Metadata descriptor for each card style preset */
export interface CardStyleMeta {
  key: CardStyle;
  label: string;
  description: string;
  icon: string;
}

/** Shared props interface for all card style components */
export interface StyleCardProps {
  cardData: CardData;
  density: DensityLevel;
  cardRef?: React.RefObject<HTMLDivElement | null>;
}

export const CARD_STYLE_CONFIG: Record<CardStyle, CardStyleMeta> = {
  hero:     { key: 'hero',     label: '聚光',  description: '自适应排版，金句+干货分层',   icon: '✦' },
  minimal:  { key: 'minimal',  label: '极简',  description: '纯文本高密度，无装饰',     icon: '◻' },
  standard: { key: 'standard', label: '标准',  description: '玻璃拟物化卡片设计',       icon: '🪟' },
  creative: { key: 'creative', label: '创意',  description: '渐变光晕，装饰丰富',       icon: '🎨' },
  magazine: { key: 'magazine', label: '杂志',  description: '杂志版式，多栏排版',       icon: '📰' },
  compact:  { key: 'compact',  label: '列表',  description: '紧凑列表，可折叠章节',     icon: '📋' },
};

export const DENSITY_CONFIG: Record<DensityLevel, { label: string; description: string }> = {
  low:    { label: '简要', description: '仅展示结论与评分' },
  medium: { label: '标准', description: '章节、结论与评分' },
  high:   { label: '详细', description: '含完整转录原文' },
};

export const DEFAULT_USER_SETTINGS: UserSettings = {
  cardStyle: 'hero',
  density: 'medium',
};
