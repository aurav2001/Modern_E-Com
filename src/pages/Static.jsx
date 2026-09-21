import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { PRODUCTS, bestSellers } from '../lib/catalog'
import { FAQS, POLICIES, SIZE_CHART } from '../data/content'
import { Crumbs, Accordion, Rail } from '../components/Shared'
import ProductCard from '../components/ProductCard'
import { SizeTable } from './Product'
import { Heart, MapPin, Phone, Mail, Clock, Zap, Award, Leaf, Shield } from '../components/Icons'
import { cx } from '../lib/utils'

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
      <section className="section"><Rail items={bestSellers(8)} eyebrow="Popular" title="Athletes also love" to="/shop" /></section>
    </div>
  )
}

const P = 'https://tyka.premierhostings.com/backend/storage/products/'

export function About() {
  return (
    <div className="container">
      <div className="page-head"><Crumbs items={[{ label: 'About' }]} /></div>
      <div className="about-hero">
        <div className="split__stack"><img src="/img/face.jpg" alt="" /><img src={P + 'TYKA-Shoe-Speed-BlackBlue-L.webp'} alt="" /></div>
        <span className="eyebrow" style={{ color: '#b8bcc4' }}>Since 2019</span>
        <h1>Made for the game</h1>
      </div>
      <section className="section">
        <div className="split">
          <div className="prose">
            <span className="eyebrow">Our story</span>
            <h2 style={{ marginTop: 10 }}>Started by players who were tired of guessing.</h2>
            <p>KRIDA began in 2019 with three club cricketers, a spreadsheet of gear that had let them down, and a simple rule: we only sell what we would take to the ground ourselves.</p>
            <p>Today the store carries 280+ styles across cricket, training, running and shooting — every one of them worn, washed and tested by our community before it is listed. If it sags, fades or fails, it does not make the cut.</p>
            <p>We ship from Gurugram to every pincode in India, and kit out academies, clubs and office leagues with custom team orders.</p>
          </div>
          <div className="founder"><img src="/img/face.jpg" alt="Founder of KRIDA" /><div className="founder__cap"><b>Founder, KRIDA</b><span>"If it would not survive a season in my own kit bag, it does not go on the site."</span></div></div>
        </div>
      </section>
      <section className="section section--bg" id="values" style={{ borderRadius: 'var(--radius-lg)' }}>
        <div className="container">
          <div className="sec-head sec-head--center"><div><span className="eyebrow">What we stand for</span><h2 style={{ marginTop: 10 }}>Performance with purpose</h2></div></div>
          <div className="values">
            <div className="value"><Zap /><b>Player tested</b><p>Every product is worn, washed and abused by real athletes before it reaches the store.</p></div>
            <div className="value"><Award /><b>Pro-grade protection</b><p>Helmets we list meet BS 7928:2013 and are trusted at first-class level.</p></div>
            <div className="value"><Leaf /><b>Honest pricing</b><p>No fake MRPs, no flash-sale games. The price you see is the price it is worth.</p></div>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="stats" style={{ borderTop: 0, paddingTop: 0, gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div><b>280+</b><span>Styles in store</span></div>
          <div><b>12k+</b><span>Orders a month</span></div>
          <div><b>400+</b><span>Teams kitted</span></div>
          <div><b>4.8★</b><span>Average rating</span></div>
        </div>
      </section>
    </div>
  )
}

export function Contact() {
  const { toast } = useStore()
  const [f, setF] = useState({ name: '', email: '', topic: 'Order help', message: '' })
  return (
    <div className="container">
      <div className="page-head"><Crumbs items={[{ label: 'Contact' }]} /><h1>Get in touch</h1><p>We usually reply within one working day.</p></div>
      <div className="contact" style={{ paddingTop: 16 }}>
        <div>
          <div className="contact__card"><MapPin /><div><b>Head office & warehouse</b><span>Unit 4, Udyog Vihar Phase 5, Gurugram, Haryana 122016</span></div></div>
          <div className="contact__card"><Phone /><div><b>Customer care</b><span>+91 98765 43210 (Mon–Sat, 10am–7pm)</span></div></div>
          <div className="contact__card"><Mail /><div><b>Email</b><span>care@krida.in · teams@krida.in for bulk & team kits</span></div></div>
          <div className="contact__card"><Clock /><div><b>Dealer enquiries</b><span>Want to sell on KRIDA? Write to brands@krida.in with your catalogue.</span></div></div>
        </div>
        <form className="block" onSubmit={(e) => { e.preventDefault(); toast('Message sent. We will get back to you soon.'); setF({ name: '', email: '', topic: 'Order help', message: '' }) }}>
          <h3>Send us a message</h3>
          <div className="form-grid">
            <div className="field"><label>Name</label><input className="input" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
            <div className="field"><label>Email</label><input className="input" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
            <div className="field span-2"><label>Topic</label><select className="select" value={f.topic} onChange={(e) => setF({ ...f, topic: e.target.value })}>{['Order help', 'Returns & exchanges', 'Team / bulk order', 'Dealer enquiry', 'Something else'].map((t) => <option key={t}>{t}</option>)}</select></div>
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
        <p className="muted" style={{ marginTop: 24 }}>Still stuck? <Link to="/contact" className="btn btn--link">Contact us</Link></p>
      </div>
    </div>
  )
}

export function SizeChartPage() {
  const [key, setKey] = useState('tops')
  return (
    <div className="container">
      <div className="page-head"><Crumbs items={[{ label: 'Size guide' }]} /><h1>Size guide</h1><p>Measure over light clothing with a soft tape. Compare with the chart to find your fit.</p></div>
      <div className="tabs" style={{ margin: '16px 0 20px' }}>
        {Object.entries(SIZE_CHART).map(([k, v]) => <button key={k} className={cx('tab', key === k && 'active')} onClick={() => setKey(k)}>{v.title}</button>)}
      </div>
      <div className="prose"><SizeTable chart={SIZE_CHART[key]} /><p className="small muted" style={{ marginTop: 12 }}>All measurements in {SIZE_CHART[key].unit}.</p>
        <h2>How to measure</h2>
        <p><b>Chest:</b> around the fullest part, keeping the tape level under the arms.</p>
        <p><b>Waist:</b> around the natural waistline, where you normally wear your shorts.</p>
        <p><b>Inseam:</b> from the crotch down to the ankle bone.</p>
        <p><b>Foot length:</b> stand on paper, mark heel and longest toe, measure the distance.</p>
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
      <h2>Lost the ball?</h2>
      <p className="muted">The page you are looking for does not exist or has moved.</p>
      <Link to="/" className="btn btn--primary" style={{ marginTop: 20 }}>Back to home</Link>
    </div>
  )
}
