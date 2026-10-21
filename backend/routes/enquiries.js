import { Router } from 'express'
import { db } from '../db.js'
import { requireAdmin } from '../middleware/auth.js'
import { sendEnquiryEmail } from '../utils/mailer.js'
import { sanitizeString } from '../middleware/security.js'

export const enquiryRouter = Router()

// GET /api/enquiries - List all enquiries (Admin only)
enquiryRouter.get('/', requireAdmin, (req, res) => {
  try {
    const list = db.getEnquiries()
    res.json({ success: true, total: list.length, data: list })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/enquiries - Submit bulk customization request (Sanitized)
enquiryRouter.post('/', (req, res) => {
  try {
    const { name, phone, email, sport, teamName, quantity, fabricPreference, budgetPerPiece, notes } = req.body

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and phone are required' })
    }

    const cleanPhone = String(phone).replace(/\D/g, '').slice(0, 10)
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit mobile number' })
    }

    const list = db.getEnquiries()
    const newEnquiry = {
      id: `ENQ-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      name: sanitizeString(name),
      phone: cleanPhone,
      email: email ? String(email).trim().toLowerCase().slice(0, 80) : '',
      sport: sanitizeString(sport || 'Cricket'),
      teamName: sanitizeString(teamName || 'Not specified'),
      quantity: Math.min(10000, Math.max(1, Number(quantity) || 11)),
      fabricPreference: sanitizeString(fabricPreference || 'Any'),
      budgetPerPiece: sanitizeString(budgetPerPiece || 'Standard'),
      notes: sanitizeString(notes || '').slice(0, 500),
      status: 'New',
    }

    list.unshift(newEnquiry)
    db.saveEnquiries(list)

    // Trigger email notification to admin & confirmation to customer
    sendEnquiryEmail(newEnquiry).catch((err) => {
      console.warn('[Mailer] Enquiry notification failed:', err.message)
    })

    res.status(201).json({
      success: true,
      message: 'Enquiry submitted. Our design & production team will call you shortly.',
      data: newEnquiry,
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// PATCH /api/enquiries/:id - Update status (Admin only)
enquiryRouter.patch('/:id', requireAdmin, (req, res) => {
  try {
    const list = db.getEnquiries()
    const { id } = req.params
    const { status, adminNotes } = req.body

    const item = list.find((e) => e.id === id)
    if (!item) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' })
    }

    if (status) item.status = status
    if (adminNotes) item.adminNotes = adminNotes

    db.saveEnquiries(list)
    res.json({ success: true, message: 'Enquiry updated', data: item })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})
