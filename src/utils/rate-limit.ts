import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

/**
 * 创建 Redis 客户端（自动读取环境变量）
 * 需要配置 UPSTASH_REDIS_REST_URL 和 UPSTASH_REDIS_REST_TOKEN
 */
const redis = Redis.fromEnv()

/**
 * 图片生成接口限频
 * 限制：5 次/分钟/IP
 */
export const generateRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  prefix: 'ratelimit:generate',
  analytics: true,
})

/**
 * 任务轮询接口限频
 * 限制：60 次/分钟/IP
 */
export const pollRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  prefix: 'ratelimit:poll',
  analytics: true,
})

/**
 * 支付结账接口限频
 * 限制：10 次/分钟/IP
 */
export const checkoutRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '1 m'),
  prefix: 'ratelimit:checkout',
  analytics: true,
})

/**
 * 获取客户端 IP 地址
 * 支持 Vercel、Cloudflare 等平台的 header
 */
export function getClientIP(request: Request): string {
  // Cloudflare
  const cfIP = request.headers.get('cf-connecting-ip')
  if (cfIP) return cfIP

  // Vercel / 其他代理
  const realIP = request.headers.get('x-real-ip')
  if (realIP) return realIP

  // 标准代理 header
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()

  // 本地开发回退
  return '127.0.0.1'
}

/**
 * 构建限频响应
 */
export function buildRateLimitResponse(
  reset: number,
  remaining: number,
  message = '请求过于频繁，请稍后再试',
) {
  const retryAfter = Math.ceil((reset - Date.now()) / 1000)

  return {
    body: {
      error: 'RATE_LIMITED',
      message,
      retryAfter,
    },
    status: 429,
    headers: {
      'X-RateLimit-Remaining': remaining.toString(),
      'Retry-After': retryAfter.toString(),
    },
  }
}
