/**
 * Security Middleware for Rishikar Sports Backend
 * Provides:
 * 1. Security Headers (Anti-Clickjacking, Anti-MIME sniffing, XSS protection)
 * 2. In-memory Rate Limiting (Anti-Brute-Force & Anti-DDoS)
 * 3. Input Sanitization
 */

// In-memory hit storage: Map<key, { count: number, resetTime: number }>
const rateLimitStores = new Map()

// Clean up stale IP records every 10 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now()
  for (const [storeName, store] of rateLimitStores.entries()) {
    for (const [ip, record] of store.entries()) {
      if (now > record.resetTime) {
        store.delete(ip)
      }
    }
  }
}, 10 * 60 * 1000)

/**
 * Factory for creating custom in-memory rate limiters
 */
export function createRateLimiter({
  windowMs = 15 * 60 * 1000, // 15 minutes
  max = 100, // max requests per window
  message = 'Too many requests from this IP, please try again later.',
  name = 'default',
}) {
  if (!rateLimitStores.has(name)) {
    rateLimitStores.set(name, new Map())
  }
  const store = rateLimitStores.get(name)

  return (req, res, next) => {
    // Determine client IP (handles reverse proxy like Cloudflare, cPanel, Nginx)
    const clientIp =
      req.headers['x-forwarded-for']?.split(',')[0].trim() ||
      req.headers['x-real-ip'] ||
      req.socket.remoteAddress ||
      'unknown-ip'

    const now = Date.now()
    const record = store.get(clientIp)

    if (!record || now > record.resetTime) {
      store.set(clientIp, { count: 1, resetTime: now + windowMs })
      res.setHeader('X-RateLimit-Limit', max)
      res.setHeader('X-RateLimit-Remaining', max - 1)
      return next()
    }

    if (record.count >= max) {
      const retryAfterSec = Math.ceil((record.resetTime - now) / 1000)
      res.setHeader('Retry-After', retryAfterSec)
      res.setHeader('X-RateLimit-Limit', max)
      res.setHeader('X-RateLimit-Remaining', 0)
      return res.status(429).json({
        success: false,
        message,
        retryAfterSeconds: retryAfterSec,
      })
    }

    record.count += 1
    res.setHeader('X-RateLimit-Limit', max)
    res.setHeader('X-RateLimit-Remaining', max - record.count)
    next()
  }
}

// 1. Strict Limiter for Login, Admin PIN, and Register (Max 15 attempts per 15 mins)
export const authRateLimiter = createRateLimiter({
  name: 'auth',
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: 'Too many login attempts. For security reasons, please wait 15 minutes before trying again.',
})

// 2. Order Creation Limiter (Max 20 orders per hour per IP)
export const orderRateLimiter = createRateLimiter({
  name: 'orders',
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: 'Order creation rate limit reached. Please wait before placing more orders.',
})

// 3. General API Limiter (Max 400 requests per 10 mins per IP)
export const generalApiLimiter = createRateLimiter({
  name: 'general',
  windowMs: 10 * 60 * 1000,
  max: 400,
  message: 'Too many requests. Please slow down.',
})

/**
 * HTTP Security Headers Middleware
 */
export function securityHeaders(req, res, next) {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff')

  // Prevent Clickjacking
  res.setHeader('X-Frame-Options', 'SAMEORIGIN')

  // XSS Protection for older browsers
  res.setHeader('X-XSS-Protection', '1; mode=block')

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Disable sensitive browser permissions by default
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  // Prevent caching of sensitive API responses
  if (req.path.startsWith('/api/auth') || req.path.startsWith('/api/admin')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')
  }

  next()
}

/**
 * Basic Input Sanitizer to strip control characters & dangerous HTML tags
 */
export function sanitizeString(val) {
  if (typeof val !== 'string') return val
  return val
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // remove script tags
    .replace(/[<>]/g, (char) => (char === '<' ? '&lt;' : '&gt;')) // encode angle brackets
    .trim()
}
