const CDN_BASE_URL = 'https://cdn.hongbao.elvinn.wiki'
const CDN_IMAGE_OPTIONS = 'format=auto,quality=75'

/**
 * Convert an original CDN image URL to an optimized URL with Cloudflare Image Resizing
 * @param originalUrl - The original image URL (e.g., https://cdn.hongbao.elvinn.wiki/original/xxx.png)
 * @returns The optimized URL with Cloudflare Image Resizing
 */
export function getOptimizedImageUrl(originalUrl: string): string {
  if (!originalUrl.startsWith(CDN_BASE_URL)) {
    return originalUrl
  }

  // Already optimized
  if (originalUrl.includes('/cdn-cgi/image/')) {
    return originalUrl
  }

  // Replace base URL with optimized path (Cloudflare Image Resizing)
  const path = originalUrl.replace(CDN_BASE_URL, '')
  return `${CDN_BASE_URL}/cdn-cgi/image/${CDN_IMAGE_OPTIONS}${path}`
}
