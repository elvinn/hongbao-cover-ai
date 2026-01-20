/**
 * 兑换码配置
 */

/**
 * 默认兑换码配置
 */
export const REDEMPTION_DEFAULTS = {
  /** 默认兑换 credits 数量 */
  credits: 3,
} as const

/**
 * 兑换结果信息
 */
export interface RedemptionResult {
  success: boolean
  creditsAdded: number
  newCredits: number
  message: string
}
