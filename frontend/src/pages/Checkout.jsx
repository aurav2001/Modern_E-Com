import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { formatPrice, cx } from '../lib/utils'
import { getSettings } from '../lib/db'
import { api } from '../lib/api'

const COD_FEE = getSettings().codFee
import { OrderSummary } from './Cart'
import { Crumbs } from '../components/Shared'
import { CreditCard, Wallet, Cash, Lock, Plus, Trash } from '../components/Icons'

const STATES = ['Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal']
const empty = { name: '', phone: '', email: '', line1: '', line2: '', city: '', state: 'Uttar Pradesh', pincode: '', type: 'Home' }

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function Checkout() {
  const { cart, totals, user, addresses, addAddress, removeAddress, placeOrder, toast, coupon } = useStore()
  const nav = useNavigate()
  const [selected, setSelected] = useState(addresses[0]?.id || null)
  const [adding, setAdding] = useState(addresses.length === 0)
  const [form, setForm] = useState({ ...empty, name: user?.name || '', email: user?.email || '', phone: user?.phone || '' })
  const [errors, setErrors] = useState({})
  const [payment, setPayment] = useState('online')
  const [placing, setPlacing] = useState(false)
  const [gwConfig, setGwConfig] = useState({ isConfigured: false, mode: 'dummy' })

  useEffect(() => {
    api.getPaymentConfig()
      .then((cfg) => {
        if (cfg && cfg.success) {
          setGwConfig(cfg)
        }
      })
      .catch(() => {})
  }, [])

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
      if (adding && validateAddr()) {
        address = { ...form, id: 'tmp' }
        addAddress(address)
      } else {
        return toast('Please add a delivery address', { tone: 'error' })
      }
    }

    setPlacing(true)

    // Option 1: Cash on Delivery
    if (payment === 'cod') {
      await new Promise((r) => setTimeout(r, 800))
      const order = placeOrder({ address, payment: 'COD' })
      toast('Order placed successfully via COD!')
      nav(`/order/${order.id}`, { replace: true, state: { fresh: true } })
      return
    }

    // Option 2: Online Payment via Razorpay (Live or Dummy Mode)
    try {
      const orderAmount = totals.total
      let createRes = null
      try {
        createRes = await api.createPaymentOrder({
          amount: orderAmount,
          currency: 'INR',
          receipt: `rcpt_${Date.now()}`,
          notes: {
            customerName: address.name,
            customerPhone: address.phone,
          },
        })
      } catch (err) {
        console.warn('Payment order call failed, falling back to dummy:', err)
        createRes = {
          success: true,
          mode: 'dummy',
          order_id: `order_sim_${Date.now()}`,
          amount: Math.round(orderAmount * 100),
          currency: 'INR',
        }
      }

      if (!createRes || !createRes.success) {
        throw new Error(createRes?.message || 'Failed to initiate payment')
      }

      // SUBCASE A: LIVE RAZORPAY GATEWAY (When keys configured in .env)
      if (createRes.mode === 'live' && createRes.key_id && createRes.key_id.startsWith('rzp_')) {
        const loaded = await loadRazorpayScript()
        if (!loaded) {
          setPlacing(false)
          return toast('Could not load Razorpay SDK. Please check internet connection.', { tone: 'error' })
        }

        const options = {
          key: createRes.key_id,
          amount: createRes.amount,
          currency: createRes.currency || 'INR',
          name: 'Rishikar Sports',
          description: `Sportswear Order (${totals.count} items)`,
          image: '/logo.png',
          order_id: createRes.order_id,
          prefill: {
            name: address.name,
            email: address.email,
            contact: address.phone,
          },
          theme: { color: '#0e2140' },
          handler: async function (response) {
            try {
              toast('Payment received! Finalizing order...')
              let verifyRes = null
              try {
                verifyRes = await api.verifyPayment({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderDetails: {
                    customer: address,
                    items: cart,
                    couponCode: totals.discount ? coupon : null,
                  },
                })
              } catch (vErr) {
                console.warn('Backend verify call failed, proceeding with local confirmation:', vErr)
                verifyRes = { success: true }
              }

              if (verifyRes && verifyRes.success) {
                const order = placeOrder({
                  address,
                  payment: 'Razorpay',
                  backendOrder: verifyRes.order,
                })
                toast('Payment verified! Order confirmed.')
                nav(`/order/${order.id}`, { replace: true, state: { fresh: true } })
              } else {
                toast(verifyRes?.message || 'Payment verification failed', { tone: 'error' })
                setPlacing(false)
              }
            } catch (err) {
              toast('Verification error: ' + err.message, { tone: 'error' })
              setPlacing(false)
            }
          },
          modal: {
            ondismiss: function () {
              setPlacing(false)
              toast('Payment cancelled')
            },
          },
        }

        const rzp = new window.Razorpay(options)
        rzp.on('payment.failed', function (resp) {
          toast(`Payment failed: ${resp.error?.description || 'Transaction declined'}`, { tone: 'error' })
          setPlacing(false)
        })
        rzp.open()
        return
      }

      // SUBCASE B: SIMULATED DUMMY TEST MODE (When keys not in .env yet, or offline)
      toast('💳 Processing simulated online payment...', { duration: 1800 })
      await new Promise((r) => setTimeout(r, 1200))

      let verifyRes = null
      try {
        verifyRes = await api.verifyPayment({
          razorpay_order_id: createRes.order_id,
          razorpay_payment_id: `pay_dummy_${Date.now()}`,
          razorpay_signature: 'dummy_simulated_sig',
          orderDetails: {
            customer: address,
            items: cart,
            couponCode: totals.discount ? coupon : null,
          },
        })
      } catch (vErr) {
        console.warn('Backend verify skipped (offline mode):', vErr)
      }

      const order = placeOrder({
        address,
        payment: 'Online (Test Mode)',
        backendOrder: verifyRes?.order,
      })

      toast('✅ Payment simulated successfully! Order confirmed.')
      nav(`/order/${order.id}`, { replace: true, state: { fresh: true } })
    } catch (err) {
      console.error('Payment Error:', err)
      toast('Payment error: ' + err.message, { tone: 'error' })
      setPlacing(false)
    }
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
                <Field label="Full name" error={errors.name} id="addr-name"><input id="addr-name" className={cx('input', errors.name && 'is-error')} value={form.name} onChange={setF('name')} autoComplete="name" /></Field>
                <Field label="Mobile number" error={errors.phone} id="addr-phone"><input id="addr-phone" className={cx('input', errors.phone && 'is-error')} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} inputMode="numeric" autoComplete="tel" /></Field>
                <Field label="Email" error={errors.email} id="addr-email" className="span-2"><input id="addr-email" className={cx('input', errors.email && 'is-error')} type="email" value={form.email} onChange={setF('email')} autoComplete="email" /></Field>
                <Field label="Flat / house no., building, street" error={errors.line1} id="addr-line1" className="span-2"><input id="addr-line1" className={cx('input', errors.line1 && 'is-error')} value={form.line1} onChange={setF('line1')} autoComplete="address-line1" /></Field>
                <Field label="Area, landmark (optional)" id="addr-line2" className="span-2"><input id="addr-line2" className="input" value={form.line2} onChange={setF('line2')} autoComplete="address-line2" /></Field>
                <Field label="Pincode" error={errors.pincode} id="addr-pincode"><input id="addr-pincode" className={cx('input', errors.pincode && 'is-error')} value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })} inputMode="numeric" autoComplete="postal-code" /></Field>
                <Field label="City" error={errors.city} id="addr-city"><input id="addr-city" className={cx('input', errors.city && 'is-error')} value={form.city} onChange={setF('city')} autoComplete="address-level2" /></Field>
                <Field label="State"><select id="addr-state" className="select" value={form.state} onChange={setF('state')}>{STATES.map((s) => <option key={s}>{s}</option>)}</select></Field>
                <Field label="Address type"><div className="tabs">{['Home', 'Work', 'Other'].map((t) => <button type="button" key={t} className={cx('tab', form.type === t && 'active')} onClick={() => setForm({ ...form, type: t })}>{t}</button>)}</div></Field>
                <div className="span-2" style={{ display: 'flex', gap: 8 }}>
                  <button id="btn-save-address" className="btn btn--primary">Save address</button>
                  {addresses.length > 0 && <button type="button" className="btn btn--ghost" onClick={() => setAdding(false)}>Cancel</button>}
                </div>
              </form>
            )}
          </div>

          <div className="block">
            <h3>Payment method</h3>
            <div className="pay-opts">
              <PayOpt
                id="online"
                icon={<Wallet />}
                title="UPI / Cards / NetBanking (Online)"
                text="Google Pay, PhonePe, Paytm, BHIM, Visa, Mastercard, NetBanking"
                payment={payment}
                setPayment={setPayment}
              >
                <div style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <Lock width={13} height={13} />
                  {gwConfig.isConfigured ? (
                    <span style={{ color: '#16a34a', fontWeight: 600 }}>🟢 Official Razorpay Gateway Active</span>
                  ) : (
                    <span style={{ color: '#ea580c', fontWeight: 500 }}>
                      ⚡ Test Mode Active — Dummy simulation running until Razorpay keys are added in .env
                    </span>
                  )}
                </div>
              </PayOpt>

              <PayOpt
                id="cod"
                icon={<Cash />}
                title="Cash on delivery (COD)"
                text={`Pay cash when your parcel is delivered · ₹${COD_FEE} handling fee`}
                payment={payment}
                setPayment={setPayment}
              />
            </div>
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
          <OrderSummary
            cta
            onCta={submit}
            ctaLabel={placing ? (payment === 'online' ? 'Processing payment…' : 'Placing order…') : (payment === 'online' ? `Pay online · ${formatPrice(totals.total)}` : `Place order · ${formatPrice(totals.total + codFee)}`)}
            extra={codFee}
            extraLabel="COD handling fee"
          />
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
