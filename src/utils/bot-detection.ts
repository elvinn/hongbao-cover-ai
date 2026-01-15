/**
 * Bot/Crawler detection utility
 * Used to determine if a request is from a search engine or AI crawler
 * for SSR/CSR hybrid rendering strategy
 */

const BOT_PATTERNS = [
  // Search engines
  /googlebot/i,
  /bingbot/i,
  /baiduspider/i,
  /yandexbot/i,
  /duckduckbot/i,
  /sogou/i,
  /360spider/i,
  /bytespider/i,
  /slurp/i, // Yahoo

  // AI crawlers
  /gptbot/i,
  /chatgpt-user/i,
  /claudebot/i,
  /anthropic-ai/i,
  /perplexitybot/i,
  /google-extended/i,
  /meta-externalagent/i,
  /cohere-ai/i,

  // Social platforms (for link previews)
  /facebookexternalhit/i,
  /twitterbot/i,
  /linkedinbot/i,
  /applebot/i,
  /telegrambot/i,
  /whatsapp/i,
  /slackbot/i,
  /discordbot/i,

  // Other crawlers
  /ahrefsbot/i,
  /semrushbot/i,
  /mj12bot/i,
  /dotbot/i,
]

/**
 * Check if the user agent indicates a bot/crawler
 * @param userAgent - The User-Agent header value
 * @returns true if the request is from a bot/crawler
 */
export function isBot(userAgent: string | null): boolean {
  if (!userAgent) return false
  return BOT_PATTERNS.some((pattern) => pattern.test(userAgent))
}
