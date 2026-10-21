import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { requireAdmin } from '../middleware/auth.js'

const _dirname = typeof __dirname !== 'undefined' ? __dirname : process.cwd()
const UPLOAD_DIR = process.env.VERCEL ? path.join('/tmp', 'uploads') : path.resolve(_dirname, '../uploads')
try {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true })
  }
} catch {}

// Strict whitelist of allowed extensions & mimetypes
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp'])
const ALLOWED_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp'])

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR)
  },
  filename: (req, file, cb) => {
    let ext = path.extname(file.originalname).toLowerCase()
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      ext = '.jpg'
    }
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9]/gi, '-').toLowerCase().slice(0, 50)
    cb(null, `${base || 'img'}-${Date.now()}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    if (ALLOWED_EXTENSIONS.has(ext) && ALLOWED_MIMES.has(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Security violation: Only JPG, PNG, and WEBP image files are permitted.'))
    }
  },
})

export const uploadRouter = Router()

// POST /api/upload - Single image upload (Strict Admin Only)
uploadRouter.post('/', requireAdmin, (req, res) => {
  // If base64 JSON is sent
  if (req.body && req.body.base64) {
    try {
      const { base64, filename } = req.body
      // Strictly match only jpg, jpeg, png, webp
      const matches = base64.match(/^data:image\/(jpeg|jpg|png|webp);base64,(.+)$/i)
      if (matches && matches.length === 3) {
        let ext = matches[1].toLowerCase()
        if (ext === 'jpeg') ext = 'jpg'
        const cleanName = (filename || 'upload').replace(/[^a-z0-9]/gi, '-').toLowerCase().slice(0, 40)
        const fname = `${cleanName}-${Date.now()}.${ext}`
        const fpath = path.join(UPLOAD_DIR, fname)
        fs.writeFileSync(fpath, Buffer.from(matches[2], 'base64'))
        return res.json({
          success: true,
          message: 'Image uploaded successfully',
          url: `/uploads/${fname}`,
          dataUrl: base64,
          filename: fname,
        })
      }
      return res.status(400).json({
        success: false,
        message: 'Invalid image format. Allowed formats: JPG, PNG, WEBP.',
      })
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Image processing failed: ' + err.message })
    }
  }

  // Handle standard multipart form data
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message })
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded' })
    }
    const publicUrl = `/uploads/${req.file.filename}`
    res.json({
      success: true,
      message: 'Image uploaded successfully',
      url: publicUrl,
      filename: req.file.filename,
    })
  })
})
