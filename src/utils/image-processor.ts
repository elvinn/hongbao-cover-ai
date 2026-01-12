import sharp from 'sharp'

export const IMAGE_FORMAT = 'png'
export const PREVIEW_SCALE = 0.5

export async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`)
  }
  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

export async function createPreviewImage(
  originalBuffer: Buffer,
): Promise<Buffer> {
  const image = sharp(originalBuffer)
  const metadata = await image.metadata()

  const originalWidth = metadata.width || 957
  const originalHeight = metadata.height || 1278

  const previewWidth = Math.round(originalWidth * PREVIEW_SCALE)
  const previewHeight = Math.round(originalHeight * PREVIEW_SCALE)

  return sharp(originalBuffer)
    .resize(previewWidth, previewHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .toFormat(IMAGE_FORMAT)
    .png({ quality: 85 })
    .toBuffer()
}

export async function addWatermark(
  imageBuffer: Buffer,
  scale: number = PREVIEW_SCALE,
): Promise<Buffer> {
  const image = sharp(imageBuffer)
  const metadata = await image.metadata()

  const originalWidth = metadata.width || 957
  const originalHeight = metadata.height || 1278

  const targetWidth = Math.round(originalWidth * scale)
  const targetHeight = Math.round(originalHeight * scale)

  return sharp(imageBuffer)
    .resize(targetWidth, targetHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .toFormat(IMAGE_FORMAT)
    .png({ quality: 85 })
    .toBuffer()
}

export function generateImageId(): string {
  return crypto.randomUUID()
}
