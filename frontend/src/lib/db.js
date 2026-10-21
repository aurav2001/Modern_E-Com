// Tiny localStorage-backed "database" shared by the storefront and the admin panel.
// Base data ships in src/data; anything the admin edits is stored as an override.
import baseProducts from '../data/products.json'
import baseMenu from '../data/menu.json'
import { BRAND, COUPONS as BASE_COUPONS, FREE_SHIP_ABOVE, SHIPPING_FEE, COD_FEE } from '../data/content'
import { loadLS, saveLS } from './utils'
import { api } from './api'

export const KEYS = {
  products: 'rs.products.v2',
  orders: 'rs.orders',
  users: 'rs.users',
  enquiries: 'rs.enquiries',
  settings: 'rs.settings',
  coupons: 'rs.coupons',
  admin: 'rs.admin',
  categories: 'rs.categories',
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

// ── Categories & Sub-categories ───────────────────────────
export const BASE_CATS = [
  { slug: 'jerseys', name: 'Jerseys' },
  { slug: 'tshirts', name: 'T-Shirts & Polos' },
  { slug: 'teamwear', name: 'Teamwear' },
  { slug: 'accessories', name: 'Accessories' },
]

export const BASE_SUBS = {
  jerseys: ['sublimation-jerseys', 'football-jerseys', 'cricket-jerseys'],
  tshirts: ['polo-tshirts', 'round-neck-tees', 'sleeveless-tees'],
  teamwear: ['tracksuits', 'track-jackets', 'hoodies', 'lowers', 'shorts'],
  accessories: ['kit-bags', 'caps', 'bottles'],
}

export function getCategories() {
  const custom = loadLS(KEYS.categories, null)
  if (!custom) return { cats: BASE_CATS, subs: BASE_SUBS }
  return {
    cats: custom.cats || BASE_CATS,
    subs: custom.subs || BASE_SUBS,
  }
}

export function addCategory(name) {
  const cur = getCategories()
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  if (!slug || cur.cats.some((c) => c.slug === slug)) return cur
  const next = {
    cats: [...cur.cats, { slug, name: name.trim() }],
    subs: { ...cur.subs, [slug]: [] },
  }
  saveLS(KEYS.categories, next)
  notify()
  return next
}

export function addSubCategory(catSlug, subName) {
  const cur = getCategories()
  const subSlug = subName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  if (!subSlug) return cur
  const existing = cur.subs[catSlug] || []
  if (existing.includes(subSlug)) return cur
  const next = {
    ...cur,
    subs: {
      ...cur.subs,
      [catSlug]: [...existing, subSlug],
    },
  }
  saveLS(KEYS.categories, next)
  notify()
  return next
}

export function deleteCategory(slug) {
  const cur = getCategories()
  const nextCats = cur.cats.filter((c) => c.slug !== slug)
  const nextSubs = { ...cur.subs }
  delete nextSubs[slug]
  const next = {
    cats: nextCats.length > 0 ? nextCats : BASE_CATS,
    subs: nextSubs,
  }
  saveLS(KEYS.categories, next)
  notify()
  return next
}

export function deleteSubCategory(catSlug, subSlug) {
  const cur = getCategories()
  const existing = cur.subs[catSlug] || []
  const next = {
    ...cur,
    subs: {
      ...cur.subs,
      [catSlug]: existing.filter((s) => s !== subSlug),
    },
  }
  saveLS(KEYS.categories, next)
  notify()
  return next
}

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
  let next
  if (i === -1) {
    next = [{ ...product, id: Math.max(0, ...list.map((p) => p.id)) + 1 }, ...list]
    api.createProduct(product).catch(() => {})
  } else {
    next = [...list]
    next[i] = { ...next[i], ...product }
    api.updateProduct(product.slug, product).catch(() => api.createProduct(product).catch(() => {}))
  }
  return saveProducts(next)
}
export const deleteProduct = (slug) => {
  api.deleteProduct(slug).catch(() => {})
  return saveProducts(getProducts().filter((p) => p.slug !== slug))
}
export const resetProducts = () => { localStorage.removeItem(KEYS.products); notify(); return baseProducts }

// ── Menu (read-only, but counts follow the live catalogue) ─
export function getMenu() {
  const products = getProducts()
  const count = (sub) => products.filter((p) => p.subs.includes(sub)).length
  const { cats, subs } = getCategories()
  const baseSlugs = new Set(baseMenu.map((m) => m.slug))
  const extraCats = cats.filter((c) => !baseSlugs.has(c.slug)).map((c) => ({
    name: c.name,
    slug: c.slug,
    groups: [
      {
        name: `Shop ${c.name}`,
        items: (subs[c.slug] || []).map((s) => ({
          name: s.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          slug: s,
          count: count(s),
        })),
      },
    ],
  }))
  const fullMenu = [...baseMenu, ...extraCats]
  return fullMenu.map((cat) => ({
    ...cat,
    groups: cat.groups.map((g) => ({ ...g, items: g.items.map((it) => ({ ...it, count: count(it.slug) })) })),
  }))
}

// ── Orders ────────────────────────────────────────────────
export const getOrders = () => loadLS(KEYS.orders, [])
export function setOrderStatus(id, status) {
  const orders = getOrders().map((o) => (o.id === id ? { ...o, status, statusAt: Date.now() } : o))
  saveLS(KEYS.orders, orders)
  api.updateOrderStatus(id, status).catch(() => {})
  notify()
  return orders
}
export function updateOrderTracking(id, updates) {
  const orders = getOrders().map((o) => (o.id === id ? { ...o, ...updates } : o))
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
export const getUsers = () => {
  const raw = loadLS(KEYS.users, [])
  if (!Array.isArray(raw)) return []
  const seen = new Set()
  const unique = raw.filter((u) => {
    if (!u || !u.email) return false
    const em = String(u.email).toLowerCase().trim()
    if (seen.has(em)) return false
    seen.add(em)
    return true
  })
  if (unique.length !== raw.length) {
    saveLS(KEYS.users, unique)
  }
  return unique
}
export function deleteUser(email) {
  const list = getUsers().filter((u) => u.email.toLowerCase() !== String(email).toLowerCase())
  saveLS(KEYS.users, list)
  notify()
  return list
}
export function cleanDuplicateUsers() {
  const list = getUsers()
  saveLS(KEYS.users, list)
  notify()
  return list
}

// ── Enquiries (bulk quote + contact form) ─────────────────
export const getEnquiries = () => loadLS(KEYS.enquiries, [])
export function addEnquiry(e) {
  const list = [{ id: 'ENQ' + Date.now().toString().slice(-8), at: Date.now(), status: 'New', ...e }, ...getEnquiries()]
  saveLS(KEYS.enquiries, list)
  api.createEnquiry(e).catch(() => {})
  notify()
  return list
}
export function setEnquiryStatus(id, status) {
  const list = getEnquiries().map((e) => (e.id === id ? { ...e, status } : e))
  saveLS(KEYS.enquiries, list)
  api.updateEnquiryStatus(id, status).catch(() => {})
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
  api.saveSettings(next).catch(() => {})
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
  saveLS('rs.admin_pin', String(pin).trim())
  api.adminLogin(pin).catch(() => {})
  notify()
  return true
}
export const signOutAdmin = () => {
  saveLS(KEYS.admin, false)
  api.adminLogout()
  notify()
}

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
