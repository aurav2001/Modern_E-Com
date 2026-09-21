import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { formatPrice } from '../lib/utils'
import { FREE_SHIP_ABOVE } from '../data/content'
import { Bag, X } from './Icons'
import { Qty } from './Shared'

export default function CartDrawer() {
  const { cart, cartOpen, setCartOpen, setQty, removeLine, totals } = useStore()
  const nav = useNavigate()
  const loc = useLocation()

  useEffect(() => setCartOpen(false), [loc.pathname, setCartOpen])
  useEffect(() => {
    document.body.classList.toggle('no-scroll', cartOpen)
    const onKey = (e) => e.key === 'Escape' && setCartOpen(false)
    window.addEventListener('keydown', onKey)
    return () => { document.body.classList.remove('no-scroll'); window.removeEventListener('keydown', onKey) }
  }, [cartOpen, setCartOpen])

  if (!cartOpen) return null
  const remaining = Math.max(0, FREE_SHIP_ABOVE - totals.subtotal)
  const pctFree = Math.min(100, Math.round((totals.subtotal / FREE_SHIP_ABOVE) * 100))

  return (
    <>
      <div className="drawer-backdrop" onClick={() => setCartOpen(false)} />
      <aside className="drawer drawer--right" aria-label="Shopping bag">
        <div className="drawer__head">
          <h3>Your bag {totals.count > 0 && <span className="muted" style={{ fontSize: 16, fontFamily: 'var(--font-body)', fontWeight: 500, textTransform: 'none' }}>({totals.count})</span>}</h3>
          <button className="icon-btn" onClick={() => setCartOpen(false)} aria-label="Close"><X /></button>
        </div>
        <div className="drawer__body">
          {cart.length === 0 ? (
            <div className="drawer__empty">
              <Bag />
              <h3>Your bag is empty</h3>
              <p className="muted" style={{ margin: '8px 0 20px' }}>Add some gear and rise beyond reach.</p>
              <Link to="/shop" className="btn btn--primary" onClick={() => setCartOpen(false)}>Start shopping</Link>
            </div>
          ) : (
            <>
              <div className="freeship">
                {remaining > 0 ? <>Add <b>{formatPrice(remaining)}</b> more for <b>free shipping</b></> : <><b>🎉 You've unlocked free shipping</b></>}
                <i style={{ '--w': pctFree + '%' }} />
              </div>
              {cart.map((l) => (
                <div className="line" key={l.key}>
                  <Link to={`/product/${l.slug}`}><img src={l.image} alt="" /></Link>
                  <div>
                    <Link to={`/product/${l.slug}`} className="line__name">{l.name}</Link>
                    <div className="line__meta">{[l.color, l.size && l.size.replace('UK-', 'UK ')].filter(Boolean).join(' · ')}</div>
                    <div className="line__row">
                      <Qty small value={l.qty} onChange={(q) => setQty(l.key, q)} />
                      <b>{formatPrice(l.price * l.qty)}</b>
                    </div>
                    <div className="line__row" style={{ marginTop: 6 }}>
                      <button className="line__remove" onClick={() => removeLine(l.key)}>Remove</button>
                      {l.mrp > l.price && <span className="small" style={{ color: 'var(--success)' }}>You save {formatPrice((l.mrp - l.price) * l.qty)}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
        {cart.length > 0 && (
          <div className="drawer__foot">
            <div className="summary-row"><span>Subtotal</span><b>{formatPrice(totals.subtotal)}</b></div>
            {totals.discount > 0 && <div className="summary-row"><span>Coupon</span><span className="green">−{formatPrice(totals.discount)}</span></div>}
            <p className="small muted" style={{ margin: '4px 0 14px' }}>Shipping and taxes calculated at checkout.</p>
            <button className="btn btn--primary btn--lg btn--block" onClick={() => { setCartOpen(false); nav('/checkout') }}>Checkout · {formatPrice(totals.total)}</button>
            <Link to="/cart" className="btn btn--ghost btn--block" style={{ marginTop: 8 }} onClick={() => setCartOpen(false)}>View bag</Link>
          </div>
        )}
      </aside>
    </>
  )
}
