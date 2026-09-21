import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useStore } from '../context/StoreContext'

const P = 'https://tyka.premierhostings.com/backend/storage/products/'
const IMGS = [P + 'elite-women-black-3.webp', P + 'TYKA-Shoe-Strike320L-WhiteBlue-L.webp']

export function Login() {
  const { login } = useStore()
  const nav = useNavigate()
  const [sp] = useSearchParams()
  const [f, setF] = useState({ email: '', password: '' })
  const [err, setErr] = useState('')
  const submit = (e) => {
    e.preventDefault()
    const er = login(f.email, f.password)
    if (er) return setErr(er)
    nav(sp.get('next') || '/account')
  }
  return (
    <AuthShell title="Welcome back" sub="Log in to track orders, save addresses and check out faster.">
      <form onSubmit={submit}>
        {err && <div className="alert alert--error">{err}</div>}
        <div className="field"><label>Email</label><input className="input" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" /></div>
        <div className="field"><label>Password</label><input className="input" type="password" required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} autoComplete="current-password" /></div>
        <button className="btn btn--primary btn--lg btn--block">Log in</button>
      </form>
      <p className="auth__alt">New to KRIDA? <Link to={`/signup${sp.get('next') ? `?next=${sp.get('next')}` : ''}`}>Create an account</Link></p>
      <p className="auth__alt small">Demo store: accounts are stored only in this browser.</p>
    </AuthShell>
  )
}

export function Signup() {
  const { register } = useStore()
  const nav = useNavigate()
  const [sp] = useSearchParams()
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '' })
  const [err, setErr] = useState('')
  const submit = (e) => {
    e.preventDefault()
    if (f.password.length < 6) return setErr('Password must be at least 6 characters')
    if (!/^[6-9]\d{9}$/.test(f.phone)) return setErr('Enter a valid 10-digit mobile number')
    const er = register(f.name.trim(), f.email.trim(), f.password, f.phone)
    if (er) return setErr(er)
    nav(sp.get('next') || '/account')
  }
  return (
    <AuthShell title="Join the squad" sub="Create your account for order tracking, wishlists and member-only drops.">
      <form onSubmit={submit}>
        {err && <div className="alert alert--error">{err}</div>}
        <div className="field"><label>Full name</label><input className="input" required minLength={2} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" /></div>
        <div className="field"><label>Email</label><input className="input" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" /></div>
        <div className="field"><label>Mobile</label><input className="input" required inputMode="numeric" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} autoComplete="tel" /></div>
        <div className="field"><label>Password</label><input className="input" type="password" required minLength={6} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} autoComplete="new-password" /></div>
        <button className="btn btn--primary btn--lg btn--block">Create account</button>
        <p className="small muted">By continuing you agree to our <Link to="/policies/terms" style={{ textDecoration: 'underline' }}>Terms</Link> and <Link to="/policies/privacy" style={{ textDecoration: 'underline' }}>Privacy Policy</Link>.</p>
      </form>
      <p className="auth__alt">Already have an account? <Link to="/login">Log in</Link></p>
    </AuthShell>
  )
}

function AuthShell({ title, sub, children }) {
  return (
    <div className="auth">
      <div className="auth__media">
        <div className="split__stack">{IMGS.map((s) => <img key={s} src={s} alt="" />)}</div>
        <div className="cap"><span className="eyebrow" style={{ color: '#b8bcc4' }}>KRIDA</span><h2>Made for the game</h2></div>
      </div>
      <div className="auth__panel">
        <div className="auth__card">
          <h1>{title}</h1>
          <p className="muted">{sub}</p>
          {children}
        </div>
      </div>
    </div>
  )
}
