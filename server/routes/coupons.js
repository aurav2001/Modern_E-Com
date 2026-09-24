import { Router } from 'express'
import { db } from '../db.js'

export const couponRouter = Router()

// GET /api/coupons - List active coupons
couponRouter.get('/', (req, res) => {
  try {
    const list = db.getCoupons()
    res.json({ success: true, data: list })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/coupons/validate - Validate coupon for cart amount
couponRouter.post('/validate', (req, res) => {
  try {
    const { code, amount } = req.body
    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' })
    }

    const coupons = db.getCoupons()
    const found = coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase())

    if (!found) {
      return res.status(404).json({ success: false, message: 'Invalid coupon code' })
    }

    const cartTotal = Number(amount) || 0
    if (found.minOrder && cartTotal < found.minOrder) {
      return res.status(400).json({
        success: false,
        message: `Coupon '${found.code}' requires a minimum order of ₹${found.minOrder}`,
      })
    }

    let discount = 0
    if (found.type === 'percent') {
      discount = Math.round((cartTotal * found.discount) / 100)
      if (found.maxDiscount) discount = Math.min(discount, found.maxDiscount)
    } else {
      discount = found.discount
    }

    res.json({
      success: true,
      message: `Coupon applied: ${found.label || found.code}`,
      data: {
        code: found.code,
        discount,
        type: found.type,
      },
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})
