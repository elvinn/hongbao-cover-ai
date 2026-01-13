/**
 * Get the Volcano Engine (Ark) API key for Seeddream
 */
export function getArkApiKey(): string {
  const key = process.env.ARK_API_KEY
  if (!key || key === 'your-ark-api-key') {
    throw new Error(
      'ARK_API_KEY is not configured. ' +
        'Please add your Volcano Engine Ark API key to .env.local. ' +
        'Get your API key from: https://console.volcengine.com/ark',
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

  // Validate Seeddream API key
  if (
    !process.env.ARK_API_KEY ||
    process.env.ARK_API_KEY === 'your-ark-api-key'
  ) {
    errors.push(
      'ARK_API_KEY is not configured (required for Seeddream provider)',
    )
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
