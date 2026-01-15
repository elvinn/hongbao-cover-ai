import type { PlanId } from '@/types/database'

/**
 * 套餐定价配置
 */
export interface PricingPlan {
  id: PlanId
  name: string
  description: string
  price: number // 金额（分）
  priceDisplay: string // 显示价格
  credits: number // 生成次数
  validityDays: number // 有效期（天）
  validityDisplay: string // 显示有效期
  features: string[] // 功能列表
  recommended?: boolean // 是否推荐
}

export const PRICING_PLANS: Record<PlanId, PricingPlan> = {
  trial: {
    id: 'trial',
    name: '体验版',
    description: '适合尝鲜体验',
    price: 990, // ¥9.9
    priceDisplay: '¥9.9',
    credits: 3,
    validityDays: 7,
    validityDisplay: '7 天',
    features: ['3 次生成机会', '无水印', '高清下载', '7 天有效期'],
  },
  premium: {
    id: 'premium',
    name: '畅享版',
    description: '超值推荐',
    price: 1990, // ¥19.9
    priceDisplay: '¥19.9',
    credits: 20,
    validityDays: 90,
    validityDisplay: '3 个月',
    features: ['20 次生成机会', '无水印', '高清下载', '3 个月有效期'],
    recommended: true,
  },
} as const

/**
 * 获取套餐信息
 */
export function getPlan(planId: PlanId): PricingPlan {
  return PRICING_PLANS[planId]
}

/**
 * 计算过期时间
 */
export function calculateExpiresAt(
  planId: PlanId,
  fromDate: Date = new Date(),
): Date {
  const plan = getPlan(planId)
  const expiresAt = new Date(fromDate)
  expiresAt.setDate(expiresAt.getDate() + plan.validityDays)
  return expiresAt
}
