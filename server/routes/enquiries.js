import { Router } from 'express'
import { db } from '../db.js'

export const enquiryRouter = Router()

// GET /api/enquiries - List all enquiries
enquiryRouter.get('/', (req, res) => {
  try {
    const list = db.getEnquiries()
    res.json({ success: true, total: list.length, data: list })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/enquiries - Submit bulk customization request
enquiryRouter.post('/', (req, res) => {
  try {
    const { name, phone, email, sport, teamName, quantity, fabricPreference, budgetPerPiece, notes } = req.body

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and phone are required' })
    }

    const list = db.getEnquiries()
    const newEnquiry = {
      id: `ENQ-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      name,
      phone,
      email: email || '',
      sport: sport || 'Cricket',
      teamName: teamName || 'Not specified',
      quantity: Number(quantity) || 11,
      fabricPreference: fabricPreference || 'Any',
      budgetPerPiece: budgetPerPiece || 'Standard',
      notes: notes || '',
      status: 'New',
    }

    list.unshift(newEnquiry)
    db.saveEnquiries(list)

    res.status(201).json({
      success: true,
      message: 'Enquiry submitted. Our design & production team will call you shortly.',
      data: newEnquiry,
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// PATCH /api/enquiries/:id - Update status (Admin)
enquiryRouter.patch('/:id', (req, res) => {
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
