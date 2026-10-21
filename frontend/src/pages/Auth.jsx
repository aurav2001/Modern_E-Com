import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff, ShieldCheck } from '../components/Icons'

const IMGS = [
  { src: '/products/polo.png', pill: '🏆 Sublimation Matchwear' },
  { src: '/products/bag.png', pill: '⚡ Squad Kitbag' },
]

export function Login() {
  const { login } = useStore()
  const nav = useNavigate()
  const [sp] = useSearchParams()
  const [f, setF] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(true)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErr('')
    const er = await login(f.email, f.password)
    setLoading(false)
    if (er) return setErr(er)
    nav(sp.get('next') || '/account')
  }

  return (
    <AuthShell
      title="Welcome Back"
      sub="Sign in to track orders, manage addresses and access exclusive teamwear pricing."
    >
      <form onSubmit={submit}>
        {err && <div className="alert alert--error">{err}</div>}

        <div className="auth-field">
          <label>Email Address</label>
          <div className="auth-input-group">
            <span className="auth-input-icon"><Mail /></span>
            <input
              className="auth-input-field"
              type="email"
              required
              placeholder="e.g. coach@club.com"
              value={f.email}
              onChange={(e) => setF({ ...f, email: e.target.value })}
              autoComplete="email"
            />
          </div>
        </div>

        <div className="auth-field">
          <label>Password</label>
          <div className="auth-input-group">
            <span className="auth-input-icon"><Lock /></span>
            <input
              className="auth-input-field"
              type={showPass ? 'text' : 'password'}
              required
              placeholder="Enter your password"
              value={f.password}
              onChange={(e) => setF({ ...f, password: e.target.value })}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="auth-input-toggle"
              onClick={() => setShowPass(!showPass)}
              title={showPass ? 'Hide password' : 'Show password'}
            >
              {showPass ? <EyeOff /> : <Eye />}
            </button>
          </div>
        </div>

        <div className="auth__meta-row">
          <label>
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span>Remember me</span>
          </label>
          <a
            href="#forgot"
            onClick={(e) => {
              e.preventDefault()
              alert('To reset your password, please contact Rishikar Sports support via WhatsApp or email with your registered email.')
            }}
          >
            Forgot password?
          </a>
        </div>

        <button type="submit" className="auth-submit-btn" disabled={loading}>
          {loading ? 'Signing in…' : <><span>Log In</span><ArrowRight width={16} height={16} /></>}
        </button>
      </form>

      <p className="auth__alt">
        New to Rishikar Sports?{' '}
        <Link to={`/signup${sp.get('next') ? `?next=${sp.get('next')}` : ''}`}>
          Create an account
        </Link>
      </p>

      <div className="auth__trust">
        <ShieldCheck />
        <span>256-bit SSL Encrypted · Official Rishikar Store</span>
      </div>
    </AuthShell>
  )
}

export function Signup() {
  const { register } = useStore()
  const nav = useNavigate()
  const [sp] = useSearchParams()
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (f.password.length < 6) return setErr('Password must be at least 6 characters')
    if (!/^[6-9]\d{9}$/.test(f.phone)) return setErr('Enter a valid 10-digit mobile number')
    setLoading(true)
    setErr('')
    const er = await register(f.name.trim(), f.email.trim(), f.password, f.phone)
    setLoading(false)
    if (er) return setErr(er)
    nav(sp.get('next') || '/account')
  }

  return (
    <AuthShell
      title="Join the Squad"
      sub="Create an account to track orders, save squad kit designs and reorder teamwear faster."
    >
      <form onSubmit={submit}>
        {err && <div className="alert alert--error">{err}</div>}

        <div className="auth-field">
          <label>Full Name</label>
          <div className="auth-input-group">
            <span className="auth-input-icon"><User /></span>
            <input
              className="auth-input-field"
              required
              minLength={2}
              placeholder="e.g. Rahul Sharma"
              value={f.name}
              onChange={(e) => setF({ ...f, name: e.target.value })}
              autoComplete="name"
            />
          </div>
        </div>

        <div className="auth-field">
          <label>Email Address</label>
          <div className="auth-input-group">
            <span className="auth-input-icon"><Mail /></span>
            <input
              className="auth-input-field"
              type="email"
              required
              placeholder="e.g. rahul@sportsclub.com"
              value={f.email}
              onChange={(e) => setF({ ...f, email: e.target.value })}
              autoComplete="email"
            />
          </div>
        </div>

        <div className="auth-field">
          <label>Mobile Number</label>
          <div className="auth-input-group">
            <span className="auth-input-icon"><Phone /></span>
            <input
              className="auth-input-field"
              required
              inputMode="numeric"
              placeholder="10-digit phone number"
              value={f.phone}
              onChange={(e) => setF({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
              autoComplete="tel"
            />
          </div>
        </div>

        <div className="auth-field">
          <label>Create Password</label>
          <div className="auth-input-group">
            <span className="auth-input-icon"><Lock /></span>
            <input
              className="auth-input-field"
              type={showPass ? 'text' : 'password'}
              required
              minLength={6}
              placeholder="Min. 6 characters"
              value={f.password}
              onChange={(e) => setF({ ...f, password: e.target.value })}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="auth-input-toggle"
              onClick={() => setShowPass(!showPass)}
              title={showPass ? 'Hide password' : 'Show password'}
            >
              {showPass ? <EyeOff /> : <Eye />}
            </button>
          </div>
        </div>

        <button type="submit" className="auth-submit-btn" disabled={loading}>
          {loading ? 'Creating account…' : <><span>Create Account</span><ArrowRight width={16} height={16} /></>}
        </button>

        <p className="small muted" style={{ marginTop: 10, textAlign: 'center', lineHeight: 1.4 }}>
          By continuing you agree to Rishikar Sports{' '}
          <Link to="/policies/terms" style={{ textDecoration: 'underline' }}>Terms</Link> and{' '}
          <Link to="/policies/privacy" style={{ textDecoration: 'underline' }}>Privacy Policy</Link>.
        </p>
      </form>

      <p className="auth__alt">
        Already have an account? <Link to="/login">Log in</Link>
      </p>

      <div className="auth__trust">
        <ShieldCheck />
        <span>Official Store Protection · Direct Manufacturer Guarantee</span>
      </div>
    </AuthShell>
  )
}

function AuthShell({ title, sub, children }) {
  return (
    <div className="auth">
      <div className="auth__media">
        <div className="auth__media-ambient" />

        {/* Top Brand Badge */}
        <div className="auth__brand-badge">
          <span className="auth__brand-dot" />
          <b>RISHIKAR SPORTS</b>
          <span style={{ opacity: 0.75 }}>· Official Store</span>
        </div>

        {/* Visual Showcase (Properly centered & zero text collision) */}
        <div className="auth__showcase">
          {IMGS.map((item, idx) => (
            <div className="auth__showcase-card" key={idx}>
              <img src={item.src} alt="Rishikar Sports Gear" />
              <span className="auth__card-pill">{item.pill}</span>
            </div>
          ))}
        </div>

        {/* Bottom Hero Typography & Stats */}
        <div className="auth__media-text">
          <span className="eyebrow">Engineered for Champions</span>
          <h2>We make every player look confident.</h2>
          <p>
            Custom sublimated team kits, training tracksuits, and athletic accessories engineered for peak performance.
          </p>
          <div className="auth__media-stats">
            <div className="auth__media-stat">
              <b>50K+</b>
              <span>Kits Crafted</span>
            </div>
            <div className="auth__media-stat">
              <b>Pan-India</b>
              <span>Express Delivery</span>
            </div>
            <div className="auth__media-stat">
              <b>4.9 ★</b>
              <span>Club Rating</span>
            </div>
          </div>
        </div>
      </div>

      <div className="auth__panel">
        <div className="auth__card">
          <div className="auth__card-head">
            <h1>{title}</h1>
            <p>{sub}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
