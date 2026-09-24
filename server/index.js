import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { productRouter } from './routes/products.js'
import { orderRouter } from './routes/orders.js'
import { enquiryRouter } from './routes/enquiries.js'
import { couponRouter } from './routes/coupons.js'
import { adminRouter } from './routes/admin.js'
import { rateListRouter } from './routes/rateList.js'
import { uploadRouter } from './routes/uploads.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000

// Middlewares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

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

// Static files for uploaded images & public files
app.use('/uploads', express.static(path.resolve(__dirname, '../public/uploads')))
app.use('/products', express.static(path.resolve(__dirname, '../public/products')))

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    store: 'Rishikar Sports API',
    uptime: Math.round(process.uptime()),
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

// In production, serve the built Vite SPA from dist/
const distPath = path.resolve(__dirname, '../dist')
app.use(express.static(distPath))

app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    const indexPath = path.join(distPath, 'index.html')
    return res.sendFile(indexPath, (err) => {
      if (err) next()
    })
  }
  next()
})

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
  })
}

export default app
