export const formatPrice = (n) =>
  '₹' + Math.round(Number(n) || 0).toLocaleString('en-IN')

export const discountPct = (p) =>
  p?.mrp && p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0

export const cx = (...a) => a.filter(Boolean).join(' ')

export const titleCase = (s = '') =>
  s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

export const uid = () => Math.random().toString(36).slice(2, 8).toUpperCase()

export function loadLS(key, fallback) {
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : fallback
  } catch {
    return fallback
  }
}
export function saveLS(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

// Delivery estimate: N days from now
export function deliveryDate(days = 5) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
}
