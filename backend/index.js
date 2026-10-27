import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import zlib from 'zlib'
import { productRouter } from './routes/products.js'
import { orderRouter } from './routes/orders.js'
import { enquiryRouter } from './routes/enquiries.js'
import { couponRouter } from './routes/coupons.js'
import { adminRouter } from './routes/admin.js'
import { rateListRouter } from './routes/rateList.js'
import { uploadRouter } from './routes/uploads.js'
import { authRouter } from './routes/auth.js'
import { paymentRouter } from './routes/payment.js'
import { db } from './db.js'
import { verifySmtpConnection } from './utils/mailer.js'
import { securityHeaders, generalApiLimiter } from './middleware/security.js'

const _dirname = typeof __dirname !== 'undefined' ? __dirname : process.cwd()

const app = express()
const PORT = process.env.PORT || 5000

// Security: Hide server technology header
app.disable('x-powered-by')

// Security: Set security headers on all responses
app.use(securityHeaders)

// High-Performance Native Gzip Compression (Reduces JSON payloads by ~75%)
app.use((req, res, next) => {
  const acceptEncoding = req.headers['accept-encoding'] || ''
  if (!acceptEncoding.includes('gzip')) return next()

  const originalSend = res.send
  res.send = function (body) {
    if (typeof body === 'string' && body.length > 1024 && !res.getHeader('Content-Encoding')) {
      zlib.gzip(Buffer.from(body), (err, compressed) => {
        if (!err && compressed) {
          res.setHeader('Content-Encoding', 'gzip')
          res.setHeader('Content-Length', compressed.length)
          return originalSend.call(res, compressed)
        }
        return originalSend.call(res, body)
      })
    } else {
      return originalSend.call(res, body)
    }
  }
  next()
})

// Middlewares
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-admin-pin')
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  next()
})
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'x-admin-pin']
}))

// Body parser with safe payload limits
app.use(express.json({ limit: '8mb' }))
app.use(express.urlencoded({ limit: '8mb', extended: true }))

// Apply general API rate limiting to prevent DDoS & scraping
app.use('/api', generalApiLimiter)

// Request logger
app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    if (req.path.startsWith('/api')) {
      const duration = Date.now() - start
      console.log(`[API] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`)
    }
  })
  next()
})

// Static files for uploaded images (Served securely with nosniff)
const uploadDir = process.env.VERCEL ? path.join('/tmp', 'uploads') : path.resolve(_dirname, 'uploads')
const staticOptions = {
  maxAge: '7d',
  setHeaders: (res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff')
  },
}
app.use('/uploads', express.static(uploadDir, staticOptions))
app.use('/api/uploads', express.static(uploadDir, staticOptions))

// Root info
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'Rishikar Sports Backend API',
    endpoints: {
      health: '/api/health',
      products: '/api/products',
      orders: '/api/orders',
      rateList: '/api/rate-list'
    }
  })
})

// Health check
app.get('/api/health', async (req, res) => {
  const dbStatus = db.getStatus ? await db.getStatus() : db.getMongoStatus()
  res.json({
    status: 'ok',
    store: 'Rishikar Sports API',
    uptime: Math.round(process.uptime()),
    database: dbStatus,
    timestamp: new Date().toISOString(),
  })
})

// Mount API Routes
app.use('/api/products', productRouter)
app.use('/api/orders', orderRouter)
app.use('/api/enquiries', enquiryRouter)
app.use('/api/coupons', couponRouter)
app.use('/api/admin', adminRouter)
app.use('/api/rate-list', rateListRouter)
app.use('/api/upload', uploadRouter)
app.use('/api/auth', authRouter)
app.use('/api/payment', paymentRouter)

// Middleware: Recover original URL if Apache mod_rewrite forwarded request as /index.html
app.use((req, res, next) => {
  const original = req.headers['x-original-uri'] || req.headers['x-original-url'] || req.headers['x-rewrite-url']
  if (original && (req.url === '/index.html' || req.path === '/index.html')) {
    req.url = original
  }
  next()
})

// Optional: If frontend dist is copied to backend/public, serve it
const distPath = path.resolve(_dirname, 'public')
const indexPath = path.join(distPath, 'index.html')
if (fs.existsSync(distPath) && fs.existsSync(indexPath)) {
  app.use(express.static(distPath))
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(indexPath, (err) => {
        if (err) next()
      })
    }
    next()
  })
}

// Error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err)
  res.status(500).json({ success: false, message: err.message || 'Internal server error' })
})

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`===============================================`)
    console.log(`🚀 Rishikar Sports Backend running on port ${PORT}`)
    console.log(`📡 API endpoint: http://localhost:${PORT}/api/health`)
    console.log(`===============================================`)
    verifySmtpConnection()
  })
}

export default app
