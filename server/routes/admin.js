import { Router } from 'express'
import { db } from '../db.js'
import { requireAdmin, generateToken } from '../middleware/auth.js'

export const adminRouter = Router()

// POST /api/admin/login - Verify PIN & return JWT
adminRouter.post('/login', (req, res) => {
  try {
    const { pin } = req.body
    const settings = db.getSettings()

    if (String(pin).trim() === String(settings.adminPin).trim()) {
      const token = generateToken({ role: 'admin', name: 'Store Admin' }, '7d')
      return res.json({
        success: true,
        message: 'Admin access granted',
        token,
        adminToken: `rs_adm_${Date.now()}_token`,
      })
    }
    res.status(401).json({ success: false, message: 'Invalid Admin PIN' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/admin/stats - Analytics & Dashboard stats (Admin only)
adminRouter.get('/stats', requireAdmin, (req, res) => {
  try {
    const orders = db.getOrders()
    const products = db.getProducts()
    const enquiries = db.getEnquiries()
    const users = db.getUsers()

    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0)
    const paidRevenue = orders
      .filter((o) => o.paymentStatus === 'Paid' || o.status === 'Delivered')
      .reduce((sum, o) => sum + (o.total || 0), 0)

    const pendingOrders = orders.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled').length
    const lowStockProducts = products.filter((p) => p.stock !== undefined && p.stock < 15)

    // Category distribution
    const categoryCounts = {}
    products.forEach((p) => {
      ;(p.categories || []).forEach((c) => {
        categoryCounts[c] = (categoryCounts[c] || 0) + 1
      })
    })

    res.json({
      success: true,
      data: {
        totalRevenue,
        paidRevenue,
        totalOrders: orders.length,
        pendingOrders,
        totalProducts: products.length,
        lowStockCount: lowStockProducts.length,
        totalEnquiries: enquiries.length,
        totalCustomers: users.length,
        categoryCounts,
        recentOrders: orders.slice(0, 5),
        recentEnquiries: enquiries.slice(0, 5),
      },
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/admin/settings - Read store public settings (hides adminPin unless admin)
adminRouter.get('/settings', (req, res) => {
  try {
    const settings = { ...db.getSettings() }

    // Check if requester is admin
    const authHeader = req.headers.authorization
    const pinHeader = req.headers['x-admin-pin']
    const isAdmin =
      (pinHeader && String(pinHeader).trim() === String(settings.adminPin).trim()) ||
      (authHeader && (authHeader.includes('rs_adm_') || authHeader.startsWith('Bearer ')))

    // Hide admin PIN for non-admin viewers
    if (!isAdmin) {
      delete settings.adminPin
    }

    res.json({ success: true, data: settings })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// PUT /api/admin/settings - Update settings (Admin only)
adminRouter.put('/settings', requireAdmin, (req, res) => {
  try {
    const current = db.getSettings()
    const updated = { ...current, ...req.body }
    db.saveSettings(updated)
    res.json({ success: true, message: 'Settings saved', data: updated })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})
