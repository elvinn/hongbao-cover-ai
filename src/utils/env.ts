export function getAlibabaImageKey(): string {
  const key = process.env.NEXT_PUBLIC_ALIBABA_IMAGE_KEY
  if (!key || key === 'your-alibaba-image-key') {
    throw new Error(
      'NEXT_PUBLIC_ALIBABA_IMAGE_KEY is not configured. ' +
        'Please add your Alibaba Wanx API key to .env.local. ' +
        'Get your API key from: https://dashscope.console.aliyun.com/',
    )
  }
  return key
}

/**
 * 获取图片生成的系统 prompt
 * 从环境变量 IMAGE_GENERATION_SYSTEM_PROMPT 读取
 * 如果未设置则返回 undefined
 */
export function getImageGenerationSystemPrompt(): string | undefined {
  return process.env.IMAGE_GENERATION_SYSTEM_PROMPT
}

export function validateEnv(): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL === 'your-project-url'
  ) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is not configured')
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'your-anon-key'
  ) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured')
  }

  if (
    !process.env.NEXT_PUBLIC_ALIBABA_IMAGE_KEY ||
    process.env.NEXT_PUBLIC_ALIBABA_IMAGE_KEY === 'your-alibaba-image-key'
  ) {
    errors.push('NEXT_PUBLIC_ALIBABA_IMAGE_KEY is not configured')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
