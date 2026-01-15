import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getImageProvider } from '@/services/image-generation'
import { createServiceRoleClient } from '@/supabase/server'
import { ensureUserExists } from '@/supabase/auth'
import {
  generateRateLimit,
  getClientIP,
  buildRateLimitResponse,
} from '@/utils/rate-limit'
import {
  downloadImage,
  generateImageId,
  addWatermark,
} from '@/utils/image-processor'
import { uploadToR2, getOriginalKey, getPreviewKey } from '@/utils/r2-storage'

const CDN_DOMAIN = process.env.R2_CDN_DOMAIN || ''

/**
 * 后台异步上传图片到 R2
 * 此函数在响应返回后继续执行，不阻塞用户
 * 数据库记录已经创建，只需上传文件到 R2
 */
async function uploadImageToR2InBackground(params: {
  imageBuffer: Buffer
  originalKey: string
  taskId: string
  userId: string
}) {
  const { imageBuffer, originalKey, taskId, userId } = params

  try {
    const startTime = Date.now()
    console.log('[Background] 开始后台上传:', originalKey)

    // 上传到 R2
    await uploadToR2(imageBuffer, originalKey)

    console.log(
      '[Background] 后台处理完成，总耗时:',
      Date.now() - startTime,
      'ms',
    )
    console.log('[Background] taskId:', taskId, 'userId:', userId)
  } catch (error) {
    console.error('[Background] 后台处理失败:', error)
    // 注意：这里的错误不会影响已返回给用户的响应
  }
}

export async function POST(request: NextRequest) {
  try {
    // 0. 限频检查（放在最前面，减少不必要的处理）
    const ip = getClientIP(request)
    const { success, remaining, reset } = await generateRateLimit.limit(ip)

    if (!success) {
      const response = buildRateLimitResponse(reset, remaining)
      return NextResponse.json(response.body, {
        status: response.status,
        headers: response.headers,
      })
    }

    // 1. 验证用户身份（使用 Clerk）
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: '请先登录' },
        { status: 401 },
      )
    }

    // 2. 确保用户存在于数据库中
    const userData = await ensureUserExists(userId)

    // 3. 解析请求
    const body = await request.json()
    const { prompt } = body

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'INVALID_REQUEST', message: '请提供有效的 prompt' },
        { status: 400 },
      )
    }

    // 4. 创建 Supabase 客户端
    const supabase = createServiceRoleClient()

    // 5. 预扣积分（原子操作，确保并发安全）
    const { data: updateData, error: deductError } = await supabase
      .from('users')
      .update({ credits: userData.credits - 1 })
      .eq('id', userId)
      .gt('credits', 0) // 确保积分大于0
      .select('credits')
      .single()

    if (deductError || !updateData) {
      return NextResponse.json(
        {
          error: 'NO_CREDITS',
          message: '生成次数不足',
          credits: userData.credits,
        },
        { status: 403 },
      )
    }

    console.log(
      `[Credits] User ${userId}: ${userData.credits} -> ${updateData.credits}`,
    )

    // 6. 获取图片生成 provider 并生成图片
    const provider = getImageProvider()
    const isPremium = userData.access_level === 'premium'
    const result = await provider.generateImage(prompt)

    // 7. 在数据库中创建任务记录
    const { error: insertError } = await supabase
      .from('generation_tasks')
      .insert({
        user_id: userId,
        provider_task_id: result.taskId,
        prompt: prompt, // 存储原始用户输入，而不是完整 prompt
        status: result.status,
      })

    if (insertError) {
      console.error('Failed to insert task record:', insertError)
      // 不影响用户体验，继续返回结果
    }

    // 8. 如果生成成功，根据用户类型处理图片和水印
    if (result.status === 'SUCCEEDED' && result.originalUrl) {
      const processStartTime = Date.now()
      console.log('[Generate] 图片生成成功，开始处理')
      console.log('[Generate] 用户类型:', isPremium ? 'premium' : 'free')

      // 异步增加生成次数
      supabase
        .from('users')
        .update({ generation_count: userData.generation_count + 1 })
        .eq('id', userId)
        .select()
        .then(({ error }) => {
          if (error) {
            console.error('[Generation Count] 更新失败:', error)
          } else {
            console.log(
              `[Generation Count] Updated for user ${userId}: ${userData.generation_count} -> ${userData.generation_count + 1}`,
            )
          }
        })

      // 生成图片 ID 和存储 key
      const originalId = generateImageId()
      const previewId = generateImageId() // 使用不同的 UUID 以防止推测
      const originalKey = getOriginalKey(originalId)
      const previewKey = getPreviewKey(previewId)

      // 查询任务记录
      const { data: taskData } = await supabase
        .from('generation_tasks')
        .select('id')
        .eq('provider_task_id', result.taskId)
        .eq('user_id', userId)
        .single()

      let finalImageUrl: string
      let previewKeyToStore: string | null = null

      if (isPremium) {
        // 付费用户: 直接返回原始 URL，后台异步下载并上传到 R2
        console.log('[Generate] 付费用户: 直接返回原始 URL')
        finalImageUrl = result.originalUrl
        const originalUrl = result.originalUrl // Capture for async closure

        // 后台异步处理：下载并上传到 R2
        // 不 await，让它在后台执行
        ;(async () => {
          try {
            const imageBuffer = await downloadImage(originalUrl)
            await uploadImageToR2InBackground({
              imageBuffer,
              originalKey,
              taskId: result.taskId,
              userId,
            })
          } catch (error) {
            console.error('[Background Upload] 后台上传失败:', error)
          }
        })()
      } else {
        // 免费用户: 同步生成预览图并返回 base64，异步上传原图和预览图到 R2
        console.log('[Generate] 免费用户: 生成预览图并返回 base64')
        const downloadStartTime = Date.now()

        // 1. 下载无水印原图
        const originalBuffer = await downloadImage(result.originalUrl)
        console.log(
          '[Generate] 下载图片耗时:',
          Date.now() - downloadStartTime,
          'ms',
        )

        // 2. 生成缩小的带水印预览图（50% 尺寸）
        const watermarkStartTime = Date.now()
        const watermarkedBuffer = await addWatermark(originalBuffer, 0.5)
        console.log(
          '[Generate] 添加水印耗时:',
          Date.now() - watermarkStartTime,
          'ms',
        )

        // 3. 转换为 base64 直接返回（快速响应）
        const base64Image = watermarkedBuffer.toString('base64')
        finalImageUrl = `data:image/png;base64,${base64Image}`
        console.log('[Generate] 已生成 base64 预览图')

        // 4. 异步上传原图和预览图到 R2（不阻塞响应）
        previewKeyToStore = previewKey

        // 后台异步上传
        ;(async () => {
          try {
            await Promise.all([
              uploadToR2(originalBuffer, originalKey), // 无水印原图
              uploadToR2(watermarkedBuffer, previewKey), // 带水印预览图
            ])
            console.log('[Background] 图片上传到 R2 完成')
          } catch (error) {
            console.error('[Background] 上传到 R2 失败:', error)
          }
        })()
      }

      // 创建图片记录
      const { data: imageData, error: imageInsertError } = await supabase
        .from('images')
        .insert({
          task_id: taskData?.id,
          user_id: userId,
          preview_key: previewKeyToStore,
          original_key: originalKey,
          is_public: true,
        })
        .select('id')
        .single()

      if (imageInsertError) {
        console.error('Failed to insert image record:', imageInsertError)
      }

      const imageId = imageData?.id || originalId

      // 更新任务状态为成功
      await supabase
        .from('generation_tasks')
        .update({
          status: 'SUCCEEDED',
          completed_at: new Date().toISOString(),
        })
        .eq('provider_task_id', result.taskId)
        .eq('user_id', userId)

      console.log('[Generate] 总处理耗时:', Date.now() - processStartTime, 'ms')

      // 返回图片 URL
      return NextResponse.json(
        {
          taskId: result.taskId,
          status: 'SUCCEEDED',
          imageUrl: finalImageUrl,
          imageId,
        },
        { status: 201 },
      )
    }

    // 9. 对于异步 provider 或生成失败，返回任务状态
    // 如果生成失败，回滚积分
    if (result.status === 'FAILED') {
      const { error: rollbackError } = await supabase
        .from('users')
        .update({ credits: updateData.credits + 1 })
        .eq('id', userId)
        .select()

      if (rollbackError) {
        console.error('[Credits] 回滚失败:', rollbackError)
      } else {
        console.log(
          `[Credits] Rollback credit for user ${userId}: ${updateData.credits} -> ${updateData.credits + 1}`,
        )
      }
    }

    // 不直接暴露 provider 的错误消息，使用统一的友好提示
    const responseMessage =
      result.status === 'FAILED' ? '图片生成失败，请稍后重试' : undefined

    // 记录详细错误信息到日志（不返回给用户）
    if (result.status === 'FAILED' && result.errorMessage) {
      console.error('Provider generation failed:', {
        errorCode: result.errorCode,
        errorMessage: result.errorMessage,
        taskId: result.taskId,
      })
    }

    return NextResponse.json(
      {
        taskId: result.taskId,
        status: result.status,
        ...(result.errorCode && { error: result.errorCode }),
        ...(responseMessage && { message: responseMessage }),
      },
      { status: result.status === 'FAILED' ? 500 : 201 },
    )
  } catch (error) {
    console.error('Create task error:', error)

    let status = 500
    let message = '生成失败，请稍后重试'
    let errorCode = 'SERVER_ERROR'

    if (error instanceof Error) {
      if (error.message.includes('not configured')) {
        status = 401
        message = `${error.message}，请稍后重试`
        errorCode = 'AUTH_FAILED'
      } else if (
        error.message.includes('请输入') ||
        error.message.includes('过长')
      ) {
        status = 400
        message = error.message // 这些是用户输入错误，不需要"稍后重试"
        errorCode = 'INVALID_REQUEST'
      } else {
        // 其他未知错误，确保有友好提示
        message = '生成失败，请稍后重试'
      }
    }

    return NextResponse.json({ error: errorCode, message }, { status })
  }
}
