-- =============================================================================
-- Hongbao 红包封面生成器 - 数据库 Schema (Clerk Auth 版本)
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
CREATE TABLE IF NOT EXISTS public.images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.generation_tasks(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  original_key TEXT NOT NULL,                    -- R2 存储 key: original/{uuid}.png
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_images_task_id ON public.images(task_id);
CREATE INDEX IF NOT EXISTS idx_images_user_id ON public.images(user_id);

-- -----------------------------------------------------------------------------
-- 4. Payments 表 - 支付记录
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

-- =============================================================================
-- Row Level Security (RLS) - 禁用
-- =============================================================================
-- 由于所有数据库操作都通过 service_role 进行，RLS 策略不会生效
-- 为简化管理，禁用 RLS

ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.images DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;
