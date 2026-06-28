# SuperNovba ⚡

**跨平台轻量化 AI 多模态营销物料生成工具**

输入一款产品，AI 从情感、数据、幽默、社交、生活方式等 5 个创意角度生成营销方向——帮你发现产品被忽视的可能性。

## 🎯 核心价值

- **多样性** — 5种创意透镜，每轮从不同角度挖掘产品可能
- **快速** — 10秒内完成多角度创意构思
- **创造力** — 高温度+并行生成确保每次都不一样
- **辅助想象** — 启发灵感，不是替代判断

## 🛠 技术栈

| 层 | 技术 |
|---|---|
| 移动端 | React Native (Expo) |
| Web + API | Next.js 16 (App Router) |
| AI 文本 | DeepSeek (deepseek-v4) |
| AI 图片 | Seedream 5.0 (火山引擎) |
| 数据库 | Supabase (PostgreSQL) |
| 部署 Web | Vercel |
| 部署 iOS | EAS Build + Xcode |

## 📁 项目结构

```
SuperNovba/
├── apps/web/          # Next.js Web 应用 + API
├── apps/mobile/       # Expo 移动端应用
├── packages/shared/   # 共享类型定义
├── supabase/          # 数据库迁移
├── CLAUDE.md          # 项目指令文档
└── .env.example       # 环境变量模板
```

## 🚀 快速开始

### 前置条件

- Node.js >= 20
- DeepSeek API Key
- Supabase 账号（免费）

### 安装运行

```bash
# 1. 克隆并进入项目
cd SuperNovba

# 2. 配置环境变量
cp .env.example apps/web/.env.local
# 编辑 apps/web/.env.local，填入 API Keys

# 3. 安装依赖
cd apps/web
npm install --registry=https://registry.npmmirror.com

# 4. 启动开发服务器
npm run dev

# 5. 打开浏览器
# http://localhost:3000
```

### Web 端部署

```bash
# 推送到 GitHub，在 Vercel 中导入项目
# Vercel 自动检测 Next.js，零配置部署
```

### iOS 端部署

```bash
cd apps/mobile
npm install --registry=https://registry.npmmirror.com
npx eas build --platform ios
# 在 Mac Mini 上用 Xcode 提交到 App Store
```

## 📖 开发阶段

| 阶段 | 内容 | 状态 |
|---|---|---|
| Phase 0 | 项目初始化 | ✅ 完成 |
| Phase 1 | AI 流水线 + SSE API | ✅ 完成 |
| Phase 2 | Web MVP | ✅ 完成 |
| Phase 3 | 移动端 App | 🚧 骨架已建 |
| Phase 4 | 打磨优化 | 📋 待开始 |
| Phase 5 | App Store 上架 | 📋 待开始 |

## 🔑 环境变量

| 变量 | 说明 |
|---|---|
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥 |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名 Key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务端 Key |
| `VOLCENGINE_ACCESS_KEY` | 火山引擎 AK |
| `VOLCENGINE_SECRET_KEY` | 火山引擎 SK |
