import { Router } from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { db } from '../db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const rateListRouter = Router()

// GET /api/rate-list
rateListRouter.get('/', (req, res) => {
  try {
    const data = db.getRateList()
    res.json({ success: true, data })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/rate-list/download
rateListRouter.get('/download', (req, res) => {
  try {
    const excelPath = path.resolve(__dirname, '../../public/Rishikar_Sports_Rate_List.xlsx')
    res.download(excelPath, 'Rishikar_Sports_Rate_List.xlsx')
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})
