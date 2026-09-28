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

  // Upload
  uploadImage: async (file) => {
    const fd = new FormData()
    fd.append('image', file)
    const authHeaders = getAuthHeaders()
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: { ...authHeaders },
      body: fd,
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Upload failed')
    return data
  },
}
