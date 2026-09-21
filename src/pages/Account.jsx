import { useState } from 'react'
import { Link, NavLink, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { formatPrice, cx, deliveryDate } from '../lib/utils'
import { Crumbs } from '../components/Shared'
import ProductCard from '../components/ProductCard'
import { PRODUCTS } from '../lib/catalog'
import { Package, User, MapPin, Heart, LogOut, Trash } from '../components/Icons'

const STAGES = ['Placed', 'Packed', 'Shipped', 'Out for delivery', 'Delivered']
const PAY = { upi: 'UPI', card: 'Card', cod: 'COD' }

// Simulate progress based on order age
const stageIndex = (o) => Math.min(STAGES.length - 1, Math.floor((Date.now() - o.placedAt) / (1000 * 60 * 60 * 18)))

export default function Account() {
  const { user, logout, orders, addresses, removeAddress, updateUser, toast, wishlist } = useStore()
  const { tab = 'dashboard' } = useParams()
  const nav = useNavigate()
  if (!user) return <Navigate to={`/login?next=/account${tab !== 'dashboard' ? '/' + tab : ''}`} replace />

  const myOrders = orders.filter((o) => !o.email || o.email === user.email)
  const wishItems = wishlist.map((s) => PRODUCTS.find((p) => p.slug === s)).filter(Boolean)

  return (
    <div className="container">
      <div className="page-head">
        <Crumbs items={[{ label: 'My account' }]} />
        <h1>My account</h1>
      </div>
      <div className="account">
        <nav className="account__nav">
          <NavLink to="/account" end><User /> Overview</NavLink>
          <NavLink to="/account/orders"><Package /> Orders {myOrders.length > 0 && `(${myOrders.length})`}</NavLink>
          <NavLink to="/account/addresses"><MapPin /> Addresses</NavLink>
          <NavLink to="/wishlist"><Heart /> Wishlist {wishlist.length > 0 && `(${wishlist.length})`}</NavLink>
          <a href="#" onClick={(e) => { e.preventDefault(); logout(); nav('/') }}><LogOut /> Log out</a>
        </nav>
        <div>
          {tab === 'dashboard' && (
            <>
              <div className="account__hello">
                <span className="avatar">{user.name[0]}</span>
                <div><b>{user.name}</b><span>{user.email} · {user.phone}</span></div>
              </div>
              <div className="values" style={{ marginBottom: 28 }}>
                <Link to="/account/orders" className="value"><Package /><b>{myOrders.length} order{myOrders.length === 1 ? '' : 's'}</b><p>View history and track deliveries</p></Link>
                <Link to="/account/addresses" className="value"><MapPin /><b>{addresses.length} address{addresses.length === 1 ? '' : 'es'}</b><p>Manage delivery addresses</p></Link>
                <Link to="/wishlist" className="value"><Heart /><b>{wishlist.length} saved</b><p>Items in your wishlist</p></Link>
              </div>
              <Profile user={user} updateUser={updateUser} toast={toast} />
              {myOrders.length > 0 && <><h3 style={{ margin: '28px 0 14px' }}>Latest order</h3><OrderCard o={myOrders[0]} /></>}
            </>
          )}
          {tab === 'orders' && (
            myOrders.length === 0 ? (
              <div className="empty"><h3>No orders yet</h3><p>When you place an order it will show up here with live tracking.</p><Link to="/shop" className="btn btn--primary" style={{ marginTop: 16 }}>Start shopping</Link></div>
            ) : myOrders.map((o) => <OrderCard key={o.id} o={o} />)
          )}
          {tab === 'addresses' && (
            addresses.length === 0 ? (
              <div className="empty"><h3>No saved addresses</h3><p>Addresses you add at checkout are saved here for next time.</p></div>
            ) : (
              <div className="addr-list">
                {addresses.map((a) => (
                  <div key={a.id} className="addr" style={{ gridTemplateColumns: '1fr auto', cursor: 'default' }}>
                    <div>
                      <b>{a.name} <span className="badge" style={{ background: 'var(--bg-2)', marginLeft: 6 }}>{a.type}</span></b>
                      <span>{a.line1}{a.line2 ? `, ${a.line2}` : ''}, {a.city}, {a.state} – {a.pincode}</span><br /><span>{a.phone}</span>
                    </div>
                    <button className="icon-btn" onClick={() => removeAddress(a.id)} aria-label="Remove"><Trash /></button>
                  </div>
                ))}
              </div>
            )
          )}
          {tab === 'wishlist' && (
            wishItems.length === 0 ? <div className="empty"><h3>Your wishlist is empty</h3></div> : <div className="grid grid--3">{wishItems.map((p) => <ProductCard key={p.slug} p={p} />)}</div>
          )}
        </div>
      </div>
    </div>
  )
}

function Profile({ user, updateUser, toast }) {
  const [f, setF] = useState({ name: user.name, phone: user.phone || '' })
  return (
    <form className="block" onSubmit={(e) => { e.preventDefault(); updateUser(f); toast('Profile updated') }}>
      <h3>Profile</h3>
      <div className="form-grid">
        <div className="field"><label>Full name</label><input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required /></div>
        <div className="field"><label>Mobile</label><input className="input" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} /></div>
        <div className="field span-2"><label>Email</label><input className="input" value={user.email} disabled /></div>
        <div><button className="btn btn--primary">Save changes</button></div>
      </div>
    </form>
  )
}

export function OrderCard({ o }) {
  const idx = stageIndex(o)
  return (
    <div className="order">
      <div className="order__head">
        <div><b>Order</b>#{o.id}</div>
        <div><b>Placed</b>{new Date(o.placedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
        <div><b>Total</b>{formatPrice(o.total)} · {PAY[o.payment]}</div>
        <div><b>Deliver to</b>{o.address.name}, {o.address.city}</div>
        <span className="status">{STAGES[idx]}</span>
      </div>
      <div className="order__items">
        {o.items.map((l) => (
          <div className="mini-line" key={l.key}>
            <Link to={`/product/${l.slug}`}><img src={l.image} alt="" /></Link>
            <div><b>{l.name}</b><span>{[l.color, l.size?.replace('UK-', 'UK ')].filter(Boolean).join(' · ')} · Qty {l.qty}</span></div>
            <b>{formatPrice(l.price * l.qty)}</b>
          </div>
        ))}
      </div>
      <div className="track">
        {STAGES.map((s, i) => <span key={s} className={cx(i <= idx && 'done')}><i />{s}</span>)}
      </div>
      {idx < STAGES.length - 1 && <p className="small muted" style={{ padding: '0 18px 16px' }}>Expected delivery by {deliveryDate(5)}.</p>}
    </div>
  )
}
