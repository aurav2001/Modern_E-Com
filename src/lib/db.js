// Tiny localStorage-backed "database" shared by the storefront and the admin panel.
// Base data ships in src/data; anything the admin edits is stored as an override.
import baseProducts from '../data/products.json'
import baseMenu from '../data/menu.json'
import { BRAND, COUPONS as BASE_COUPONS, FREE_SHIP_ABOVE, SHIPPING_FEE, COD_FEE } from '../data/content'
import { loadLS, saveLS } from './utils'

export const KEYS = {
  products: 'rs.products',
  orders: 'rs.orders',
  users: 'rs.users',
  enquiries: 'rs.enquiries',
  settings: 'rs.settings',
  coupons: 'rs.coupons',
  admin: 'rs.admin',
}

export const DEFAULT_SETTINGS = {
  phone: BRAND.phone,
  phoneIntl: BRAND.phoneIntl,
  email: BRAND.email,
  address: BRAND.address,
  addressShort: BRAND.addressShort,
  hours: BRAND.hours,
  moq: BRAND.moq,
  freeShipAbove: FREE_SHIP_ABOVE,
  shippingFee: SHIPPING_FEE,
  codFee: COD_FEE,
  adminPin: '1234',
}

const listeners = new Set()
export const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn) }
const notify = () => listeners.forEach((fn) => fn())

// ── Products ──────────────────────────────────────────────
export const getProducts = () => loadLS(KEYS.products, null) || baseProducts
export function saveProducts(list) {
  saveLS(KEYS.products, list)
  notify()
  return list
}
export function upsertProduct(product) {
  const list = getProducts()
  const i = list.findIndex((p) => p.slug === product.slug)
  if (i === -1) return saveProducts([{ ...product, id: Math.max(0, ...list.map((p) => p.id)) + 1 }, ...list])
  const next = [...list]
  next[i] = { ...next[i], ...product }
  return saveProducts(next)
}
export const deleteProduct = (slug) => saveProducts(getProducts().filter((p) => p.slug !== slug))
export const resetProducts = () => { localStorage.removeItem(KEYS.products); notify(); return baseProducts }

// ── Menu (read-only, but counts follow the live catalogue) ─
export function getMenu() {
  const products = getProducts()
  const count = (sub) => products.filter((p) => p.subs.includes(sub)).length
  return baseMenu.map((cat) => ({
    ...cat,
    groups: cat.groups.map((g) => ({ ...g, items: g.items.map((it) => ({ ...it, count: count(it.slug) })) })),
  }))
}

// ── Orders ────────────────────────────────────────────────
export const getOrders = () => loadLS(KEYS.orders, [])
export function setOrderStatus(id, status) {
  const orders = getOrders().map((o) => (o.id === id ? { ...o, status, statusAt: Date.now() } : o))
  saveLS(KEYS.orders, orders)
  notify()
  return orders
}
export function deleteOrder(id) {
  const orders = getOrders().filter((o) => o.id !== id)
  saveLS(KEYS.orders, orders)
  notify()
  return orders
}

// ── Customers ─────────────────────────────────────────────
export const getUsers = () => loadLS(KEYS.users, [])

// ── Enquiries (bulk quote + contact form) ─────────────────
export const getEnquiries = () => loadLS(KEYS.enquiries, [])
export function addEnquiry(e) {
  const list = [{ id: 'ENQ' + Date.now().toString().slice(-8), at: Date.now(), status: 'New', ...e }, ...getEnquiries()]
  saveLS(KEYS.enquiries, list)
  notify()
  return list
}
export function setEnquiryStatus(id, status) {
  const list = getEnquiries().map((e) => (e.id === id ? { ...e, status } : e))
  saveLS(KEYS.enquiries, list)
  notify()
  return list
}
export function deleteEnquiry(id) {
  const list = getEnquiries().filter((e) => e.id !== id)
  saveLS(KEYS.enquiries, list)
  notify()
  return list
}

// ── Settings ──────────────────────────────────────────────
export const getSettings = () => ({ ...DEFAULT_SETTINGS, ...loadLS(KEYS.settings, {}) })
export function saveSettings(patch) {
  const next = { ...getSettings(), ...patch }
  saveLS(KEYS.settings, next)
  notify()
  return next
}

// ── Coupons ───────────────────────────────────────────────
export const getCoupons = () => loadLS(KEYS.coupons, null) || BASE_COUPONS
export function saveCoupons(map) {
  saveLS(KEYS.coupons, map)
  notify()
  return map
}

// ── Admin session ─────────────────────────────────────────
export const isAdmin = () => loadLS(KEYS.admin, false) === true
export const signInAdmin = (pin) => {
  if (String(pin) !== String(getSettings().adminPin)) return false
  saveLS(KEYS.admin, true)
  notify()
  return true
}
export const signOutAdmin = () => { saveLS(KEYS.admin, false); notify() }

// ── Derived stats for the dashboard ───────────────────────
export function stats() {
  const orders = getOrders()
  const products = getProducts()
  const revenue = orders.reduce((a, o) => a + (o.total || 0), 0)
  const items = orders.reduce((a, o) => a + o.items.reduce((s, l) => s + l.qty, 0), 0)
  const lowStock = products.filter((p) => (p.stock ?? 0) <= 40)
  const enquiries = getEnquiries()
  const sold = {}
  for (const o of orders) for (const l of o.items) sold[l.slug] = (sold[l.slug] || 0) + l.qty
  const top = Object.entries(sold)
    .map(([slug, qty]) => ({ qty, product: products.find((p) => p.slug === slug) }))
    .filter((x) => x.product)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5)
  // revenue per day for the last 14 days
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (13 - i))
    const next = d.getTime() + 86400000
    return {
      label: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      short: d.toLocaleDateString('en-IN', { day: 'numeric' }),
      value: orders.filter((o) => o.placedAt >= d.getTime() && o.placedAt < next).reduce((a, o) => a + o.total, 0),
    }
  })
  return {
    revenue,
    orders: orders.length,
    items,
    aov: orders.length ? Math.round(revenue / orders.length) : 0,
    products: products.length,
    lowStock,
    customers: getUsers().length,
    enquiries: enquiries.length,
    newEnquiries: enquiries.filter((e) => e.status === 'New').length,
    pending: orders.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled').length,
    top,
    days,
  }
}
