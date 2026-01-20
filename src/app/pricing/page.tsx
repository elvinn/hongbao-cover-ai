'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Check,
  Loader2,
  Sparkles,
  ShieldCheck,
  Zap,
  HelpCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PRICING_PLANS, type PricingPlan } from '@/config/pricing'
import type { PlanId } from '@/types/database'
import { cn } from '@/utils/tailwind'

const PRICING_FAQS = [
  {
    question: '购买后生成次数什么时候到账？',
    answer:
      '支付成功后，生成次数将立即自动充值到您的账户中。您可以在个人中心查看余额。',
  },
  {
    question: '生成次数会过期吗？',
    answer: '不会！购买的生成次数永久有效，次数永不过期，您可以随时使用。',
  },
  {
    question: '支持退款吗？',
    answer:
      '由于 AI 生成属于消耗性数字产品，一旦开始消耗生成次数，原则上不支持退款。如有异常支付问题请联系客服。',
  },
  {
    question: '生成的封面可以商用吗？',
    answer:
      '生成的封面可供个人社交账号使用。如需大规模商用，请确保遵循相关素材版权规定。',
  },
]

export default function PricingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const canceled = searchParams.get('canceled') === 'true'

  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handlePurchase = async (planId: PlanId) => {
    setLoadingPlan(planId)
    setError(null)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          // 未登录，跳转到登录页
          router.push('/sign-in?redirect=/pricing')
          return
        }
        throw new Error(data.message || '创建支付会话失败')
      }

      if (data.url) {
        // 跳转到 Stripe Checkout 页面
        window.location.href = data.url
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败，请稍后重试')
    } finally {
      setLoadingPlan(null)
    }
  }

  const plans = Object.values(PRICING_PLANS)

  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="container max-w-4xl px-4 py-12 sm:py-20">
        <header className="mb-12 text-center sm:mb-20">
          <div className="bg-primary/10 text-primary mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium">
            <Zap className="h-4 w-4" />
            立即升级，解锁无限可能
          </div>
          <h1 className="text-foreground mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            选择适合您的方案
          </h1>
          <p className="hb-section-subtitle text-lg sm:text-xl">
            专业 AI 生成，高清无水印，让您的红包封面脱颖而出
          </p>
        </header>

        {canceled && (
          <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-center text-amber-900 backdrop-blur-sm">
            <p className="text-sm">
              支付已取消，您可以随时重新选择适合您的套餐
            </p>
          </div>
        )}

        {error && (
          <div className="mb-8 rounded-xl border border-red-200 bg-red-50/50 p-4 text-center text-red-700 backdrop-blur-sm">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="grid gap-8 sm:grid-cols-2">
          {plans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              isLoading={loadingPlan === plan.id}
              disabled={loadingPlan !== null}
              onPurchase={() => handlePurchase(plan.id)}
            />
          ))}
        </div>

        <div className="mt-16 flex flex-wrap justify-center gap-8 text-center sm:mt-24">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-primary h-5 w-5" />
            <span className="text-muted-foreground text-sm font-medium">
              安全支付保障
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="text-primary h-5 w-5" />
            <span className="text-muted-foreground text-sm font-medium">
              永久有效 · 次数永不过期
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="text-primary h-5 w-5" />
            <span className="text-muted-foreground text-sm font-medium">
              高清无水印下载
            </span>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-24 sm:mt-32">
          <div className="mb-10 text-center">
            <div className="text-primary mb-2 flex items-center justify-center gap-2 text-sm font-semibold tracking-wider uppercase">
              <HelpCircle className="h-4 w-4" />
              常见问题
            </div>
            <h2 className="text-2xl font-bold">还有其他疑问？</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {PRICING_FAQS.map((faq, index) => (
              <div
                key={index}
                className="hb-card group p-6 transition-all hover:bg-white/80"
              >
                <h3 className="text-foreground mb-2 text-base font-semibold">
                  {faq.question}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground text-sm">
            支付由 Stripe 安全处理，支持微信支付、支付宝、信用卡等主流方式
          </p>
          <p className="text-muted-foreground mt-2 text-xs">
            如有任何疑问，请联系我们：support@elvinn.wiki
          </p>
        </div>
      </div>
    </main>
  )
}

interface PricingCardProps {
  plan: PricingPlan
  isLoading: boolean
  disabled: boolean
  onPurchase: () => void
}

function PricingCard({
  plan,
  isLoading,
  disabled,
  onPurchase,
}: PricingCardProps) {
  return (
    <div
      className={cn(
        'hb-card relative flex flex-col p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
        plan.recommended
          ? 'ring-primary border-primary/50 shadow-lg ring-2'
          : 'hover:border-primary/30',
      )}
    >
      {plan.recommended && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-primary text-primary-foreground shadow-primary/20 flex items-center gap-1 rounded-full px-4 py-1 text-xs font-bold tracking-wide uppercase shadow-lg">
            <Sparkles className="h-3.5 w-3.5" />
            最受欢迎
          </span>
        </div>
      )}

      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-foreground text-2xl font-bold">{plan.name}</h3>
          {plan.id === 'premium' && (
            <span className="bg-primary/10 text-primary rounded-md px-2 py-0.5 text-xs font-bold">
              超值优惠
            </span>
          )}
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {plan.description}
        </p>
      </div>

      <div className="mb-8">
        <div className="flex items-baseline gap-1">
          <span className="text-foreground text-5xl font-extrabold tracking-tight">
            {plan.priceDisplay}
          </span>
          <span className="text-muted-foreground text-sm font-medium">
            / 一次支付·无需订阅
          </span>
        </div>
      </div>

      <div className="mb-8 flex-1">
        <p className="text-foreground mb-4 text-sm font-semibold">包含功能：</p>
        <ul className="space-y-4">
          {plan.features.map((feature, index) => (
            <li key={index} className="group flex items-center text-sm">
              <div className="bg-primary/10 group-hover:bg-primary/20 mr-3 flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors">
                <Check className="text-primary h-3.5 w-3.5" />
              </div>
              <span className="text-foreground/90 font-medium">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <Button
        onClick={onPurchase}
        disabled={disabled}
        className={cn(
          'w-full py-6 text-base font-bold transition-all active:scale-[0.98]',
          plan.recommended ? 'hb-btn-primary' : '',
        )}
        variant={plan.recommended ? 'default' : 'outline'}
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            支付跳转中...
          </>
        ) : (
          `立即获取 ${plan.priceDisplay}`
        )}
      </Button>

      <p className="text-muted-foreground mt-4 text-center text-[10px]">
        点击按钮即代表您同意我们的{' '}
        <a href="/terms" className="hover:text-primary underline">
          服务条款
        </a>
      </p>
    </div>
  )
}
