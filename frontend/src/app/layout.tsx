import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import ThemeToggle from '@/components/ThemeToggle';
import QRModal from '@/components/QRModal';
import Providers from './Providers';
import './globals.css';

const inter = localFont({
  src: './InterVariable.woff2',
  display: 'swap',
  variable: '--font-inter',
  weight: '100 900',
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
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || 'dark';
                document.documentElement.setAttribute('data-theme', theme);
              } catch (e) {}
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
                });
              }
            `,
          }}
        />
      </head>
      <body className="min-h-[100dvh] flex flex-col">
        {/* Floating glass nav pill */}
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-4xl">
          <header
            className="glass rounded-2xl px-2 py-1.5 md:px-3 md:py-2"
            style={{
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
            }}
          >
            <div className="mx-auto max-w-6xl flex items-center justify-between px-3 py-1.5 md:px-4 md:py-2">
              <a
                href="/"
                className="flex items-center gap-2.5 text-foreground no-underline group"
              >
                <span className="text-xl md:text-2xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110 group-hover:rotate-6">
                  🫒
                </span>
                <span className="text-base md:text-lg font-bold tracking-tight text-balance">
                  收藏夹榨汁机
                </span>
              </a>
              <nav className="flex items-center gap-1 md:gap-1.5">
                <a
                  href="/notes"
                  className="relative text-foreground-secondary hover:text-foreground transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] text-sm font-medium px-3.5 py-2 rounded-xl hover:bg-white/[0.06] min-h-[40px] flex items-center group/nav"
                >
                  知识库
                  <span className="absolute bottom-1 left-3.5 right-3.5 h-px bg-accent-emerald scale-x-0 group-hover/nav:scale-x-100 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] origin-left" />
                </a>
                <div className="hidden md:block">
                  <QRModal />
                </div>
                <ThemeToggle />
              </nav>
            </div>
          </header>
        </div>

        {/* Spacer for floating nav */}
        <div className="h-16 md:h-[4.5rem]" />

        {/* Main content */}
        <main className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8 flex-1 w-full">
          <Providers>{children}</Providers>
        </main>

        {/* Footer */}
        <footer className="relative border-t border-card-border/50 py-8 md:py-10">
          <div className="mx-auto max-w-6xl px-4 md:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-foreground-muted text-xs">
            <p className="flex items-center gap-2">
              <span className="text-base">🫒</span>
              <span>VideoCapsule · 让每一段视频都有价值</span>
            </p>
            <p className="text-foreground-muted/60">知识卡片提取工具</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
