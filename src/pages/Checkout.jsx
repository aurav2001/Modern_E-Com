import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { formatPrice, cx } from '../lib/utils'
import { getSettings } from '../lib/db'

const COD_FEE = getSettings().codFee
import { OrderSummary } from './Cart'
import { Crumbs } from '../components/Shared'
import { CreditCard, Wallet, Cash, Lock, Plus, Trash } from '../components/Icons'

const STATES = ['Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal']
const empty = { name: '', phone: '', email: '', line1: '', line2: '', city: '', state: 'Uttar Pradesh', pincode: '', type: 'Home' }

export default function Checkout() {
  const { cart, totals, user, addresses, addAddress, removeAddress, placeOrder, toast } = useStore()
  const nav = useNavigate()
  const [selected, setSelected] = useState(addresses[0]?.id || null)
  const [adding, setAdding] = useState(addresses.length === 0)
  const [form, setForm] = useState({ ...empty, name: user?.name || '', email: user?.email || '', phone: user?.phone || '' })
  const [errors, setErrors] = useState({})
  const [payment, setPayment] = useState('upi')
  const [upi, setUpi] = useState('')
  const [card, setCard] = useState({ num: '', name: '', exp: '', cvv: '' })
  const [placing, setPlacing] = useState(false)

  useEffect(() => { if (cart.length === 0 && !placing) nav('/cart', { replace: true }) }, [cart.length, nav, placing])

  const setF = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const validateAddr = () => {
    const er = {}
    if (form.name.trim().length < 2) er.name = 'Enter your full name'
    if (!/^[6-9]\d{9}$/.test(form.phone)) er.phone = 'Enter a valid 10-digit mobile number'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) er.email = 'Enter a valid email'
    if (form.line1.trim().length < 4) er.line1 = 'Enter your street address'
    if (form.city.trim().length < 2) er.city = 'Enter your city'
    if (!/^\d{6}$/.test(form.pincode)) er.pincode = 'Enter a 6-digit pincode'
    setErrors(er)
    return Object.keys(er).length === 0
  }
  const saveAddress = (e) => {
    e.preventDefault()
    if (!validateAddr()) return
    const id = Math.random().toString(36).slice(2, 8).toUpperCase()
    addAddress({ ...form, id })
    setSelected(id); setAdding(false)
    toast('Address saved')
  }

  const codFee = payment === 'cod' ? COD_FEE : 0
  const submit = async () => {
    let address = addresses.find((a) => a.id === selected)
    if (!address) {
      if (adding && validateAddr()) { address = { ...form, id: 'tmp' }; addAddress(address) }
      else return toast('Please add a delivery address', { tone: 'error' })
    }
    if (payment === 'upi' && !/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(upi)) return toast('Enter a valid UPI ID (e.g. name@upi)', { tone: 'error' })
    if (payment === 'card') {
      if (card.num.replace(/\s/g, '').length !== 16) return toast('Enter a valid 16-digit card number', { tone: 'error' })
      if (!/^\d{2}\/\d{2}$/.test(card.exp)) return toast('Enter expiry as MM/YY', { tone: 'error' })
      if (!/^\d{3}$/.test(card.cvv)) return toast('Enter a valid CVV', { tone: 'error' })
    }
    setPlacing(true)
    await new Promise((r) => setTimeout(r, 1400))
    const order = placeOrder({ address, payment })
    nav(`/order/${order.id}`, { replace: true, state: { fresh: true } })
  }

  if (cart.length === 0) return null

  return (
    <div className="container">
      <div className="page-head">
        <Crumbs items={[{ label: 'Bag', to: '/cart' }, { label: 'Checkout' }]} />
        <h1>Checkout</h1>
      </div>
      <div className="checkout">
        <div>
          <div className="steps">
            <span className="done" data-n="1">Bag</span><i />
            <span className="active" data-n="2">Address & payment</span><i />
            <span data-n="3">Done</span>
          </div>

          {!user && <div className="alert alert--info" style={{ marginBottom: 18 }}>Have an account? <Link to="/login?next=/checkout" style={{ fontWeight: 700, textDecoration: 'underline' }}>Log in</Link> for faster checkout and order tracking. You can also continue as a guest.</div>}

          <div className="block">
            <h3>Delivery address {addresses.length > 0 && !adding && <button className="btn btn--sm btn--ghost" onClick={() => setAdding(true)}><Plus width={16} height={16} /> New address</button>}</h3>
            {addresses.length > 0 && (
              <div className="addr-list">
                {addresses.map((a) => (
                  <label key={a.id} className={cx('addr', selected === a.id && !adding && 'active')} onClick={() => { setSelected(a.id); setAdding(false) }}>
                    <input type="radio" name="addr" checked={selected === a.id && !adding} onChange={() => {}} />
                    <div>
                      <b>{a.name} <span className="badge" style={{ background: 'var(--bg-2)', marginLeft: 6 }}>{a.type}</span></b>
                      <span>{a.line1}{a.line2 ? `, ${a.line2}` : ''}, {a.city}, {a.state} – {a.pincode}</span><br />
                      <span>{a.phone} · {a.email}</span>
                      <div style={{ marginTop: 6 }}><button className="line__remove" onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeAddress(a.id); if (selected === a.id) setSelected(addresses.find((x) => x.id !== a.id)?.id || null) }}><Trash width={13} height={13} style={{ verticalAlign: -2 }} /> Remove</button></div>
                    </div>
                  </label>
                ))}
              </div>
            )}
            {adding && (
              <form className="form-grid" onSubmit={saveAddress} noValidate>
                <Field label="Full name" error={errors.name}><input className={cx('input', errors.name && 'is-error')} value={form.name} onChange={setF('name')} autoComplete="name" /></Field>
                <Field label="Mobile number" error={errors.phone}><input className={cx('input', errors.phone && 'is-error')} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} inputMode="numeric" autoComplete="tel" /></Field>
                <Field label="Email" error={errors.email} className="span-2"><input className={cx('input', errors.email && 'is-error')} type="email" value={form.email} onChange={setF('email')} autoComplete="email" /></Field>
                <Field label="Flat / house no., building, street" error={errors.line1} className="span-2"><input className={cx('input', errors.line1 && 'is-error')} value={form.line1} onChange={setF('line1')} autoComplete="address-line1" /></Field>
                <Field label="Area, landmark (optional)" className="span-2"><input className="input" value={form.line2} onChange={setF('line2')} autoComplete="address-line2" /></Field>
                <Field label="Pincode" error={errors.pincode}><input className={cx('input', errors.pincode && 'is-error')} value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })} inputMode="numeric" autoComplete="postal-code" /></Field>
                <Field label="City" error={errors.city}><input className={cx('input', errors.city && 'is-error')} value={form.city} onChange={setF('city')} autoComplete="address-level2" /></Field>
                <Field label="State"><select className="select" value={form.state} onChange={setF('state')}>{STATES.map((s) => <option key={s}>{s}</option>)}</select></Field>
                <Field label="Address type"><div className="tabs">{['Home', 'Work', 'Other'].map((t) => <button type="button" key={t} className={cx('tab', form.type === t && 'active')} onClick={() => setForm({ ...form, type: t })}>{t}</button>)}</div></Field>
                <div className="span-2" style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn--primary">Save address</button>
                  {addresses.length > 0 && <button type="button" className="btn btn--ghost" onClick={() => setAdding(false)}>Cancel</button>}
                </div>
              </form>
            )}
          </div>

          <div className="block">
            <h3>Payment method</h3>
            <div className="pay-opts">
              <PayOpt id="upi" icon={<Wallet />} title="UPI" text="Google Pay, PhonePe, Paytm, BHIM" payment={payment} setPayment={setPayment}>
                <input className="input" placeholder="yourname@upi" value={upi} onChange={(e) => setUpi(e.target.value)} aria-label="UPI ID" />
              </PayOpt>
              <PayOpt id="card" icon={<CreditCard />} title="Credit / Debit card" text="Visa, Mastercard, RuPay, Amex" payment={payment} setPayment={setPayment}>
                <div className="form-grid">
                  <div className="span-2"><input className="input" placeholder="Card number" value={card.num} onChange={(e) => setCard({ ...card, num: e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ') })} inputMode="numeric" aria-label="Card number" /></div>
                  <div className="span-2"><input className="input" placeholder="Name on card" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} aria-label="Name on card" /></div>
                  <input className="input" placeholder="MM/YY" value={card.exp} onChange={(e) => setCard({ ...card, exp: e.target.value.replace(/\D/g, '').slice(0, 4).replace(/(\d{2})(?=\d)/, '$1/') })} inputMode="numeric" aria-label="Expiry" />
                  <input className="input" placeholder="CVV" type="password" value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })} inputMode="numeric" aria-label="CVV" />
                </div>
              </PayOpt>
              <PayOpt id="cod" icon={<Cash />} title="Cash on delivery" text={`Pay when it arrives · ₹${COD_FEE} handling fee`} payment={payment} setPayment={setPayment} />
            </div>
            <p className="small muted" style={{ marginTop: 14, display: 'flex', gap: 6, alignItems: 'center' }}><Lock width={14} height={14} /> This is a demo store — no real payment is taken.</p>
          </div>
        </div>

        <div>
          <div className="summary" style={{ marginBottom: 16 }}>
            <h3>Items ({totals.count})</h3>
            <div className="mini-lines">
              {cart.map((l) => (
                <div className="mini-line" key={l.key}>
                  <img src={l.image} alt="" />
                  <div><b>{l.name}</b><span>{[l.color, l.size?.replace('UK-', 'UK ')].filter(Boolean).join(' · ')} · Qty {l.qty}</span></div>
                  <b>{formatPrice(l.price * l.qty)}</b>
                </div>
              ))}
            </div>
            <Link to="/cart" className="btn btn--link small">Edit bag</Link>
          </div>
          <OrderSummary cta onCta={submit} ctaLabel={placing ? 'Placing order…' : `Place order · ${formatPrice(totals.total + codFee)}`} extra={codFee} extraLabel="COD handling fee" />
        </div>
      </div>
    </div>
  )
}

function Field({ label, error, className, children }) {
  return <div className={cx('field', className)}><label>{label}</label>{children}{error && <span className="field__error">{error}</span>}</div>
}

function PayOpt({ id, icon, title, text, payment, setPayment, children }) {
  const active = payment === id
  return (
    <div>
      <label className={cx('pay', active && 'active')} onClick={() => setPayment(id)}>
        <input type="radio" name="pay" checked={active} onChange={() => setPayment(id)} />
        <div><b>{title}</b><span>{text}</span></div>
        {icon}
      </label>
      {active && children && <div className="pay__extra">{children}</div>}
    </div>
  )
}
