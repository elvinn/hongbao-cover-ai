# 数据库设计文档

## 概述

本文档描述了红包封面 AI 应用的数据库设计，使用 Supabase (PostgreSQL) 作为后端数据库。

## 架构图

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Clerk Auth    │────►│  public.users   │◄────│    payments     │
│  (身份验证)      │     │  (用户信息)      │     │   (支付记录)    │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐     ┌─────────────────┐
                       │generation_tasks │────►│     images      │
                       │  (生成任务)      │     │  (图片元数据)   │
                       └─────────────────┘     └─────────────────┘
```

## 表结构

### 1. users - 用户信息

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | text | ✓ | - | 主键，Clerk user ID |
| credits | integer | ✓ | 1 | 剩余生成次数 |
| credits_expires_at | timestamptz | - | null | Credits 过期时间 |
| access_level | text | ✓ | 'free' | 访问级别：free/premium |
| generation_count | integer | ✓ | 0 | 累计生成次数 |
| created_at | timestamptz | ✓ | now() | 创建时间 |
| updated_at | timestamptz | ✓ | now() | 更新时间（自动） |

### 2. generation_tasks - 生成任务

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | uuid | ✓ | gen_random_uuid() | 主键 |
| user_id | text | ✓ | - | 外键，关联 users |
| provider_task_id | text | ✓ | - | 外部服务提供商的任务 ID |
| prompt | text | ✓ | - | 用户输入的描述 |
| status | text | ✓ | 'PENDING' | 状态：PENDING/PROCESSING/SUCCEEDED/FAILED |
| error_code | text | - | null | 错误码 |
| error_message | text | - | null | 错误信息 |
| created_at | timestamptz | ✓ | now() | 创建时间 |
| completed_at | timestamptz | - | null | 完成时间 |

**状态流转**：
```
PENDING → PROCESSING → SUCCEEDED
    │          │
    │          └──→ FAILED
    │
    └──→ FAILED
```

### 3. images - 图片元数据

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | uuid | ✓ | gen_random_uuid() | 主键 |
| task_id | uuid | ✓ | - | 外键，关联 generation_tasks |
| user_id | text | ✓ | - | 外键，关联 users |
| preview_key | text | - | null | R2 预览图 key (仅免费用户) |
| original_key | text | ✓ | - | R2 原图 key |
| preview_url | text | - | null | CDN 预览图 URL (仅免费用户) |
| created_at | timestamptz | ✓ | now() | 创建时间 |

**安全设计**：
- `preview_key` 和 `original_key` 使用不同的 UUID
- 用户无法通过预览图 URL 推测原图地址
- 原图只能通过 API 验证后获取

**水印处理流程**：
1. 调用 API 时统一设置 `watermark: false`，不依赖 API 水印
2. **免费用户**：
   - Server 下载无水印原图并保存到 `original/{uuid}.png`
   - Server 使用 Sharp 添加水印并保存到 `preview/{uuid}.png`
   - 返回 `preview_url` (CDN 公开链接，带水印)
   - 用户付费后可通过 API 获取原图签名 URL
3. **付费用户**：
   - 直接返回 API 原图 URL
   - 后台异步保存原图到 `original/{uuid}.png`
   - 不生成预览图 (`preview_key` 和 `preview_url` 为 null)

### 4. payments - 支付记录

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | uuid | ✓ | gen_random_uuid() | 主键 |
| user_id | text | ✓ | - | 外键，关联 users |
| amount | integer | ✓ | - | 金额（分） |
| status | text | ✓ | 'pending' | 状态：pending/completed/failed |
| provider | text | - | null | 支付渠道：wechat/alipay/mock |
| provider_transaction_id | text | - | null | 支付平台交易 ID |
| credits_added | integer | ✓ | 1 | 增加的生成次数 |
| created_at | timestamptz | ✓ | now() | 创建时间 |
| completed_at | timestamptz | - | null | 完成时间 |

## Row Level Security (RLS)

由于使用 Clerk 进行身份验证，所有数据库操作通过 `service_role` 进行，RLS 已禁用。
安全性通过 API 层的 Clerk 认证来保证。

## 自动触发器

### 1. handle_updated_at

自动更新 `users` 表的 `updated_at` 字段。

## 部署步骤

1. 登录 Supabase Dashboard
2. 进入项目 → SQL Editor
3. 复制 `schema.sql` 的内容
4. 执行 SQL 脚本
5. 验证表和策略是否创建成功

## 环境变量

确保 `.env.local` 中配置了以下变量：

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

## 数据流示例

### 用户首次访问

```
1. 用户通过 Clerk 登录（Google OAuth 等）
2. API 检测到新用户，自动在 public.users 创建记录
3. 用户获得 1 次免费生成机会
```

### 生成图片

```
1. 前端提交 prompt
2. API 创建 generation_tasks 记录
3. 调用文生图 API (watermark: false)，保存 provider_task_id
4. API 返回无水印图片 URL
5. 免费用户：
   - 下载并保存无水印原图到 original/
   - 生成带水印预览图并保存到 preview/
   - 返回 preview_url (CDN URL)
   付费用户：
   - 直接返回 API 原图 URL
   - 后台异步保存原图到 original/
6. 创建 images 记录（使用不同 UUID）
7. 扣减 credits，增加 generation_count
```

### 支付解锁

```
1. 用户点击支付
2. 创建 payments 记录 (status: pending)
3. 模拟支付成功
4. 更新 payments.status = 'completed'
5. 更新 users.access_level = 'premium'
6. 更新 users.credits += 1
```

### 下载原图

```
1. 用户请求原图
2. API 验证 access_level = 'premium'
3. 从 images 表查询 original_key
4. 生成 R2 签名 URL
5. 返回给用户
```
