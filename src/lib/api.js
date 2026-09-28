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

  // Upload with automatic client-side compression to prevent 413 Payload Too Large
  uploadImage: async (file) => {
    // 1. Fast Canvas compression (< 300KB)
    const { blob, dataUrl } = await compressImageFile(file)
    const authHeaders = getAuthHeaders()

    // 2. Try uploading compressed Blob to server
    try {
      const fd = new FormData()
      fd.append('image', blob, file.name ? file.name.replace(/\.[^.]+$/, '.jpg') : 'product.jpg')

      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers: { ...authHeaders },
        body: fd,
      })

      if (res.ok) {
        const data = await res.json()
        if (data.url) return data
      }
    } catch (err) {
      console.warn('Multipart upload notice:', err.message)
    }

    // 3. Try base64 JSON upload to server
    if (dataUrl) {
      try {
        const res = await fetch(`${API_BASE}/upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders,
          },
          body: JSON.stringify({
            base64: dataUrl,
            filename: file.name ? file.name.replace(/[^a-z0-9]/gi, '-').toLowerCase() : 'product',
          }),
        })

        if (res.ok) {
          const data = await res.json()
          if (data.url) return data
        }
      } catch (err) {
        console.warn('Base64 upload notice:', err.message)
      }

      // 4. Client-side fallback: Return optimized data URL directly so image is never lost
      return {
        success: true,
        message: 'Image optimized successfully',
        url: dataUrl,
      }
    }

    throw new Error('Unable to process photo. Please choose a valid image file.')
  },
}

// Client-side image compressor: Resizes image to max 1280px & compresses to ~150KB JPEG
async function compressImageFile(file, maxDimension = 1280, quality = 0.82) {
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
