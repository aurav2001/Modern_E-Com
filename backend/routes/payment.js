import { Router } from 'express'
import crypto from 'crypto'
import Razorpay from 'razorpay'
import { db } from '../db.js'
import { sendOrderConfirmationEmail } from '../utils/mailer.js'

export const paymentRouter = Router()

// Check if Razorpay keys are configured
function getRazorpayConfig() {
  const keyId = process.env.RAZORPAY_KEY_ID ? String(process.env.RAZORPAY_KEY_ID).trim() : ''
  const keySecret = process.env.RAZORPAY_KEY_SECRET ? String(process.env.RAZORPAY_KEY_SECRET).trim() : ''
  const isConfigured = Boolean(
    keyId &&
    keySecret &&
    !keyId.includes('<') &&
    !keySecret.includes('<') &&
    keyId.startsWith('rzp_')
  )

  return { keyId, keySecret, isConfigured }
}

// GET /api/payment/config - Status & Public Key for frontend
paymentRouter.get('/config', (req, res) => {
  const { keyId, isConfigured } = getRazorpayConfig()
  res.json({
    success: true,
    isConfigured,
    mode: isConfigured ? 'live' : 'dummy',
    key_id: isConfigured ? keyId : null,
    gateway: 'Razorpay',
    message: isConfigured
      ? 'Razorpay credentials active'
      : 'Razorpay running in dummy/test mode (Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env for real payments)',
  })
})

// POST /api/payment/create-order - Create Razorpay or Dummy order
paymentRouter.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, notes } = req.body

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount is required' })
    }

    const { keyId, keySecret, isConfigured } = getRazorpayConfig()
    const amountInPaise = Math.round(Number(amount) * 100)

    // REAL RAZORPAY ORDER
    if (isConfigured) {
      try {
        const razorpay = new Razorpay({
          key_id: keyId,
          key_secret: keySecret,
        })

        const options = {
          amount: amountInPaise,
          currency: currency.toUpperCase(),
          receipt: receipt || `rcpt_${Date.now()}`,
          notes: notes || {},
        }

        const rzpOrder = await razorpay.orders.create(options)

        return res.json({
          success: true,
          mode: 'live',
          order_id: rzpOrder.id,
          amount: rzpOrder.amount,
          currency: rzpOrder.currency,
          key_id: keyId,
        })
      } catch (err) {
        console.error('[Razorpay Order Error]', err)
        return res.status(500).json({
          success: false,
          message: err.error?.description || err.message || 'Error creating Razorpay order',
        })
      }
    }

    // DUMMY / SIMULATION ORDER (When credentials not provided yet)
    const dummyOrderId = `order_dummy_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`
    return res.json({
      success: true,
      mode: 'dummy',
      order_id: dummyOrderId,
      amount: amountInPaise,
      currency: currency.toUpperCase(),
      key_id: 'rzp_test_dummy',
      notice: 'Running in simulated dummy mode. Add Razorpay keys to .env to take real payments.',
    })
  } catch (err) {
    console.error('[Payment Create Order Error]', err)
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/payment/verify - Verify Signature & Finalize Order
paymentRouter.post('/verify', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderDetails,
    } = req.body

    const { keySecret, isConfigured } = getRazorpayConfig()

    // 1. Verification Step
    if (isConfigured) {
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: 'razorpay_order_id, razorpay_payment_id, and razorpay_signature are required for verification',
        })
      }

      const body = `${razorpay_order_id}|${razorpay_payment_id}`
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(body.toString())
        .digest('hex')

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({
          success: false,
          verified: false,
          message: 'Payment verification failed: Invalid signature',
        })
      }
    }

    // 2. If orderDetails is provided, register the order directly into the database
    let createdOrder = null
    if (orderDetails && orderDetails.customer && Array.isArray(orderDetails.items)) {
      const { customer, items, couponCode, notes } = orderDetails
      const settings = db.getSettings()
      const coupons = db.getCoupons()

      const subtotal = items.reduce((acc, it) => acc + (Number(it.price) || 0) * (Number(it.qty) || 1), 0)

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

      const shippingFee = subtotal >= settings.freeShipAbove ? 0 : settings.shippingFee
      const taxableAmount = Math.max(0, subtotal - discount)
      const tax = Math.round(taxableAmount * 0.05)
      const total = taxableAmount + shippingFee

      const randomSuffix = Math.floor(1000 + Math.random() * 9000)
      const orderId = `RS-ORD-${randomSuffix}`

      createdOrder = {
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
        codFee: 0,
        tax,
        total,
        paymentMethod: isConfigured ? 'Razorpay (Online)' : 'Online (Test Mode)',
        paymentStatus: 'Paid',
        paymentDetails: {
          gateway: 'Razorpay',
          mode: isConfigured ? 'live' : 'dummy',
          razorpay_order_id: razorpay_order_id || null,
          razorpay_payment_id: razorpay_payment_id || `pay_dummy_${Date.now()}`,
          paidAt: new Date().toISOString(),
        },
        status: 'In Production',
        notes: notes || '',
        timeline: [
          { title: 'Payment Received', time: new Date().toISOString(), desc: isConfigured ? 'Payment successfully verified via Razorpay.' : 'Online payment verified in simulated test mode.' },
          { title: 'Order Placed', time: new Date().toISOString(), desc: 'Order confirmed and registered in production system.' },
        ],
      }

      // Save to Orders
      const orders = db.getOrders()
      orders.unshift(createdOrder)
      db.saveOrders(orders)

      // Deduct stock
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

      // Send confirmation email
      sendOrderConfirmationEmail(createdOrder).catch((err) =>
        console.error('[Payment Email Error]', err.message)
      )
    }

    res.json({
      success: true,
      verified: true,
      mode: isConfigured ? 'live' : 'dummy',
      order: createdOrder,
      message: isConfigured
        ? 'Payment verified successfully via Razorpay'
        : 'Payment simulated successfully in test mode',
    })
  } catch (err) {
    console.error('[Payment Verification Error]', err)
    res.status(500).json({ success: false, message: err.message })
  }
})
