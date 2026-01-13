import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getImageProvider } from '@/services/image-generation'
import {
  pollRateLimit,
  getClientIP,
  buildRateLimitResponse,
} from '@/utils/rate-limit'

/**
 * 查询异步任务状态
 * 注意：当前使用的 Seeddream provider 是同步的，不支持任务轮询
 * 保留此 API 以便将来可能添加异步 provider
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> },
) {
  try {
    // 限频检查
    const ip = getClientIP(request)
    const { success, remaining, reset } = await pollRateLimit.limit(ip)

    if (!success) {
      const response = buildRateLimitResponse(reset, remaining)
      return NextResponse.json(response.body, {
        status: response.status,
        headers: response.headers,
      })
    }

    const { taskId } = await params

    if (!taskId || typeof taskId !== 'string') {
      return NextResponse.json(
        { error: 'INVALID_REQUEST', message: '无效的任务 ID' },
        { status: 400 },
      )
    }

    // 验证用户身份（使用 Clerk）
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: '请先登录' },
        { status: 401 },
      )
    }

    // 获取 provider
    const provider = getImageProvider()

    // Seeddream provider 是同步的，不支持任务轮询
    // 图片生成结果在 POST /api/generate 时直接返回
    if (provider.isSync) {
      return NextResponse.json(
        {
          error: 'NOT_SUPPORTED',
          message: '当前 provider 不支持任务轮询，图片已在生成时直接返回',
        },
        { status: 400 },
      )
    }

    // 如果将来添加异步 provider，可以在这里实现轮询逻辑
    return NextResponse.json(
      {
        error: 'NOT_IMPLEMENTED',
        message: '异步任务查询暂未实现',
      },
      { status: 501 },
    )
  } catch (error) {
    console.error('Query task error:', error)

    return NextResponse.json(
      { error: 'SERVER_ERROR', message: '查询任务状态失败，请稍后重试' },
      { status: 500 },
    )
  }
}
