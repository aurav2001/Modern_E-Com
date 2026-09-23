import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getProduct, related, subMeta, sortSizes, sizeChartKey, PRODUCTS } from '../lib/catalog'
import { useStore } from '../context/StoreContext'
import { formatPrice, discountPct, cx, deliveryDate } from '../lib/utils'
import { SIZE_CHART } from '../data/content'
import { Crumbs, Stars, Qty, Accordion, Rail, Modal } from '../components/Shared'
import { Heart, HeartFill, ChevronLeft, ChevronRight, Truck, Refresh, Shield, Check, MapPin, Zap } from '../components/Icons'
import NotFound from './NotFound'

const REVIEW_NAMES = ['Aarav', 'Priya', 'Karan', 'Sneha', 'Rahul', 'Meera', 'Vikram', 'Isha']
const REVIEW_TEXT = [
  'Fit is true to size and the fabric breathes really well during long sessions.',
  'Quality is better than expected at this price. Colour exactly as shown.',
  'Second time ordering — holds up wash after wash. Would recommend to teammates.',
  'Delivered in 3 days. Stitching and finish feel premium.',
  'Comfortable and lightweight. Slightly long in the sleeves for me but otherwise perfect.',
]

export default function Product() {
  const { slug } = useParams()
  const p = getProduct(slug)
  const nav = useNavigate()
  const { addToCart, isWished, toggleWish, markViewed, toast } = useStore()
  const [color, setColor] = useState(null)
  const [size, setSize] = useState(null)
  const [qty, setQtyV] = useState(1)
  const [img, setImg] = useState(0)
  const [err, setErr] = useState('')
  const [chart, setChart] = useState(false)
  const [pin, setPin] = useState('')
  const [pinMsg, setPinMsg] = useState('')

  useEffect(() => {
    if (!p) return
    setColor(p.colors[0]?.name || null)
    setSize(p.sizes.length === 1 ? p.sizes[0] : null)
    setQtyV(1); setImg(0); setErr(''); setPinMsg('')
    markViewed(p.slug)
    document.title = `${p.name} – Rishikar Sports`
    return () => { document.title = 'Rishikar Sports – Quality You Trust, Performance You Deserve' }
  }, [slug]) // eslint-disable-line

  const gallery = useMemo(() => {
    if (!p) return []
    const c = p.colors.find((x) => x.name === color)
    const imgs = c?.images?.length ? c.images : []
    return [...new Set([...imgs, ...p.gallery])].slice(0, 8)
  }, [p, color])
  useEffect(() => setImg(0), [color])

  if (!p) return <NotFound />
  const pct = discountPct(p)
  const cat = p.subs.map(subMeta).find(Boolean)
  const wished = isWished(p.slug)
  const rel = related(p, 8)
  const chartKey = sizeChartKey(p)
  const tone = (k) => (k === 'cricket' ? 'the crease' : 'the field')

  const validate = () => { if (p.sizes.length && !size) { setErr('Please select a size'); return false } return true }
  const add = () => { if (!validate()) return; addToCart(p, color, size, qty) }
  const buyNow = () => { if (!validate()) return; addToCart(p, color, size, qty, { open: false }); nav('/checkout') }
  const checkPin = (e) => { e.preventDefault(); if (!/^\d{6}$/.test(pin)) return setPinMsg('Enter a valid 6-digit pincode'); setPinMsg(`Delivery by ${deliveryDate(+pin[0] <= 4 ? 4 : 6)} · COD available`) }

  const reviews = Array.from({ length: Math.min(4, Math.max(2, Math.round(p.reviews / 30))) }).map((_, i) => ({
    name: REVIEW_NAMES[(p.id + i) % REVIEW_NAMES.length],
    rating: Math.max(3, Math.min(5, Math.round(p.rating + (i % 2 ? -0.6 : 0.4)))),
    text: REVIEW_TEXT[(p.id + i) % REVIEW_TEXT.length],
    when: ['2 days ago', '1 week ago', '3 weeks ago', '2 months ago'][i],
  }))
  const dist = [5, 4, 3, 2, 1].map((s) => [s, Math.round(s === 5 ? p.rating * 12 : s === 4 ? 28 - (5 - p.rating) * 10 : s === 3 ? 8 : s === 2 ? 3 : 1)])
  const distTotal = dist.reduce((a, [, v]) => a + v, 0)

  const details = [
    {
      title: 'Product details',
      body: (
        <>
          {p.description && <p style={{ marginBottom: 10 }}>{p.description}</p>}
          {p.features?.length > 0 ? <ul>{p.features.map((f, i) => <li key={i}>{f}</li>)}</ul> : !p.description && <p>Performance {cat?.name?.toLowerCase() || 'gear'} engineered for {tone(p.categories[0])}. Moisture-wicking, quick-dry fabric with four-way stretch and a modern athletic fit.</p>}
          <p style={{ marginTop: 10 }} className="small muted">SKU: TYK-{p.id.toString().padStart(4, '0')} · Style: {p.name}</p>
        </>
      ),
    },
    { title: 'Fabric & care', body: <><p><b>Fabric:</b> {p.fabric || (chartKey === 'shoes' ? 'Engineered mesh upper, EVA midsole, rubber outsole' : '100% polyester performance knit')}</p><p style={{ marginTop: 8 }}>Machine wash cold with like colours. Do not bleach. Do not tumble dry. Do not iron on print. Wash inside out to protect sublimation.</p></> },
    { title: 'Shipping & returns', body: <><p>Dispatched within 24–48 hours. Free shipping above ₹999. Delivery in 2–4 working days for metros, 4–7 days elsewhere.</p><p style={{ marginTop: 8 }}>7-day easy returns and free size exchanges. <Link to="/policies/shipping-returns" className="btn btn--link">Read the full policy</Link></p></> },
  ]

  return (
    <div className="pdp-page">
      <div className="container">
        <div className="page-head" style={{ paddingBottom: 0 }}>
          <Crumbs items={[cat ? { label: cat.categoryName, to: `/c/${cat.category}` } : { label: 'Shop', to: '/shop' }, cat ? { label: cat.name, to: `/c/${cat.category}/${cat.slug}` } : null, { label: p.name }].filter(Boolean)} />
        </div>
        <div className="pdp">
          <div className="gallery">
            <div className="gallery__thumbs">
              {gallery.map((g, i) => (
                <button key={g} className={cx('gallery__thumb', i === img && 'active')} onClick={() => setImg(i)} aria-label={`Image ${i + 1}`}><img src={g} alt="" loading="lazy" /></button>
              ))}
            </div>
            <div className="gallery__main" onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--zx', ((e.clientX - r.left) / r.width) * 100 + '%'); e.currentTarget.style.setProperty('--zy', ((e.clientY - r.top) / r.height) * 100 + '%') }}>
              <img src={gallery[img] || p.image} alt={p.name} key={gallery[img]} />
              <div className="card__badges">
                {pct > 0 && <span className="badge badge--sale">-{pct}%</span>}
                {p.isNew && <span className="badge badge--new">New</span>}
              </div>
              {gallery.length > 1 && (
                <>
                  <button className="gallery__nav gallery__nav--prev" onClick={() => setImg((img - 1 + gallery.length) % gallery.length)} aria-label="Previous image"><ChevronLeft /></button>
                  <button className="gallery__nav gallery__nav--next" onClick={() => setImg((img + 1) % gallery.length)} aria-label="Next image"><ChevronRight /></button>
                </>
              )}
            </div>
          </div>

          <div className="pinfo">
            <div>
              <span className="pinfo__cat">{cat ? `${cat.categoryName} · ${cat.name}` : p.categories.join(' · ')}</span>
              <h1>{p.name}</h1>
              <div className="pinfo__meta">
                <Stars value={p.rating} />
                <span className="small"><b>{p.rating}</b> <span className="muted">({p.reviews} reviews)</span></span>
                {p.stock > 0 ? <span className="status">In stock</span> : <span className="status" style={{ background: 'var(--sale-soft)', color: 'var(--sale)' }}>Out of stock</span>}
              </div>
            </div>
            <div className="pinfo__price">
              <div className="price">
                <b>{formatPrice(p.price)}</b>
                {pct > 0 && <><s>{formatPrice(p.mrp)}</s><em>{pct}% off</em></>}
              </div>
              <div className="pinfo__tax">Inclusive of all taxes · Free shipping above ₹999</div>
            </div>

            {p.colors.length > 0 && (
              <div className="opt">
                <div className="opt__head"><b>Colour: <span>{color}</span></b></div>
                <div className="colors">
                  {p.colors.map((c) => (
                    <button key={c.name} className={cx('color', color === c.name && 'active')} onClick={() => setColor(c.name)} title={c.name} aria-label={c.name}><i style={{ background: c.hex }} /></button>
                  ))}
                </div>
              </div>
            )}

            {p.sizes.length > 0 && (
              <div className="opt">
                <div className="opt__head"><b>Size{size ? `: ` : ''}<span>{size?.replace('UK-', 'UK ')}</span></b><button onClick={() => setChart(true)}>Size guide</button></div>
                <div className="sizes">
                  {sortSizes(p.sizes).map((s) => <button key={s} className={cx('size', size === s && 'active')} onClick={() => { setSize(s); setErr('') }}>{s.replace('UK-', 'UK ')}</button>)}
                </div>
                {err && <span className="opt__error">{err}</span>}
              </div>
            )}

            <div className="buy">
              <Qty value={qty} onChange={setQtyV} />
              <button className="btn btn--primary btn--lg" onClick={add} disabled={p.stock === 0}>Add to bag · {formatPrice(p.price * qty)}</button>
              <button className={cx('icon-btn', wished && 'on')} onClick={() => toggleWish(p.slug, p.name)} aria-label="Wishlist">{wished ? <HeartFill /> : <Heart />}</button>
            </div>
            <button className="btn btn--accent btn--lg btn--block" onClick={buyNow} disabled={p.stock === 0}><Zap width={18} height={18} /> Buy it now</button>

            <div className="pinfo__delivery">
              <form onSubmit={checkPin}>
                <input className="input" placeholder="Enter pincode" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" aria-label="Pincode" />
                <button className="btn btn--sm btn--outline" style={{ height: 40 }}>Check</button>
              </form>
              {pinMsg && <div><MapPin /> <span>{pinMsg}</span></div>}
              <div><Truck /> <span>Order in the next few hours for dispatch tomorrow. Expected by <b>{deliveryDate(5)}</b>.</span></div>
              <div><Refresh /> <span>7-day easy returns & free size exchange</span></div>
              <div><Shield /> <span>Made in our own unit · Bulk rates from 11 pieces</span></div>
            </div>

            <Accordion items={details} />

            <div className="pinfo__trust">
              <span><Check /> Made in Bihar, India</span>
              <span><Check /> Custom logo & numbering</span>
              <span><Check /> Colour-fast sublimation</span>
            </div>
          </div>
        </div>

        <section className="section">
          <div className="sec-head"><div><span className="eyebrow">What athletes say</span><h2>Reviews</h2></div></div>
          <div className="reviews">
            <div className="reviews__summary">
              <div className="big">{p.rating}</div>
              <Stars value={p.rating} size={20} />
              <p className="small muted" style={{ marginTop: 6 }}>Based on {p.reviews} verified reviews</p>
              <div style={{ marginTop: 16, textAlign: 'left' }}>
                {dist.map(([s, v]) => <div className="rbar" key={s}><span>{s}★</span><i style={{ '--w': Math.round((v / distTotal) * 100) + '%' }} /><span>{Math.round((v / distTotal) * 100)}%</span></div>)}
              </div>
              <button className="btn btn--outline btn--sm" style={{ marginTop: 18 }} onClick={() => toast('Thanks! Reviews open after a verified purchase.')}>Write a review</button>
            </div>
            <div>
              {reviews.map((r, i) => (
                <div className="review" key={i}>
                  <div className="review__head"><span className="avatar">{r.name[0]}</span><b>{r.name}</b><span>· Verified buyer · {r.when}</span><Stars value={r.rating} size={14} /></div>
                  <p>{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {rel.length > 0 && (
          <section className="section" style={{ paddingTop: 0 }}>
            <Rail items={rel} eyebrow="Complete the kit" title="You may also like" to={cat ? `/c/${cat.category}/${cat.slug}` : '/shop'} />
          </section>
        )}
      </div>

      <div className="buybar">
        <div className="price"><b>{formatPrice(p.price * qty)}</b>{pct > 0 && <s>{formatPrice(p.mrp * qty)}</s>}</div>
        <button className="btn btn--primary" onClick={add} disabled={p.stock === 0}>Add to bag</button>
      </div>

      {chart && (
        <Modal title="Size guide" onClose={() => setChart(false)}>
          <SizeTable chart={SIZE_CHART[chartKey]} />
          <p className="small muted" style={{ marginTop: 14 }}>Measurements are body measurements in {SIZE_CHART[chartKey].unit}. If you are between sizes, size up for a relaxed fit.</p>
        </Modal>
      )}
    </div>
  )
}

export function SizeTable({ chart }) {
  return (
    <table className="chart">
      <thead><tr>{chart.cols.map((c) => <th key={c}>{c}</th>)}</tr></thead>
      <tbody>{chart.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
    </table>
  )
}
