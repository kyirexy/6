# 🫒 收藏夹榨汁机 (VideoCapsule)

> 将长视频转化为高颜值知识卡片的个人生产力工具

## ✨ 功能特性

- 🎬 **文案提取** — 粘贴抖音链接，自动提取无水印视频文案
- 🧠 **AI 智能榨汁** — DeepSeek 自动识别内容类型，生成结构化卡片
- 📝 **多类型卡片** — 美食菜谱、认知金句、历史科普、好物推荐
- ⭐ **防踩坑指数** — 3行终极结论 + 5星避雷评分
- 🔍 **SEO 自动化** — 每个笔记自动生成公开可抓取页面
- 📱 **多端支持** — Web PWA (iOS) + Android APK

## 🚀 快速开始

### 环境要求

- Python 3.10+
- Node.js 20+
- FFmpeg

### 安装

```bash
# 1. 克隆项目
git clone <your-repo>
cd 6month

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 填入 API Keys

# 3. 启动后端
cd backend
pip install -r requirements.txt
python run.py

# 4. 启动前端
cd frontend
npm install
npm run dev
```

### 访问

- 前端: http://localhost:3000
- 后端 API: http://localhost:8000
- API 文档: http://localhost:8000/docs

## 📁 项目结构

```
├── frontend/          # Next.js 15 + TailwindCSS v4
├── backend/           # FastAPI + LiteLLM + SQLAlchemy
├── douyin-mcp-server/ # 底层文案提取服务
├── openspec/          # 开发规范 (OpenSpec)
└── DEVELOPMENT_SPEC.md # 完整开发规范文档
```

## 📄 License

MIT
