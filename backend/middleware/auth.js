import jwt from 'jsonwebtoken'
import { db } from '../db.js'

const JWT_SECRET = process.env.JWT_SECRET || 'rishikar-sports-super-secret-key-2026'

/**
 * Generate a JWT token for a user or admin
 */
export function generateToken(payload, expiresIn = '30d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn })
}

/**
 * Middleware: Verify user is logged in
 */
export function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization token missing or invalid' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token', error: err.message })
  }
}

/**
 * Middleware: Verify user is an Admin
 * Accepts either:
 * 1) Bearer JWT token with role === 'admin' cryptographically verified
 * 2) Admin PIN header `x-admin-pin` matching settings.adminPin strictly
 */
export function requireAdmin(req, res, next) {
  try {
    const settings = db.getSettings()

    // 1. Check custom admin PIN header strictly against stored settings.adminPin
    const rawPin = req.headers['x-admin-pin']
    const cleanPin = rawPin ? String(rawPin).replace(/['"]/g, '').trim() : null
    const validPin = settings?.adminPin ? String(settings.adminPin).trim() : null
    if (cleanPin && validPin && cleanPin === validPin) {
      req.user = { role: 'admin', name: 'Store Admin' }
      return next()
    }

    // 2. Check Bearer JWT token with verified admin role
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      try {
        const decoded = jwt.verify(token, JWT_SECRET)
        if (decoded && decoded.role === 'admin') {
          req.user = decoded
          return next()
        }
      } catch {
        // Fall through to 403
      }
    }

    return res.status(403).json({
      success: false,
      message: 'Access Denied: Admin authorization required to perform this action',
    })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Auth check error', error: err.message })
  }
}

/**
 * Check if the current request has valid Admin credentials without throwing
 */
export function isAdminRequest(req) {
  try {
    const settings = db.getSettings()
    const rawPin = req.headers['x-admin-pin']
    const cleanPin = rawPin ? String(rawPin).replace(/['"]/g, '').trim() : null
    const validPin = settings?.adminPin ? String(settings.adminPin).trim() : null
    if (cleanPin && validPin && cleanPin === validPin) return true

    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      const decoded = jwt.verify(token, JWT_SECRET)
      if (decoded && decoded.role === 'admin') return true
    }
  } catch {}
  return false
}

/**
 * Middleware: Optional Auth (if token present, attaches req.user, otherwise continues)
 */
export function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      req.user = jwt.verify(token, JWT_SECRET)
    }
  } catch {
    // Continue without req.user
  }
  next()
}

