## Context

「收藏夹榨汁机 (VideoCapsule)」是一个全新项目，目标是将长视频转化为高颜值知识卡片。当前状态：

- 已 clone `douyin-mcp-server` 作为底层文案提取引擎，它提供 MCP 工具（`parse_douyin_video_info`、`get_douyin_download_link`、`extract_douyin_text`）和一个 FastAPI WebUI
- `douyin-mcp-server` 使用阿里云百炼 dashscope API（paraformer-v2）做 ASR，也支持硅基流动 SenseVoice API
- 用户要求使用 LiteLLM 作为 LLM 统一网关调用 DeepSeek
- 前端要求 JS 全栈（Next.js + TailwindCSS），配置 PWA

约束条件：
- 系统为 Windows 11，代理端口 7892
- 需要 Python 3.10+、Node.js 20+、FFmpeg
- 优先低成本方案（DeepSeek-V3 文本模型极低价格）

## Goals / Non-Goals

**Goals:**
- 搭建完整的前后端分离架构：Next.js 前端 ↔ FastAPI 后端 ↔ douyin-mcp-server + LiteLLM
- 实现"粘贴链接 → 提取文案 → AI 生成卡片 → SEO 页面"全自动闭环
- 高颜值 UI（暗色主题 + 毛玻璃 + 卡片流），支持 PWA 离线和 iOS 添加到主屏幕
- 本地降级 ASR（yt-dlp + Faster-Whisper）确保提取成功率
- SEO 自动化：每个笔记自动生成公开页面 `/notes/[id]`

**Non-Goals:**
- 不做用户注册/登录系统（MVP 阶段，笔记通过 URL 分享）
- 不做视频剪辑功能
- 不做多平台视频源支持（MVP 仅支持抖音，后续扩展 B站/YouTube）
- 不做原生 iOS/Android App（通过 PWA + APK 套壳实现）

## Decisions

### D1: 前端框架 — Next.js 15 (App Router) + TailwindCSS v4

**选择理由**：
- Next.js 的 App Router 支持 SSR/SSG，天然利于 SEO（`/notes/[id]` 页面可静态生成）
- TailwindCSS 的 utility-first 方式快速实现高颜值 UI
- 生态成熟，PWA 支持通过 `next-pwa` 插件即可完成

**备选方案**：
- Vue3 + Vite：同样可行，但 Next.js 的 SSG 对 SEO 更友好
- Nuxt3：Vue 生态的全栈方案，但社区规模和 PWA 插件成熟度不如 Next.js

### D2: 后端框架 — Python FastAPI

**选择理由**：
- douyin-mcp-server 已使用 FastAPI，保持技术栈一致
- FastAPI 原生支持 async，适合 IO 密集型的视频下载和 LLM 调用
- 自动生成 OpenAPI 文档，前后端联调方便

**备选方案**：
- Flask：同步框架，不适合高并发场景
- Express.js：如果全 JS 栈，但 ASR/视频处理 Python 生态更成熟

### D3: LLM 网关 — LiteLLM (Python SDK 模式)

**选择理由**：
- 统一接口调用 DeepSeek-V3，后续可无缝切换到其他模型
- 直接在 FastAPI 中以 SDK 模式引入，无需额外部署代理服务
- 支持 100+ LLM 提供商，一个 API 走天下

**备选方案**：
- 直接调用 DeepSeek API：可行但耦合度高，切换模型需改代码
- 自建 LLM 代理：过度工程，MVP 不需要

### D4: 数据库 — SQLite (MVP) → PostgreSQL (生产)

**选择理由**：
- SQLite 零配置，MVP 阶段快速启动
- 使用 SQLAlchemy ORM，后续迁移 PostgreSQL 只需改连接字符串
- 存储结构简单：笔记、视频元数据、SEO 页面

**数据模型**：
```
notes 表：
- id (PK, UUID)
- video_id (抖音视频ID)
- video_title (原视频标题)
- video_url (无水印视频链接)
- transcript_raw (原始文案)
- ai_summary (AI 榨汁后的结构化内容)
- card_type (卡片类型：recipe/quote/history/product)
- seo_title (SEO 优化标题)
- seo_slug (URL slug)
- seo_meta (meta description)
- created_at, updated_at
```

### D5: ASR 降级策略

**策略**：douyin-mcp-server (主) → yt-dlp + Faster-Whisper (备)

```
1. 尝试调用 douyin-mcp-server 的 extract_douyin_text
2. 若失败（网络/配额/格式问题），降级为：
   a. yt-dlp 下载视频音频流
   b. Faster-Whisper (tiny/base 模型) 本地转录
3. 两路都失败则返回错误
```

### D6: AI 榨汁 Prompt 设计

通过 LiteLLM 调用 DeepSeek-V3，根据内容类型动态选择 prompt：

| 识别类型 | 卡片格式 | Emoji 装饰 |
|---------|---------|------------|
| 美食做菜 | 食材清单 + 步骤 1️⃣2️⃣3️⃣ | 🍳🥘🍜 |
| 认知搞钱 | 金句脑图 + 行动清单 | 💡🧠💰 |
| 历史科普 | 时间线 + 关键人物 | 📚🏛️⏳ |
| 好物推荐 | 产品对比 + 推荐指数 | 🛒⭐✅ |

每个卡片统一包含：
- 【3行字终极结论】
- 【防踩坑避雷指数】⭐（满分5星）

### D7: SEO 页面生成

- 每个笔记保存后自动生成静态路由 `/notes/[id]`
- SEO 标题格式：`《【视频干货】{原视频标题}的文字笔记与步骤总结》`
- Next.js 的 `generateStaticParams` 预生成热门页面
- 动态页面通过 ISR (Incremental Static Regeneration) 保证新鲜度

### D8: 多端部署方案

| 平台 | 方案 | 实现方式 |
|------|------|---------|
| Web | Vercel/自托管 | Next.js 标准部署 |
| iOS | PWA | Safari "添加到主屏幕"，配置 manifest.json + apple-touch-icon |
| Android | APK 套壳 | Uni-app 或 Capacitor 将 Web 打包为 APK |

## Risks / Trade-offs

- **[抖音反爬]** → 使用移动端 UA + 请求频率限制，必要时引入代理池
- **[ASR 准确率]** → Faster-Whisper tiny 模型中文准确率有限，可升级 base/small 模型
- **[DeepSeek API 延迟]** → 流式输出 + 前端 loading 动画缓解
- **[SQLite 并发]** → MVP 阶段单用户可接受，生产环境迁移 PostgreSQL
- **[PWA iOS 限制]** → iOS Safari 对 PWA 支持有限（无推送通知），但核心功能可用
