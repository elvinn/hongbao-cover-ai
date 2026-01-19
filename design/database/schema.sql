-- =============================================================================
-- Hongbao 红包封面 AI - 数据库 Schema (Clerk Auth 版本)
-- =============================================================================
-- 全新安装：在 Supabase SQL Editor 中执行此脚本
-- 注意：使用 Clerk 进行身份验证，所有数据库操作通过 service_role 进行
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Users 表 - 用户信息（使用 Clerk user ID）
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,                             -- Clerk user ID (格式: user_xxx)
  credits INTEGER DEFAULT 1 NOT NULL,              -- 剩余生成次数
  credits_expires_at TIMESTAMPTZ,                  -- Credits 过期时间（null 表示永不过期）
  access_level TEXT DEFAULT 'free' NOT NULL,       -- 'free' | 'premium'
  generation_count INTEGER DEFAULT 0 NOT NULL,     -- 总生成次数
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT valid_access_level CHECK (access_level IN ('free', 'premium'))
);

-- 创建 updated_at 自动更新触发器
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_updated_at ON public.users;
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- -----------------------------------------------------------------------------
-- 2. Generation Tasks 表 - 图片生成任务
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.generation_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provider_task_id TEXT NOT NULL,                -- 外部服务提供商的任务 ID
  prompt TEXT NOT NULL,                          -- 用户输入的描述
  status TEXT DEFAULT 'PENDING' NOT NULL,        -- PENDING | PROCESSING | SUCCEEDED | FAILED
  error_code TEXT,                               -- 失败时的错误码
  error_message TEXT,                            -- 失败时的错误信息
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ,
  
  CONSTRAINT valid_task_status CHECK (status IN ('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED'))
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_generation_tasks_user_id ON public.generation_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_generation_tasks_provider_task_id ON public.generation_tasks(provider_task_id);
CREATE INDEX IF NOT EXISTS idx_generation_tasks_status ON public.generation_tasks(status);

-- -----------------------------------------------------------------------------
-- 3. Images 表 - 图片存储映射
-- -----------------------------------------------------------------------------
-- 水印处理说明:
-- - 调用 API 时统一不添加水印
-- - 免费用户: 同时存储无水印原图(original)和带水印预览图(preview)
--   - original_key: 无水印原图,仅付费后可访问
--   - preview_key: 带水印预览图,公开访问
-- - 付费用户: 可直接访问 original_key 对应的无水印原图
-- - CDN URL 通过 R2_CDN_DOMAIN 环境变量 + key 拼接得到
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.generation_tasks(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  preview_key TEXT,                              -- R2 存储 key: preview/{uuid}.png (免费用户)
  original_key TEXT NOT NULL,                    -- R2 存储 key: original/{uuid}.png
  is_public BOOLEAN DEFAULT FALSE NOT NULL,     -- 是否公开展示
  likes_count INTEGER DEFAULT 0 NOT NULL,       -- 点赞数（冗余字段，提高查询性能）
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_images_task_id ON public.images(task_id);
CREATE INDEX IF NOT EXISTS idx_images_user_id ON public.images(user_id);
CREATE INDEX IF NOT EXISTS idx_images_preview_key ON public.images(preview_key) WHERE preview_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_images_is_public ON public.images(is_public) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_images_likes_count ON public.images(likes_count DESC);

-- -----------------------------------------------------------------------------
-- 4. Image Likes 表 - 图片点赞记录
-- -----------------------------------------------------------------------------
-- 用于记录用户对图片的点赞，支持后续扩展（如点赞记录页面）
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.image_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_id UUID NOT NULL REFERENCES public.images(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT unique_image_like UNIQUE (image_id, user_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_image_likes_image_id ON public.image_likes(image_id);
CREATE INDEX IF NOT EXISTS idx_image_likes_user_id ON public.image_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_image_likes_created_at ON public.image_likes(created_at DESC);

-- -----------------------------------------------------------------------------
-- 5. Payments 表 - 支付记录
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,                       -- 金额（分）
  status TEXT DEFAULT 'pending' NOT NULL,        -- pending | completed | failed
  provider TEXT,                                 -- stripe | wechat | alipay | mock
  provider_transaction_id TEXT,                  -- 支付平台的交易 ID
  stripe_session_id TEXT,                        -- Stripe Checkout Session ID
  plan_id TEXT,                                  -- 套餐 ID: 'trial' | 'premium'
  credits_added INTEGER DEFAULT 1 NOT NULL,      -- 增加的生成次数
  credits_validity_days INTEGER,                 -- Credits 有效天数
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ,
  
  CONSTRAINT valid_payment_status CHECK (status IN ('pending', 'completed', 'failed')),
  CONSTRAINT valid_plan_id CHECK (plan_id IS NULL OR plan_id IN ('trial', 'premium'))
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_session_id ON public.payments(stripe_session_id);

-- -----------------------------------------------------------------------------
-- 6. Redemption Codes 表 - 兑换码
-- -----------------------------------------------------------------------------
-- 用于存储兑换码，支持给用户增加 credits 和升级 premium
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.redemption_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,                      -- 兑换码（唯一）
  credits_amount INTEGER DEFAULT 3 NOT NULL,      -- 兑换后增加的 credits 数量
  validity_days INTEGER DEFAULT 7 NOT NULL,       -- credits 有效期（天）
  is_used BOOLEAN DEFAULT FALSE NOT NULL,         -- 是否已被使用
  used_by TEXT REFERENCES public.users(id),       -- 使用者的 user ID
  used_at TIMESTAMPTZ,                            -- 使用时间
  expires_at TIMESTAMPTZ,                         -- 兑换码过期时间（null 表示永不过期）
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT valid_credits_amount CHECK (credits_amount > 0),
  CONSTRAINT valid_validity_days CHECK (validity_days > 0)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_redemption_codes_code ON public.redemption_codes(code);
CREATE INDEX IF NOT EXISTS idx_redemption_codes_is_used ON public.redemption_codes(is_used) WHERE is_used = FALSE;
CREATE INDEX IF NOT EXISTS idx_redemption_codes_used_by ON public.redemption_codes(used_by);

-- =============================================================================
-- Row Level Security (RLS) - 禁用
-- =============================================================================
-- 由于所有数据库操作都通过 service_role 进行，RLS 策略不会生效
-- 为简化管理，禁用 RLS

ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.images DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.redemption_codes DISABLE ROW LEVEL SECURITY;
