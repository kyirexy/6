# 🫒 收藏夹榨机 (VideoCapsule) — 开发规范

> 将长视频转化为高颜值知识卡片的个人生产力工具

## 1. 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js 15)                    │
│  ┌──────────┐  ┌──────────────┐  ┌────────────┐  ┌──────────┐  │
│  │ InputBar │  │ CardRenderer │  │ Notes List │  │ NotePage │  │
│  └────┬─────┘  └──────┬───────┘  └─────┬──────┘  └────┬─────┘  │
│       │               │                │              │         │
│       └───────────────┴────────────────┴──────────────┘         │
│                           │ REST API                            │
└───────────────────────────┼─────────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────────┐
│                    Backend (FastAPI)                              │
│  ┌────────────────────────┴────────────────────────────────┐    │
│  │  API Routes: /api/extract, /api/notes, /api/health      │    │
│  └──────┬──────────────┬──────────────┬────────────────────┘    │
│         │              │              │                          │
│  ┌──────┴──────┐ ┌─────┴──────┐ ┌────┴───────┐                  │
│  │VideoExtract │ │ AI Juicer  │ │NoteService │                  │
│  │(douyin-mcp) │ │(LiteLLM+DS)│ │ (SQLite)   │                  │
│  └──────┬──────┘ └─────┬──────┘ └────────────┘                  │
│         │              │                                         │
│  ┌──────┴──────┐ ┌─────┴──────┐                                 │
│  │yt-dlp+Whisper│ │ LiteLLM   │                                 │
│  │ (fallback)  │ │(DeepSeek-V3)│                                │
│  └─────────────┘ └────────────┘                                 │
└─────────────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────────┐
│                  External Services                               │
│  ┌──────────────┐  ┌─────┴──────┐  ┌───────────────────┐       │
│  │douyin-mcp-   │  │ DeepSeek   │  │ 硅基流动/百炼API  │       │
│  │server (ASR)  │  │   API      │  │  (ASR fallback)   │       │
│  └──────────────┘  └────────────┘  └───────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

## 2. 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 前端框架 | Next.js (App Router) | 15.x |
| 样式 | TailwindCSS | 4.x |
| 语言 | TypeScript | 5.x |
| 后端框架 | FastAPI | 0.115+ |
| 语言 | Python | 3.12 |
| LLM 网关 | LiteLLM | 1.50+ |
| LLM 模型 | DeepSeek-V3 | deepseek-chat |
| ASR 主 | dashscope (paraformer-v2) | via douyin-mcp-server |
| ASR 备 | yt-dlp + Faster-Whisper | 1.2+ |
| 数据库 | SQLite (MVP) → PostgreSQL | - |
| ORM | SQLAlchemy | 2.0+ |
| PWA | next-pwa | - |
| 包管理 | npm (前端) / pip (后端) | - |

## 3. 项目结构

```
D:/6month/
├── frontend/                # Next.js 前端
│   ├── src/
│   │   ├── app/            # App Router pages
│   │   ├── components/     # React components
│   │   └── lib/            # API client, types
│   ├── public/             # Static assets, manifest.json
│   └── next.config.ts      # PWA config
├── backend/                 # FastAPI 后端
│   ├── app/
│   │   ├── api/            # Route handlers
│   │   ├── core/           # Config, database
│   │   ├── models/         # SQLAlchemy models
│   │   └── services/       # Business logic
│   └── run.py              # Entry point
├── douyin-mcp-server/       # Cloned dependency (底层服务)
├── openspec/                # OpenSpec change tracking
├── .env.example             # Environment template
├── DEVELOPMENT_SPEC.md      # This file
└── README.md                # Project README
```

## 4. 数据库设计

### notes 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID (PK) | 笔记唯一标识 |
| video_id | String | 抖音视频 ID |
| video_title | String | 原视频标题 |
| video_url | String | 无水印视频链接 |
| transcript_raw | Text | 原始 ASR 文案 |
| ai_summary | Text | AI 生成的结构化 JSON |
| card_type | String | recipe/insight/history/product/general |
| seo_title | String | SEO 优化标题 |
| seo_slug | String | URL slug (unique, indexed) |
| seo_meta | String | meta description |
| pitfall_rating | Integer | 1-5 星 |
| created_at | DateTime | 创建时间 |
| updated_at | DateTime | 更新时间 |

## 5. API 接口契约

### POST /api/video/info
```json
// Request
{ "url": "https://v.douyin.com/xxxxx/" }
// Response
{ "success": true, "data": { "video_id": "7600361826030865707", "title": "...", "download_url": "..." } }
```

### POST /api/extract
```json
// Request
{ "url": "https://v.douyin.com/xxxxx/" }
// Response
{
  "success": true,
  "data": {
    "note_id": "uuid",
    "video_id": "...",
    "title": "...",
    "transcript": "...",
    "card": {
      "card_type": "recipe",
      "sections": [{ "title": "食材清单", "content": "...", "emoji": "🥘" }],
      "conclusion": "line1\nline2\nline3",
      "pitfall_rating": 4
    },
    "seo_slug": "abc123"
  }
}
```

### GET /api/notes?page=1&per_page=20
```json
{
  "success": true,
  "data": {
    "notes": [{ "id": "...", "title": "...", "card_type": "...", "pitfall_rating": 4, "created_at": "..." }],
    "total": 100,
    "page": 1,
    "per_page": 20
  }
}
```

### GET /api/notes/{note_id}
```json
{
  "success": true,
  "data": {
    "id": "...",
    "video_title": "...",
    "transcript_raw": "...",
    "ai_summary": "{...}",
    "card_type": "recipe",
    "seo_title": "《【视频干货】...的文字笔记与步骤总结》",
    "pitfall_rating": 4,
    "created_at": "..."
  }
}
```

## 6. UI 设计系统

### 色彩方案 (Dark Mode Default)

| Token | Value | 用途 |
|-------|-------|------|
| bg-primary | #0a0a0f → #1a1a2e | 页面渐变背景 |
| bg-card | rgba(255,255,255,0.05) | 卡片背景 + backdrop-blur |
| text-primary | #f8fafc | 主文字 |
| text-secondary | #94a3b8 | 次要文字 |
| accent-emerald | #10b981 | insight 类型强调 |
| accent-amber | #f59e0b | history/product 类型 |
| accent-rose | #f43f5e | recipe 类型 |
| border | rgba(255,255,255,0.1) | 边框 |
| shadow | soft colored glows | 阴影效果 |

### 组件规范

- 圆角：卡片 16px，输入框 12px，按钮 8px
- 间距：基础 4px 网格 (4/8/12/16/24/32/48)
- 字体：Inter (Google Fonts)
- 毛玻璃：`backdrop-blur-xl bg-white/5 border border-white/10`
- 动画：`transition-all duration-300 ease-out`

### 卡片类型主题

| 类型 | Emoji | 强调色 | 背景渐变 |
|------|-------|--------|---------|
| recipe | 🍕 | #f43f5e | rose-500/10 |
| insight | 💡 | #10b981 | emerald-500/10 |
| history | 📚 | #f59e0b | amber-500/10 |
| product | 🛒 | #8b5cf6 | violet-500/10 |
| general | 📝 | #64748b | slate-500/10 |

## 7. 多端部署

| 平台 | 方案 | 说明 |
|------|------|------|
| Web | Vercel / 自托管 | Next.js 标准部署 |
| iOS | PWA | Safari "添加到主屏幕" |
| Android | APK (Capacitor) | Web → APK 套壳 |

## 8. 开发规范

- 提交格式：`<type>: <description>` (feat/fix/refactor/docs/test/chore)
- 分支策略：feature branches → main
- 测试覆盖：80% 最低要求
- 代码风格：ESLint (前端) / Ruff (后端)
