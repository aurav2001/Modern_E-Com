import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { PRODUCTS, bestSellers } from '../lib/catalog'
import { BRAND, FAQS, POLICIES, SIZE_CHART, PROCESS } from '../data/content'
import { Crumbs, Accordion, Rail } from '../components/Shared'
import ProductCard from '../components/ProductCard'
import { SizeTable } from './Product'
import { Heart, MapPin, Phone, Mail, Clock, Zap, Award, Leaf, Shield, WhatsApp, Factory, Scissors, Check } from '../components/Icons'
import { cx } from '../lib/utils'

const P = '/products/'
const waLink = (text) => `https://wa.me/${BRAND.phoneIntl.replace('+', '')}?text=${encodeURIComponent(text)}`

export function Wishlist() {
  const { wishlist } = useStore()
  const items = wishlist.map((s) => PRODUCTS.find((p) => p.slug === s)).filter(Boolean)
  return (
    <div className="container">
      <div className="page-head"><Crumbs items={[{ label: 'Wishlist' }]} /><h1>Wishlist {items.length > 0 && <span className="muted" style={{ fontSize: '0.5em' }}>({items.length})</span>}</h1></div>
      {items.length === 0 ? (
        <div className="empty" style={{ paddingTop: 30 }}>
          <Heart width={56} height={56} style={{ margin: '0 auto 14px', color: 'var(--line-2)' }} />
          <h3>Nothing saved yet</h3>
          <p>Tap the heart on any product to keep it here.</p>
          <Link to="/shop" className="btn btn--primary" style={{ marginTop: 18 }}>Browse products</Link>
        </div>
      ) : (
        <div className="grid" style={{ paddingTop: 16 }}>{items.map((p) => <ProductCard key={p.slug} p={p} />)}</div>
      )}
      <section className="section"><Rail items={bestSellers(8)} eyebrow="Popular" title="Teams also order" to="/shop" /></section>
    </div>
  )
}

export function About() {
  return (
    <div className="container">
      <div className="page-head"><Crumbs items={[{ label: 'About' }]} /></div>
      <div className="about-hero">
        <div className="split__stack"><img src={P + 'jersey.png'} alt="" /><img src={P + 'jacket.png'} alt="" /></div>
        <span className="eyebrow" style={{ color: '#b8bcc4' }}>Sportswear manufacturing · Chapra, Bihar</span>
        <h1>Quality you trust, performance you deserve</h1>
      </div>

      <section className="section">
        <div className="split">
          <div className="prose">
            <span className="eyebrow">Our story</span>
            <h2 style={{ marginTop: 10 }}>A manufacturing unit, not a reseller.</h2>
            <p>Rishikar Sports makes sportswear from our own unit in Dahiawan Tola, Chapra. Cutting, sublimation printing, stitching and quality checking all happen under one roof — which is why we can hold our rates, our timelines and our quality.</p>
            <p>We supply football and cricket clubs, school teams, coaching academies and companies across Bihar and the rest of India. Every kit is made to order: your logo, your colours, your players' names and numbers.</p>
            <p>Small orders are welcome. Custom printed kits start from just {BRAND.moq} pieces, and plain stock items can be ordered by the piece.</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 20 }}>
              <Link to="/custom" className="btn btn--primary">Start a custom order</Link>
              <a className="btn btn--outline" href={waLink('Hi Rishikar Sports, I want to enquire about a team kit.')} target="_blank" rel="noreferrer"><WhatsApp width={16} height={16} /> WhatsApp</a>
            </div>
          </div>
          <div className="split__stack"><img src={P + 'hoodie.png'} alt="" /><img src={P + 'bag.png'} alt="" /></div>
        </div>
      </section>

      <section className="section section--bg" id="values" style={{ borderRadius: 'var(--radius-lg)' }}>
        <div className="container">
          <div className="sec-head sec-head--center"><div><span className="eyebrow">What we stand for</span><h2 style={{ marginTop: 10 }}>Why teams stay with us</h2></div></div>
          <div className="values">
            <div className="value"><Factory /><b>Own unit</b><p>No middlemen. We control the fabric, the print and the finish, so what you approve is what you receive.</p></div>
            <div className="value"><Scissors /><b>Custom designs free</b><p>Design mock-ups, logo placement and numbering are included — you only pay for the kit.</p></div>
            <div className="value"><Award /><b>On-time delivery</b><p>10–12 working days from approval, packed set-wise and shipped anywhere in India.</p></div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="sec-head sec-head--center"><div><span className="eyebrow">How we work</span><h2 style={{ marginTop: 10 }}>From your idea to your team</h2></div></div>
        <div className="steps-grid">
          {PROCESS.map((s) => <div className="step" key={s.n}><b>{s.n}</b><h3>{s.title}</h3><p>{s.text}</p></div>)}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="stats" style={{ borderTop: 0, paddingTop: 0, gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div><b>400+</b><span>Teams kitted</span></div>
          <div><b>11</b><span>Minimum order</span></div>
          <div><b>10–12</b><span>Days to deliver</span></div>
          <div><b>4.8★</b><span>Customer rating</span></div>
        </div>
      </section>
    </div>
  )
}

export function CustomKits() {
  const { toast, submitEnquiry } = useStore()
  const [f, setF] = useState({ name: '', phone: '', org: '', product: 'Sublimated Jerseys', qty: '11–25', message: '' })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const enquiry = `Hi Rishikar Sports!%0AName: ${f.name}%0ATeam/Company: ${f.org}%0AProduct: ${f.product}%0AQuantity: ${f.qty}%0A${f.message}`
  return (
    <div className="container">
      <div className="page-head">
        <Crumbs items={[{ label: 'Custom kits' }]} />
        <h1>Custom team kits</h1>
        <p>Your logo, your colours, your players' names — made in our own unit and delivered anywhere in India. Minimum {BRAND.moq} pieces for printed kits.</p>
      </div>

      <section className="section section--tight">
        <div className="steps-grid">
          {PROCESS.map((s) => <div className="step" key={s.n}><b>{s.n}</b><h3>{s.title}</h3><p>{s.text}</p></div>)}
        </div>
      </section>

      <div className="contact" style={{ paddingTop: 8 }}>
        <div>
          <h3 style={{ marginBottom: 14 }}>What you get</h3>
          {[
            'Free 3D design mock-up before production',
            'Full sublimation — unlimited colours at no extra cost',
            'Player names, numbers and sponsor logos included',
            'Embroidery available on polos, caps and jackets',
            'Size set samples before bulk production',
            'Packed set-wise, ready to hand out',
          ].map((t) => (
            <div className="contact__card" key={t}><Check /><div><b>{t}</b></div></div>
          ))}
          <div className="contact__card" style={{ border: 0 }}>
            <WhatsApp /><div><b>Prefer to talk?</b><span>Call or WhatsApp <a href={`tel:${BRAND.phoneIntl}`} style={{ textDecoration: 'underline' }}>{BRAND.phone}</a> — {BRAND.hours}</span></div>
          </div>
        </div>

        <form className="block" onSubmit={(e) => { e.preventDefault(); submitEnquiry({ type: 'Bulk quote', ...f }); toast('Enquiry noted. We will call you within one working day.'); setF({ ...f, name: '', org: '', phone: '', message: '' }) }}>
          <h3>Get a bulk quote</h3>
          <div className="form-grid">
            <div className="field"><label>Your name</label><input className="input" required value={f.name} onChange={set('name')} /></div>
            <div className="field"><label>Mobile</label><input className="input" required inputMode="numeric" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} /></div>
            <div className="field span-2"><label>Team / school / company</label><input className="input" value={f.org} onChange={set('org')} placeholder="e.g. Chapra United FC" /></div>
            <div className="field"><label>Product</label>
              <select className="select" value={f.product} onChange={set('product')}>
                {['Sublimated Jerseys', 'Cricket Kit', 'Tracksuits', 'Hoodies', 'Polo T-Shirts', 'Round Neck Tees', 'Kit Bags', 'Caps', 'Mixed / not sure'].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="field"><label>Quantity</label>
              <select className="select" value={f.qty} onChange={set('qty')}>
                {['11–25', '26–50', '51–100', '100–250', '250+'].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="field span-2"><label>Colours, deadline, any other details</label><textarea className="textarea" value={f.message} onChange={set('message')} placeholder="Navy and orange, need them before 20th, logo attached on WhatsApp…" /></div>
            <div className="span-2" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn btn--primary">Send enquiry</button>
              <a className="btn btn--accent" href={`https://wa.me/${BRAND.phoneIntl.replace('+', '')}?text=${enquiry}`} target="_blank" rel="noreferrer"><WhatsApp width={16} height={16} /> Send on WhatsApp</a>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export function Contact() {
  const { toast, submitEnquiry } = useStore()
  const [f, setF] = useState({ name: '', email: '', topic: 'Bulk / team order', message: '' })
  return (
    <div className="container">
      <div className="page-head"><Crumbs items={[{ label: 'Contact' }]} /><h1>Get in touch</h1><p>We usually reply the same working day.</p></div>
      <div className="contact" style={{ paddingTop: 16 }}>
        <div>
          <div className="contact__card"><MapPin /><div><b>Unit & office</b><span>{BRAND.address}</span></div></div>
          <div className="contact__card"><Phone /><div><b>Call or WhatsApp</b><span><a href={`tel:${BRAND.phoneIntl}`}>{BRAND.phone}</a> · {BRAND.hours}</span></div></div>
          <div className="contact__card"><Mail /><div><b>Email</b><span><a href={`mailto:${BRAND.email}`}>{BRAND.email}</a></span></div></div>
          <div className="contact__card"><Clock /><div><b>Bulk & team orders</b><span>Minimum {BRAND.moq} pieces for custom printed kits. <Link to="/custom" style={{ textDecoration: 'underline' }}>Get a quote →</Link></span></div></div>
          <a className="btn btn--accent" style={{ marginTop: 18 }} href={waLink('Hi Rishikar Sports, I have an enquiry.')} target="_blank" rel="noreferrer"><WhatsApp width={16} height={16} /> Chat on WhatsApp</a>
        </div>
        <form className="block" onSubmit={(e) => { e.preventDefault(); submitEnquiry({ type: 'Contact', ...f }); toast('Message sent. We will get back to you soon.'); setF({ name: '', email: '', topic: 'Bulk / team order', message: '' }) }}>
          <h3>Send us a message</h3>
          <div className="form-grid">
            <div className="field"><label>Name</label><input className="input" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
            <div className="field"><label>Email</label><input className="input" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
            <div className="field span-2"><label>Topic</label><select className="select" value={f.topic} onChange={(e) => setF({ ...f, topic: e.target.value })}>{['Bulk / team order', 'Order help', 'Returns & exchanges', 'Sizes and fabric', 'Something else'].map((t) => <option key={t}>{t}</option>)}</select></div>
            <div className="field span-2"><label>Message</label><textarea className="textarea" required value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} /></div>
            <div><button className="btn btn--primary">Send message</button></div>
          </div>
        </form>
      </div>
    </div>
  )
}

export function FAQ() {
  return (
    <div className="container">
      <div className="page-head"><Crumbs items={[{ label: 'FAQs' }]} /><h1>Frequently asked questions</h1></div>
      <div className="faq" style={{ paddingTop: 16 }}>
        <Accordion items={FAQS.map((f) => ({ title: f.q, body: <p>{f.a}</p> }))} />
        <p className="muted" style={{ marginTop: 24 }}>Still stuck? <Link to="/contact" className="btn btn--link">Contact us</Link> or WhatsApp {BRAND.phone}.</p>
      </div>
    </div>
  )
}

export function SizeChartPage() {
  const [key, setKey] = useState('tops')
  return (
    <div className="container">
      <div className="page-head"><Crumbs items={[{ label: 'Size guide' }]} /><h1>Size guide</h1><p>Measure over light clothing with a soft tape. For team orders we can send a size set before bulk production.</p></div>
      <div className="tabs" style={{ margin: '16px 0 20px' }}>
        {Object.entries(SIZE_CHART).map(([k, v]) => <button key={k} className={cx('tab', key === k && 'active')} onClick={() => setKey(k)}>{v.title}</button>)}
      </div>
      <div className="prose"><SizeTable chart={SIZE_CHART[key]} /><p className="small muted" style={{ marginTop: 12 }}>All measurements in {SIZE_CHART[key].unit}.</p>
        <h2>How to measure</h2>
        <p><b>Chest:</b> around the fullest part, keeping the tape level under the arms.</p>
        <p><b>Waist:</b> around the natural waistline, where you normally wear your shorts.</p>
        <p><b>Inseam:</b> from the crotch down to the ankle bone.</p>
        <p style={{ marginTop: 16 }}>Ordering for a squad? <Link to="/custom" className="btn btn--link">Ask for a size set</Link> — we send one piece per size before the bulk run.</p>
      </div>
    </div>
  )
}

export function Policy() {
  const { slug } = useParams()
  const pol = POLICIES[slug]
  if (!pol) return <NotFound />
  return (
    <div className="container">
      <div className="page-head"><Crumbs items={[{ label: pol.title }]} /><h1>{pol.title}</h1><p>Last updated: 1 September 2026</p></div>
      <div className="prose">
        {pol.sections.map(([h, t]) => <div key={h}><h2>{h}</h2><p>{t}</p></div>)}
        <p style={{ marginTop: 24 }}><Shield width={16} height={16} style={{ verticalAlign: -3 }} /> Questions? <Link to="/contact" className="btn btn--link">Contact our team</Link></p>
      </div>
    </div>
  )
}

export function NotFound() {
  return (
    <div className="container nf">
      <h1>404</h1>
      <h2>Off target</h2>
      <p className="muted">The page you are looking for does not exist or has moved.</p>
      <Link to="/" className="btn btn--primary" style={{ marginTop: 20 }}>Back to home</Link>
    </div>
  )
}
