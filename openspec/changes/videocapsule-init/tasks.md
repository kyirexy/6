## 1. 项目骨架与环境搭建

- [ ] 1.1 初始化 Next.js 15 项目 (App Router + TypeScript + TailwindCSS v4)
- [ ] 1.2 初始化 FastAPI 后端项目目录结构 (`backend/`)
- [ ] 1.3 配置 Python 依赖：litellm, fastapi, uvicorn, sqlalchemy, yt-dlp, faster-whisper
- [ ] 1.4 配置 douyin-mcp-server 为本地可调用服务（确认 FFmpeg 已安装）
- [ ] 1.5 搭建 SQLite 数据库 ORM 模型 (notes 表)
- [ ] 1.6 编写 `docker-compose.yml` 或本地启动脚本（前后端联调）

## 2. 后端核心功能 (video-extract + ai-juicer)

- [ ] 2.1 实现 `POST /api/video/info` 端点：调用 douyin-mcp-server 解析视频元数据
- [ ] 2.2 实现 `POST /api/extract` 端点：调用 douyin-mcp-server 提取文案
- [ ] 2.3 实现 ASR 降级逻辑：MCP 失败时用 yt-dlp + Faster-Whisper 本地转录
- [ ] 2.4 集成 LiteLLM Python SDK，配置 DeepSeek-V3 为默认模型
- [ ] 2.5 实现内容类型自动识别（recipe/insight/history/product/general）
- [ ] 2.6 实现 AI 榨汁 Prompt 模板（按类型生成结构化卡片内容）
- [ ] 2.7 实现 3 行终极结论 + 防踩坑指数生成
- [ ] 2.8 实现笔记自动持久化到 SQLite

## 3. SEO 页面后端 (seo-notes)

- [ ] 3.1 实现 `GET /api/notes` 端点：分页返回笔记列表
- [ ] 3.2 实现 `GET /api/notes/[id]` 端点：返回单个笔记详情
- [ ] 3.3 实现 SEO 元数据生成（标题格式、meta description、OG tags）
- [ ] 3.4 配置 Next.js ISR 为 SEO 页面提供服务端渲染

## 4. 前端 UI 开发 (card-renderer)

- [ ] 4.1 实现暗色主题设计系统（CSS 变量、毛玻璃效果、阴影体系）
- [ ] 4.2 实现首页居中大输入框组件（粘贴链接 → 提交）
- [ ] 4.3 实现卡片渲染组件系统（recipe/insight/history/product 各类型模板）
- [ ] 4.4 实现加载状态动画（skeleton loading + 进度提示）
- [ ] 4.5 实现 3 行结论 + 星级评分的卡片底部展示
- [ ] 4.6 实现一键导出长图功能（html2canvas → PNG 下载）
- [ ] 4.7 实现亮/暗主题切换
- [ ] 4.8 实现 `/notes` 笔记列表页面
- [ ] 4.9 实现 `/notes/[id]` SEO 笔记详情页面（SSG/ISR）

## 5. PWA 与多端部署 (pwa-deploy)

- [ ] 5.1 配置 `next-pwa` 插件，生成 service-worker 和 manifest.json
- [ ] 5.2 配置 iOS Safari "添加到主屏幕" 引导提示
- [ ] 5.3 配置 PWA 离线缓存策略（缓存已查看的笔记）
- [ ] 5.4 编写 Android APK 打包脚本（Capacitor 或 Uni-app WebView 套壳）
- [ ] 5.5 实现安卓用户访问时显示"下载 APK"按钮

## 6. 联调与测试

- [ ] 6.1 端到端测试：粘贴链接 → 提取文案 → AI 生成卡片 → 渲染展示
- [ ] 6.2 端到端测试：AI 生成卡片 → 自动保存 → SEO 页面可访问
- [ ] 6.3 测试 ASR 降级逻辑（模拟 MCP 失败场景）
- [ ] 6.4 测试 PWA 安装流程（Chrome + Safari iOS）
- [ ] 6.5 测试响应式布局（移动端 320px / 平板 768px / 桌面 1024px+）
