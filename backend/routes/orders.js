import { Router } from 'express'
import { db } from '../db.js'
import { requireAdmin, optionalAuth, isAdminRequest } from '../middleware/auth.js'
import { sendOrderConfirmationEmail } from '../utils/mailer.js'
import { orderRateLimiter, sanitizeString } from '../middleware/security.js'

export const orderRouter = Router()

// GET /api/orders - List orders (Admin gets all, customer gets only their own)
orderRouter.get('/', optionalAuth, (req, res) => {
  try {
    let orders = db.getOrders()
    const { status, phone, search } = req.query
    const isAdmin = isAdminRequest(req)

    // Unauthenticated or non-admin access
    if (!isAdmin) {
      if (req.user?.email || req.user?.phone) {
        orders = orders.filter(
          (o) =>
            (req.user.email && o.customer?.email?.toLowerCase() === req.user.email.toLowerCase()) ||
            (req.user.phone && o.customer?.phone === req.user.phone)
        )
      } else {
        return res.status(401).json({
          success: false,
          message: 'Authentication required to view order history',
        })
      }
    } else {
      // Admin filters
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

// GET /api/orders/:id - Single order tracking (Protects private customer data)
orderRouter.get('/:id', optionalAuth, (req, res) => {
  try {
    const orders = db.getOrders()
    const { id } = req.params
    const order = orders.find((o) => o.id === id || o.orderNumber === id)

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }

    const isAdmin = isAdminRequest(req)
    const reqPhone = req.query.phone ? String(req.query.phone).replace(/\D/g, '') : null
    const isOwner =
      (req.user?.email && order.customer?.email?.toLowerCase() === req.user.email.toLowerCase()) ||
      (req.user?.phone && order.customer?.phone === req.user.phone) ||
      (reqPhone && order.customer?.phone && order.customer.phone.replace(/\D/g, '').endsWith(reqPhone.slice(-10)))

    // If caller is Admin or verified owner, return complete order with full address
    if (isAdmin || isOwner) {
      return res.json({ success: true, data: order })
    }

    // For public tracking, return order tracking details without leaking customer's full address
    res.json({
      success: true,
      data: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        timeline: order.timeline || [],
        tracking: order.tracking || null,
        createdAt: order.createdAt,
        items: (order.items || []).map((it) => ({
          name: it.name,
          color: it.color,
          size: it.size,
          qty: it.qty,
        })),
        customerCity: order.customer?.city,
        customerState: order.customer?.state,
      },
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/orders - Place a new order (Protected by rate limiting & validation)
orderRouter.post('/', orderRateLimiter, (req, res) => {
  try {
    const { customer, items, paymentMethod, couponCode, notes } = req.body

    if (!customer || !customer.name || !customer.phone || !customer.address) {
      return res.status(400).json({ success: false, message: 'Customer name, phone, and delivery address are required' })
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must contain at least 1 item' })
    }

    const cleanPhone = String(customer.phone).replace(/\D/g, '').slice(0, 10)
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit mobile number' })
    }

    const settings = db.getSettings()
    const coupons = db.getCoupons()

    // Calculate subtotal
    const subtotal = items.reduce((acc, it) => acc + (Number(it.price) || 0) * (Number(it.qty) || 1), 0)

    // Calculate discount
    let discount = 0
    if (couponCode) {
      const matched = coupons.find((c) => c.code.toUpperCase() === String(couponCode).trim().toUpperCase())
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
        name: sanitizeString(customer.name),
        phone: cleanPhone,
        email: customer.email ? String(customer.email).trim().toLowerCase() : '',
        address: sanitizeString(customer.address),
        city: sanitizeString(customer.city || 'Chapra'),
        state: sanitizeString(customer.state || 'Bihar'),
        pincode: String(customer.pincode || '').replace(/\D/g, '').slice(0, 6),
      },
      items: items.map((it) => ({
        id: it.id,
        slug: it.slug,
        name: sanitizeString(it.name),
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
      paymentMethod: paymentMethod === 'COD' ? 'COD' : 'Online',
      paymentStatus: 'Pending', // Secure: Always Pending on order placement. Only verified via Razorpay webhook or Admin
      status: 'Placed',
      notes: sanitizeString(notes || ''),
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

    // Trigger confirmation and alert email asynchronously
    sendOrderConfirmationEmail(newOrder).catch((err) => {
      console.warn('[Mailer] Order notification failed:', err.message)
    })

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
