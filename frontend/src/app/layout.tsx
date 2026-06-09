import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import ThemeToggle from '@/components/ThemeToggle';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#10b981',
};

export const metadata: Metadata = {
  title: '收藏夹榨汁机 | VideoCapsule',
  description: '将视频转化为精美知识卡片，快速提取核心信息，告别信息过载',
  keywords: ['视频笔记', '知识卡片', '视频提取', 'VideoCapsule'],
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={inter.variable} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || 'dark';
                document.documentElement.setAttribute('data-theme', theme);
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="glass sticky top-0 z-50 px-6 py-4">
          <div className="mx-auto max-w-6xl flex items-center justify-between">
            <a href="/" className="flex items-center gap-3 text-foreground no-underline hover:opacity-80 transition-opacity">
              <span className="text-2xl">🫒</span>
              <span className="text-lg font-semibold tracking-tight">收藏夹榨汁机</span>
            </a>
            <nav className="flex items-center gap-6">
              <a
                href="/notes"
                className="text-foreground-secondary hover:text-foreground transition-colors text-sm font-medium"
              >
                知识库
              </a>
              <ThemeToggle />
            </nav>
          </div>
        </header>

        {/* Main content */}
        <main className="mx-auto max-w-6xl px-6 py-8 flex-1 w-full">
          {children}
        </main>

        {/* Footer */}
        <footer className="py-8 text-center text-foreground-muted text-sm">
          <p>VideoCapsule · 让每一段视频都有价值</p>
        </footer>
      </body>
    </html>
  );
}
