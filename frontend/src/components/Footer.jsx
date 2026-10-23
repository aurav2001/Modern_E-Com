import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from './Header'
import {
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Factory,
  ShieldCheck,
  Truck,
  Phone,
  Mail,
  MapPin,
} from './Icons'
import { useStore } from '../context/StoreContext'
import { BRAND } from '../data/content'

export default function Footer() {
  return (
    <footer className="footer">
      {/* ── Trust & Factory Badges Strip ── */}
      <div className="footer__features">
        <div className="container footer__features-inner">
          <div className="footer__feature-item">
            <div className="footer__feature-icon">
              <Factory width={20} height={20} />
            </div>
            <div>
              <b>Direct Manufacturing Unit</b>
              <span>In-house sublimation & stitching in Chapra</span>
            </div>
          </div>
          <div className="footer__feature-item">
            <div className="footer__feature-icon">
              <ShieldCheck width={20} height={20} />
            </div>
            <div>
              <b>100% Sublimation Verified</b>
              <span>Anti-fade colors with pro athletic fabrics</span>
            </div>
          </div>
          <div className="footer__feature-item">
            <div className="footer__feature-icon">
              <Truck width={20} height={20} />
            </div>
            <div>
              <b>Pan-India Courier Dispatch</b>
              <span>Fast express delivery to all pin codes</span>
            </div>
          </div>
          <div className="footer__feature-item">
            <div className="footer__feature-icon">
              <Phone width={20} height={20} />
            </div>
            <div>
              <b>Instant WhatsApp Support</b>
              <span>Direct factory quotes & order tracking</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="footer__top">
          <div className="footer__brand-col">
            <Logo />
            <p className="footer__about">{BRAND.about}</p>
            <div className="footer__contact-list">
              <a href={'tel:' + BRAND.phoneIntl} className="footer__contact-link">
                <Phone width={14} height={14} /> {BRAND.phone}
              </a>
              <a href={'mailto:' + BRAND.email} className="footer__contact-link">
                <Mail width={14} height={14} /> {BRAND.email}
              </a>
              <span className="footer__contact-link">
                <MapPin width={14} height={14} /> {BRAND.addressShort}
              </span>
            </div>
            <div className="footer__social">
              <a href="#" aria-label="Instagram"><Instagram /></a>
              <a href="#" aria-label="Facebook"><Facebook /></a>
              <a href="#" aria-label="YouTube"><Youtube /></a>
              <a href="#" aria-label="X"><Twitter /></a>
            </div>
          </div>

          <div>
            <h4>Shop</h4>
            <ul className="footer__links">
              <li><Link to="/c/jerseys">Jerseys</Link></li>
              <li><Link to="/c/tshirts">T-Shirts & Polos</Link></li>
              <li><Link to="/c/teamwear">Teamwear</Link></li>
              <li><Link to="/c/accessories">Accessories</Link></li>
              <li><Link to="/custom">Custom kits</Link></li>
              <li><Link to="/rate-list" style={{ color: 'var(--orange)', fontWeight: 700 }}>Rate List (Excel)</Link></li>
              <li><Link to="/sale">Offers & Combos</Link></li>
            </ul>
          </div>

          <div>
            <h4>Help & Support</h4>
            <ul className="footer__links">
              <li><Link to="/account/orders">Track order</Link></li>
              <li><Link to="/policies/shipping-returns">Shipping & returns</Link></li>
              <li><Link to="/size-chart">Size guide</Link></li>
              <li><Link to="/faq">FAQs</Link></li>
              <li><Link to="/contact">Contact us</Link></li>
            </ul>
          </div>

          <div>
            <h4>Company</h4>
            <ul className="footer__links">
              <li><Link to="/about">About us</Link></li>
              <li><Link to="/custom">Team & bulk orders</Link></li>
              <li><Link to="/about#values">How we work</Link></li>
              <li><Link to="/contact">Visit our unit</Link></li>
            </ul>
          </div>

          <div>
            <h4>Legal</h4>
            <ul className="footer__links">
              <li><Link to="/policies/privacy">Privacy policy</Link></li>
              <li><Link to="/policies/terms">Terms & conditions</Link></li>
              <li><Link to="/policies/shipping-returns">Return policy</Link></li>
              <li><Link to="/admin">Admin panel</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} Rishikar Sports LLP · Chapra, Bihar. All rights reserved.</span>
          <div className="footer__pay">
            {['UPI', 'VISA', 'Mastercard', 'RuPay', 'NetBanking', 'COD'].map((p) => (
              <span key={p}>{p}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export function Newsletter() {
  const { toast } = useStore()
  const [email, setEmail] = useState('')
  return (
    <section className="section section--tight">
      <div className="container">
        <div className="newsletter">
          <div>
            <span className="eyebrow">Join the squad</span>
            <h2 style={{ marginTop: 10 }}>Get 15% off your first order</h2>
            <p>New arrivals, bulk-rate updates and offers for clubs and academies. No spam, unsubscribe any time.</p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); if (email) { toast('You are on the list. Use WELCOME15 at checkout.'); setEmail('') } }}>
            <input className="input" type="email" required placeholder="Your email address" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email" />
            <button className="btn btn--accent">Subscribe</button>
          </form>
        </div>
      </div>
    </section>
  )
}
