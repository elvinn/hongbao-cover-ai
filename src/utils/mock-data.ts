import { COVER_STYLES, SAMPLE_COVERS, type CoverStyle } from '@/types/hongbao'
import { COVER_IMAGE_WIDTH, COVER_IMAGE_HEIGHT } from '@/utils/prompts'

export function getStyleById(id: CoverStyle) {
  return COVER_STYLES.find((s) => s.id === id) || COVER_STYLES[0]
}

export function getSampleCoverById(id: string) {
  return SAMPLE_COVERS.find((s) => s.id === id) || SAMPLE_COVERS[0]
}

export function getRandomSampleCovers(count: number = 6): typeof SAMPLE_COVERS {
  const shuffled = [...SAMPLE_COVERS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

export function generateMockImageUrl(style: CoverStyle): string {
  const colors: Record<CoverStyle, string> = {
    newyear: 'FF6B6B',
    minimalist: '4ECDC4',
    cute: 'FFE66D',
    chinese: '95E1D3',
  }
  const hex = colors[style] || colors.newyear
  return `https://placehold.co/${COVER_IMAGE_WIDTH}x${COVER_IMAGE_HEIGHT}/${hex}/FFFFFF/png?text=Cover+${style}&font=noto-sans`
}

export function generateSampleImageUrl(style: CoverStyle): string {
  const seed = `${style}-${Math.floor(Date.now() / 60000)}`
  return `https://picsum.photos/seed/${seed}/${COVER_IMAGE_WIDTH}/${COVER_IMAGE_HEIGHT}`
}

export function validateDescription(description: string): {
  valid: boolean
  error?: string
} {
  const trimmed = description.trim()
  if (trimmed.length < 4) {
    return { valid: false, error: '描述至少需要4个字符' }
  }
  if (trimmed.length > 2000) {
    return { valid: false, error: '描述不能超过2000个字符' }
  }
  return { valid: true }
}
