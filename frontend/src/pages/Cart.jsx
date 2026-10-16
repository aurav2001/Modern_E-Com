import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { formatPrice } from '../lib/utils'
import { getCoupons, getSettings } from '../lib/db'

const COUPONS = getCoupons()
const FREE_SHIP_ABOVE = getSettings().freeShipAbove
import { Crumbs, Qty, Rail } from '../components/Shared'
import { Bag, Lock, Heart } from '../components/Icons'
import { bestSellers, PRODUCTS } from '../lib/catalog'

export function OrderSummary({ cta, onCta, ctaLabel, extra = 0, extraLabel }) {
  const { totals, coupon, applyCoupon, removeCoupon } = useStore()
  const [code, setCode] = useState('')
  const grand = totals.total + extra
  return (
    <aside className="summary">
      <h3>Order summary</h3>
      <div className="summary-row"><span>Subtotal ({totals.count} item{totals.count === 1 ? '' : 's'})</span><span>{formatPrice(totals.mrpTotal)}</span></div>
      {totals.mrpTotal > totals.subtotal && <div className="summary-row"><span>MRP discount</span><span className="green">−{formatPrice(totals.mrpTotal - totals.subtotal)}</span></div>}
      {totals.discount > 0 && <div className="summary-row"><span>Coupon ({coupon})</span><span className="green">−{formatPrice(totals.discount)}</span></div>}
      <div className="summary-row"><span>Shipping</span><span className={totals.shipping === 0 ? 'green' : ''}>{totals.shipping === 0 ? 'Free' : formatPrice(totals.shipping)}</span></div>
      {extra > 0 && <div className="summary-row"><span>{extraLabel}</span><span>{formatPrice(extra)}</span></div>}
      <div className="summary-row total"><span>Total</span><span>{formatPrice(grand)}</span></div>
      {totals.shipping > 0 && <p className="small muted" style={{ marginTop: 6 }}>Add {formatPrice(FREE_SHIP_ABOVE - totals.subtotal + totals.discount)} more for free shipping.</p>}

      {coupon && !totals.couponError ? (
        <div className="coupon-applied"><span>✓ {coupon} applied — {COUPONS[coupon].label}</span><button onClick={removeCoupon}>Remove</button></div>
      ) : (
        <>
          {coupon && totals.couponError && <div className="alert alert--error" style={{ margin: '12px 0 0' }}>{totals.couponError}</div>}
          <form className="coupon" onSubmit={(e) => { e.preventDefault(); if (applyCoupon(code)) setCode('') }}>
            <input className="input" placeholder="Coupon code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} aria-label="Coupon code" />
            <button className="btn btn--outline btn--sm">Apply</button>
          </form>
          <div className="coupon-hint">Try: {Object.keys(COUPONS).map((c) => <code key={c} onClick={() => setCode(c)}>{c}</code>)}</div>
        </>
      )}

      {cta && <button className="btn btn--primary btn--lg btn--block" onClick={onCta}>{ctaLabel || `Checkout · ${formatPrice(grand)}`}</button>}
      <div className="summary__secure"><Lock /> Secure 256-bit encrypted checkout</div>
    </aside>
  )
}

export default function Cart() {
  const { cart, setQty, removeLine, totals, toggleWish, isWished } = useStore()
  const nav = useNavigate()
  const recs = bestSellers(8).filter((p) => !cart.some((l) => l.slug === p.slug))

  return (
    <div className="container">
      <div className="page-head">
        <Crumbs items={[{ label: 'Bag' }]} />
        <h1>Your bag {totals.count > 0 && <span className="muted" style={{ fontSize: '0.5em' }}>({totals.count})</span>}</h1>
      </div>
      {cart.length === 0 ? (
        <div className="empty" style={{ paddingTop: 30 }}>
          <Bag width={56} height={56} style={{ margin: '0 auto 14px', color: 'var(--line-2)' }} />
          <h3>Your bag is empty</h3>
          <p>Looks like you have not added anything yet.</p>
          <Link to="/shop" className="btn btn--primary" style={{ marginTop: 18 }}>Continue shopping</Link>
        </div>
      ) : (
        <div className="cart-page">
          <div>
            {cart.map((l) => {
              const p = PRODUCTS.find((x) => x.slug === l.slug)
              return (
                <div className="line" key={l.key}>
                  <Link to={`/product/${l.slug}`}><img src={l.image} alt="" /></Link>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                      <div>
                        <Link to={`/product/${l.slug}`} className="line__name">{l.name}</Link>
                        <div className="line__meta">{[l.color, l.size && `Size ${l.size.replace('UK-', 'UK ')}`].filter(Boolean).join(' · ')}</div>
                        {p?.stock > 0 && p.stock <= 5 && <div className="small" style={{ color: 'var(--warn)', marginTop: 4 }}>Only {p.stock} left</div>}
                      </div>
                      <div className="price" style={{ flexDirection: 'column', alignItems: 'flex-end', gap: 0 }}>
                        <b>{formatPrice(l.price * l.qty)}</b>
                        {l.mrp > l.price && <s>{formatPrice(l.mrp * l.qty)}</s>}
                      </div>
                    </div>
                    <div className="line__row">
                      <Qty small value={l.qty} onChange={(q) => setQty(l.key, q)} />
                      <div style={{ display: 'flex', gap: 14 }}>
                        <button className="line__remove" onClick={() => { if (!isWished(l.slug)) toggleWish(l.slug, l.name); removeLine(l.key) }}>Move to wishlist</button>
                        <button className="line__remove" onClick={() => removeLine(l.key)}>Remove</button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18 }}>
              <Link to="/shop" className="btn btn--ghost">← Continue shopping</Link>
            </div>
          </div>
          <OrderSummary cta onCta={() => nav('/checkout')} />
        </div>
      )}
      {recs.length > 0 && (
        <section className="section">
          <Rail items={recs} eyebrow="Pairs well with" title="Recommended for you" to="/shop" />
        </section>
      )}
    </div>
  )
}
