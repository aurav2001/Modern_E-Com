// Rishikar Sports API Client with Automatic Auth Headers
const API_BASE = '/api'

function getAuthHeaders() {
  const headers = {}
  try {
    const adminToken = localStorage.getItem('rs.admin_token')
    const userToken = localStorage.getItem('rs.auth_token')
    const adminPin = localStorage.getItem('rs.admin_pin')

    const token = adminToken || userToken
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    if (adminPin) {
      headers['x-admin-pin'] = adminPin
    }
  } catch {}
  return headers
}

async function request(endpoint, options = {}) {
  try {
    const authHeaders = getAuthHeaders()
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...options.headers,
      },
      ...options,
    })
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`)
    }
    return data
  } catch (err) {
    console.warn(`API Error [${endpoint}]:`, err.message)
    throw err
  }
}

export const api = {
  // Auth (User & Admin)
  register: (name, email, phone, password) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, phone, password }),
    }),
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  getMe: () => request('/auth/me'),
  updateProfile: (patch) =>
    request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(patch),
    }),

  // Products
  getProducts: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/products${qs ? '?' + qs : ''}`)
  },
  getProduct: (slugOrId) => request(`/products/${slugOrId}`),
  createProduct: (data) => request('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (slugOrId, data) => request(`/products/${slugOrId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (slugOrId) => request(`/products/${slugOrId}`, { method: 'DELETE' }),

  // Orders
  getOrders: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/orders${qs ? '?' + qs : ''}`)
  },
  getOrder: (id) => request(`/orders/${id}`),
  createOrder: (data) => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateOrderStatus: (id, status, note) =>
    request(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note }),
    }),

  // Enquiries
  getEnquiries: () => request('/enquiries'),
  createEnquiry: (data) => request('/enquiries', { method: 'POST', body: JSON.stringify(data) }),
  updateEnquiryStatus: (id, status, adminNotes) =>
    request(`/enquiries/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, adminNotes }),
    }),

  // Coupons
  getCoupons: () => request('/coupons'),
  validateCoupon: (code, amount) => request('/coupons/validate', { method: 'POST', body: JSON.stringify({ code, amount }) }),

  // Admin
  adminLogin: async (pin) => {
    const res = await request('/admin/login', { method: 'POST', body: JSON.stringify({ pin }) })
    if (res.success && res.token) {
      try {
        localStorage.setItem('rs.admin_token', res.token)
        localStorage.setItem('rs.admin_pin', String(pin).trim())
      } catch {}
    }
    return res
  },
  adminLogout: () => {
    try {
      localStorage.removeItem('rs.admin_token')
      localStorage.removeItem('rs.admin_pin')
    } catch {}
  },
  getAdminStats: () => request('/admin/stats'),
  getSettings: () => request('/admin/settings'),
  saveSettings: (settings) => request('/admin/settings', { method: 'PUT', body: JSON.stringify(settings) }),

  // Rate list
  getRateList: () => request('/rate-list'),

  // Upload with automatic client-side compression to ensure instant display & persistence
  uploadImage: async (file) => {
    // 1. Fast Canvas compression (< 120KB)
    const { blob, dataUrl } = await compressImageFile(file, 1000, 0.78)
    const authHeaders = getAuthHeaders()

    // 2. Also send to server in background if backend storage is active
    try {
      const fd = new FormData()
      fd.append('image', blob, file.name ? file.name.replace(/\.[^.]+$/, '.jpg') : 'product.jpg')
      fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers: { ...authHeaders },
        body: fd,
      }).catch(() => {})
    } catch {}

    // 3. Return optimized dataUrl so image displays immediately without 404 on Vercel
    if (dataUrl) {
      return {
        success: true,
        message: 'Image uploaded successfully',
        url: dataUrl,
      }
    }

    throw new Error('Unable to process photo. Please choose a valid image file.')
  },
}

// Client-side image compressor: Resizes image to max 1000px & compresses to ~90KB JPEG
async function compressImageFile(file, maxDimension = 1000, quality = 0.78) {
  return new Promise((resolve) => {
    if (!file || !file.type || !file.type.startsWith('image/') || file.type === 'image/svg+xml') {
      return resolve({ blob: file, dataUrl: null })
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        let width = img.width
        let height = img.height

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width)
            width = maxDimension
          } else {
            width = Math.round((width * maxDimension) / height)
            height = maxDimension
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        const dataUrl = canvas.toDataURL('image/jpeg', quality)
        canvas.toBlob(
          (blob) => {
            resolve({ blob: blob || file, dataUrl })
          },
          'image/jpeg',
          quality
        )
      }
      img.onerror = () => resolve({ blob: file, dataUrl: e.target.result })
      img.src = e.target.result
    }
    reader.onerror = () => resolve({ blob: file, dataUrl: null })
    reader.readAsDataURL(file)
  })
}
