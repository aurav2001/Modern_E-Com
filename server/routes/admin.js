import { Router } from 'express'
import { db } from '../db.js'

export const adminRouter = Router()

// POST /api/admin/login - Verify PIN
adminRouter.post('/login', (req, res) => {
  try {
    const { pin } = req.body
    const settings = db.getSettings()

    if (String(pin).trim() === String(settings.adminPin).trim()) {
      return res.json({
        success: true,
        message: 'Admin access granted',
        token: `rs_adm_${Date.now()}_token`,
      })
    }
    res.status(401).json({ success: false, message: 'Invalid Admin PIN' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/admin/stats - Analytics & Dashboard stats
adminRouter.get('/stats', (req, res) => {
  try {
    const orders = db.getOrders()
    const products = db.getProducts()
    const enquiries = db.getEnquiries()

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
        categoryCounts,
        recentOrders: orders.slice(0, 5),
        recentEnquiries: enquiries.slice(0, 5),
      },
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/admin/settings
adminRouter.get('/settings', (req, res) => {
  try {
    const settings = db.getSettings()
    res.json({ success: true, data: settings })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// PUT /api/admin/settings
adminRouter.put('/settings', (req, res) => {
  try {
    const current = db.getSettings()
    const updated = { ...current, ...req.body }
    db.saveSettings(updated)
    res.json({ success: true, message: 'Settings saved', data: updated })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})
