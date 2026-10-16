import { useEffect, useMemo, useState, useRef } from 'react'
import { Link, NavLink, useParams, useNavigate } from 'react-router-dom'
import * as XLSX from 'xlsx'
import * as db from '../lib/db'
import { api } from '../lib/api'
import { useStore } from '../context/StoreContext'
import { formatPrice, cx } from '../lib/utils'
import { Modal } from '../components/Shared'
import {
  Grid, Package, User, Mail, Lock, LogOut, Plus, Trash, Search, X, ArrowRight,
  Scissors, Truck, Check, Shield, Download, Upload,
} from '../components/Icons'

const STAGES = ['Placed', 'Packed', 'Shipped', 'Out for delivery', 'Delivered', 'Cancelled']
const ENQ_STATUS = ['New', 'Contacted', 'Quoted', 'Won', 'Closed']
const PAY = { upi: 'UPI', card: 'Card', cod: 'COD' }
const CATS = [
  { slug: 'jerseys', name: 'Jerseys' },
  { slug: 'tshirts', name: 'T-Shirts & Polos' },
  { slug: 'teamwear', name: 'Teamwear' },
  { slug: 'accessories', name: 'Accessories' },
]
const fmtDate = (t) => new Date(t).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })
const fmtTime = (t) => new Date(t).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })

// re-render whenever the local db changes
function useDb() {
  const [, bump] = useState(0)
  useEffect(() => db.subscribe(() => bump((n) => n + 1)), [])
}

export default function Admin() {
  const { tab = 'dashboard' } = useParams()
  const [authed, setAuthed] = useState(db.isAdmin())
  useDb()
  useEffect(() => { document.title = 'Admin – Rishikar Sports'; return () => { document.title = 'Rishikar Sports – Quality You Trust, Performance You Deserve' } }, [])
  if (!authed) return <AdminLogin onDone={() => setAuthed(true)} />
  return (
    <div className="admin">
      <AdminNav />
      <div className="admin__main">
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'orders' && <Orders />}
        {tab === 'products' && <Products />}
        {tab === 'enquiries' && <Enquiries />}
        {tab === 'customers' && <Customers />}
        {tab === 'settings' && <Settings onSignOut={() => setAuthed(false)} />}
      </div>
    </div>
  )
}

function AdminLogin({ onDone }) {
  const [pin, setPin] = useState('')
  const [err, setErr] = useState('')
  const submit = (e) => {
    e.preventDefault()
    if (db.signInAdmin(pin)) return onDone()
    setErr('Wrong PIN. Default is 1234.')
  }
  return (
    <div className="admin-login">
      <form onSubmit={submit}>
        <span className="logo__mark" style={{ width: 56, height: 56, margin: '0 auto 14px' }}><img src="/logo.png" alt="" /></span>
        <h1>Admin panel</h1>
        <p className="muted">Rishikar Sports · enter your PIN to continue</p>
        {err && <div className="alert alert--error" style={{ marginTop: 14 }}>{err}</div>}
        <div className="field" style={{ marginTop: 16 }}>
          <label>PIN</label>
          <input className="input" type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value)} autoFocus />
        </div>
        <button className="btn btn--primary btn--lg btn--block" style={{ marginTop: 14 }}><Lock width={16} height={16} /> Log in</button>
        <p className="small muted" style={{ marginTop: 14, textAlign: 'center' }}>Demo PIN: <b>1234</b> — change it in Settings.</p>
        <Link to="/" className="btn btn--link" style={{ display: 'block', textAlign: 'center', marginTop: 12 }}>← Back to store</Link>
      </form>
    </div>
  )
}

function AdminNav() {
  const s = db.stats()
  const links = [
    ['', 'Dashboard', Grid],
    ['orders', 'Orders', Package, s.orders],
    ['products', 'Products', Scissors, s.products],
    ['enquiries', 'Enquiries', Mail, s.newEnquiries],
    ['customers', 'Customers', User, s.customers],
    ['settings', 'Settings', Shield],
  ]
  return (
    <aside className="admin__nav">
      <Link to="/admin" className="logo" style={{ marginBottom: 22 }}>
        <span className="logo__mark"><img src="/logo.png" alt="" /></span>
        <span className="logo__text"><b>RISHIKAR</b><span>ADMIN</span></span>
      </Link>
      {links.map(([slug, label, Icon, badge]) => (
        <NavLink key={label} to={`/admin${slug ? '/' + slug : ''}`} end={!slug}>
          <Icon /> {label}
          {badge > 0 && <em>{badge}</em>}
        </NavLink>
      ))}
      <div className="admin__nav-foot">
        <a href="/" target="_blank" rel="noreferrer"><ArrowRight /> View store</a>
      </div>
    </aside>
  )
}

function Stat({ label, value, sub, tone }) {
  return (
    <div className={cx('astat', tone && `astat--${tone}`)}>
      <span>{label}</span>
      <b>{value}</b>
      {sub && <small>{sub}</small>}
    </div>
  )
}

function Dashboard() {
  const s = db.stats()
  const orders = db.getOrders()
  const max = Math.max(1, ...s.days.map((d) => d.value))
  return (
    <>
      <header className="admin__head">
        <div><h1>Dashboard</h1><p className="muted">Everything happening in your store right now.</p></div>
        <Link to="/admin/products" className="btn btn--primary btn--sm"><Plus width={15} height={15} /> Add product</Link>
      </header>

      <div className="astats">
        <Stat label="Revenue" value={formatPrice(s.revenue)} sub={`${s.items} items sold`} tone="orange" />
        <Stat label="Orders" value={s.orders} sub={`${s.pending} pending`} />
        <Stat label="Average order" value={formatPrice(s.aov)} sub="per order" />
        <Stat label="Enquiries" value={s.enquiries} sub={`${s.newEnquiries} new`} tone={s.newEnquiries ? 'alert' : undefined} />
        <Stat label="Products" value={s.products} sub={`${s.lowStock.length} low stock`} />
        <Stat label="Customers" value={s.customers} sub="registered" />
      </div>

      <div className="admin__grid">
        <section className="acard">
          <h3>Revenue · last 14 days</h3>
          {s.revenue === 0 ? (
            <p className="muted small" style={{ padding: '30px 0', textAlign: 'center' }}>No orders yet. Place a test order on the store to see it here.</p>
          ) : (
            <div className="achart">
              {s.days.map((d) => (
                <div className="achart__col" key={d.label} title={`${d.label}: ${formatPrice(d.value)}`}>
                  <i style={{ height: Math.max(3, Math.round((d.value / max) * 100)) + '%' }} />
                  <span>{d.short}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="acard">
          <h3>Top products</h3>
          {s.top.length === 0 ? <p className="muted small">No sales yet.</p> : (
            <ul className="alist">
              {s.top.map(({ product, qty }) => (
                <li key={product.slug}>
                  <img src={product.image} alt="" />
                  <div><b>{product.name}</b><span>{formatPrice(product.price)}</span></div>
                  <em>{qty} sold</em>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="acard">
        <h3>Recent orders <Link to="/admin/orders" className="btn btn--link small">View all</Link></h3>
        {orders.length === 0 ? <p className="muted small">No orders yet.</p> : (
          <div className="atable-wrap">
            <table className="atable">
              <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th></tr></thead>
              <tbody>
                {orders.slice(0, 6).map((o) => (
                  <tr key={o.id}>
                    <td><b>#{o.id}</b><br /><span className="muted small">{fmtDate(o.placedAt)}</span></td>
                    <td>{o.address.name}<br /><span className="muted small">{o.address.city}</span></td>
                    <td>{o.items.reduce((a, l) => a + l.qty, 0)}</td>
                    <td><b>{formatPrice(o.total)}</b></td>
                    <td>{PAY[o.payment]}</td>
                    <td><StatusPill status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {s.lowStock.length > 0 && (
        <section className="acard">
          <h3>Low stock ({s.lowStock.length})</h3>
          <ul className="alist">
            {s.lowStock.slice(0, 6).map((p) => (
              <li key={p.slug}>
                <img src={p.image} alt="" />
                <div><b>{p.name}</b><span>{p.categories[0]}</span></div>
                <em className={p.stock <= 20 ? 'danger' : ''}>{p.stock} left</em>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}

const StatusPill = ({ status = 'Placed' }) => {
  const tone = status === 'Delivered' ? 'ok' : status === 'Cancelled' ? 'bad' : status === 'Placed' ? 'new' : 'warn'
  return <span className={cx('apill', `apill--${tone}`)}>{status}</span>
}

function Orders() {
  useDb()
  const { toast } = useStore()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('All')
  const [open, setOpen] = useState(null)
  const orders = db.getOrders()
  const list = orders.filter((o) => {
    const okStatus = filter === 'All' || (o.status || 'Placed') === filter
    const hay = (o.id + o.address.name + o.address.city + o.email + o.items.map((l) => l.name).join(' ')).toLowerCase()
    return okStatus && (!q || hay.includes(q.toLowerCase()))
  })
  return (
    <>
      <header className="admin__head">
        <div><h1>Orders</h1><p className="muted">{orders.length} total · {orders.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled').length} still to fulfil</p></div>
      </header>

      <div className="atools">
        <div className="asearch"><Search /><input placeholder="Search order, customer, city…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <div className="tabs">
          {['All', ...STAGES].map((s) => <button key={s} className={cx('tab', filter === s && 'active')} onClick={() => setFilter(s)}>{s}</button>)}
        </div>
      </div>

      {list.length === 0 ? (
        <div className="acard"><p className="muted small" style={{ padding: '24px 0', textAlign: 'center' }}>No orders match this filter.</p></div>
      ) : (
        <div className="acard" style={{ padding: 0 }}>
          <div className="atable-wrap">
            <table className="atable">
              <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {list.map((o) => (
                  <tr key={o.id}>
                    <td><b>#{o.id}</b><br /><span className="muted small">{fmtDate(o.placedAt)}</span></td>
                    <td>{o.address.name}<br /><span className="muted small">{o.address.phone} · {o.address.city}</span></td>
                    <td>{o.items.reduce((a, l) => a + l.qty, 0)}</td>
                    <td><b>{formatPrice(o.total)}</b></td>
                    <td>{PAY[o.payment]}</td>
                    <td>
                      <select className="select select--sm" value={o.status || 'Placed'} onChange={(e) => { db.setOrderStatus(o.id, e.target.value); toast(`Order #${o.id} → ${e.target.value}`) }}>
                        {STAGES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <button className="btn btn--sm btn--ghost" onClick={() => setOpen(o)}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {open && (
        <Modal title={`Order #${open.id}`} onClose={() => setOpen(null)}>
          <div className="aorder">
            <div className="aorder__meta">
              <div><b>Placed</b>{fmtTime(open.placedAt)}</div>
              <div><b>Payment</b>{PAY[open.payment]}{open.coupon ? ` · ${open.coupon}` : ''}</div>
              <div><b>Status</b><StatusPill status={open.status} /></div>
            </div>
            <div className="mini-lines" style={{ maxHeight: 'none' }}>
              {open.items.map((l) => (
                <div className="mini-line" key={l.key}>
                  <img src={l.image} alt="" />
                  <div><b>{l.name}</b><span>{[l.color, l.size].filter(Boolean).join(' · ')} · Qty {l.qty}</span></div>
                  <b>{formatPrice(l.price * l.qty)}</b>
                </div>
              ))}
            </div>
            <div className="summary-row"><span>Subtotal</span><span>{formatPrice(open.subtotal)}</span></div>
            {open.discount > 0 && <div className="summary-row"><span>Discount</span><span className="green">−{formatPrice(open.discount)}</span></div>}
            <div className="summary-row"><span>Shipping</span><span>{open.shipping ? formatPrice(open.shipping) : 'Free'}</span></div>
            {open.codFee > 0 && <div className="summary-row"><span>COD fee</span><span>{formatPrice(open.codFee)}</span></div>}
            <div className="summary-row total"><span>Total</span><span>{formatPrice(open.total)}</span></div>
            <div className="acard" style={{ marginTop: 16 }}>
              <h3>Deliver to</h3>
              <p className="small">{open.address.name}<br />{open.address.line1}{open.address.line2 ? `, ${open.address.line2}` : ''}<br />{open.address.city}, {open.address.state} – {open.address.pincode}<br />{open.address.phone} · {open.email}</p>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
              <a className="btn btn--accent btn--sm" href={`tel:${open.address.phone}`}>Call customer</a>
              <a className="btn btn--outline btn--sm" href={`https://wa.me/91${open.address.phone}?text=${encodeURIComponent(`Hi ${open.address.name}, your Rishikar Sports order #${open.id} is on the way.`)}`} target="_blank" rel="noreferrer">WhatsApp update</a>
              <button className="btn btn--sm btn--ghost" style={{ marginLeft: 'auto', color: 'var(--sale)' }} onClick={() => { if (confirm('Delete this order permanently?')) { db.deleteOrder(open.id); setOpen(null) } }}><Trash width={14} height={14} /> Delete</button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

const blankProduct = {
  name: '', slug: '', price: 0, mrp: null, image: '/products/jersey.png', stock: 100,
  categories: ['jerseys'], subs: ['football-jerseys'], description: '', fabric: '', features: [],
  colors: [{ name: 'Navy', hex: '#0e2140' }], sizes: ['S', 'M', 'L', 'XL'], rating: 4.5, reviews: 0, isNew: true,
}
const SUBS = {
  jerseys: ['sublimation-jerseys', 'football-jerseys', 'cricket-jerseys'],
  tshirts: ['polo-tshirts', 'round-neck-tees', 'sleeveless-tees'],
  teamwear: ['tracksuits', 'track-jackets', 'hoodies', 'lowers', 'shorts'],
  accessories: ['kit-bags', 'caps', 'bottles'],
}
const IMAGES = ['jersey', 'polo', 'jacket', 'hoodie', 'pants', 'shorts', 'bag', 'cap', 'bottle'].map((n) => `/products/${n}.png`)

function Products() {
  useDb()
  const { toast } = useStore()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('All')
  const [edit, setEdit] = useState(null)
  const [syncing, setSyncing] = useState(false)
  const [excelPreview, setExcelPreview] = useState(null)
  const [importing, setImporting] = useState(false)
  const excelFileRef = useRef(null)
  const products = db.getProducts()

  // Smart Sync: If local has items not in MySQL, push all to database
  useEffect(() => {
    api.getProducts().then((res) => {
      if (res && res.data && Array.isArray(res.data)) {
        const local = db.getProducts()
        const remoteSlugs = new Set(res.data.map((p) => p.slug))
        const localOnly = local.filter((p) => !remoteSlugs.has(p.slug))

        if (localOnly.length > 0) {
          console.log(`[Admin] Pushing ${local.length} products to MySQL database...`)
          api.syncProducts(local).then(() => {
            toast(`Auto-synced ${local.length} products to MySQL database!`)
          }).catch(() => {})
        } else if (res.data.length > 0) {
          db.saveProducts(res.data)
        }
      }
    }).catch(() => {})
  }, [])

  const handleManualSync = async () => {
    try {
      setSyncing(true)
      const current = db.getProducts()
      await api.syncProducts(current)
      toast(`✅ All ${current.length} products successfully saved to cPanel MySQL!`)
    } catch (err) {
      toast(`❌ Sync error: ${err.message}`)
    } finally {
      setSyncing(false)
    }
  }

  // 1. Download Excel Template
  const downloadProductTemplate = () => {
    const headers = [
      'Name*', 'Category*', 'Subcategory', 'Price*', 'MRP', 'Stock', 'Sizes', 'Colors', 'Fabric', 'Description', 'ImageURL'
    ]
    const sampleRows = [
      [
        'RS Pro Cricket Jersey',
        'jerseys',
        'cricket-jerseys',
        350,
        599,
        100,
        'S, M, L, XL, 2XL',
        'Navy Blue, White',
        'Dotknit',
        'Professional match jersey with moisture wicking fabric and sublimation print',
        '/products/rs/rs-prod-01.jpg'
      ],
      [
        'RS Athletic Polo T-Shirt',
        'tshirts',
        'polo-tshirts',
        399,
        699,
        80,
        'M, L, XL',
        'Black, Royal Blue',
        'Honeycomb Cotton',
        'Breathable pique polo t-shirt for daily workouts and coaching',
        '/products/rs/rs-prod-02.jpg'
      ],
      [
        'RS Elite Tracksuit (Top + Lower)',
        'teamwear',
        'tracksuits',
        950,
        1499,
        50,
        'S, M, L, XL',
        'Navy Blue, Red',
        'Micro Peach Poly',
        'Complete tournament tracksuit with zip pockets and breathable mesh lining',
        '/products/rs/rs-prod-04.jpg'
      ],
      [
        'RS Official Sports Cap',
        'accessories',
        'caps',
        250,
        450,
        120,
        'Free Size',
        'Navy Blue, Black',
        'Cotton Twill',
        '3D embroidered logo cap with adjustable rear metal buckle',
        '/products/rs/rs-prod-03.jpg'
      ]
    ]

    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows])
    ws['!cols'] = [
      { wch: 32 }, // Name
      { wch: 14 }, // Category
      { wch: 18 }, // Subcategory
      { wch: 10 }, // Price
      { wch: 10 }, // MRP
      { wch: 10 }, // Stock
      { wch: 20 }, // Sizes
      { wch: 22 }, // Colors
      { wch: 20 }, // Fabric
      { wch: 45 }, // Description
      { wch: 30 }, // ImageURL
    ]

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Products')
    XLSX.writeFile(wb, 'rishikar_products_template.xlsx')
    toast('📥 Sample Excel template downloaded!')
  }

  // 1b. Export All Live Products to Excel
  const exportProductsToExcel = () => {
    const prods = db.getProducts()
    if (!prods || prods.length === 0) {
      toast('⚠️ No products available to export!')
      return
    }

    const headers = [
      'Name',
      'Category',
      'Subcategory',
      'Price',
      'MRP',
      'Stock',
      'Sizes',
      'Colors',
      'Fabric',
      'Description',
      'ImageURL'
    ]

    const rows = prods.map((p) => [
      p.name || '',
      p.categories?.[0] || 'jerseys',
      p.subs?.[0] || '',
      p.price ?? 0,
      p.mrp || Math.round((p.price || 0) * 1.5),
      p.stock ?? 100,
      (p.sizes || []).join(', '),
      (p.colors || []).map((c) => (typeof c === 'object' ? c.name : c)).filter(Boolean).join(', '),
      (p.fabrics || []).map((f) => (typeof f === 'object' ? f.name : f)).filter(Boolean).join(', '),
      p.description || '',
      p.image || ''
    ])

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
    ws['!cols'] = [
      { wch: 34 }, // Name
      { wch: 15 }, // Category
      { wch: 20 }, // Subcategory
      { wch: 10 }, // Price
      { wch: 10 }, // MRP
      { wch: 10 }, // Stock
      { wch: 22 }, // Sizes
      { wch: 25 }, // Colors
      { wch: 25 }, // Fabric
      { wch: 55 }, // Description
      { wch: 35 }, // ImageURL
    ]

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Products')
    const today = new Date().toISOString().slice(0, 10)
    XLSX.writeFile(wb, `rishikar_products_export_${today}.xlsx`)
    toast(`📥 Exported ${prods.length} products to Excel!`)
  }

  // 2. Parse Uploaded Excel File
  const handleExcelUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result)
        const wb = XLSX.read(data, { type: 'array' })
        const sheetName = wb.SheetNames[0]
        const ws = wb.Sheets[sheetName]
        const rawRows = XLSX.utils.sheet_to_json(ws, { defval: '' })

        if (!rawRows || rawRows.length === 0) {
          toast('⚠️ Selected Excel sheet is empty!')
          return
        }

        const existingProducts = db.getProducts()
        const existingMap = new Map(existingProducts.map((p) => [p.slug.toLowerCase(), p]))
        const existingNameMap = new Map(existingProducts.map((p) => [p.name.toLowerCase().trim(), p]))

        const parsedList = []
        let newCount = 0
        let updateCount = 0
        let skippedCount = 0

        rawRows.forEach((r) => {
          const row = {}
          for (const [k, v] of Object.entries(r)) {
            row[k.toLowerCase().replace(/[^a-z0-9]/g, '')] = v
          }

          const name = String(row.name || row.productname || row.product || row.title || '').trim()
          const price = Number(row.price || row.rate || row.sellingprice || 0)

          if (!name || isNaN(price) || price <= 0) {
            skippedCount++
            return
          }

          const rawMrp = Number(row.mrp || row.originalprice || row.marketprice || 0)
          const mrp = (!isNaN(rawMrp) && rawMrp > price) ? rawMrp : Math.round(price * 1.5)

          const rawStock = Number(row.stock || row.quantity || row.qty || 100)
          const stock = !isNaN(rawStock) && rawStock >= 0 ? rawStock : 100

          let category = String(row.category || row.cat || 'jerseys').toLowerCase().trim()
          if (category.includes('tshirt') || category.includes('polo')) category = 'tshirts'
          else if (category.includes('team') || category.includes('track') || category.includes('lower') || category.includes('short')) category = 'teamwear'
          else if (category.includes('cap') || category.includes('bag') || category.includes('access')) category = 'accessories'
          else if (!['jerseys', 'tshirts', 'teamwear', 'accessories'].includes(category)) category = 'jerseys'

          let sub = String(row.subcategory || row.sub || '').toLowerCase().trim()
          if (!sub) {
            if (category === 'jerseys') sub = 'cricket-jerseys'
            else if (category === 'tshirts') sub = 'polo-tshirts'
            else if (category === 'teamwear') sub = 'tracksuits'
            else sub = 'caps'
          }

          let sizes = ['S', 'M', 'L', 'XL']
          const rawSizes = row.sizes || row.size
          if (rawSizes) {
            const split = String(rawSizes).split(/[,/|]+/).map((s) => s.trim().toUpperCase()).filter(Boolean)
            if (split.length > 0) sizes = split
          }

          let colors = [{ name: 'Navy Blue', hex: '#0e2140' }]
          const rawColors = row.colors || row.color
          if (rawColors) {
            const split = String(rawColors).split(/[,/|]+/).map((c) => c.trim()).filter(Boolean)
            if (split.length > 0) {
              colors = split.map((c) => ({
                name: c,
                hex: c.toLowerCase().includes('black') ? '#111827' :
                     c.toLowerCase().includes('white') ? '#ffffff' :
                     c.toLowerCase().includes('red') ? '#dc2626' :
                     c.toLowerCase().includes('royal') ? '#1e40af' :
                     c.toLowerCase().includes('green') ? '#16a34a' :
                     c.toLowerCase().includes('yellow') ? '#eab308' : '#0e2140'
              }))
            }
          }

          const fabric = String(row.fabric || row.material || 'Dotknit / Standard Poly').trim()
          const description = String(row.description || row.desc || `${name} designed for optimal athletic performance and teamwear durability.`).trim()
          const image = String(row.imageurl || row.image || row.photo || '/products/jersey.png').trim()

          const baseSlug = String(row.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
          const existing = existingMap.get(baseSlug.toLowerCase()) || existingNameMap.get(name.toLowerCase())

          if (existing) {
            updateCount++
            parsedList.push({
              action: 'update',
              slug: existing.slug,
              id: existing.id,
              name,
              category,
              sub,
              price,
              mrp,
              stock,
              sizes,
              colors: existing.colors?.length ? existing.colors : colors,
              fabric,
              description,
              image: existing.image || image,
              oldPrice: existing.price,
              oldStock: existing.stock,
            })
          } else {
            newCount++
            parsedList.push({
              action: 'new',
              slug: baseSlug,
              name,
              category,
              sub,
              price,
              mrp,
              stock,
              sizes,
              colors,
              fabric,
              description,
              image,
              isNew: true,
              rating: 4.8,
              reviews: 14,
            })
          }
        })

        if (parsedList.length === 0) {
          toast('❌ No valid products found. Ensure columns "Name" and "Price" exist.')
          return
        }

        setExcelPreview({
          filename: file.name,
          items: parsedList,
          newCount,
          updateCount,
          skippedCount,
        })
      } catch (err) {
        toast(`❌ Error parsing Excel: ${err.message}`)
      } finally {
        if (e.target) e.target.value = ''
      }
    }
    reader.readAsArrayBuffer(file)
  }

  // 3. Confirm and Save Excel Products
  const handleConfirmExcelImport = async () => {
    if (!excelPreview || !excelPreview.items.length) return
    try {
      setImporting(true)
      const currentProducts = db.getProducts()
      let updatedList = [...currentProducts]
      let maxId = Math.max(0, ...currentProducts.map((p) => Number(p.id) || 0))

      excelPreview.items.forEach((item) => {
        if (item.action === 'update') {
          const idx = updatedList.findIndex((p) => p.slug === item.slug || p.id === item.id)
          if (idx !== -1) {
            updatedList[idx] = {
              ...updatedList[idx],
              price: item.price,
              mrp: item.mrp,
              stock: item.stock,
              fabric: item.fabric || updatedList[idx].fabric,
              description: item.description || updatedList[idx].description,
              categories: [item.category],
              subs: [item.sub],
              sizes: item.sizes,
            }
          }
        } else {
          maxId += 1
          updatedList.unshift({
            id: maxId,
            slug: item.slug,
            name: item.name,
            price: item.price,
            mrp: item.mrp,
            stock: item.stock,
            categories: [item.category],
            subs: [item.sub],
            sizes: item.sizes,
            colors: item.colors,
            fabric: item.fabric,
            description: item.description,
            image: item.image,
            gallery: [item.image],
            rating: item.rating || 4.8,
            reviews: item.reviews || 10,
            isNew: true,
            featured: false,
            topSelling: false,
            createdAt: new Date().toISOString(),
          })
        }
      })

      // Save to local storage
      db.saveProducts(updatedList)

      // Sync to MySQL Database
      try {
        await api.syncProducts(updatedList)
        toast(`✅ Success! ${excelPreview.items.length} products imported and synced to MySQL!`)
      } catch (apiErr) {
        toast(`✅ Products saved! (MySQL sync: ${apiErr.message})`)
      }

      setExcelPreview(null)
    } catch (err) {
      toast(`❌ Import failed: ${err.message}`)
    } finally {
      setImporting(false)
    }
  }

  const list = products.filter((p) => (cat === 'All' || p.categories.includes(cat)) && (!q || p.name.toLowerCase().includes(q.toLowerCase())))

  const quick = (slug, patch) => { db.upsertProduct({ slug, ...patch }) }

  return (
    <>
      <header className="admin__head">
        <div><h1>Products</h1><p className="muted">{products.length} products in catalogue · Database connected</p></div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="btn btn--outline btn--sm" onClick={exportProductsToExcel} title="Export all catalogue products into Excel (.xlsx) file">
            <Download width={14} height={14} /> Export Excel
          </button>
          <button className="btn btn--outline btn--sm" onClick={downloadProductTemplate} title="Download sample Excel sheet format">
            <Download width={14} height={14} /> Sample Template
          </button>
          <button className="btn btn--outline btn--sm" onClick={() => excelFileRef.current?.click()} title="Import products in bulk from Excel sheet">
            <Upload width={14} height={14} /> Import Excel
          </button>
          <input
            ref={excelFileRef}
            type="file"
            accept=".xlsx, .xls, .csv"
            style={{ display: 'none' }}
            onChange={handleExcelUpload}
          />
          <button className="btn btn--outline btn--sm" onClick={handleManualSync} disabled={syncing} title="Push all catalogue products directly into cPanel MySQL">
            {syncing ? 'Syncing…' : `☁️ Sync Database (${products.length})`}
          </button>
          <button className="btn btn--primary btn--sm" onClick={() => setEdit({ ...blankProduct })}><Plus width={15} height={15} /> Add product</button>
        </div>
      </header>

      <div className="atools">
        <div className="asearch"><Search /><input placeholder="Search products…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <div className="tabs">
          {['All', ...CATS.map((c) => c.slug)].map((c) => (
            <button key={c} className={cx('tab', cat === c && 'active')} onClick={() => setCat(c)}>{c === 'All' ? 'All' : CATS.find((x) => x.slug === c).name}</button>
          ))}
        </div>
      </div>

      <div className="acard" style={{ padding: 0 }}>
        <div className="atable-wrap">
          <table className="atable">
            <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>MRP</th><th>Stock</th><th>Flags</th><th></th></tr></thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.slug}>
                  <td>
                    <div className="aprod"><img src={p.image} alt="" /><div><b>{p.name}</b><span className="muted small">{p.slug}</span></div></div>
                  </td>
                  <td className="small">{CATS.find((c) => c.slug === p.categories[0])?.name || p.categories[0]}</td>
                  <td><input className="input input--cell" type="number" value={p.price} onChange={(e) => quick(p.slug, { price: +e.target.value })} /></td>
                  <td><input className="input input--cell" type="number" value={p.mrp || ''} placeholder="—" onChange={(e) => quick(p.slug, { mrp: e.target.value ? +e.target.value : null })} /></td>
                  <td><input className={cx('input input--cell', p.stock <= 40 && 'is-low')} type="number" value={p.stock} onChange={(e) => quick(p.slug, { stock: +e.target.value })} /></td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button className={cx('aflag', p.isNew && 'on')} onClick={() => quick(p.slug, { isNew: !p.isNew })}>New</button>
                    <button className={cx('aflag', p.featured && 'on')} onClick={() => quick(p.slug, { featured: !p.featured, topSelling: !p.featured })}>Top</button>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button className="btn btn--sm btn--ghost" onClick={() => setEdit(p)}>Edit</button>
                    <button className="icon-btn" style={{ width: 34, height: 34, color: 'var(--sale)' }} onClick={() => { if (confirm(`Delete “${p.name}”?`)) { db.deleteProduct(p.slug); toast('Product deleted') } }} aria-label="Delete"><Trash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="muted small" style={{ marginTop: 12 }}>Price, MRP and stock save as you type. Changes show on the storefront after a page refresh.</p>

      {edit && (
        <ProductEditor
          product={edit}
          onClose={() => setEdit(null)}
          onSave={(p) => { db.upsertProduct(p); setEdit(null); toast('Product saved') }}
          onDelete={(slug) => {
            if (confirm(`Delete “${edit.name}” permanently?`)) {
              db.deleteProduct(slug)
              setEdit(null)
              toast('Product deleted')
            }
          }}
        />
      )}

      {excelPreview && (
        <Modal width={980} title={`Import Products from Excel (${excelPreview.filename})`} onClose={() => setExcelPreview(null)}>
          <div style={{ padding: '4px 0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 16px' }}>
                <span style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Total Detected</span>
                <b style={{ display: 'block', fontSize: 22, color: '#0f172a', marginTop: 4 }}>{excelPreview.items.length} Products</b>
              </div>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 16px' }}>
                <span style={{ fontSize: 11, color: '#16a34a', textTransform: 'uppercase', fontWeight: 700 }}>New Products</span>
                <b style={{ display: 'block', fontSize: 22, color: '#15803d', marginTop: 4 }}>+{excelPreview.newCount} to Add</b>
              </div>
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px 16px' }}>
                <span style={{ fontSize: 11, color: '#2563eb', textTransform: 'uppercase', fontWeight: 700 }}>Existing Products</span>
                <b style={{ display: 'block', fontSize: 22, color: '#1d4ed8', marginTop: 4 }}>⟳ {excelPreview.updateCount} to Update</b>
              </div>
              {excelPreview.skippedCount > 0 && (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '12px 16px' }}>
                  <span style={{ fontSize: 11, color: '#d97706', textTransform: 'uppercase', fontWeight: 700 }}>Skipped</span>
                  <b style={{ display: 'block', fontSize: 22, color: '#b45309', marginTop: 4 }}>{excelPreview.skippedCount} Empty/Invalid</b>
                </div>
              )}
            </div>

            <div style={{ maxHeight: 360, overflowY: 'auto', border: '1px solid var(--line)', borderRadius: 10, marginBottom: 16 }}>
              <table className="atable" style={{ minWidth: 640 }}>
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Selling Price</th>
                    <th>MRP</th>
                    <th>Stock</th>
                    <th>Sizes</th>
                  </tr>
                </thead>
                <tbody>
                  {excelPreview.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        {item.action === 'new' ? (
                          <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                            + NEW
                          </span>
                        ) : (
                          <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                            ⟳ UPDATE
                          </span>
                        )}
                      </td>
                      <td>
                        <b>{item.name}</b>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{item.fabric}</div>
                      </td>
                      <td style={{ textTransform: 'capitalize' }}>{item.category}</td>
                      <td>
                        <b>₹{item.price}</b>
                        {item.action === 'update' && item.oldPrice !== item.price && (
                          <span style={{ fontSize: 11, color: 'var(--muted)', textDecoration: 'line-through', marginLeft: 6 }}>
                            ₹{item.oldPrice}
                          </span>
                        )}
                      </td>
                      <td>₹{item.mrp}</td>
                      <td>{item.stock} pcs</td>
                      <td style={{ fontSize: 12 }}>{item.sizes.join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, alignItems: 'center' }}>
              <button className="btn btn--ghost btn--sm" onClick={() => setExcelPreview(null)} disabled={importing}>
                Cancel
              </button>
              <button className="btn btn--primary" onClick={handleConfirmExcelImport} disabled={importing}>
                <Check width={16} height={16} />
                {importing ? 'Importing & Syncing…' : `Confirm & Import ${excelPreview.items.length} Products`}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

function ProductEditor({ product, onClose, onSave, onDelete }) {
  const isNewProduct = !product.id
  const { toast } = useStore()
  const mainFileInputRef = useRef(null)
  const hoverFileInputRef = useRef(null)
  const colorFileInputRef = useRef(null)
  const [activeColorIdx, setActiveColorIdx] = useState(null)
  const [uploading, setUploading] = useState(false)

  const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', 'Free Size']
  const COLOR_PRESETS = [
    { name: 'Navy Blue', hex: '#0e2140' },
    { name: 'Royal Blue', hex: '#1e40af' },
    { name: 'Black', hex: '#111827' },
    { name: 'White', hex: '#ffffff' },
    { name: 'Red', hex: '#dc2626' },
    { name: 'Maroon', hex: '#881337' },
    { name: 'Emerald Green', hex: '#059669' },
    { name: 'Yellow', hex: '#eab308' },
    { name: 'Orange', hex: '#ea580c' },
    { name: 'Gray', hex: '#4b5563' },
  ]
  const FABRIC_PRESETS = ['Superpoly', 'Dotknit', 'PMC', '4 Way Lycra', 'Dry-Fit Mesh', 'Interlock', 'Micro Polyester']

  const existingHover = (product.gallery && Array.isArray(product.gallery))
    ? product.gallery.find((g) => g !== product.image) || ''
    : ''

  const [f, setF] = useState({
    ...product,
    price: product.price || 0,
    mrp: product.mrp || '',
    stock: product.stock !== undefined ? product.stock : 100,
    gst: product.gst !== undefined ? product.gst : 5,
    categories: product.categories?.length ? product.categories : ['jerseys'],
    subs: product.subs?.length ? product.subs : [SUBS.jerseys[0]],
    features: (product.features || []).join('\n'),
    image: product.image || '/products/jersey.png',
    hoverImage: product.hoverImage || existingHover,
  })

  // Colors State with individual image support
  const [colors, setColors] = useState(() => {
    if (product.colors && Array.isArray(product.colors) && product.colors.length) {
      return product.colors.map((c) => ({
        name: c.name || 'Color',
        hex: c.hex || '#0e2140',
        image: c.image || product.image || '',
      }))
    }
    return [{ name: 'Navy Blue', hex: '#0e2140', image: product.image || '' }]
  })
  const [cName, setCName] = useState('')
  const [cHex, setCHex] = useState('#1e40af')

  // Sizes State
  const [sizes, setSizes] = useState(() => {
    return product.sizes && Array.isArray(product.sizes) && product.sizes.length ? product.sizes : ['S', 'M', 'L', 'XL']
  })
  const [customSize, setCustomSize] = useState('')

  // Fabric / Quality Variants State
  const [fabricOptions, setFabricOptions] = useState(() => {
    return product.fabricOptions && Array.isArray(product.fabricOptions) ? product.fabricOptions : []
  })
  const [fabName, setFabName] = useState('')
  const [fabRate, setFabRate] = useState(product.price || 420)

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  // Generic File Upload with local fallback
  const uploadGeneric = async (file) => {
    if (!file) return null
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = async (ev) => {
        const localPreview = ev.target?.result
        try {
          setUploading(true)
          const res = await api.uploadImage(file)
          resolve(res && res.url ? res.url : localPreview)
        } catch {
          resolve(localPreview)
        } finally {
          setUploading(false)
        }
      }
      reader.readAsDataURL(file)
    })
  }

  // Main Photo Upload
  const handleMainPhotoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await uploadGeneric(file)
    if (url) {
      setF((prev) => ({ ...prev, image: url }))
      toast('Main front photo updated!')
    }
    if (mainFileInputRef.current) mainFileInputRef.current.value = ''
  }

  // Hover / Back Photo Upload
  const handleHoverPhotoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await uploadGeneric(file)
    if (url) {
      setF((prev) => ({ ...prev, hoverImage: url }))
      toast('Hover back photo updated!')
    }
    if (hoverFileInputRef.current) hoverFileInputRef.current.value = ''
  }

  // Specific Color Variant Photo Upload
  const triggerColorPhotoUpload = (idx) => {
    setActiveColorIdx(idx)
    colorFileInputRef.current?.click()
  }

  const handleColorPhotoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file || activeColorIdx === null) return
    const url = await uploadGeneric(file)
    if (url) {
      setColors((prev) => prev.map((c, i) => i === activeColorIdx ? { ...c, image: url } : c))
      toast(`Photo updated for ${colors[activeColorIdx]?.name || 'color'}!`)
    }
    setActiveColorIdx(null)
    if (colorFileInputRef.current) colorFileInputRef.current.value = ''
  }

  // Toggle Size
  const toggleSize = (sz) => {
    setSizes((prev) => (prev.includes(sz) ? prev.filter((s) => s !== sz) : [...prev, sz]))
  }
  const addCustomSize = (e) => {
    e.preventDefault()
    const sz = customSize.trim().toUpperCase()
    if (!sz) return
    if (!sizes.includes(sz)) setSizes([...sizes, sz])
    setCustomSize('')
  }

  // Add Color
  const addColor = (name, hex) => {
    const n = (name || cName).trim()
    const h = hex || cHex
    if (!n) return
    if (!colors.some((c) => c.name.toLowerCase() === n.toLowerCase())) {
      setColors([...colors, { name: n, hex: h, image: f.image }])
    }
    setCName('')
  }
  const removeColor = (idx) => {
    setColors(colors.filter((_, i) => i !== idx))
  }

  // Fabric / Variants
  const addFabric = (name, rate) => {
    const fn = (name || fabName).trim()
    const fr = Number(rate !== undefined ? rate : fabRate) || Number(f.price) || 0
    if (!fn) return
    if (!fabricOptions.some((item) => item.name.toLowerCase() === fn.toLowerCase())) {
      setFabricOptions([...fabricOptions, { name: fn, rate: fr }])
    }
    setFabName('')
  }
  const removeFabric = (idx) => {
    setFabricOptions(fabricOptions.filter((_, i) => i !== idx))
  }
  const updateFabricRate = (idx, rate) => {
    setFabricOptions(fabricOptions.map((item, i) => (i === idx ? { ...item, rate: Number(rate) } : item)))
  }

  const save = (e) => {
    e.preventDefault()
    const fullGallery = [f.image, f.hoverImage].filter(Boolean)
    colors.forEach((c) => {
      if (c.image && !fullGallery.includes(c.image)) fullGallery.push(c.image)
    })
    const uniqueGallery = [...new Set(fullGallery)]

    onSave({
      ...product,
      name: f.name,
      slug: f.slug || slugify(f.name),
      price: +f.price || 0,
      mrp: f.mrp ? +f.mrp : null,
      stock: +f.stock || 0,
      gst: Number(f.gst) || 5,
      image: f.image,
      gallery: uniqueGallery.length ? uniqueGallery : [f.image],
      categories: [f.categories[0]],
      subs: f.subs,
      description: f.description,
      fabric: f.fabric || (fabricOptions[0]?.name ? `${fabricOptions[0].name} Performance Knit` : ''),
      features: f.features.split('\n').map((x) => x.trim()).filter(Boolean),
      colors: colors.length ? colors.map((c) => ({
        name: c.name,
        hex: c.hex,
        image: c.image || f.image,
        images: [c.image || f.image],
      })) : [{ name: 'Standard', hex: '#0e2140', image: f.image, images: [f.image] }],
      sizes: sizes.length ? sizes : ['S', 'M', 'L', 'XL'],
      fabricOptions: fabricOptions,
      isNew: !!f.isNew,
      featured: !!f.featured,
      rating: +f.rating || 4.8,
      reviews: +f.reviews || 0,
    })
  }

  const cat = f.categories[0]
  return (
    <Modal title={isNewProduct ? 'Add product' : `Edit: ${product.name}`} onClose={onClose} className="modal--admin-wide">
      <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
        <div className="modal__body">
          <div className="admin-editor-layout">
            {/* Left Column: General Info, Pricing, Description */}
            <div>
              <div className="admin-card-section">
                <h4>General Information & Pricing</h4>
                <div className="form-grid">
                  <div className="field span-2">
                    <label>Product Name</label>
                    <input className="input" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value, slug: isNewProduct ? slugify(e.target.value) : f.slug })} placeholder="e.g. RS Pro Sublimated Match Jersey" />
                  </div>

                  <div className="field">
                    <label>Selling Price (₹)</label>
                    <input className="input" type="number" required min="0" value={f.price} onChange={set('price')} />
                  </div>
                  <div className="field">
                    <label>MRP (₹, optional)</label>
                    <input className="input" type="number" min="0" value={f.mrp || ''} onChange={set('mrp')} placeholder="Crossed-out price" />
                  </div>

                  <div className="field">
                    <label>Stock Quantity</label>
                    <input className="input" type="number" min="0" value={f.stock} onChange={set('stock')} />
                  </div>
                  <div className="field">
                    <label>GST / Tax Rate (%)</label>
                    <select className="select" value={f.gst} onChange={set('gst')}>
                      <option value="5">5% (Apparel / Sportswear standard)</option>
                      <option value="12">12% (Caps, Bags & Accessories)</option>
                      <option value="18">18% (Standard Rate)</option>
                      <option value="0">0% (Tax Exempt)</option>
                    </select>
                  </div>

                  <div className="field">
                    <label>Primary Category</label>
                    <select className="select" value={cat} onChange={(e) => setF({ ...f, categories: [e.target.value], subs: [SUBS[e.target.value][0]] })}>
                      {CATS.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label>Product Slug (URL)</label>
                    <input className="input" value={f.slug || ''} onChange={set('slug')} placeholder="auto-generated-slug" />
                  </div>

                  <div className="field span-2">
                    <label>Sub-categories</label>
                    <div className="achips">
                      {SUBS[cat].map((s) => (
                        <button type="button" key={s} className={cx('chip', f.subs.includes(s) && 'active')}
                          onClick={() => setF({ ...f, subs: f.subs.includes(s) ? f.subs.filter((x) => x !== s) : [...f.subs, s] })}>
                          {s.replace(/-/g, ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="admin-card-section">
                <h4>Description & Specifications</h4>
                <div className="form-grid">
                  <div className="field span-2">
                    <label>Product Description</label>
                    <textarea className="textarea" style={{ minHeight: 75 }} value={f.description} onChange={set('description')} placeholder="Detailed description of the product, manufacturing standards, etc." />
                  </div>
                  <div className="field span-2">
                    <label>Primary Fabric Specification</label>
                    <input className="input" value={f.fabric || ''} onChange={set('fabric')} placeholder="e.g. 150 GSM Micro Polyester, Breathable & Quick Dry" />
                  </div>
                  <div className="field span-2">
                    <label>Key Features (one per line)</label>
                    <textarea className="textarea" style={{ minHeight: 75 }} value={f.features} onChange={set('features')} placeholder="Sublimation printing&#10;Breathable fabric&#10;Custom team name & numbers" />
                  </div>
                  <div className="field span-2" style={{ flexDirection: 'row', gap: 24, paddingTop: 6 }}>
                    <label className="check"><input type="checkbox" checked={!!f.isNew} onChange={(e) => setF({ ...f, isNew: e.target.checked })} /> Mark as “New Arrival”</label>
                    <label className="check"><input type="checkbox" checked={!!f.featured} onChange={(e) => setF({ ...f, featured: e.target.checked })} /> Mark as “Best Seller / Top”</label>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Media, Colors, Sizes, Fabric Variants */}
            <div>
              {/* Hidden file inputs */}
              <input type="file" ref={mainFileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleMainPhotoUpload} />
              <input type="file" ref={hoverFileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleHoverPhotoUpload} />
              <input type="file" ref={colorFileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleColorPhotoUpload} />

              {/* Photo Upload Section: Main + Hover Photo */}
              <div className="admin-card-section">
                <h4>Product Photos (Front & Hover)</h4>
                <div className="a-media-grid">
                  {/* Main Front Photo */}
                  <div className="a-media-card">
                    <div className="a-media-card-title">
                      <span>Front Photo (Main)</span>
                      <span className="badge badge--new" style={{ fontSize: 10, padding: '2px 6px' }}>Default</span>
                    </div>
                    <img className="a-media-card-prev" src={f.image} alt="Front View" onError={(e) => { e.target.src = '/products/jersey.png' }} />
                    <button type="button" className="btn btn--sm btn--primary" style={{ width: '100%', fontSize: 11 }} onClick={() => mainFileInputRef.current?.click()} disabled={uploading}>
                      <Upload width={12} height={12} /> {uploading ? 'Uploading…' : 'Upload Front Photo'}
                    </button>
                    <input className="input" style={{ fontSize: 11, height: 28 }} value={f.image} onChange={set('image')} placeholder="Image URL: /products/..." />
                  </div>

                  {/* Hover / Back Photo */}
                  <div className="a-media-card">
                    <div className="a-media-card-title">
                      <span>Hover Photo (Back)</span>
                      {f.hoverImage && (
                        <button type="button" className="icon-btn" style={{ width: 20, height: 20, color: 'var(--sale)' }} onClick={() => setF({ ...f, hoverImage: '' })} title="Remove hover photo">
                          <X width={12} height={12} />
                        </button>
                      )}
                    </div>
                    {f.hoverImage ? (
                      <img className="a-media-card-prev" src={f.hoverImage} alt="Hover View" onError={(e) => { e.target.src = '/products/jersey.png' }} />
                    ) : (
                      <div className="a-media-card-empty" onClick={() => hoverFileInputRef.current?.click()} style={{ cursor: 'pointer' }}>
                        <Plus width={18} height={18} />
                        <span>Add Hover / Back Photo</span>
                      </div>
                    )}
                    <button type="button" className="btn btn--sm btn--outline" style={{ width: '100%', fontSize: 11 }} onClick={() => hoverFileInputRef.current?.click()} disabled={uploading}>
                      <Upload width={12} height={12} /> {uploading ? 'Uploading…' : (f.hoverImage ? 'Change Hover Photo' : 'Upload Hover Photo')}
                    </button>
                    <input className="input" style={{ fontSize: 11, height: 28 }} value={f.hoverImage || ''} onChange={set('hoverImage')} placeholder="Image URL: /products/..." />
                  </div>
                </div>
                <p className="small muted" style={{ margin: '4px 0 10px', fontSize: 11.5 }}>
                  💡 <b>Hover Photo:</b> Card par mouse le jaane par yeh photo dikhegi aur product page par 2nd photo banegi.
                </p>

                <p className="small muted" style={{ margin: '8px 0 6px', fontSize: 12 }}>Or pick from existing catalogue photos:</p>
                <div className="aimgs">
                  {IMAGES.map((src) => (
                    <button type="button" key={src} className={cx('aimg', f.image === src && 'active')} onClick={() => setF({ ...f, image: src })}>
                      <img src={src} alt="" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Management with Individual Photo Upload */}
              <div className="admin-card-section">
                <h4>Color Variants & Photos ({colors.length})</h4>
                <p className="small muted" style={{ margin: '0 0 10px', fontSize: 12 }}>
                  Har color ke liye alag photo set kar sakte hain — customer jab storefront par color chunta hai, photo automatically switch hoti hai.
                </p>

                <div className="a-color-table">
                  {colors.map((c, i) => (
                    <div className="a-color-row" key={i}>
                      <span className="a-color-dot" style={{ background: c.hex }} />
                      <b style={{ fontSize: 13, minWidth: 90 }}>{c.name}</b>
                      <img className="a-color-thumb" src={c.image || f.image} alt={c.name} onError={(e) => { e.target.src = f.image }} />
                      <button type="button" className="btn btn--sm btn--outline" style={{ fontSize: 11, padding: '3px 8px', height: 28 }} onClick={() => triggerColorPhotoUpload(i)} disabled={uploading} title="Upload photo for this color variant">
                        <Upload width={12} height={12} /> {c.image && c.image !== f.image ? 'Change Photo' : 'Upload Color Photo'}
                      </button>
                      <button type="button" className="icon-btn" style={{ marginLeft: 'auto', color: 'var(--sale)', width: 28, height: 28 }} onClick={() => removeColor(i)} title="Remove color variant">
                        <X width={13} height={13} />
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 10 }}>
                  <input className="input" style={{ width: 140, height: 34 }} placeholder="Color name" value={cName} onChange={(e) => setCName(e.target.value)} />
                  <input type="color" style={{ width: 40, height: 34, padding: 2, border: '1px solid var(--line)', borderRadius: 8, cursor: 'pointer' }} value={cHex} onChange={(e) => setCHex(e.target.value)} title="Pick hex code" />
                  <button type="button" className="btn btn--sm btn--outline" onClick={() => addColor()}><Plus width={14} height={14} /> Add Color</button>
                </div>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                  <span className="small muted" style={{ alignSelf: 'center', marginRight: 4, fontSize: 11 }}>Presets:</span>
                  {COLOR_PRESETS.map((p) => (
                    <button type="button" key={p.name} className="chip" style={{ fontSize: 11, height: 26, padding: '0 8px' }} onClick={() => addColor(p.name, p.hex)}>
                      <span className="a-color-dot" style={{ background: p.hex, width: 10, height: 10, marginRight: 4, display: 'inline-block' }} />
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sizes Selection */}
              <div className="admin-card-section">
                <h4>Available Sizes ({sizes.length} selected)</h4>
                <div className="a-size-grid">
                  {STANDARD_SIZES.map((sz) => (
                    <button type="button" key={sz} className={cx('a-size-btn', sizes.includes(sz) && 'active')} onClick={() => toggleSize(sz)}>
                      {sz}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center' }}>
                  <input className="input" style={{ width: 180, height: 34 }} placeholder="Custom size (e.g. 28, 30)" value={customSize} onChange={(e) => setCustomSize(e.target.value)} />
                  <button type="button" className="btn btn--sm btn--outline" onClick={addCustomSize}><Plus width={14} height={14} /> Add Size</button>
                </div>
              </div>

              {/* Fabric & Variants Quality Options */}
              <div className="admin-card-section">
                <h4>Fabric Variants & Rates ({fabricOptions.length})</h4>
                {fabricOptions.length > 0 ? (
                  <div className="a-fab-list" style={{ marginBottom: 12 }}>
                    {fabricOptions.map((item, i) => (
                      <div className="a-fab-row" key={i}>
                        <span className="a-fab-name">{item.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 13, color: 'var(--muted)' }}>₹</span>
                          <input className="input a-fab-rate" type="number" min="0" value={item.rate} onChange={(e) => updateFabricRate(i, e.target.value)} />
                        </div>
                        <button type="button" className="icon-btn" style={{ color: 'var(--sale)', width: 30, height: 30 }} onClick={() => removeFabric(i)} title="Remove fabric variant"><Trash width={14} height={14} /></button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="small muted" style={{ marginBottom: 10 }}>No custom fabric variants yet. Base price (₹{f.price}) will apply.</p>
                )}

                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <input className="input" style={{ width: 160, height: 34 }} placeholder="Fabric name (e.g. Dotknit)" value={fabName} onChange={(e) => setFabName(e.target.value)} />
                  <input className="input" style={{ width: 100, height: 34 }} type="number" placeholder="₹ Rate" value={fabRate} onChange={(e) => setFabRate(e.target.value)} />
                  <button type="button" className="btn btn--sm btn--outline" onClick={() => addFabric()}><Plus width={14} height={14} /> Add Variant</button>
                </div>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                  <span className="small muted" style={{ alignSelf: 'center', marginRight: 4 }}>Add sports fabric:</span>
                  {FABRIC_PRESETS.map((name) => (
                    <button type="button" key={name} className="chip" style={{ fontSize: 11, height: 26, padding: '0 8px' }} onClick={() => addFabric(name, f.price)}>
                      + {name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Modal Footer */}
        <div className="modal__foot">
          <div>
            {!isNewProduct && onDelete && (
              <button type="button" className="btn btn--sm btn--ghost" style={{ color: 'var(--sale)', display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={() => onDelete(product.slug)}>
                <Trash width={15} height={15} /> Delete Product
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn--primary" style={{ minWidth: 130 }}>Save Product</button>
          </div>
        </div>
      </form>
    </Modal>
  )
}

function Enquiries() {
  useDb()
  const { toast } = useStore()
  const [filter, setFilter] = useState('All')
  const all = db.getEnquiries()
  const list = all.filter((e) => filter === 'All' || e.status === filter)
  return (
    <>
      <header className="admin__head">
        <div><h1>Enquiries</h1><p className="muted">Bulk quote requests and contact messages from the site</p></div>
      </header>
      <div className="atools">
        <div className="tabs">{['All', ...ENQ_STATUS].map((s) => <button key={s} className={cx('tab', filter === s && 'active')} onClick={() => setFilter(s)}>{s}</button>)}</div>
      </div>
      {list.length === 0 ? (
        <div className="acard"><p className="muted small" style={{ padding: '24px 0', textAlign: 'center' }}>No enquiries yet. Submit the form on the Custom Kits page to see one here.</p></div>
      ) : (
        <div className="aenq">
          {list.map((e) => (
            <article className="acard aenq__item" key={e.id}>
              <div className="aenq__top">
                <div>
                  <b>{e.name || 'Unnamed'}</b>
                  <span className="muted small"> · {e.type} · {fmtTime(e.at)}</span>
                  {e.org && <div className="muted small">{e.org}</div>}
                </div>
                <select className="select select--sm" value={e.status} onChange={(ev) => { db.setEnquiryStatus(e.id, ev.target.value); toast('Enquiry updated') }}>
                  {ENQ_STATUS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              {(e.product || e.qty || e.topic) && (
                <div className="aenq__tags">
                  {e.product && <span className="chip">{e.product}</span>}
                  {e.qty && <span className="chip">{e.qty} pcs</span>}
                  {e.topic && <span className="chip">{e.topic}</span>}
                </div>
              )}
              {e.message && <p className="small" style={{ marginTop: 10 }}>{e.message}</p>}
              <div className="aenq__foot">
                {e.phone && <a className="btn btn--sm btn--accent" href={`https://wa.me/91${e.phone}`} target="_blank" rel="noreferrer">WhatsApp {e.phone}</a>}
                {e.phone && <a className="btn btn--sm btn--ghost" href={`tel:+91${e.phone}`}>Call</a>}
                {e.email && <a className="btn btn--sm btn--ghost" href={`mailto:${e.email}`}>{e.email}</a>}
                <button className="btn btn--sm btn--ghost" style={{ marginLeft: 'auto', color: 'var(--sale)' }} onClick={() => { if (confirm('Delete this enquiry?')) db.deleteEnquiry(e.id) }}><Trash width={14} height={14} /></button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  )
}

function Customers() {
  useDb()
  const rawUsers = db.getUsers()
  // Clean / deduplicate by email
  const seen = new Set()
  const users = rawUsers.filter((u) => {
    if (!u || !u.email) return false
    const em = String(u.email).toLowerCase().trim()
    if (seen.has(em)) return false
    seen.add(em)
    return true
  })

  const orders = db.getOrders()
  const rows = users.map((u) => {
    const mine = orders.filter((o) => o.email && u.email && o.email.toLowerCase() === u.email.toLowerCase())
    return { ...u, orders: mine.length, spent: mine.reduce((a, o) => a + (o.total || 0), 0) }
  }).sort((a, b) => b.spent - a.spent)

  const handleClean = () => {
    db.cleanDuplicateUsers()
    window.location.reload()
  }

  const handleDelete = (email) => {
    if (confirm(`Delete customer (${email})?`)) {
      db.deleteUser(email)
    }
  }

  return (
    <>
      <header className="admin__head">
        <div>
          <h1>Customers</h1>
          <p className="muted">{users.length} unique registered {users.length === 1 ? 'account' : 'accounts'}</p>
        </div>
        {rawUsers.length > users.length && (
          <button className="btn btn--sm btn--outline" onClick={handleClean} style={{ color: 'var(--sale)', borderColor: 'var(--sale)' }} title="Click to clear all repeated duplicate records">
            🧹 Clean Duplicates ({rawUsers.length - users.length} removed)
          </button>
        )}
      </header>
      {rows.length === 0 ? (
        <div className="acard"><p className="muted small" style={{ padding: '24px 0', textAlign: 'center' }}>No customers yet. Sign up on the store to see one here.</p></div>
      ) : (
        <div className="acard" style={{ padding: 0 }}>
          <div className="atable-wrap">
            <table className="atable">
              <thead><tr><th>Customer</th><th>Email</th><th>Mobile</th><th>Orders</th><th>Spent</th><th>Joined</th><th></th></tr></thead>
              <tbody>
                {rows.map((u) => (
                  <tr key={u.id || u.email}>
                    <td><div className="aprod"><span className="avatar">{u.name?.[0] || 'U'}</span><b>{u.name || 'Anonymous'}</b></div></td>
                    <td className="small">{u.email}</td>
                    <td className="small">{u.phone || '—'}</td>
                    <td>{u.orders}</td>
                    <td><b>{formatPrice(u.spent)}</b></td>
                    <td className="small">{u.createdAt ? fmtDate(u.createdAt) : '—'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn--sm btn--ghost"
                        style={{ color: 'var(--sale)' }}
                        title="Delete customer"
                        onClick={() => handleDelete(u.email)}
                      >
                        <Trash width={14} height={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}

function Settings({ onSignOut }) {
  useDb()
  const { toast } = useStore()
  const nav = useNavigate()
  const [s, setS] = useState(db.getSettings())
  const [coupons, setCoupons] = useState(db.getCoupons())
  const [nc, setNc] = useState({ code: '', type: 'pct', value: 10, min: 999 })
  const set = (k) => (e) => setS({ ...s, [k]: e.target.value })

  const saveShop = (e) => {
    e.preventDefault()
    db.saveSettings({ ...s, moq: +s.moq, freeShipAbove: +s.freeShipAbove, shippingFee: +s.shippingFee, codFee: +s.codFee })
    toast('Settings saved — refresh the store to see them')
  }
  const addCoupon = (e) => {
    e.preventDefault()
    const code = nc.code.trim().toUpperCase()
    if (!code) return
    const label = nc.type === 'pct' ? `${nc.value}% off on orders above ₹${nc.min}` : `₹${nc.value} off on orders above ₹${nc.min}`
    const next = { ...coupons, [code]: { type: nc.type, value: +nc.value, min: +nc.min, label } }
    setCoupons(next); db.saveCoupons(next); setNc({ code: '', type: 'pct', value: 10, min: 999 })
    toast(`Coupon ${code} added`)
  }
  const delCoupon = (code) => {
    const next = { ...coupons }; delete next[code]
    setCoupons(next); db.saveCoupons(next); toast(`Coupon ${code} removed`)
  }

  return (
    <>
      <header className="admin__head">
        <div><h1>Settings</h1><p className="muted">Business details, shipping rules and coupons</p></div>
      </header>

      <div className="admin__grid">
        <form className="acard" onSubmit={saveShop}>
          <h3>Business details</h3>
          <div className="form-grid">
            <div className="field"><label>Phone</label><input className="input" value={s.phone} onChange={set('phone')} /></div>
            <div className="field"><label>WhatsApp (with +91)</label><input className="input" value={s.phoneIntl} onChange={set('phoneIntl')} /></div>
            <div className="field span-2"><label>Email</label><input className="input" value={s.email} onChange={set('email')} /></div>
            <div className="field span-2"><label>Address</label><textarea className="textarea" style={{ minHeight: 70 }} value={s.address} onChange={set('address')} /></div>
            <div className="field"><label>Working hours</label><input className="input" value={s.hours} onChange={set('hours')} /></div>
            <div className="field"><label>Minimum order (pieces)</label><input className="input" type="number" value={s.moq} onChange={set('moq')} /></div>
          </div>
          <h3 style={{ marginTop: 22 }}>Shipping & payment</h3>
          <div className="form-grid">
            <div className="field"><label>Free shipping above (₹)</label><input className="input" type="number" value={s.freeShipAbove} onChange={set('freeShipAbove')} /></div>
            <div className="field"><label>Shipping fee (₹)</label><input className="input" type="number" value={s.shippingFee} onChange={set('shippingFee')} /></div>
            <div className="field"><label>COD handling fee (₹)</label><input className="input" type="number" value={s.codFee} onChange={set('codFee')} /></div>
            <div className="field"><label>Admin PIN</label><input className="input" value={s.adminPin} onChange={set('adminPin')} /></div>
          </div>
          <button className="btn btn--primary" style={{ marginTop: 16 }}>Save settings</button>
        </form>

        <div>
          <section className="acard">
            <h3>Coupons</h3>
            <ul className="alist alist--plain">
              {Object.entries(coupons).map(([code, c]) => (
                <li key={code}>
                  <div><b>{code}</b><span>{c.label}</span></div>
                  <button className="icon-btn" style={{ width: 34, height: 34, color: 'var(--sale)' }} onClick={() => delCoupon(code)} aria-label="Remove"><Trash /></button>
                </li>
              ))}
            </ul>
            <form className="form-grid" style={{ marginTop: 14 }} onSubmit={addCoupon}>
              <div className="field"><label>Code</label><input className="input" value={nc.code} onChange={(e) => setNc({ ...nc, code: e.target.value.toUpperCase() })} placeholder="TEAM20" /></div>
              <div className="field"><label>Type</label><select className="select" value={nc.type} onChange={(e) => setNc({ ...nc, type: e.target.value })}><option value="pct">% off</option><option value="flat">₹ off</option></select></div>
              <div className="field"><label>Value</label><input className="input" type="number" value={nc.value} onChange={(e) => setNc({ ...nc, value: e.target.value })} /></div>
              <div className="field"><label>Min order (₹)</label><input className="input" type="number" value={nc.min} onChange={(e) => setNc({ ...nc, min: e.target.value })} /></div>
              <div className="span-2"><button className="btn btn--outline btn--sm"><Plus width={14} height={14} /> Add coupon</button></div>
            </form>
          </section>

          <section className="acard" style={{ marginTop: 16 }}>
            <h3>Danger zone</h3>
            <p className="muted small">Restore the catalogue that ships with the site. Orders and customers are not touched.</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              <button className="btn btn--sm btn--outline" onClick={() => { if (confirm('Reset all products to the original catalogue?')) { db.resetProducts(); toast('Catalogue reset') } }}>Reset catalogue</button>
              <button className="btn btn--sm btn--ghost" onClick={() => { db.signOutAdmin(); onSignOut(); nav('/admin') }}><LogOut width={14} height={14} /> Log out</button>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
