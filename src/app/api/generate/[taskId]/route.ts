import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import {
  queryTaskStatus,
  mapApiStatusToTaskStatus,
  getImageUrlFromResponse,
} from '@/services/alibaba-image'
import {
  downloadImage,
  createPreviewImage,
  addWatermark,
  generateImageId,
} from '@/utils/image-processor'
import {
  uploadToR2,
  getPreviewUrl,
  getSignedDownloadUrl,
} from '@/utils/r2-storage'
import { createServiceRoleClient } from '@/supabase/server'
import type { TaskStatus } from '@/types/hongbao'
import {
  pollRateLimit,
  getClientIP,
  buildRateLimitResponse,
} from '@/utils/rate-limit'

const CDN_DOMAIN = process.env.R2_CDN_DOMAIN || 'cdn.hongbao.elvinn.wiki'
const ORIGINAL_FOLDER = 'original'
const PREVIEW_FOLDER = 'preview'

interface TaskResult {
  taskId: string
  status: TaskStatus
  output?: {
    url?: string
    imageId?: string
    error_code?: string
    error_message?: string
  }
}

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

    // 查询文生图任务状态
    const response = await queryTaskStatus(taskId)
    const status = mapApiStatusToTaskStatus(response.output.task_status)
    const imageUrl = getImageUrlFromResponse(response)

    const result: TaskResult = {
      taskId: response.output.task_id,
      status,
    }

    // 获取 Supabase 客户端（使用 service role）
    const supabase = createServiceRoleClient()

    // 更新数据库中的任务状态
    if (status === 'FAILED') {
      result.output = {
        error_code: response.output.code || 'GenerationFailed',
        error_message: response.output.message || '图片生成失败，请稍后重试',
      }

      // 更新任务状态为失败
      await supabase
        .from('generation_tasks')
        .update({
          status: 'FAILED',
          error_code: response.output.code || 'GenerationFailed',
          error_message: response.output.message || '图片生成失败',
          completed_at: new Date().toISOString(),
        })
        .eq('provider_task_id', taskId)
        .eq('user_id', userId)
    }

    if (status === 'SUCCEEDED' && imageUrl) {
      // 使用两个不同的 UUID 存储 preview 和 original
      const previewId = generateImageId()
      const originalId = generateImageId()

      try {
        // 先查询用户会员状态
        const { data: userData } = await supabase
          .from('users')
          .select('access_level')
          .eq('id', userId)
          .single()

        const isPremium = userData?.access_level === 'premium'

        // 下载原图
        const originalBuffer = await downloadImage(imageUrl)

        // 构建存储 key
        const originalKey = `${ORIGINAL_FOLDER}/${originalId}.png`
        const previewKey = `${PREVIEW_FOLDER}/${previewId}.png`

        let finalUrl: string
        let previewKeyToStore: string | null = null
        let previewUrlToStore: string | null = null

        if (isPremium) {
          // 付费会员：只上传原图，不生成预览图
          await uploadToR2(originalBuffer, originalKey)
          finalUrl = await getSignedDownloadUrl(originalKey)
        } else {
          // 免费用户：生成预览图并上传两个版本
          const previewBuffer = await createPreviewImage(originalBuffer)
          const host = request.headers.get('host') || 'hongbao.com'
          const domain = host.replace('www.', '')
          const watermarkedBuffer = await addWatermark(previewBuffer, domain)

          // 并行上传到 R2
          await Promise.all([
            uploadToR2(originalBuffer, originalKey),
            uploadToR2(watermarkedBuffer, previewKey),
          ])

          previewKeyToStore = previewKey
          previewUrlToStore = getPreviewUrl(previewKey, CDN_DOMAIN)
          finalUrl = previewUrlToStore
        }

        // 查询任务记录
        const { data: taskData } = await supabase
          .from('generation_tasks')
          .select('id')
          .eq('provider_task_id', taskId)
          .eq('user_id', userId)
          .single()

        // 在数据库中创建图片记录
        const { data: imageData, error: insertError } = await supabase
          .from('images')
          .insert({
            task_id: taskData?.id,
            user_id: userId,
            preview_key: previewKeyToStore,
            original_key: originalKey,
            preview_url: previewUrlToStore,
          })
          .select('id')
          .single()

        if (insertError) {
          console.error('Failed to insert image record:', insertError)
        }

        // 更新任务状态为成功
        await supabase
          .from('generation_tasks')
          .update({
            status: 'SUCCEEDED',
            completed_at: new Date().toISOString(),
          })
          .eq('provider_task_id', taskId)
          .eq('user_id', userId)

        // 返回图片记录 ID 和 URL
        result.output = {
          url: finalUrl,
          imageId: imageData?.id || previewId,
        }
      } catch (processError) {
        console.error('Image processing error:', processError)

        // 处理失败时，标记任务为失败
        await supabase
          .from('generation_tasks')
          .update({
            status: 'FAILED',
            error_code: 'ProcessingFailed',
            error_message: '图片处理失败',
            completed_at: new Date().toISOString(),
          })
          .eq('provider_task_id', taskId)
          .eq('user_id', userId)

        result.output = {
          error_code: 'ProcessingFailed',
          error_message: '图片处理失败，请重试',
        }
        result.status = 'FAILED'
      }
    } else if (status === 'PROCESSING' || status === 'PENDING') {
      // 更新任务状态
      await supabase
        .from('generation_tasks')
        .update({ status })
        .eq('provider_task_id', taskId)
        .eq('user_id', userId)
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Query task error:', error)

    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'TASK_NOT_FOUND', message: '任务不存在' },
        { status: 404 },
      )
    }

    return NextResponse.json(
      { error: 'SERVER_ERROR', message: '查询任务状态失败，请稍后重试' },
      { status: 500 },
    )
  }
}
