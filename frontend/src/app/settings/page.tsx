'use client';

import { Smartphone, Globe, Cpu } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto pb-24">
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-3xl font-bold text-foreground tracking-tight">设置</h1>
        <p className="text-foreground-muted text-sm mt-1">应用信息与连接状态</p>
      </div>

      <div className="space-y-4">
        <div className="p-5 rounded-2xl bg-card-bg border border-card-border">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🫒</span>
            <div>
              <p className="text-base font-semibold text-foreground">知萃 KnowBrew</p>
              <p className="text-xs text-foreground-muted mt-0.5">知萃 v0.1.0</p>
            </div>
          </div>
          <p className="text-sm text-foreground-secondary leading-relaxed">
            将短视频一键转化为结构化知识卡片。支持食谱提取、知识洞察、历史解读、好物推荐和计划管理。
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-card-bg border border-card-border space-y-4">
          <div className="flex items-center gap-3">
            <Smartphone size={18} className="text-accent-emerald flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">连接方式</p>
              <p className="text-xs text-foreground-muted mt-0.5">
                App 通过 adb reverse 连接 PC 后端 (localhost:8000)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Globe size={18} className="text-foreground-muted flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">Web 版</p>
              <p className="text-xs text-foreground-muted mt-0.5">
                浏览器访问 localhost:3000，API 通过 Next.js rewrite 代理
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Cpu size={18} className="text-foreground-muted flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">AI 引擎</p>
              <p className="text-xs text-foreground-muted mt-0.5">
                DeepSeek Flash · 后端 Python FastAPI + SQLite
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card-bg border border-card-border">
          <p className="text-xs text-foreground-muted leading-relaxed text-center">
            如遇连接问题，请确保手机通过 USB 连接电脑且 adb reverse tcp:8000 tcp:8000 已启用
          </p>
        </div>
      </div>
    </div>
  );
}
