## Why

自媒体和普通用户在观看长视频（抖音/B站等）时，有价值的干货信息淹没在冗长的内容中，难以留存和检索。现有工具要么只做简单转录，要么缺乏美观的知识整理体验。我们需要一个将长视频一键转化为高颜值"知识卡片、菜谱清单、备忘录笔记"的个人生产力工具——「收藏夹榨汁机 (VideoCapsule)」。

核心差异化：不只是"文案提取"，而是**AI 智能榨汁**——自动识别内容类型并输出结构化、可分享、SEO 友好的精美卡片。

## What Changes

- **新建完整 Web 应用**：基于 JS 全栈（Next.js + TailwindCSS），提供高颜值暗色主题 UI
- **后端 Python FastAPI 服务**：封装 douyin-mcp-server 作为底层文案提取引擎，接入 LiteLLM 统一调用 DeepSeek 等大模型
- **AI 智能体榨汁层**：自动识别视频类型（美食/认知/历史/好物），输出不同格式的结构化卡片
- **SEO 自动化**：每个 AI 生成的笔记自动持久化为公开可抓取的静态页面 `/notes/[id]`
- **多端部署**：Web PWA（iOS 免安装）+ Android APK（Uni-app 打包）
- **本地降级 ASR**：当 douyin-mcp-server 提取失败时，自动降级为 yt-dlp + Faster-Whisper 本地转录

## Capabilities

### New Capabilities
- `video-extract`: 视频文案提取核心——调用 douyin-mcp-server API 解析链接、下载无水印视频、提取文案文本，失败时降级为本地 yt-dlp + Faster-Whisper
- `ai-juicer`: AI 智能榨汁层——通过 LiteLLM 调用 DeepSeek，自动识别内容类型，生成结构化卡片（菜谱步骤、金句脑图、好物清单等），输出 3 行终极结论和防踩坑指数
- `card-renderer`: 高颜值卡片渲染引擎——前端组件系统，支持多种卡片类型模板，一键导出长图
- `seo-notes`: SEO 笔记自动生成——将 AI 生成的笔记持久化到数据库，动态渲染为公开静态页面，自动优化标题和 meta 标签
- `pwa-deploy`: PWA 多端部署——配置 Service Worker 离线支持、iOS 添加到主屏幕引导、Android APK 打包脚本

### Modified Capabilities

（无，这是全新项目）

## Impact

- **新增依赖**：douyin-mcp-server（已 clone 作为底层服务）、LiteLLM（LLM 统一网关）、DeepSeek API、Faster-Whisper（本地 ASR 降级）、Next.js、TailwindCSS、SQLite/PostgreSQL
- **基础设施**：需要 Python 3.10+ 运行时（后端）、Node.js 20+（前端）、FFmpeg（音视频处理）
- **API 接口**：新建 FastAPI 后端 REST API，对接 douyin-mcp-server 的 MCP 工具和 LiteLLM 的统一 LLM 接口
- **数据存储**：新建数据库存储用户提取的笔记、视频元数据、SEO 页面
