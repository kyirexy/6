export type CardType = 'recipe' | 'insight' | 'history' | 'product' | 'general';

export interface CardSection {
  title: string;
  content: string;
  emoji?: string;
}

export interface CardData {
  id?: string;
  card_type: CardType;
  title: string;
  sections: CardSection[];
  conclusion: string;
  pitfall_rating: number;
  source_url?: string;
  created_at?: string;
  transcript_raw?: string | null;
  video_title?: string;
  video_id?: string;
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
}

export interface NoteDetail extends Note {
  sections: CardSection[];
  transcript_raw?: string | null;
  video_title?: string;
  video_id?: string;
  video_url?: string;
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
  general: { emoji: '📝', label: '通用', accent: '#64748b' },
};

// ============================================================================
// Multi-style card display system types
// ============================================================================

/** Card display style presets */
export type CardStyle = 'minimal' | 'standard' | 'creative' | 'magazine' | 'compact';

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
  minimal:  { key: 'minimal',  label: '极简',  description: '纯文本高密度，无装饰',     icon: '◻️' },
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
  cardStyle: 'standard',
  density: 'medium',
};
