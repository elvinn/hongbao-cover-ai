'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PRICING_PLANS, type PricingPlan } from '@/config/pricing'
import type { PlanId } from '@/types/database'
import { cn } from '@/utils/tailwind'

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
          router.push('/auth/login?redirect=/pricing')
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
      <div className="container max-w-4xl px-4 py-10 sm:py-14">
        <header className="mb-10 text-center sm:mb-14">
          <h1 className="text-primary mb-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            选择适合你的套餐
          </h1>
          <p className="hb-section-subtitle text-base sm:text-lg">
            解锁无水印高清封面，畅享 AI 生成体验
          </p>
        </header>

        {canceled && (
          <div className="mb-8 rounded-lg bg-amber-50/70 p-4 text-center text-amber-900">
            <p className="text-sm">支付已取消，你可以随时重新选择套餐</p>
          </div>
        )}

        {error && (
          <div className="mb-8 rounded-lg bg-red-50/70 p-4 text-center text-red-700">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2">
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

        <div className="mt-10 text-center">
          <p className="text-muted-foreground text-sm">
            支付由 Stripe 安全处理，支持微信支付、支付宝、信用卡/借记卡
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            购买后 credits 立即到账，有效期内可随时使用
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
        'hb-card relative flex flex-col p-6 sm:p-8',
        plan.recommended && 'ring-primary/50 ring-2',
      )}
    >
      {plan.recommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-primary text-primary-foreground inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium">
            <Sparkles className="h-3 w-3" />
            推荐
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-foreground text-xl font-semibold">{plan.name}</h3>
        <p className="text-muted-foreground mt-1 text-sm">{plan.description}</p>
      </div>

      <div className="mb-6">
        <span className="text-foreground text-4xl font-bold">
          {plan.priceDisplay}
        </span>
        <span className="text-muted-foreground ml-2">/ 一次支付·无需订阅</span>
      </div>

      <ul className="mb-8 flex-1 space-y-3">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-center text-sm">
            <Check className="mr-2 h-4 w-4 shrink-0 text-green-600" />
            <span className="text-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        onClick={onPurchase}
        disabled={disabled}
        className={cn('w-full', plan.recommended && 'hb-btn-primary')}
        variant={plan.recommended ? 'default' : 'outline'}
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            处理中...
          </>
        ) : (
          `立即购买 ${plan.priceDisplay}`
        )}
      </Button>
    </div>
  )
}
