import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { MENU, PRODUCTS } from '../lib/catalog'
import { Bag, Heart, Search, User, Menu as MenuIcon, X, ChevronDown, KMark, Home, Package, Info, Phone, Ruler } from './Icons'
import { cx } from '../lib/utils'

const ANNOUNCEMENTS = ['Free shipping on orders above ₹999', 'Use code KRIDA10 for 10% off', 'Easy 7-day returns & exchanges', 'Team & academy kits — bulk pricing']

const FEATURE = {
  men: { img: PRODUCTS.find((p) => p.slug === 'resistant-jacket')?.image, title: 'Resistant Jacket', text: 'New season layering', to: '/product/resistant-jacket' },
  women: { img: PRODUCTS.find((p) => p.slug === 'elite-tights-women')?.image, title: 'Elite Tights', text: 'Squat-proof, second skin', to: '/product/elite-tights-women' },
  cricket: { img: PRODUCTS.find((p) => p.slug === 'tyka-force-match-titanium-grill')?.image, title: 'Force Titanium', text: 'Pro-grade protection', to: '/product/tyka-force-match-titanium-grill' },
  accessories: { img: PRODUCTS.find((p) => p.slug === 'legend-wheelie-150')?.image, title: 'Legend Wheelie', text: 'Carry the whole kit', to: '/product/legend-wheelie-150' },
}

export function Logo({ className }) {
  return (
    <Link to="/" className={cx('logo', className)} aria-label="KRIDA home">
      <span className="logo__mark"><KMark /></span>
      KRIDA
    </Link>
  )
}

export default function Header() {
  const { totals, wishlist, user, setCartOpen, setSearchOpen, setMenuOpen } = useStore()
  const loc = useLocation()

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearchOpen(true) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setSearchOpen])

  return (
    <>
      <div className="announce" aria-hidden="true">
        <div className="announce__track">
          {[...ANNOUNCEMENTS, ...ANNOUNCEMENTS].map((a, i) => (
            <span className="announce__item" key={i}>{a}</span>
          ))}
        </div>
      </div>
      <header className="header">
        <div className="container header__bar">
          <button className="icon-btn burger" onClick={() => setMenuOpen(true)} aria-label="Open menu"><MenuIcon /></button>
          <Logo />
          <nav className="nav" aria-label="Primary">
            {MENU.map((cat) => (
              <div className="nav__item" key={cat.slug}>
                <NavLink to={`/c/${cat.slug}`} className={({ isActive }) => cx('nav__link', isActive && 'active')}>
                  {cat.name}
                </NavLink>
                <div className="mega" role="menu">
                  {cat.groups.map((g) => (
                    <div key={g.name}>
                      <div className="mega__title">{g.name}</div>
                      <ul className="mega__list">
                        {g.items.filter((i) => i.count > 0).map((it) => (
                          <li key={it.slug}>
                            <Link to={`/c/${cat.slug}/${it.slug}`}>{it.name} <small>{it.count}</small></Link>
                          </li>
                        ))}
                      </ul>
                      {g === cat.groups[0] && <Link className="mega__all" to={`/c/${cat.slug}`}>Shop all {cat.name} →</Link>}
                    </div>
                  ))}
                  {cat.groups.length < 3 && <div />}
                  <Link to={FEATURE[cat.slug]?.to || `/c/${cat.slug}`} className="mega__feature">
                    <img src={FEATURE[cat.slug]?.img} alt="" loading="lazy" />
                    <div className="mega__feature-cap"><b>{FEATURE[cat.slug]?.title}</b><span>{FEATURE[cat.slug]?.text}</span></div>
                  </Link>
                </div>
              </div>
            ))}
            <div className="nav__item"><NavLink to="/new" className={({ isActive }) => cx('nav__link', isActive && 'active')}>New</NavLink></div>
            <div className="nav__item"><NavLink to="/sale" className={({ isActive }) => cx('nav__link nav__link--hot', isActive && 'active')}>Sale</NavLink></div>
          </nav>
          <div className="header__actions">
            <button className="header__search-btn" onClick={() => setSearchOpen(true)}>
              <Search /> Search products… <kbd>Ctrl K</kbd>
            </button>
            <button className="icon-btn" onClick={() => setSearchOpen(true)} aria-label="Search"><Search /></button>
            <Link to={user ? '/account' : '/login'} className="icon-btn" aria-label="Account"><User /></Link>
            <Link to="/wishlist" className="icon-btn" aria-label="Wishlist">
              <Heart />
              {wishlist.length > 0 && <span className="icon-btn__badge">{wishlist.length}</span>}
            </Link>
            <button className="icon-btn" onClick={() => setCartOpen(true)} aria-label="Open bag">
              <Bag />
              {totals.count > 0 && <span className="icon-btn__badge">{totals.count}</span>}
            </button>
          </div>
        </div>
      </header>
    </>
  )
}

export function MobileNav() {
  const { menuOpen, setMenuOpen, user } = useStore()
  const [open, setOpen] = useState(null)
  const loc = useLocation()
  useEffect(() => setMenuOpen(false), [loc.pathname, setMenuOpen])
  useEffect(() => {
    document.body.classList.toggle('no-scroll', menuOpen)
    return () => document.body.classList.remove('no-scroll')
  }, [menuOpen])
  if (!menuOpen) return null
  return (
    <>
      <div className="drawer-backdrop" onClick={() => setMenuOpen(false)} />
      <aside className="drawer drawer--left" aria-label="Menu">
        <div className="drawer__head">
          <Logo />
          <button className="icon-btn" onClick={() => setMenuOpen(false)} aria-label="Close"><X /></button>
        </div>
        <div className="drawer__body">
          {MENU.map((cat) => (
            <div className={cx('mnav__cat', open === cat.slug && 'open')} key={cat.slug}>
              <button onClick={() => setOpen(open === cat.slug ? null : cat.slug)}>{cat.name} <ChevronDown /></button>
              <div className="mnav__groups">
                <Link to={`/c/${cat.slug}`} className="btn btn--sm btn--outline">Shop all {cat.name}</Link>
                {cat.groups.map((g) => (
                  <div className="mnav__group" key={g.name}>
                    <b>{g.name}</b>
                    {g.items.filter((i) => i.count > 0).map((it) => (
                      <Link key={it.slug} to={`/c/${cat.slug}/${it.slug}`}>{it.name}</Link>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="mnav__cat"><Link to="/new" style={{ display: 'block', padding: '16px 0', fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 700 }}>NEW ARRIVALS</Link></div>
          <div className="mnav__cat"><Link to="/sale" style={{ display: 'block', padding: '16px 0', fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 700, color: 'var(--sale)' }}>SALE</Link></div>
          <div className="mnav__links">
            <Link to="/"><Home /> Home</Link>
            <Link to={user ? '/account' : '/login'}><User /> {user ? 'My account' : 'Login / Sign up'}</Link>
            <Link to="/account/orders"><Package /> Track order</Link>
            <Link to="/size-chart"><Ruler /> Size guide</Link>
            <Link to="/about"><Info /> About KRIDA</Link>
            <Link to="/contact"><Phone /> Contact us</Link>
          </div>
        </div>
      </aside>
    </>
  )
}
