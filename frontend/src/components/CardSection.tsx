'use client';

import { CardSection as CardSectionType } from '@/lib/types';

interface CardSectionProps {
  section: CardSectionType;
  index: number;
  accentColor?: string;
}

function formatContent(content: string): React.ReactNode {
  // Split by lines and process
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let listType: 'ol' | 'ul' | null = null;

  const flushList = () => {
    if (listItems.length > 0) {
      const ListTag = listType === 'ol' ? 'ol' : 'ul';
      elements.push(
        <ListTag key={`list-${elements.length}`} className="space-y-2 my-3">
          {listItems.map((item, i) => (
            <li key={i} className="text-foreground-secondary leading-relaxed text-sm">
              {formatInline(item)}
            </li>
          ))}
        </ListTag>
      );
      listItems = [];
      listType = null;
    }
  };

  const formatInline = (text: string): React.ReactNode => {
    // Bold text: **text**
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-foreground font-semibold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      continue;
    }

    // Check for numbered list: 1️⃣ or 1. or 1)
    const numberedMatch = trimmed.match(/^(?:[1-9]️⃣\s*|(\d+)[.)]\s*)(.*)/);
    if (numberedMatch) {
      if (listType !== 'ol') {
        flushList();
        listType = 'ol';
      }
      listItems.push(numberedMatch[2] || trimmed.replace(/^[1-9]️⃣\s*/, ''));
      continue;
    }

    // Check for bullet points: - or •
    const bulletMatch = trimmed.match(/^[•\-\*]\s+(.*)/);
    if (bulletMatch) {
      if (listType !== 'ul') {
        flushList();
        listType = 'ul';
      }
      listItems.push(bulletMatch[1]);
      continue;
    }

    flushList();
    elements.push(
      <p key={`p-${elements.length}`} className="text-foreground-secondary leading-relaxed text-sm mb-3">
        {formatInline(trimmed)}
      </p>
    );
  }

  flushList();
  return <>{elements}</>;
}

export default function CardSection({ section, index, accentColor = 'var(--accent-emerald)' }: CardSectionProps) {
  const emoji = section.emoji || '📌';

  return (
    <div
      className="animate-fade-in"
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
    >
      <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
        <span className="text-lg">{emoji}</span>
        <span>{section.title}</span>
      </h3>
      <div className="card-content pl-1">
        {formatContent(section.content)}
      </div>
    </div>
  );
}
