import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BRAND, HERO, MARQUEE, MANUFACTURE, PROMO_CARDS, CATEGORY_TILES, USPS, PROCESS, TESTIMONIALS } from '../data/content'
import { newArrivals, bestSellers, onSale, queryProducts, getProduct, PRODUCTS } from '../lib/catalog'
import { SectionHead, Rail, Stars, Reveal } from '../components/Shared'
import ProductCard from '../components/ProductCard'
import RSConstructionSection from '../components/RSConstructionSection'
import { Newsletter } from '../components/Footer'
import { ArrowRight, Truck, Refresh, Shield, Zap, WhatsApp } from '../components/Icons'
import { cx, formatPrice } from '../lib/utils'

const ICONS = { truck: Truck, refresh: Refresh, shield: Shield, zap: Zap }

function Hero() {
  return (
    <section className="hero">
      <div className="container hero__grid">
        <div>
          <span className="hero__kicker"><i>●</i> {HERO.kicker}</span>
          <h1>
            {HERO.headline[0]}<br />
            <span className="outline">{HERO.headline[1].split(' ')[0]}</span> <span className="hl">{HERO.headline[1].split(' ').slice(1).join(' ')}</span>
          </h1>
          <p className="hero__text">{HERO.text}</p>
          <div className="hero__cta">
            <Link to="/custom" className="btn btn--accent btn--lg">Get a bulk quote <ArrowRight width={16} height={16} /></Link>
            <Link to="/shop" className="btn btn--outline btn--lg">Shop products</Link>
          </div>
          <div className="hero__proof">
            <div className="hero__faces">{['R', 'S', 'A', 'V'].map((c) => <span key={c}>{c}</span>)}</div>
            <span><b>400+</b> clubs, academies and schools kitted</span>
          </div>
        </div>
        <div className="collage" aria-hidden="true">
          <div className="collage__blob" />
          {HERO.cards.map((c, i) => (
            <Link to={c.to} className={cx('collage__card', `collage__card--${'abc'[i]}`)} key={i} tabIndex={-1}>
              <img src={c.img} alt="" loading={i === 0 ? 'eager' : 'lazy'} />
            </Link>
          ))}
          {HERO.tags.map((t, i) => (
            <div className={cx('collage__tag', `collage__tag--${i + 1}`)} key={i}><b>{t.label}</b><small>{t.sub}</small></div>
          ))}
        </div>
      </div>
      <div className="marquee" aria-hidden="true">
        <div className="marquee__track">
          {[...MARQUEE, ...MARQUEE, ...MARQUEE].map((m, i) => <span className="marquee__item" key={i}>{m} <i /></span>)}
        </div>
      </div>
    </section>
  )
}

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'jerseys', label: 'Jerseys' },
  { key: 'tshirts', label: 'T-Shirts & Polos' },
  { key: 'teamwear', label: 'Teamwear' },
  { key: 'accessories', label: 'Accessories' },
]

export default function Home() {
  const [tab, setTab] = useState('all')
  const trending = useMemo(() => (tab === 'all' ? bestSellers(8) : queryProducts({ category: tab, sort: 'popular' }).slice(0, 8)), [tab])
  const sale = useMemo(() => onSale(8), [])
  const arrivals = useMemo(() => {
    const n = newArrivals(12)
    return n.length >= 4 ? n : [...n, ...PRODUCTS.filter((p) => !n.includes(p))].slice(0, 8)
  }, [])
  const kit = useMemo(() => ['rs-pro-sublimated-jersey', 'rs-pro-tracksuit', 'zipper-hoodie', 'rs-duffle-kit-bag'].map(getProduct).filter(Boolean), [])
  const kitHero = getProduct('custom-team-jersey-set-of-11') || kit[0]

  return (
    <>
      <Hero />

      <div className="container">
        <div className="usp">
          {USPS.map((u) => { const Icon = ICONS[u.icon]; return <div className="usp__item" key={u.title}><Icon /><div><b>{u.title}</b><span>{u.text}</span></div></div> })}
        </div>
      </div>

      <section className="section" style={{ paddingTop: 20 }}>
        <div className="container">
          <SectionHead eyebrow="What we make" title="Sportswear, made to order" text="Everything is cut, printed and stitched in our own unit in Chapra — so quality and delivery stay in our hands." />
          <div className="bento">
            {CATEGORY_TILES.map((t) => (
              <Link to={`/c/${t.slug}`} className={cx('tile', t.size === 'xl' && 'tile--xl', t.size === 'wide' && 'tile--wide')} key={t.slug}>
                <img src={t.img} alt={t.name} loading="lazy" />
                <span className="tile__pill">{t.slug === 'jerseys' ? 'Most ordered' : t.slug === 'teamwear' ? 'Season pick' : 'Collection'}</span>
                <div className="tile__cap"><div><h3>{t.name}</h3><span>{t.sub}</span></div><span className="arrow"><ArrowRight /></span></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--tight" style={{ paddingTop: 0 }}>
        <div className="container">
          <Rail items={arrivals} eyebrow="Ready to order" title="Popular right now" to="/shop" />
        </div>
      </section>

      <section className="section section--bg">
        <div className="container">
          <SectionHead eyebrow="Our range" title="We manufacture" />
          <div className="sports">
            {MANUFACTURE.map((s, i) => (
              <Link to={s.to} className="sport" key={s.name}>
                <div className="sport__top">
                  <span className="sport__num">0{i + 1}</span>
                  <span className="sport__arrow"><ArrowRight width={13} height={13} /></span>
                </div>
                <div className="sport__media">
                  <img src={s.img} alt={s.name} loading="lazy" />
                </div>
                <div className="sport__body">
                  <b>{s.name}</b>
                  <small>{s.sub}</small>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead
            eyebrow="Best sellers"
            title="Ordered again and again"
            action={<div className="tabs">{TABS.map((t) => <button key={t.key} className={cx('tab', tab === t.key && 'active')} onClick={() => setTab(t.key)}>{t.label}</button>)}</div>}
          />
          <div className="grid">{trending.map((p) => <ProductCard key={p.slug} p={p} />)}</div>
          <div className="load-more"><Link to={tab === 'all' ? '/shop' : `/c/${tab}`} className="btn btn--outline">Shop all products</Link></div>
        </div>
      </section>

      <RSConstructionSection />

      <section className="section section--ink">
        <div className="container drop">
          <div className="drop__media">
            <img src={kitHero?.image} alt="" loading="lazy" />
            <span className="badge badge--new">Team order</span>
          </div>
          <div>
            <span className="eyebrow">Custom kits</span>
            <h2 style={{ marginTop: 12 }}>Your logo.<br />Your colours.</h2>
            <p>Send us your club logo and colours — we send back a free 3D mock-up, then produce and deliver the full squad kit in 10–12 working days. Minimum {BRAND.moq} pieces.</p>
            <div className="drop__list">
              {kit.map((p) => (
                <Link to={`/product/${p.slug}`} className="drop__row" key={p.slug}>
                  <img src={p.image} alt="" loading="lazy" />
                  <div><b>{p.name}</b><span>{p.colors.length} colours · ★ {p.rating}</span></div>
                  <em>{formatPrice(p.price)}</em>
                </Link>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 22 }}>
              <Link to="/custom" className="btn btn--accent">Start a custom order <ArrowRight width={16} height={16} /></Link>
              <a href={`https://wa.me/${BRAND.phoneIntl.replace('+', '')}`} className="btn btn--white" target="_blank" rel="noreferrer"><WhatsApp width={16} height={16} /> WhatsApp us</a>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead eyebrow="How it works" title="Idea to delivery in four steps" center />
          <div className="steps-grid">
            {PROCESS.map((s) => (
              <Reveal key={s.n} className="step">
                <b>{s.n}</b>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--tight" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="promos">
            {PROMO_CARDS.map((b) => (
              <Link to={b.to} className={cx('promo', `promo--${b.tone}`)} key={b.title}>
                <img className="promo__img" src={b.img} alt="" loading="lazy" />
                <span className="promo__kicker">{b.kicker}</span>
                <h3>{b.title}</h3>
                <span className="promo__tag">{b.cta} <ArrowRight /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {sale.length > 0 && (
        <section className="section">
          <div className="container">
            <Rail items={sale} eyebrow="Limited time" title="Current offers" text="Season rates on our most-ordered pieces." to="/sale" linkText="All offers" />
          </div>
        </section>
      )}

      <section className="section section--bg">
        <div className="container">
          <SectionHead eyebrow="Customer reviews" title="Trusted on the ground" center />
          <div className="quotes">
            {TESTIMONIALS.map((t) => (
              <Reveal key={t.name} className="quote">
                <Stars value={t.rating} />
                <p>{t.text}</p>
                <div className="quote__who"><span className="avatar">{t.name[0]}</span><div><b>{t.name}</b><span>{t.role}</span></div></div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Newsletter />
    </>
  )
}
