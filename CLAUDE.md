# SuperNovba — 项目指令

## 项目概述

SuperNovba 是一款跨平台（iOS App Store + Web）轻量化 AI 多模态营销物料生成工具。

**核心价值：创造力、多样性、快速生成、辅助想象**
— 不是专业营销平台，而是帮助用户发现产品多样可能的灵感引擎。

## 技术栈

| 层 | 技术 | 说明 |
|---|---|---|
| 移动端 | React Native (Expo SDK 52+) | apps/mobile |
| Web 前端 + API | Next.js 16 (App Router) | apps/web |
| AI 文本生成 | DeepSeek (deepseek-v4) | @ai-sdk/openai 兼容 |
| AI 图片生成 | Seedream 5.0 (火山引擎) | 异步任务 + 轮询 |
| 数据库/认证/存储 | Supabase | PostgreSQL + Auth + Storage |
| 部署 (Web) | Vercel | git push 自动部署 |
| 部署 (iOS) | EAS Build + Mac Mini Xcode | 云构建 IPA |
| 语言 | TypeScript 全栈 | — |

## 目录结构

```
SuperNovba/
├── apps/web/          # Next.js (Web + API)
├── apps/mobile/       # Expo (iOS)
├── packages/shared/   # 共享类型和常量
├── supabase/          # 数据库迁移
├── CLAUDE.md          # 本文件
└── .env.example       # 环境变量模板
```

## 环境变量

开发前复制 `.env.example` 为 `.env.local` 并填写：
- `DEEPSEEK_API_KEY` — DeepSeek API 密钥
- `VOLCENGINE_ACCESS_KEY` + `VOLCENGINE_SECRET_KEY` — 火山引擎 AK/SK
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase

## 开发启动

```bash
# Web 开发
cd apps/web && npm run dev

# 移动端开发
cd apps/mobile && npx expo start
```

## AI 流水线

5 阶段流水线（见 `apps/web/src/lib/ai/pipeline.ts`）：
1. 产品分析 → 2. 多角度并行生成 (5创意透镜) → 3. 图片提示词优化 → 4. 图片生成 → 5. 卡片组装

SSE 流式 API 端点：`POST /api/generate`

## 关键决策

- 用户认证：先匿名试用 2-3 次，后引导注册
- 配图策略：5 张卡片中 2-3 张配图
- 使用限制：MVP 阶段不限量，显示费用提醒
- 语言：中文优先

## 协作规范

- 用户不熟悉技术难度 → 每次技术选择都要说明难度和理由
- 当前在 Windows 开发，代码需兼容 macOS
- macOS 仅用于最后 Xcode 打包提交 App Store
