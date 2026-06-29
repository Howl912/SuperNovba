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
| AI 文本生成 | DeepSeek (deepseek-v4-pro) | 纯 fetch 直连，不使用 SDK |
| AI 图片生成 | Seedream 5.0 (火山引擎 Ark 平台) | API Key Bearer Token 鉴权 |
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

`.env.local` 已创建（含真实 API Key），文件在 `apps/web/.env.local`
- `DEEPSEEK_API_KEY` + `DEEPSEEK_MODEL=deepseek-v4-pro` — DeepSeek 文本生成
- `VOLCENGINE_API_KEY` + `VOLCENGINE_MODEL=doubao-seedream-5.0-260128` — 火山引擎图片生成
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase（未配置）

## 开发启动

```bash
# Web 开发（注意用 npmmirror 镜像）
cd apps/web && npm install --registry=https://registry.npmmirror.com && npm run dev
```

## AI 流水线

5 阶段流水线（见 `apps/web/src/lib/ai/pipeline.ts`）：
1. 产品分析 → 2. 多角度并行生成 (5创意透镜) → 3. 图片提示词优化 → 4. 图片生成 → 5. 卡片组装

SSE 流式 API 端点：`POST /api/generate`

### 关键架构决策

- **不用 @ai-sdk/openai**：SDK 的 URL 拼接与 DeepSeek 不兼容导致 404。改用纯 `fetch` + OpenAI 兼容格式直接调用
- **不用 @ai-sdk/deepseek**：同上，兼容性问题
- **火山引擎鉴权**：Ark 平台 API Key（Bearer Token），不是 AK/SK 签名

## 当前状态（Phase 1 完成）

| 功能 | 状态 | 备注 |
|---|---|---|
| DeepSeek 文本生成 | ✅ 已跑通 | 产品分析 + 5角度并行生成正常 |
| Seedream 图片生成 | ❌ 待修复 | 模型名 `doubao-seedream-5.0-260128` 返回 404，需确认正确的模型/端点 ID |
| Web 前端 UI | ✅ 已完成 | 首页/生成页/收藏页 |
| 移动端 App | 🚧 骨架 | Phase 3 实现 |
| Supabase | ⏳ 未配置 | 待创建项目 |

## 下一步任务

1. **修复 Seedream**：确认 Ark 平台正确的模型名或端点 ID（用户需在火山引擎控制台查看）
2. **优化 DeepSeek 输出**：deepseek-v4-pro 是推理模型，首次调用耗时较长，提示词需适配
3. **Supabase 项目创建**：配置数据库/认证/存储
4. **Web 前端优化**：卡片内容实际展示（目前 API 已通，前端 UI 需接入真实数据）
5. **移动端开发**：Phase 3

## 关键决策

- 用户认证：先匿名试用 2-3 次，后引导注册
- 配图策略：5 张卡片中 2-3 张配图
- 使用限制：MVP 阶段不限量，显示费用提醒
- 语言：中文优先
- API 安全：所有 Key 无 NEXT_PUBLIC_ 前缀，仅服务端可读，浏览器不可见

## 协作规范

- 用户不熟悉技术难度 → 每次技术选择都要说明难度和理由
- 当前在 Windows 开发，代码需兼容 macOS
- macOS 仅用于最后 Xcode 打包提交 App Store
- npm 安装依赖需加 `--registry=https://registry.npmmirror.com`（国内镜像）
