import { useEffect, useState, useRef } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { MENU, PRODUCTS } from '../lib/catalog'
import { Bag, Heart, Search, User, Menu as MenuIcon, X, ChevronDown, ChevronRight, ArrowRight, Home, Package, Info, Phone, Ruler, Scissors, WhatsApp, Flame, Check, Zap } from './Icons'
import { cx } from '../lib/utils'

const ANNOUNCEMENTS = ['Custom team kits from 11 pieces', 'Free shipping on orders above ₹999', 'Use code RS10 for 10% off', 'Free design mock-up before production', 'Made in our own unit — Chapra, Bihar']

const feat = (slug, title, text) => ({ img: PRODUCTS.find((p) => p.slug === slug)?.image, title, text, to: '/product/' + slug })
const FEATURE = {
  jerseys: feat('rs-pro-sublimated-jersey', 'RS PRO Jersey', 'Full sublimation with your custom club design'),
  tshirts: feat('rs-construction-athletic-polo', 'RS Athletic Polo', 'Heavy matty fabric with reinforced stitching'),
  teamwear: feat('rs-pro-athletic-tracksuit', 'RS PRO Tracksuit', 'Match day & warmup full zipper set'),
  accessories: feat('rs-heavy-duty-kit-bag', 'RS Heavy-Duty Kit Bag', 'Dedicated shoe pocket & pro-grade straps'),
}

const CAT_INFO = {
  jerseys: {
    badge: '100% Sublimation',
    tagline: 'Custom player names, numbers & sponsor logos',
    specs: ['Micro-Poly Moisture Wicking Fabric', 'Zero Color Fade Guarantee', 'Sizes from XS to 5XL available'],
  },
  tshirts: {
    badge: 'Premium Matty & Cotton',
    tagline: 'Ideal for coaches, staff & tournament travel',
    specs: ['Honey-Comb Matty & Poly-Spandex', 'High-Density Club Embroidery', 'Durable Ribbed Collar & Cuffs'],
  },
  teamwear: {
    badge: 'Pro Athletic Kits',
    tagline: 'All-weather club travel & warmup gear',
    specs: ['Wind-Resistant Warmup Shell', 'Heavy-Duty YKK Pocket Zippers', 'Custom Matching Team Colorways'],
  },
  accessories: {
    badge: 'Tournament Gear',
    tagline: 'Engineered for travel, match days & training',
    specs: ['Cordura Heavy-Duty Water Resistant', 'Dedicated Ventilated Shoe Pocket', 'Laser-Cut Embroidered Club Caps'],
  },
}

export function Logo({ className }) {
  return (
    <Link to="/" className={cx('logo', className)} aria-label="Rishikar Sports home">
      <span className="logo__mark"><img src="/logo.png" alt="" /></span>
      <span className="logo__text"><b>RISHIKAR</b><span>SPORTS</span></span>
    </Link>
  )
}

function AnnouncementBar() {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => {
      setIdx((prev) => (prev + 1) % ANNOUNCEMENTS.length)
    }, 4000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="announce" role="region" aria-label="Store Announcements">
      <div className="announce__wrap">
        <span className="announce__text" key={idx}>{ANNOUNCEMENTS[idx]}</span>
      </div>
    </div>
  )
}

export default function Header() {
  const { totals, wishlist, user, setCartOpen, setSearchOpen, setMenuOpen } = useStore()
  const loc = useLocation()
  const [openMega, setOpenMega] = useState(null)
  const hoverTimer = useRef(null)

  const handleMouseEnter = (slug) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    setOpenMega(slug)
  }

  const handleMouseLeave = () => {
    hoverTimer.current = setTimeout(() => {
      setOpenMega(null)
    }, 180)
  }

  const closeMega = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    setOpenMega(null)
    if (typeof document !== 'undefined' && document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur()
    }
  }

  // Auto-close mega menu whenever route changes
  useEffect(() => {
    closeMega()
  }, [loc.pathname, loc.search])

  // Close when clicking outside header navigation
  useEffect(() => {
    const onDocClick = (e) => {
      if (!e.target.closest('.nav')) {
        closeMega()
      }
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearchOpen(true) }
      if (e.key === 'Escape') closeMega()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setSearchOpen])

  return (
    <>
      <AnnouncementBar />
      <header className="header">
        <div className="container header__bar">
          <button className="icon-btn burger" onClick={() => setMenuOpen(true)} aria-label="Open menu"><MenuIcon /></button>
          <Logo />
          <nav className="nav" aria-label="Primary">
            {MENU.map((cat) => (
              <div
                className={cx('nav__item', openMega === cat.slug && 'is-open')}
                key={cat.slug}
                onMouseEnter={() => handleMouseEnter(cat.slug)}
                onMouseLeave={handleMouseLeave}
              >
                <NavLink
                  to={`/c/${cat.slug}`}
                  onClick={closeMega}
                  className={({ isActive }) => cx('nav__link', (isActive || openMega === cat.slug) && 'active')}
                >
                  {cat.name}
                </NavLink>
                <div className="mega" role="menu">
                  <div className="mega__body">
                    {/* Col 1: Categories / Sub-collections */}
                    <div className="mega__col mega__col--cats">
                      <div className="mega__label">
                        <span className="mega__dot" /> Browse {cat.name}
                      </div>
                      <div className="mega__cards">
                        {cat.groups.flatMap((g) => g.items).filter((i) => i.count > 0).map((it) => (
                          <Link
                            key={it.slug}
                            to={`/c/${cat.slug}/${it.slug}`}
                            className="mega__card-link"
                            onClick={closeMega}
                          >
                            <span className="mega__card-name">{it.name}</span>
                            <span className="mega__card-badge">{it.count}</span>
                            <ChevronRight className="mega__card-arrow" />
                          </Link>
                        ))}
                      </div>
                      <Link className="mega__all-btn" to={`/c/${cat.slug}`} onClick={closeMega}>
                        Explore all {cat.name} <ArrowRight />
                      </Link>
                    </div>

                    {/* Col 2: Factory standards / specs */}
                    <div className="mega__col mega__col--specs">
                      <div className="mega__label">
                        <span className="mega__dot mega__dot--orange" /> Factory Standards
                      </div>
                      <div className="mega__spec-card">
                        <div className="mega__spec-badge">
                          <Zap /> {CAT_INFO[cat.slug]?.badge || 'Factory Direct'}
                        </div>
                        <p className="mega__spec-desc">{CAT_INFO[cat.slug]?.tagline}</p>
                        <ul className="mega__spec-list">
                          {(CAT_INFO[cat.slug]?.specs || []).map((s, idx) => (
                            <li key={idx}>
                              <Check />
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                        <Link to="/custom" className="mega__custom-btn" onClick={closeMega}>
                          <span>Custom Team Order (MOQ 11)</span>
                          <ArrowRight />
                        </Link>
                      </div>
                    </div>

                    {/* Col 3: Featured Product */}
                    <div className="mega__col mega__col--feature">
                      <div className="mega__label">
                        <span className="mega__dot mega__dot--lime" /> Featured
                      </div>
                      <Link
                        to={FEATURE[cat.slug]?.to || `/c/${cat.slug}`}
                        className="mega__feature-box"
                        onClick={closeMega}
                      >
                        <div className="mega__feature-media">
                          <img src={FEATURE[cat.slug]?.img} alt={FEATURE[cat.slug]?.title} loading="lazy" />
                          <span className="mega__feature-tag">
                            <Flame /> Bestseller
                          </span>
                        </div>
                        <div className="mega__feature-meta">
                          <b className="mega__feature-title">{FEATURE[cat.slug]?.title}</b>
                          <span className="mega__feature-sub">{FEATURE[cat.slug]?.text}</span>
                          <span className="mega__feature-action">
                            Shop Now <ArrowRight />
                          </span>
                        </div>
                      </Link>
                    </div>
                  </div>

                  {/* Mega Menu Footer Banner */}
                  <div className="mega__bottom">
                    <div className="mega__bottom-left">
                      <span className="mega__bottom-pill">🏭 Direct Unit Rates</span>
                      <span className="mega__bottom-note">Customized with player names, numbers & club logos</span>
                    </div>
                    <a
                      href={`https://wa.me/916299094402?text=${encodeURIComponent(`Hi Rishikar Sports, I'm checking ${cat.name} on your site and would like to order.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mega__wa-link"
                      onClick={closeMega}
                    >
                      <WhatsApp /> Instant WhatsApp Quote
                    </a>
                  </div>
                </div>
              </div>
            ))}
            <div className="nav__item"><NavLink to="/custom" onClick={closeMega} className={({ isActive }) => cx('nav__link', isActive && 'active')}>Custom Kits</NavLink></div>
            <div className="nav__item"><NavLink to="/sale" onClick={closeMega} className={({ isActive }) => cx('nav__link nav__link--hot', isActive && 'active')}>Offers</NavLink></div>
          </nav>
          <div className="header__actions">
            <button className="header__search-btn" onClick={() => setSearchOpen(true)}>
              <Search />
              <span className="header__search-label">Search products…</span>
              <kbd>Ctrl K</kbd>
            </button>
            <button className="icon-btn header__search-icon" onClick={() => setSearchOpen(true)} aria-label="Search"><Search /></button>

            {user ? (
              <Link to="/account" className="header__user-btn" aria-label="Customer Account" title={`Account: ${user.name}`}>
                <span className="header__avatar">{user.name?.[0]?.toUpperCase() || 'U'}</span>
                <span className="header__user-name">Hi, {user.name.split(' ')[0]}</span>
              </Link>
            ) : (
              <Link to="/login" className="header__login-btn" aria-label="Customer Login">
                <User />
                <span>Login</span>
              </Link>
            )}

            <Link to="/wishlist" className="icon-btn" aria-label="Wishlist" title="Wishlist">
              <Heart />
              {wishlist.length > 0 && <span className="icon-btn__badge">{wishlist.length}</span>}
            </Link>
            <button className="icon-btn" onClick={() => setCartOpen(true)} aria-label="Open bag" title="Cart">
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
          <div className="mnav__auth-banner">
            {user ? (
              <Link to="/account" className="mnav__user-card">
                <span className="header__avatar">{user.name?.[0]?.toUpperCase() || 'U'}</span>
                <div>
                  <b>{user.name}</b>
                  <span>View dashboard & orders</span>
                </div>
              </Link>
            ) : (
              <div className="mnav__guest-card">
                <div>
                  <b>Welcome to Rishikar Sports</b>
                  <span>Sign in for order tracking & faster checkout</span>
                </div>
                <Link to="/login" className="btn btn--primary btn--sm">Login / Sign up</Link>
              </div>
            )}
          </div>
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
          <div className="mnav__cat"><Link to="/custom" style={{ display: 'block', padding: '16px 0', fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 800 }}>CUSTOM KITS</Link></div>
          <div className="mnav__cat"><Link to="/sale" style={{ display: 'block', padding: '16px 0', fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 800, color: 'var(--sale)' }}>OFFERS</Link></div>
          <div className="mnav__links">
            <Link to="/"><Home /> Home</Link>
            <Link to={user ? '/account' : '/login'}><User /> {user ? 'My account' : 'Login / Sign up'}</Link>
            <Link to="/account/orders"><Package /> Track order</Link>
            <Link to="/size-chart"><Ruler /> Size guide</Link>
            <Link to="/custom"><Scissors /> Bulk / custom order</Link>
            <Link to="/about"><Info /> About Rishikar Sports</Link>
            <Link to="/contact"><Phone /> Contact us</Link>
          </div>
        </div>
      </aside>
    </>
  )
}
