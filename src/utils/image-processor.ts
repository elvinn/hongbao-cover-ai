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

/**
 * Add watermark text to an image
 * Uses Sharp's composite feature to overlay SVG text watermark
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

  // Calculate target dimensions
  const targetWidth = Math.round(originalWidth * scale)
  const targetHeight = Math.round(originalHeight * scale)

  // Watermark configuration based on target size
  const fontSize = Math.round(targetWidth * 0.05)
  const text = 'Hongbao AI'
  const padding = Math.round(targetWidth * 0.04)
  const strokeWidth = Math.max(2, Math.round(fontSize / 20)) // Stroke width relative to font size

  // Create SVG watermark - positioned at top-right
  const svgWatermark = `
    <svg width="${targetWidth}" height="${targetHeight}">
      <text
        x="${targetWidth - padding}"
        y="${padding + fontSize}"
        text-anchor="end"
        font-size="${fontSize}"
        font-family="DejaVu Sans, Liberation Sans, sans-serif"
        font-weight="bold"
        fill="white"
        fill-opacity="0.8"
        stroke="black"
        stroke-width="${strokeWidth}"
        stroke-opacity="0.5"
      >${text}</text>
    </svg>
  `

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
        input: Buffer.from(svgWatermark),
        top: 0,
        left: 0,
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
