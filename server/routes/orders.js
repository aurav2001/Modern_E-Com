import { Router } from 'express'
import { db } from '../db.js'
import { requireAdmin, optionalAuth } from '../middleware/auth.js'

export const orderRouter = Router()

// GET /api/orders - List orders (Admin gets all, customer gets by phone/email)
orderRouter.get('/', optionalAuth, (req, res) => {
  try {
    let orders = db.getOrders()
    const { status, phone, search, email } = req.query

    // Check if user is an admin
    const isAdmin = req.user?.role === 'admin' ||
      (req.headers['x-admin-pin'] && String(req.headers['x-admin-pin']).trim() === String(db.getSettings().adminPin).trim()) ||
      (req.headers.authorization && req.headers.authorization.includes('rs_adm_'))

    // If not admin and no specific phone/email filter is provided, restrict access
    if (!isAdmin && !phone && !email && !search) {
      // If regular authenticated user, show only their orders
      if (req.user?.email) {
        orders = orders.filter((o) => o.customer?.email?.toLowerCase() === req.user.email.toLowerCase())
      } else {
        return res.status(403).json({
          success: false,
          message: 'Admin authorization or customer lookup filter (phone/email) is required to view orders.',
        })
      }
    }

    if (status) {
      orders = orders.filter((o) => o.status.toLowerCase() === status.toLowerCase())
    }
    if (phone) {
      orders = orders.filter((o) => o.customer && o.customer.phone.includes(phone))
    }
    if (search) {
      const q = search.toLowerCase()
      orders = orders.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          (o.customer?.name && o.customer.name.toLowerCase().includes(q)) ||
          (o.customer?.phone && o.customer.phone.includes(q))
      )
    }

    res.json({
      success: true,
      total: orders.length,
      data: orders,
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/orders/:id - Single order tracking
orderRouter.get('/:id', (req, res) => {
  try {
    const orders = db.getOrders()
    const { id } = req.params
    const order = orders.find((o) => o.id === id || o.orderNumber === id)

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }
    res.json({ success: true, data: order })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/orders - Place a new order
orderRouter.post('/', (req, res) => {
  try {
    const { customer, items, paymentMethod, couponCode, notes } = req.body

    if (!customer || !customer.name || !customer.phone || !customer.address) {
      return res.status(400).json({ success: false, message: 'Customer name, phone, and delivery address are required' })
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must contain at least 1 item' })
    }

    const settings = db.getSettings()
    const coupons = db.getCoupons()

    // Calculate subtotal
    const subtotal = items.reduce((acc, it) => acc + (Number(it.price) || 0) * (Number(it.qty) || 1), 0)

    // Calculate discount
    let discount = 0
    if (couponCode) {
      const matched = coupons.find((c) => c.code.toUpperCase() === couponCode.toUpperCase())
      if (matched && subtotal >= (matched.minOrder || 0)) {
        if (matched.type === 'percent') {
          discount = Math.min(matched.maxDiscount || Infinity, Math.round((subtotal * matched.discount) / 100))
        } else {
          discount = matched.discount
        }
      }
    }

    // Shipping & COD
    const shippingFee = subtotal >= settings.freeShipAbove ? 0 : settings.shippingFee
    const codFee = paymentMethod === 'COD' ? settings.codFee : 0

    // GST (approximate: 5% on apparel)
    const taxableAmount = Math.max(0, subtotal - discount)
    const tax = Math.round(taxableAmount * 0.05)
    const total = taxableAmount + shippingFee + codFee

    // Generate Order ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const orderId = `RS-ORD-${randomSuffix}`

    const newOrder = {
      id: orderId,
      orderNumber: String(randomSuffix),
      createdAt: new Date().toISOString(),
      customer: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email || '',
        address: customer.address,
        city: customer.city || 'Chapra',
        state: customer.state || 'Bihar',
        pincode: customer.pincode || '',
      },
      items: items.map((it) => ({
        id: it.id,
        slug: it.slug,
        name: it.name,
        color: it.color || '',
        size: it.size || '',
        fabric: it.fabric || 'Standard',
        price: Number(it.price),
        qty: Number(it.qty) || 1,
        image: it.image || '',
      })),
      subtotal,
      discount,
      shippingFee,
      codFee,
      tax,
      total,
      paymentMethod: paymentMethod || 'COD',
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid',
      status: 'Placed',
      notes: notes || '',
      timeline: [
        { title: 'Order Placed', time: new Date().toISOString(), desc: 'Order confirmed and registered in production system.' },
      ],
    }

    // Save to Orders
    const orders = db.getOrders()
    orders.unshift(newOrder)
    db.saveOrders(orders)

    // Deduct stock in products if found
    const products = db.getProducts()
    let productsUpdated = false
    items.forEach((it) => {
      const p = products.find((prod) => prod.slug === it.slug || prod.id === it.id)
      if (p && p.stock !== undefined) {
        p.stock = Math.max(0, p.stock - (Number(it.qty) || 1))
        productsUpdated = true
      }
    })
    if (productsUpdated) {
      db.saveProducts(products)
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: newOrder,
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// PATCH /api/orders/:id/status - Update order status (Admin only)
orderRouter.patch('/:id/status', requireAdmin, (req, res) => {
  try {
    const orders = db.getOrders()
    const { id } = req.params
    const { status, note } = req.body

    const index = orders.findIndex((o) => o.id === id || o.orderNumber === id)
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }

    const order = orders[index]
    order.status = status || order.status
    if (!order.timeline) order.timeline = []

    order.timeline.push({
      title: `Status: ${status}`,
      time: new Date().toISOString(),
      desc: note || `Order updated to ${status} by Rishikar Sports dispatch team.`,
    })

    if (status === 'Delivered') {
      order.paymentStatus = 'Paid'
    }

    db.saveOrders(orders)
    res.json({ success: true, message: 'Order status updated', data: order })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})
