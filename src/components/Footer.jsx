import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from './Header'
import { Instagram, Facebook, Youtube, Twitter } from './Icons'
import { useStore } from '../context/StoreContext'
import { BRAND } from '../data/content'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <div>
            <Logo />
            <p className="footer__about">{BRAND.about}</p>
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
              <li><Link to="/c/men">Men</Link></li>
              <li><Link to="/c/women">Women</Link></li>
              <li><Link to="/c/cricket">Cricket</Link></li>
              <li><Link to="/c/accessories">Accessories</Link></li>
              <li><Link to="/new">New arrivals</Link></li>
              <li><Link to="/sale">Sale</Link></li>
            </ul>
          </div>
          <div>
            <h4>Help</h4>
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
              <li><Link to="/about">About KRIDA</Link></li>
              <li><Link to="/contact">Team & bulk orders</Link></li>
              <li><Link to="/contact">Sell on KRIDA</Link></li>
              <li><Link to="/about#values">Our values</Link></li>
            </ul>
          </div>
          <div>
            <h4>Legal</h4>
            <ul className="footer__links">
              <li><Link to="/policies/privacy">Privacy policy</Link></li>
              <li><Link to="/policies/terms">Terms & conditions</Link></li>
              <li><Link to="/policies/shipping-returns">Return policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} KRIDA Retail. All rights reserved.</span>
          <div className="footer__pay">
            {['UPI', 'VISA', 'MC', 'RuPay', 'COD'].map((p) => <span key={p}>{p}</span>)}
          </div>
        </div>
        <div className="footer__word" aria-hidden="true">KRIDA</div>
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
            <p>Early access to drops, training tips and members-only offers. No spam, unsubscribe any time.</p>
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
