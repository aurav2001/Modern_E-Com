import { useEffect, useMemo, useState, useRef } from 'react'
import { Link, NavLink, useParams, useNavigate } from 'react-router-dom'
import * as db from '../lib/db'
import { api } from '../lib/api'
import { useStore } from '../context/StoreContext'
import { formatPrice, cx } from '../lib/utils'
import { Modal } from '../components/Shared'
import {
  Grid, Package, User, Mail, Lock, LogOut, Plus, Trash, Search, X, ArrowRight,
  Scissors, Truck, Check, Shield,
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
  const products = db.getProducts()
  const list = products.filter((p) => (cat === 'All' || p.categories.includes(cat)) && (!q || p.name.toLowerCase().includes(q.toLowerCase())))

  const quick = (slug, patch) => { db.upsertProduct({ slug, ...patch }) }

  return (
    <>
      <header className="admin__head">
        <div><h1>Products</h1><p className="muted">{products.length} products in the catalogue</p></div>
        <button className="btn btn--primary btn--sm" onClick={() => setEdit({ ...blankProduct })}><Plus width={15} height={15} /> Add product</button>
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
    </>
  )
}

function ProductEditor({ product, onClose, onSave, onDelete }) {
  const isNewProduct = !product.id
  const { toast } = useStore()
  const fileInputRef = useRef(null)
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
  })

  // Colors State
  const [colors, setColors] = useState(() => {
    if (product.colors && Array.isArray(product.colors) && product.colors.length) {
      return product.colors.map((c) => ({
        name: c.name || 'Color',
        hex: c.hex || '#0e2140',
        image: c.image || product.image,
      }))
    }
    return [{ name: 'Navy Blue', hex: '#0e2140' }]
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

  // File Upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setUploading(true)
      const res = await api.uploadImage(file)
      if (res && res.url) {
        setF((prev) => ({ ...prev, image: res.url }))
        toast('Photo uploaded successfully!')
      }
    } catch (err) {
      toast(err.message || 'Upload failed', { tone: 'error' })
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
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
    onSave({
      ...product,
      name: f.name,
      slug: f.slug || slugify(f.name),
      price: +f.price || 0,
      mrp: f.mrp ? +f.mrp : null,
      stock: +f.stock || 0,
      gst: Number(f.gst) || 5,
      image: f.image,
      gallery: [f.image],
      categories: [f.categories[0]],
      subs: f.subs,
      description: f.description,
      fabric: f.fabric || (fabricOptions[0]?.name ? `${fabricOptions[0].name} Performance Knit` : ''),
      features: f.features.split('\n').map((x) => x.trim()).filter(Boolean),
      colors: colors.length ? colors : [{ name: 'Standard', hex: '#0e2140', image: f.image }],
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
              {/* Photo Upload Section */}
              <div className="admin-card-section">
                <h4>Product Image & Photo Upload</h4>
                <div className="a-upload-zone">
                  <img className="a-upload-prev" src={f.image} alt="Preview" onError={(e) => { e.target.src = '/products/jersey.png' }} />
                  <div className="a-upload-info">
                    <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handlePhotoUpload} />
                    <button type="button" className="a-upload-btn" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                      <Plus width={15} height={15} /> {uploading ? 'Uploading…' : 'Upload photo from device'}
                    </button>
                    <div style={{ marginTop: 8 }}>
                      <input className="input" style={{ fontSize: '12px', height: '32px' }} value={f.image} onChange={set('image')} placeholder="Or enter image URL: /products/rs-prod-01.jpg" />
                    </div>
                  </div>
                </div>

                <p className="small muted" style={{ margin: '10px 0 6px' }}>Or choose from existing catalogue photos:</p>
                <div className="aimgs">
                  {IMAGES.map((src) => (
                    <button type="button" key={src} className={cx('aimg', f.image === src && 'active')} onClick={() => setF({ ...f, image: src })}>
                      <img src={src} alt="" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Management */}
              <div className="admin-card-section">
                <h4>Colors & Swatches ({colors.length})</h4>
                <div className="a-color-grid">
                  {colors.map((c, i) => (
                    <div className="a-color-chip" key={i}>
                      <span className="a-color-dot" style={{ background: c.hex }} />
                      <span>{c.name}</span>
                      <button type="button" className="a-color-del" onClick={() => removeColor(i)} title="Remove color"><X width={13} height={13} /></button>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 6 }}>
                  <input className="input" style={{ width: 140, height: 34 }} placeholder="Color name" value={cName} onChange={(e) => setCName(e.target.value)} />
                  <input type="color" style={{ width: 40, height: 34, padding: 2, border: '1px solid var(--line)', borderRadius: 8, cursor: 'pointer' }} value={cHex} onChange={(e) => setCHex(e.target.value)} title="Pick hex code" />
                  <button type="button" className="btn btn--sm btn--outline" onClick={() => addColor()}><Plus width={14} height={14} /> Add Color</button>
                </div>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                  <span className="small muted" style={{ alignSelf: 'center', marginRight: 4 }}>Quick presets:</span>
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
  const users = db.getUsers()
  const orders = db.getOrders()
  const rows = users.map((u) => {
    const mine = orders.filter((o) => o.email === u.email)
    return { ...u, orders: mine.length, spent: mine.reduce((a, o) => a + o.total, 0) }
  }).sort((a, b) => b.spent - a.spent)
  return (
    <>
      <header className="admin__head">
        <div><h1>Customers</h1><p className="muted">{users.length} registered accounts</p></div>
      </header>
      {rows.length === 0 ? (
        <div className="acard"><p className="muted small" style={{ padding: '24px 0', textAlign: 'center' }}>No customers yet. Sign up on the store to see one here.</p></div>
      ) : (
        <div className="acard" style={{ padding: 0 }}>
          <div className="atable-wrap">
            <table className="atable">
              <thead><tr><th>Customer</th><th>Email</th><th>Mobile</th><th>Orders</th><th>Spent</th><th>Joined</th></tr></thead>
              <tbody>
                {rows.map((u) => (
                  <tr key={u.email}>
                    <td><div className="aprod"><span className="avatar">{u.name[0]}</span><b>{u.name}</b></div></td>
                    <td className="small">{u.email}</td>
                    <td className="small">{u.phone}</td>
                    <td>{u.orders}</td>
                    <td><b>{formatPrice(u.spent)}</b></td>
                    <td className="small">{u.createdAt ? fmtDate(u.createdAt) : '—'}</td>
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
