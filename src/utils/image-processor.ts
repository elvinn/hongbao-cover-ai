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
 * Generate a unique image ID using crypto.randomUUID
 */
export function generateImageId(): string {
  return crypto.randomUUID()
}
