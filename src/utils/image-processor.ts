import path from 'path'
import sharp from 'sharp'
import { COVER_IMAGE_WIDTH, COVER_IMAGE_HEIGHT } from '@/utils/prompts'

/**
 * Download an image from a URL and return it as a Buffer
 */
export async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`)
  }
  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

// Watermark cache: original buffer and resized buffers by width
let watermarkOriginal: Buffer | null = null
const watermarkResizedCache = new Map<number, Buffer>()

/**
 * Load and cache the original watermark buffer
 */
async function getWatermarkOriginal(): Promise<Buffer> {
  if (!watermarkOriginal) {
    const watermarkPath = path.join(process.cwd(), 'src/utils/watermark.png')
    watermarkOriginal = await sharp(watermarkPath).toBuffer()
  }
  return watermarkOriginal
}

/**
 * Get resized watermark buffer (cached by width)
 */
async function getResizedWatermark(width: number): Promise<Buffer> {
  const cached = watermarkResizedCache.get(width)
  if (cached) {
    return cached
  }

  const original = await getWatermarkOriginal()
  const resized = await sharp(original).resize(width).toBuffer()
  watermarkResizedCache.set(width, resized)
  return resized
}

/**
 * Add watermark image to an image
 * Uses Sharp's composite feature to overlay PNG watermark at top-right corner
 * @param imageBuffer - The original image buffer
 * @param scale - Scale factor for the output image (default: 1, use 0.5 for half size)
 * @returns Buffer with watermark added
 */
export async function addWatermark(
  imageBuffer: Buffer,
  scale: number = 1,
): Promise<Buffer> {
  const image = sharp(imageBuffer)
  const metadata = await image.metadata()

  const originalWidth = metadata.width || COVER_IMAGE_WIDTH
  const originalHeight = metadata.height || COVER_IMAGE_HEIGHT

  const targetWidth = Math.round(originalWidth * scale)
  const targetHeight = Math.round(originalHeight * scale)

  // Calculate watermark size (width is 25% of target image)
  const watermarkWidth = Math.round(targetWidth * 0.25)
  const watermarkBuffer = await getResizedWatermark(watermarkWidth)

  // Get resized watermark dimensions
  const watermarkMeta = await sharp(watermarkBuffer).metadata()
  const wmWidth = watermarkMeta.width || watermarkWidth

  // Calculate top-right position with padding
  const padding = Math.round(targetWidth * 0.03)
  const left = targetWidth - wmWidth - padding
  const top = padding

  let processedImage = image

  // Resize if scale is not 1
  if (scale !== 1) {
    processedImage = processedImage.resize(targetWidth, targetHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    })
  }

  return processedImage
    .composite([
      {
        input: watermarkBuffer,
        top: top,
        left: left,
      },
    ])
    .png({ quality: 80 })
    .toBuffer()
}

/**
 * Generate a unique image ID using crypto.randomUUID
 */
export function generateImageId(): string {
  return crypto.randomUUID()
}
