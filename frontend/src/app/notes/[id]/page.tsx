import type { Metadata } from 'next';
import NotePageClient from './NotePageClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${API_BASE}/api/notes/${id}`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return {
        title: '笔记未找到 | VideoCapsule',
        description: '该知识卡片不存在或已被删除',
      };
    }

    const note = await response.json();

    return {
      title: `${note.title} | VideoCapsule`,
      description: note.excerpt || note.conclusion?.slice(0, 160) || '来自 VideoCapsule 的知识卡片',
      openGraph: {
        title: note.title,
        description: note.excerpt || note.conclusion?.slice(0, 160),
        type: 'article',
      },
    };
  } catch {
    return {
      title: '知识卡片 | VideoCapsule',
      description: '来自 VideoCapsule 的知识卡片',
    };
  }
}

export default function NotePage() {
  return <NotePageClient />;
}
