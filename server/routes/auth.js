import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { db } from '../db.js'
import { generateToken, requireAuth } from '../middleware/auth.js'

export const authRouter = Router()

// POST /api/auth/register - Register a new customer
authRouter.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ success: false, message: 'All fields (name, email, phone, password) are required' })
    }

    const cleanEmail = email.trim().toLowerCase()
    const cleanPhone = phone.trim()

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' })
    }

    const users = db.getUsers()
    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail)
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      password: hashedPassword,
      role: 'user',
      addresses: [],
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)
    db.saveUsers(users)

    // Generate JWT token
    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    })

    const { password: _, ...userWithoutPass } = newUser
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: userWithoutPass,
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/auth/login - User login
authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' })
    }

    const cleanEmail = email.trim().toLowerCase()
    const users = db.getUsers()
    const user = users.find((u) => u.email.toLowerCase() === cleanEmail)

    if (!user) {
      return res.status(401).json({ success: false, message: 'No account found with this email' })
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password' })
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role || 'user',
    })

    const { password: _, ...userWithoutPass } = user
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userWithoutPass,
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/auth/me - Get current user profile
authRouter.get('/me', requireAuth, (req, res) => {
  try {
    const users = db.getUsers()
    const user = users.find((u) => u.id === req.user.id || u.email === req.user.email)

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    const { password: _, ...userWithoutPass } = user
    res.json({ success: true, user: userWithoutPass })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// PUT /api/auth/profile - Update user profile
authRouter.put('/profile', requireAuth, async (req, res) => {
  try {
    const users = db.getUsers()
    const index = users.findIndex((u) => u.id === req.user.id || u.email === req.user.email)

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    const { name, phone, addresses } = req.body
    if (name) users[index].name = name.trim()
    if (phone) users[index].phone = phone.trim()
    if (addresses && Array.isArray(addresses)) users[index].addresses = addresses

    db.saveUsers(users)

    const { password: _, ...userWithoutPass } = users[index]
    res.json({ success: true, message: 'Profile updated', user: userWithoutPass })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/auth/admin-login - Admin authentication via PIN
authRouter.post('/admin-login', (req, res) => {
  try {
    const { pin } = req.body
    const settings = db.getSettings()

    if (String(pin).trim() === String(settings.adminPin).trim()) {
      const token = generateToken(
        { role: 'admin', name: 'Store Admin', sub: 'rishikar_admin' },
        '7d'
      )
      return res.json({
        success: true,
        message: 'Admin access granted',
        token,
        role: 'admin',
      })
    }

    res.status(401).json({ success: false, message: 'Invalid Admin PIN' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})
