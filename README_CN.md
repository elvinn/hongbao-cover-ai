<p align="center">
  <img src="public/favicon/android-chrome-512x512.png" width="120" alt="红包封面 AI Logo" />
</p>

<h1 align="center">红包封面 AI</h1>

<p align="center">
  <strong>AI 驱动的微信红包封面生成器</strong>
</p>

<p align="center">
  用 AI 快速生成独特、个性化的微信红包封面。
</p>

<p align="center">
  <a href="https://hongbao.elvinn.wiki">在线体验</a> •
  <a href="README.md">English</a> •
  <a href="#功能特性">功能特性</a> •
  <a href="#快速开始">快速开始</a>
</p>

<p align="center">
  <img alt="License" src="https://img.shields.io/badge/license-MIT-blue.svg" />
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-blue" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind-4-38bdf8" />
</p>

<p align="center">
  <a href="https://hongbao.elvinn.wiki">
    <img src="https://img.shields.io/badge/🎁_在线体验_Demo-FF4444?style=for-the-badge&logoColor=white" alt="在线体验" />
  </a>
</p>

---

## 什么是红包封面 AI？

**红包封面 AI** 是一个 AI 驱动的 Web 应用，用于生成自定义微信红包封面。只需用自然语言描述你想要的效果，AI 就会创建一张精美的高质量封面图片，完全符合微信官方规范。

非常适合春节、生日、婚礼或任何你想发送独特红包的特殊场合！

## 截图预览

完美支持 **PC 端** 和 **移动端**，响应式设计适配各种屏幕尺寸。

### PC 端

| 首页 | 灵感广场 | 封面详情 |
|:----:|:--------:|:--------:|
| <img src="images/pc-index.png" width="280" /> | <img src="images/pc-gallery.png" width="280" /> | <img src="images/pc-detail.png" width="280" /> |

### 移动端

| 首页 | 灵感广场 | 封面详情 |
|:----:|:--------:|:--------:|
| <img src="images/mobile-index.png" width="180" /> | <img src="images/mobile-gallery.png" width="180" /> | <img src="images/mobile-detail.png" width="180" /> |

## 功能特性

- 🎨 **AI 图片生成** - 描述你理想的封面，让 AI 来创作
- 📐 **符合微信规范** - 输出完美适配微信红包封面尺寸
- ⚡ **快速生成** - 基于火山引擎 Seeddream 模型，秒级出图
- 🖼️ **高清画质** - 无水印高清图片（付费版）
- 💳 **灵活定价** - 提供免费体验，付费解锁更多功能
- 🌐 **现代技术栈** - 基于 Next.js 16、TypeScript 和 Tailwind CSS 构建
- 🔐 **安全认证** - 由 Clerk 提供身份认证
- 💾 **云端存储** - 图片存储在 Cloudflare R2，通过 CDN 分发

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | [Next.js 16](https://nextjs.org/)（App Router） |
| 语言 | [TypeScript 5](https://www.typescriptlang.org/) |
| 样式 | [Tailwind CSS 4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| 数据库 | [Supabase](https://supabase.com/)（PostgreSQL） |
| 认证 | [Clerk](https://clerk.com/) |
| AI | [火山引擎 Seeddream](https://www.volcengine.com/) |
| 存储 | [Cloudflare R2](https://www.cloudflare.com/r2/) |
| 支付 | [Stripe](https://stripe.com/) |
| 限流 | [Upstash Redis](https://upstash.com/) |

## 快速开始

### 前置要求

- Node.js >= 18.17.0
- pnpm 10+
- 以下服务的账号：Supabase、Clerk、火山引擎、Cloudflare R2、Stripe、Upstash

### 安装步骤

1. **克隆仓库**

```bash
git clone https://github.com/nicekate/hongbao.git
cd hongbao
```

2. **安装依赖**

```bash
pnpm install
```

3. **配置环境变量**

```bash
cp .env.example .env.local
```

编辑 `.env.local` 填入你的配置（参见下方 [环境变量](#环境变量)）。

4. **初始化数据库**

在 Supabase 项目中执行 SQL schema：

```bash
# 复制 design/database/schema.sql 的内容
# 在 Supabase SQL Editor 中粘贴并执行
```

5. **启动开发服务器**

```bash
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 环境变量

将 `.env.example` 复制为 `.env.local` 并填入你的配置：

### 必需变量

| 变量名 | 说明 | 获取方式 |
|--------|------|----------|
| `NEXT_PUBLIC_SITE_URL` | 生产环境 URL | 你的域名 |
| `ARK_API_KEY` | 火山引擎 Ark API 密钥 | [火山引擎控制台](https://console.volcengine.com/ark) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | [Supabase 控制台](https://app.supabase.com/) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名/公开密钥 | Supabase 控制台 > Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务端密钥 | Supabase 控制台 > Settings > API |
| `R2_ACCOUNT_ID` | Cloudflare 账户 ID | [Cloudflare 控制台](https://dash.cloudflare.com/) |
| `R2_ACCESS_KEY_ID` | R2 API 访问密钥 | Cloudflare 控制台 > R2 > 管理 R2 API 令牌 |
| `R2_SECRET_ACCESS_KEY` | R2 API 密钥 | 同上 |
| `R2_BUCKET_NAME` | R2 存储桶名称 | 你的 R2 存储桶 |
| `R2_CDN_DOMAIN` | 图片 CDN 域名 | 你的 Cloudflare CDN 域名 |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk 公开密钥 | [Clerk 控制台](https://dashboard.clerk.com/) |
| `CLERK_SECRET_KEY` | Clerk 密钥 | Clerk 控制台 |
| `STRIPE_SECRET_KEY` | Stripe 密钥 | [Stripe 控制台](https://dashboard.stripe.com/apikeys) |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook 密钥 | Stripe 控制台 > Webhooks |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL | [Upstash 控制台](https://console.upstash.com/) |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis 令牌 | Upstash 控制台 |

### 可选变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `SEEDDREAM_MODEL` | AI 模型名称 | `doubao-seedream-4-0-250828` |
| `IMAGE_GENERATION_SYSTEM_PROMPT` | 自定义 AI 提示词 | 内置提示词 |

## 数据库配置

本项目使用 Supabase（PostgreSQL）作为数据存储。数据库 Schema 包含：

- `users` - 用户信息和积分
- `generation_tasks` - 图片生成任务追踪
- `images` - 生成的图片元数据
- `image_likes` - 用户点赞记录
- `payments` - 支付记录

配置数据库：

1. 创建新的 Supabase 项目
2. 进入 SQL Editor
3. 复制并执行 `design/database/schema.sql` 的内容

## 可用命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 构建生产版本 |
| `pnpm start` | 启动生产服务器 |
| `pnpm lint` | 运行 ESLint 检查 |
| `pnpm lint-fix` | 运行 ESLint 并自动修复 |
| `pnpm format` | 使用 Prettier 格式化代码 |
| `pnpm type-check` | 运行 TypeScript 类型检查 |
| `pnpm test` | 运行测试（监听模式） |
| `pnpm test:ci` | 运行测试（CI 模式） |

## 部署

### Vercel（推荐）

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com/) 中导入项目
3. 在 Vercel 项目设置中添加所有环境变量
4. 部署

### 其他平台

本应用可以部署到任何支持 Next.js 的平台：

- [Netlify](https://netlify.com/)
- [Railway](https://railway.app/)
- [Render](https://render.com/)
- 使用 Docker 自托管

## 项目结构

```
src/
├── app/                 # Next.js App Router 页面
│   ├── api/            # API 路由
│   ├── cover/          # 封面详情页
│   ├── gallery/        # 公开画廊
│   ├── my-gallery/     # 用户画廊
│   ├── pricing/        # 定价页面
│   └── ...
├── components/         # React 组件
│   └── ui/            # shadcn/ui 组件
├── config/            # 应用配置
├── hooks/             # 自定义 React Hooks
├── providers/         # React Context Providers
├── services/          # 业务逻辑服务
├── supabase/          # Supabase 客户端工具
├── types/             # TypeScript 类型定义
└── utils/             # 工具函数
```

## 参与贡献

欢迎贡献代码！请随时提交 Pull Request。

1. Fork 本仓库
2. 创建你的功能分支（`git checkout -b feature/amazing-feature`）
3. 提交你的改动（`git commit -m 'feat: add amazing feature'`）
4. 推送到分支（`git push origin feature/amazing-feature`）
5. 打开 Pull Request

请遵循 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/) 规范编写提交信息。

## 许可证

本项目基于 MIT 许可证开源 - 详见 [LICENSE](LICENSE) 文件。

## 致谢

- [火山引擎](https://www.volcengine.com/) 提供的 Seeddream AI 模型。
- [AI Cover](https://github.com/all-in-aigc/aicover) 提出的 AI 生成红包封面的创意。
