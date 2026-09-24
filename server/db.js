import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import initialProducts from '../src/data/products.json' with { type: 'json' }
import initialRateList from '../src/data/rateList.json' with { type: 'json' }

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// On Vercel, the filesystem is read-only except /tmp
const DATA_DIR = process.env.VERCEL ? path.join('/tmp', 'rs_data') : path.resolve(__dirname, 'data')

try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
} catch {
  // Graceful fallback to memory if filesystem is restricted
}

function getFilePath(collection) {
  return path.join(DATA_DIR, `${collection}.json`)
}

// In-memory cache ensures zero latency and works seamlessly in serverless
const memoryStore = {
  products: initialProducts,
  rateList: initialRateList,
  coupons: null,
  settings: null,
  orders: null,
  enquiries: null,
  users: [],
}

function readJsonFile(filePath, fallback = []) {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8')
      return JSON.parse(raw)
    }
  } catch (err) {
    console.warn(`[DB Read Notice] ${filePath}:`, err.message)
  }
  return fallback
}

function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
    return true
  } catch (err) {
    console.warn(`[DB Write Notice] ${filePath}:`, err.message)
    return false
  }
}

const DEFAULT_COUPONS = [
  { code: 'RS10', discount: 10, type: 'percent', minOrder: 999, maxDiscount: 500, label: '10% off on orders above ₹999' },
  { code: 'TEAM500', discount: 500, type: 'flat', minOrder: 4999, maxDiscount: 500, label: '₹500 flat off on bulk orders above ₹4,999' },
  { code: 'WELCOME15', discount: 15, type: 'percent', minOrder: 1499, maxDiscount: 600, label: '15% welcome discount above ₹1,499' },
  { code: 'CRICKET20', discount: 20, type: 'percent', minOrder: 9999, maxDiscount: 2500, label: '20% off on complete team tournament orders' },
]

const DEFAULT_SETTINGS = {
  storeName: 'Rishikar Sports',
  phone: '6299094402',
  phoneIntl: '+916299094402',
  email: 'rishikarsports@gmail.com',
  address: 'CN137, Plot No 602, Tari, Near Atithee Vihar, Dahiawan Tola, Chapra, Saran, Bihar 841301',
  hours: 'Mon–Sat, 9am–7pm',
  moq: 11,
  freeShipAbove: 999,
  shippingFee: 79,
  codFee: 49,
  adminPin: '1234',
}

const DEFAULT_ORDERS = [
  {
    id: 'RS-ORD-8941',
    orderNumber: '8941',
    createdAt: new Date(Date.now() - 3600 * 1000 * 24 * 2).toISOString(),
    customer: {
      name: 'Vikram Singh',
      phone: '9876543210',
      email: 'vikram.singh@gmail.com',
      address: 'Near Gandhi Chowk, Siwan Road',
      city: 'Chapra',
      state: 'Bihar',
      pincode: '841301',
    },
    items: [
      {
        id: 1001,
        slug: 'rs-pro-sublimated-jersey',
        name: 'RS PRO Sublimated Match Jersey',
        color: 'Navy & Orange',
        size: 'L',
        fabric: 'Dotknit',
        price: 420,
        qty: 15,
        image: '/products/rs/rs-prod-35.jpg',
      },
    ],
    subtotal: 6300,
    discount: 500,
    shippingFee: 0,
    codFee: 0,
    tax: 315,
    total: 6115,
    paymentMethod: 'COD',
    paymentStatus: 'Pending',
    status: 'In Production',
    notes: 'Team Name: Chapra Super Kings (Print back numbers 1 to 15)',
  },
  {
    id: 'RS-ORD-8942',
    orderNumber: '8942',
    createdAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
    customer: {
      name: 'Rajnish Kumar',
      phone: '9123456789',
      email: 'rajnish.bca@gmail.com',
      address: 'Boring Road, Anandpuri',
      city: 'Patna',
      state: 'Bihar',
      pincode: '800001',
    },
    items: [
      {
        id: 1014,
        slug: 'bihar-cricket-association-cap',
        name: 'Bihar Cricket Association (BCA) Official Cap',
        color: 'BCA Royal Blue & Gold',
        size: 'Adjustable',
        fabric: 'Standard Heavy Twill',
        price: 350,
        qty: 25,
        image: '/products/rs/rs-prod-05.jpg',
      },
    ],
    subtotal: 8750,
    discount: 500,
    shippingFee: 0,
    codFee: 0,
    tax: 437,
    total: 8687,
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    status: 'Dispatched',
    notes: 'Ship via DTDC / Tirupati Courier to Patna office',
  },
]

const DEFAULT_ENQUIRIES = [
  {
    id: 'ENQ-101',
    createdAt: new Date(Date.now() - 3600 * 1000 * 18).toISOString(),
    name: 'Coach Arvind Sharma',
    phone: '9431200000',
    email: 'arvind.cricket@gmail.com',
    sport: 'Cricket',
    teamName: 'Saran Youth Cricket Club',
    quantity: 22,
    fabricPreference: '4-Way Lycra & Dotknit Combo',
    budgetPerPiece: '₹800 - ₹1,200',
    notes: 'Need 22 full kits with trousers and embroidered caps before state tournament next month.',
    status: 'Quote Sent',
  },
]

// Populate memory store
memoryStore.coupons = DEFAULT_COUPONS
memoryStore.settings = DEFAULT_SETTINGS
memoryStore.orders = DEFAULT_ORDERS
memoryStore.enquiries = DEFAULT_ENQUIRIES

export const db = {
  getProducts() {
    return memoryStore.products || readJsonFile(getFilePath('products'), initialProducts)
  },
  saveProducts(data) {
    memoryStore.products = data
    writeJsonFile(getFilePath('products'), data)
    return true
  },

  getOrders() {
    const list = readJsonFile(getFilePath('orders'), null)
    if (list) memoryStore.orders = list
    return memoryStore.orders || DEFAULT_ORDERS
  },
  saveOrders(data) {
    memoryStore.orders = data
    writeJsonFile(getFilePath('orders'), data)
    return true
  },

  getEnquiries() {
    const list = readJsonFile(getFilePath('enquiries'), null)
    if (list) memoryStore.enquiries = list
    return memoryStore.enquiries || DEFAULT_ENQUIRIES
  },
  saveEnquiries(data) {
    memoryStore.enquiries = data
    writeJsonFile(getFilePath('enquiries'), data)
    return true
  },

  getCoupons() {
    return memoryStore.coupons || readJsonFile(getFilePath('coupons'), DEFAULT_COUPONS)
  },
  saveCoupons(data) {
    memoryStore.coupons = data
    writeJsonFile(getFilePath('coupons'), data)
    return true
  },

  getSettings() {
    return memoryStore.settings || readJsonFile(getFilePath('settings'), DEFAULT_SETTINGS)
  },
  saveSettings(data) {
    memoryStore.settings = data
    writeJsonFile(getFilePath('settings'), data)
    return true
  },

  getRateList() {
    return initialRateList
  },

  getUsers() {
    return memoryStore.users
  },
  saveUsers(data) {
    memoryStore.users = data
    return true
  },
}
