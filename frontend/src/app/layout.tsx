import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import ThemeToggle from '@/components/ThemeToggle';
import QRModal from '@/components/QRModal';
import BottomTabBar from '@/components/BottomTabBar';
import GlobalSheetManager from '@/components/GlobalSheetManager';
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
  title: '知萃 · 视频知识萃取工具',
  description: 'AI 驱动的视频知识萃取工具。粘贴视频链接，自动生成结构化知识卡片、任务计划和行动清单。',
  keywords: ['知萃', '视频知识萃取', 'AI知识卡片', '视频笔记', '哔哩哔哩', 'YouTube', 'KnowBrew'],
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
              // Detect Capacitor native app — hide web-only elements.
              (function () {
                try {
                  if (window.Capacitor && window.Capacitor.isNativePlatform()) {
                    document.documentElement.setAttribute('data-capacitor', 'true');
                  }
                } catch (e) {}
              })();
              // Service Worker is production-only. In dev (localhost / 127.0.0.1
              // / *.local), Turbopack rotates chunk hashes on every edit, but a
              // cache-first SW keeps serving stale chunks → 404 → Next refresh
              // → SW returns stale HTML → infinite reload loop. So in dev we
              // also actively unregister any SW that a previous prod build (or
              // a previous version of this app) left behind, and clear its
              // caches.
              (function () {
                if (!('serviceWorker' in navigator)) return;
                var host = location.hostname;
                var isDev =
                  host === 'localhost' ||
                  host === '127.0.0.1' ||
                  host === '0.0.0.0' ||
                  host.endsWith('.local');
                if (isDev) {
                  navigator.serviceWorker.getRegistrations().then(function (regs) {
                    regs.forEach(function (r) { r.unregister(); });
                  }).catch(function () {});
                  if (window.caches) {
                    caches.keys().then(function (keys) {
                      keys.forEach(function (k) { caches.delete(k); });
                    }).catch(function () {});
                  }
                  return;
                }
                window.addEventListener('load', function () {
                  navigator.serviceWorker.register('/sw.js').catch(function () {});
                });
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-[100dvh] flex flex-col">
        {/* Floating glass nav pill — hidden inside Capacitor app (native shell has its own chrome).
            The .capacitor-hide class is set by the inline script in <head>. */}
        <div className="capacitor-hide fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-4xl">
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
                  知萃
                </span>
              </a>
              <nav className="flex items-center gap-1 md:gap-1.5">
                {/* Desktop-only: "知识库" link. On mobile, this nav item lives
                    in the BottomTabBar so the top bar stays minimal. */}
                <a
                  href="/notes"
                  className="relative text-foreground-secondary hover:text-foreground transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] text-sm font-medium px-3.5 py-2 rounded-xl hover:bg-white/[0.06] min-h-[40px] hidden md:flex items-center group/nav"
                >
                  知识库
                  <span className="absolute bottom-1 left-3.5 right-3.5 h-px bg-accent-emerald scale-x-0 group-hover/nav:scale-x-100 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] origin-left" />
                </a>
                {/* Desktop-only: "计划" link. Mobile equivalent in TabBar. */}
                <a
                  href="/plans"
                  className="relative text-foreground-secondary hover:text-foreground transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] text-sm font-medium px-3.5 py-2 rounded-xl hover:bg-white/[0.06] min-h-[40px] hidden md:flex items-center group/nav"
                >
                  计划
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

        {/* Main content — extra bottom padding on mobile so content clears
            the fixed BottomTabBar (60px tabbar + safe-area + breathing room). */}
        <main className="mx-auto max-w-6xl px-5 pt-6 pb-24 md:px-8 md:py-8 lg:px-12 flex-1 w-full">
          <Providers>
            <GlobalSheetManager />
            {children}
          </Providers>
        </main>

        {/* Footer — desktop only. On mobile the BottomTabBar replaces it. */}
        <footer className="relative border-t border-card-border/50 py-8 md:py-10 hidden md:block">
          <div className="mx-auto max-w-6xl px-4 md:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-foreground-muted text-xs">
            <p className="flex items-center gap-2">
              <span className="text-base">🫒</span>
              <span>知萃 · 萃取视频里的全部干货</span>
            </p>
            <p className="text-foreground-muted/60">知识卡片提取工具</p>
          </div>
        </footer>

        {/* Mobile-only: bottom tab bar (hidden on md+). */}
        <BottomTabBar />
      </body>
    </html>
  );
}
