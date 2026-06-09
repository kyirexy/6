export type CardType = 'recipe' | 'insight' | 'history' | 'product' | 'general';

export interface CardSection {
  title: string;
  content: string;
  emoji?: string;
}

export interface CardData {
  card_type: CardType;
  title: string;
  sections: CardSection[];
  conclusion: string;
  pitfall_rating: number;
  source_url?: string;
  created_at?: string;
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
