import fs from 'fs'
import path from 'path'
import mysql from 'mysql2/promise'
import 'dotenv/config'

const _dirname = typeof __dirname !== 'undefined' ? __dirname : process.cwd()
const DATA_DIR = process.env.VERCEL ? path.join('/tmp', 'rs_data') : path.resolve(_dirname, 'data')

let initialProducts = []
let initialRateList = []
try {
  const pPath = path.resolve(DATA_DIR, 'products.json')
  if (fs.existsSync(pPath)) initialProducts = JSON.parse(fs.readFileSync(pPath, 'utf-8'))
} catch (e) {
  console.warn('[Initial Products Load Notice]', e.message)
}
try {
  const rPath = path.resolve(DATA_DIR, 'rateList.json')
  if (fs.existsSync(rPath)) initialRateList = JSON.parse(fs.readFileSync(rPath, 'utf-8'))
} catch (e) {
  console.warn('[Initial RateList Load Notice]', e.message)
}

try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
} catch {}

function getFilePath(collection) {
  return path.join(DATA_DIR, `${collection}.json`)
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
]

const DEFAULT_ENQUIRIES = [
  {
    id: 'ENQ-2041',
    date: new Date(Date.now() - 3600 * 1000 * 18).toISOString(),
    name: 'Coach Rajeev Sharma',
    phone: '9835012345',
    email: 'coach.rajeev@saranacademy.org',
    city: 'Chapra',
    category: 'Cricket',
    qty: 22,
    notes: 'Need 22 full kits with trousers and embroidered caps before tournament.',
    status: 'Quote Sent',
  },
]

// In-memory cache
import dotenv from 'dotenv'
dotenv.config({ path: path.resolve(_dirname, '.env') })

// In-memory cache
const memoryStore = {
  products: initialProducts,
  rateList: initialRateList,
  coupons: DEFAULT_COUPONS,
  settings: DEFAULT_SETTINGS,
  orders: DEFAULT_ORDERS,
  enquiries: DEFAULT_ENQUIRIES,
  users: [],
}

/* ───────────────────────── MySQL Database Connection ───────────────────────── */
const DB_HOST = process.env.DB_HOST || 'localhost'
const DB_USER = process.env.DB_USER || 'uniotechitsol_rishikardb'
const DB_PASSWORD = process.env.DB_PASSWORD || 'Rishikar@001001'
const DB_NAME = process.env.DB_NAME || 'uniotechitsol_rishikar'
const DB_PORT = Number(process.env.DB_PORT) || 3306

let pool = null
let isConnected = false
let connectionError = null

async function initMySQL() {
  if (!DB_USER || !DB_NAME || DB_USER.includes('<username>') || DB_NAME.includes('<dbname>')) {
    connectionError = 'Database user or name is unset or placeholder in .env'
    console.log('[MySQL Notice]', connectionError)
    return
  }

  try {
    pool = mysql.createPool({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      port: DB_PORT,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    })

    // Test connection
    const conn = await pool.getConnection()
    conn.release()
    isConnected = true
    connectionError = null
    console.log(`[MySQL] ✅ Successfully connected to MySQL database: ${DB_NAME} at ${DB_HOST}`)

    // Auto-create required tables if not exist
    await ensureTables()

    // Sync / seed data from MySQL
    await syncFromMySQL()
  } catch (err) {
    connectionError = `${err.code || 'ERROR'}: ${err.message}`
    console.warn(`[MySQL] ⚠️ Connection notice (${connectionError}). Fallback to local storage store.`)
    isConnected = false
  }
}


async function ensureTables() {
  if (!pool) return
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rs_products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        slug VARCHAR(255) UNIQUE,
        name VARCHAR(255),
        category VARCHAR(100),
        price DECIMAL(10,2),
        data LONGTEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS rs_orders (
        id VARCHAR(100) PRIMARY KEY,
        order_number VARCHAR(50),
        customer_name VARCHAR(255),
        customer_phone VARCHAR(50),
        total DECIMAL(10,2),
        status VARCHAR(50),
        data LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS rs_enquiries (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255),
        phone VARCHAR(50),
        status VARCHAR(50),
        data LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS rs_coupons (
        code VARCHAR(50) PRIMARY KEY,
        discount DECIMAL(10,2),
        type VARCHAR(20),
        data LONGTEXT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS rs_settings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value LONGTEXT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS rs_users (
        id VARCHAR(100) PRIMARY KEY,
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(50),
        password VARCHAR(255),
        data LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS rs_rate_list (
        id INT AUTO_INCREMENT PRIMARY KEY,
        data LONGTEXT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)
  } catch (err) {
    console.warn('[MySQL] Table check notice:', err.message)
  }
}

async function syncFromMySQL() {
  if (!pool || !isConnected) return
  try {
    // 1. Products
    const [pRows] = await pool.query('SELECT data FROM rs_products ORDER BY id ASC')
    if (pRows.length > 0) {
      memoryStore.products = pRows.map((r) => JSON.parse(r.data))
    } else {
      // Seed default products
      for (const p of initialProducts) {
        const cat = p.category || (Array.isArray(p.categories) ? p.categories[0] : '') || ''
        await pool.query(
          'INSERT INTO rs_products (id, slug, name, category, price, data) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), category = VALUES(category), price = VALUES(price), data = VALUES(data)',
          [Number(p.id) || null, p.slug, p.name || '', cat, Number(p.price) || 0, JSON.stringify(p)]
        )
      }
    }

    // 2. Orders
    const [oRows] = await pool.query('SELECT data FROM rs_orders ORDER BY created_at DESC')
    if (oRows.length > 0) {
      memoryStore.orders = oRows.map((r) => JSON.parse(r.data))
    } else {
      for (const o of DEFAULT_ORDERS) {
        await pool.query(
          'INSERT INTO rs_orders (id, order_number, customer_name, customer_phone, total, status, data) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [o.id, o.orderNumber || '', o.customer?.name || '', o.customer?.phone || '', Number(o.total) || 0, o.status || 'Pending', JSON.stringify(o)]
        )
      }
    }

    // 3. Enquiries
    const [eRows] = await pool.query('SELECT data FROM rs_enquiries ORDER BY created_at DESC')
    if (eRows.length > 0) {
      memoryStore.enquiries = eRows.map((r) => JSON.parse(r.data))
    } else {
      for (const e of DEFAULT_ENQUIRIES) {
        await pool.query(
          'INSERT INTO rs_enquiries (id, name, phone, status, data) VALUES (?, ?, ?, ?, ?)',
          [e.id, e.name || '', e.phone || '', e.status || 'New', JSON.stringify(e)]
        )
      }
    }

    // 4. Coupons
    const [cRows] = await pool.query('SELECT data FROM rs_coupons')
    if (cRows.length > 0) {
      memoryStore.coupons = cRows.map((r) => JSON.parse(r.data))
    } else {
      for (const c of DEFAULT_COUPONS) {
        await pool.query(
          'INSERT INTO rs_coupons (code, discount, type, data) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data)',
          [c.code, Number(c.discount) || 0, c.type || 'percent', JSON.stringify(c)]
        )
      }
    }

    // 5. Settings
    const [sRows] = await pool.query('SELECT setting_value FROM rs_settings WHERE setting_key = ?', ['main'])
    if (sRows.length > 0 && sRows[0].setting_value) {
      memoryStore.settings = JSON.parse(sRows[0].setting_value)
    } else {
      await pool.query('INSERT INTO rs_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)', [
        'main',
        JSON.stringify(DEFAULT_SETTINGS),
      ])
    }

    // 6. Users
    const [uRows] = await pool.query('SELECT data FROM rs_users')
    if (uRows.length > 0) {
      memoryStore.users = uRows.map((r) => JSON.parse(r.data))
    }

    // 7. Rate list
    const [rlRows] = await pool.query('SELECT data FROM rs_rate_list LIMIT 1')
    if (rlRows.length > 0 && rlRows[0].data) {
      memoryStore.rateList = JSON.parse(rlRows[0].data)
    } else {
      await pool.query('INSERT INTO rs_rate_list (data) VALUES (?)', [JSON.stringify(initialRateList)])
    }
  } catch (err) {
    console.warn('[MySQL] Sync notice:', err.message)
  }
}

// Background MySQL persistence
async function persistProductsToMySQL(products) {
  if (!pool || !isConnected) return
  try {
    await pool.query('DELETE FROM rs_products')
    for (const p of products) {
      const cat = p.category || (Array.isArray(p.categories) ? p.categories[0] : '') || ''
      const prodId = p.id ? Number(p.id) : null
      if (prodId) {
        await pool.query(
          `INSERT INTO rs_products (id, slug, name, category, price, data) 
           VALUES (?, ?, ?, ?, ?, ?) 
           ON DUPLICATE KEY UPDATE 
             slug = VALUES(slug), 
             name = VALUES(name), 
             category = VALUES(category), 
             price = VALUES(price), 
             data = VALUES(data)`,
          [prodId, p.slug, p.name || '', cat, Number(p.price) || 0, JSON.stringify(p)]
        )
      } else {
        await pool.query(
          `INSERT INTO rs_products (slug, name, category, price, data) 
           VALUES (?, ?, ?, ?, ?) 
           ON DUPLICATE KEY UPDATE 
             name = VALUES(name), 
             category = VALUES(category), 
             price = VALUES(price), 
             data = VALUES(data)`,
          [p.slug, p.name || '', cat, Number(p.price) || 0, JSON.stringify(p)]
        )
      }
    }
  } catch (err) {
    console.warn('[MySQL] Persist products error:', err.message)
  }
}

async function persistSingleProduct(p) {
  if (!pool || !isConnected) return
  try {
    const cat = p.category || (Array.isArray(p.categories) ? p.categories[0] : '') || ''
    const prodId = p.id ? Number(p.id) : null
    if (prodId) {
      await pool.query(
        `INSERT INTO rs_products (id, slug, name, category, price, data) 
         VALUES (?, ?, ?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE 
           slug = VALUES(slug), 
           name = VALUES(name), 
           category = VALUES(category), 
           price = VALUES(price), 
           data = VALUES(data)`,
        [prodId, p.slug, p.name || '', cat, Number(p.price) || 0, JSON.stringify(p)]
      )
    } else {
      await pool.query(
        `INSERT INTO rs_products (slug, name, category, price, data) 
         VALUES (?, ?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE 
           name = VALUES(name), 
           category = VALUES(category), 
           price = VALUES(price), 
           data = VALUES(data)`,
        [p.slug, p.name || '', cat, Number(p.price) || 0, JSON.stringify(p)]
      )
    }
  } catch (err) {
    console.warn('[MySQL] Persist single product error:', err.message)
  }
}

async function removeProductFromMySQL(slug) {
  if (!pool || !isConnected) return
  try {
    await pool.query('DELETE FROM rs_products WHERE slug = ?', [slug])
  } catch (err) {
    console.warn('[MySQL] Delete product from MySQL error:', err.message)
  }
}

async function persistOrdersToMySQL(orders) {
  if (!pool || !isConnected) return
  try {
    await pool.query('DELETE FROM rs_orders')
    for (const o of orders) {
      await pool.query(
        'INSERT INTO rs_orders (id, order_number, customer_name, customer_phone, total, status, data) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [o.id, o.orderNumber || '', o.customer?.name || '', o.customer?.phone || '', Number(o.total) || 0, o.status || 'Pending', JSON.stringify(o)]
      )
    }
  } catch (err) {
    console.warn('[MySQL] Persist orders error:', err.message)
  }
}

async function persistSingleOrder(o) {
  if (!pool || !isConnected) return
  try {
    await pool.query(
      'INSERT INTO rs_orders (id, order_number, customer_name, customer_phone, total, status, data) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE order_number = VALUES(order_number), customer_name = VALUES(customer_name), customer_phone = VALUES(customer_phone), total = VALUES(total), status = VALUES(status), data = VALUES(data)',
      [o.id, o.orderNumber || '', o.customer?.name || '', o.customer?.phone || '', Number(o.total) || 0, o.status || 'Pending', JSON.stringify(o)]
    )
  } catch (err) {
    console.warn('[MySQL] Persist single order error:', err.message)
  }
}

async function persistEnquiriesToMySQL(enquiries) {
  if (!pool || !isConnected) return
  try {
    await pool.query('DELETE FROM rs_enquiries')
    for (const e of enquiries) {
      await pool.query(
        'INSERT INTO rs_enquiries (id, name, phone, status, data) VALUES (?, ?, ?, ?, ?)',
        [e.id, e.name || '', e.phone || '', e.status || 'New', JSON.stringify(e)]
      )
    }
  } catch (err) {
    console.warn('[MySQL] Persist enquiries error:', err.message)
  }
}

async function persistCouponsToMySQL(coupons) {
  if (!pool || !isConnected) return
  try {
    await pool.query('DELETE FROM rs_coupons')
    for (const c of coupons) {
      await pool.query(
        'INSERT INTO rs_coupons (code, discount, type, data) VALUES (?, ?, ?, ?)',
        [c.code, Number(c.discount) || 0, c.type || 'percent', JSON.stringify(c)]
      )
    }
  } catch (err) {
    console.warn('[MySQL] Persist coupons error:', err.message)
  }
}

async function persistSettingsToMySQL(settings) {
  if (!pool || !isConnected) return
  try {
    await pool.query('INSERT INTO rs_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)', [
      'main',
      JSON.stringify(settings),
    ])
  } catch (err) {
    console.warn('[MySQL] Persist settings error:', err.message)
  }
}

async function persistUsersToMySQL(users) {
  if (!pool || !isConnected) return
  try {
    await pool.query('DELETE FROM rs_users')
    for (const u of users) {
      await pool.query(
        'INSERT INTO rs_users (id, email, phone, password, data) VALUES (?, ?, ?, ?, ?)',
        [u.id, u.email || '', u.phone || '', u.password || '', JSON.stringify(u)]
      )
    }
  } catch (err) {
    console.warn('[MySQL] Persist users error:', err.message)
  }
}

// Start MySQL connection in background
initMySQL()

export const db = {
  getProducts() {
    return memoryStore.products || readJsonFile(getFilePath('products'), initialProducts)
  },
  saveProducts(data) {
    memoryStore.products = data
    writeJsonFile(getFilePath('products'), data)
    persistProductsToMySQL(data)
    return true
  },
  upsertProduct(product) {
    if (!memoryStore.products) memoryStore.products = db.getProducts()
    const idx = memoryStore.products.findIndex((p) => p.slug === product.slug)
    if (idx >= 0) {
      memoryStore.products[idx] = { ...memoryStore.products[idx], ...product }
    } else {
      memoryStore.products.unshift(product)
    }
    writeJsonFile(getFilePath('products'), memoryStore.products)
    persistSingleProduct(product)
    return product
  },
  deleteProduct(slug) {
    if (!memoryStore.products) memoryStore.products = db.getProducts()
    memoryStore.products = memoryStore.products.filter((p) => p.slug !== slug)
    writeJsonFile(getFilePath('products'), memoryStore.products)
    removeProductFromMySQL(slug)
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
    persistOrdersToMySQL(data)
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
    persistEnquiriesToMySQL(data)
    return true
  },

  getCoupons() {
    return memoryStore.coupons || readJsonFile(getFilePath('coupons'), DEFAULT_COUPONS)
  },
  saveCoupons(data) {
    memoryStore.coupons = data
    writeJsonFile(getFilePath('coupons'), data)
    persistCouponsToMySQL(data)
    return true
  },

  getSettings() {
    return memoryStore.settings || readJsonFile(getFilePath('settings'), DEFAULT_SETTINGS)
  },
  saveSettings(data) {
    memoryStore.settings = data
    writeJsonFile(getFilePath('settings'), data)
    persistSettingsToMySQL(data)
    return true
  },

  getRateList() {
    return memoryStore.rateList || initialRateList
  },

  getUsers() {
    const list = readJsonFile(getFilePath('users'), null)
    if (list) memoryStore.users = list
    return memoryStore.users || []
  },
  saveUsers(data) {
    memoryStore.users = data
    writeJsonFile(getFilePath('users'), data)
    persistUsersToMySQL(data)
    return true
  },

  isMySQLConnected() {
    return isConnected
  },
  async getStatus() {
    let tableCounts = {}
    if (pool && isConnected) {
      try {
        const [p] = await pool.query('SELECT COUNT(*) as count FROM rs_products')
        const [o] = await pool.query('SELECT COUNT(*) as count FROM rs_orders')
        tableCounts = {
          products_table_count: p[0].count,
          orders_table_count: o[0].count,
        }
      } catch (e) {
        tableCounts = { count_error: e.message }
      }
    }
    return {
      type: 'MySQL',
      connected: isConnected,
      database: DB_NAME,
      user: DB_USER,
      host: DB_HOST,
      ...tableCounts,
      error: connectionError,
    }
  },
  getDbStatus() {
    return {
      type: 'MySQL',
      connected: isConnected,
      database: DB_NAME,
      user: DB_USER,
      host: DB_HOST,
      port: DB_PORT,
      error: connectionError,
    }
  },
  // Backward compatibility alias for /api/health
  getMongoStatus() {
    return {
      type: 'MySQL',
      connected: isConnected,
      database: DB_NAME,
      user: DB_USER,
      host: DB_HOST,
      error: connectionError,
    }
  },
}
