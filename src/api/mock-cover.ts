import type {
  Cover,
  CoverStyle,
  GenerateCoverParams,
  GenerateCoverResponse,
  PaymentResponse,
  SampleCover,
} from '@/types/hongbao'
import {
  generateMockImageUrl,
  generateSampleImageUrl,
  getRandomSampleCovers,
} from '@/utils/mock-data'

const MOCK_DELAY_MS = 1500

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function generateId(): string {
  return `cover-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export async function generateCover(
  params: GenerateCoverParams,
): Promise<GenerateCoverResponse> {
  await delay(MOCK_DELAY_MS)

  const cover: Cover = {
    id: generateId(),
    description: params.description,
    style: params.style,
    status: 'completed',
    quality: 'preview',
    hasWatermark: true,
    createdAt: Date.now(),
    url: generateMockImageUrl(params.style),
  }

  return {
    success: true,
    cover,
  }
}

export async function processPayment(): Promise<PaymentResponse> {
  await delay(MOCK_DELAY_MS)

  // Mock payment: set cookie to simulate paid status
  document.cookie = 'paymentStatus=paid; path=/; max-age=86400'

  return {
    success: true,
    creditsAdded: 1,
  }
}

export async function getSampleCovers(): Promise<SampleCover[]> {
  await delay(500)

  return getRandomSampleCovers(6).map((cover) => ({
    ...cover,
    imageUrl: generateSampleImageUrl(cover.style),
  }))
}

export async function getHDCover(coverId: string): Promise<Cover | null> {
  await delay(1000)

  return {
    id: coverId,
    description: '',
    style: 'newyear',
    status: 'completed',
    quality: 'hd',
    hasWatermark: false,
    createdAt: Date.now(),
    url: generateMockImageUrl('newyear'),
  }
}
