// Rishikar Sports API Client
const API_BASE = '/api'

async function request(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
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
  updateOrderStatus: (id, status, note) => request(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, note }) }),

  // Enquiries
  getEnquiries: () => request('/enquiries'),
  createEnquiry: (data) => request('/enquiries', { method: 'POST', body: JSON.stringify(data) }),
  updateEnquiryStatus: (id, status, adminNotes) => request(`/enquiries/${id}`, { method: 'PATCH', body: JSON.stringify({ status, adminNotes }) }),

  // Coupons
  getCoupons: () => request('/coupons'),
  validateCoupon: (code, amount) => request('/coupons/validate', { method: 'POST', body: JSON.stringify({ code, amount }) }),

  // Admin
  adminLogin: (pin) => request('/admin/login', { method: 'POST', body: JSON.stringify({ pin }) }),
  getAdminStats: () => request('/admin/stats'),
  getSettings: () => request('/admin/settings'),
  saveSettings: (settings) => request('/admin/settings', { method: 'PUT', body: JSON.stringify(settings) }),

  // Rate list
  getRateList: () => request('/rate-list'),

  // Upload
  uploadImage: async (file) => {
    const fd = new FormData()
    fd.append('image', file)
    const res = await fetch(`${API_BASE}/upload`, { method: 'POST', body: fd })
    return res.json()
  },
}
