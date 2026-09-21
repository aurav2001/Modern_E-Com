import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { HERO, MARQUEE, PROMO_CARDS, CATEGORY_TILES, USPS, TESTIMONIALS } from '../data/content'
import { newArrivals, bestSellers, onSale, queryProducts, SPORTS, getProduct } from '../lib/catalog'
import { SectionHead, Rail, Stars, Reveal } from '../components/Shared'
import ProductCard from '../components/ProductCard'
import { Newsletter } from '../components/Footer'
import { ArrowRight, Truck, Refresh, Shield, Flag } from '../components/Icons'
import { cx, formatPrice } from '../lib/utils'

const ICONS = { truck: Truck, refresh: Refresh, shield: Shield, flag: Flag }

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
            <Link to="/shop" className="btn btn--primary btn--lg">Shop all <ArrowRight width={16} height={16} /></Link>
            <Link to="/c/cricket" className="btn btn--outline btn--lg">Cricket gear</Link>
          </div>
          <div className="hero__proof">
            <div className="hero__faces">{['R', 'A', 'V', 'S'].map((c) => <span key={c}>{c}</span>)}</div>
            <span><b>12,400+</b> athletes shopped this month</span>
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
  { key: 'men', label: 'Men' },
  { key: 'women', label: 'Women' },
  { key: 'cricket', label: 'Cricket' },
  { key: 'accessories', label: 'Accessories' },
]

export default function Home() {
  const [tab, setTab] = useState('all')
  const trending = useMemo(() => (tab === 'all' ? bestSellers(8) : queryProducts({ category: tab, sort: 'popular' }).slice(0, 8)), [tab])
  const sale = useMemo(() => onSale(8), [])
  const arrivals = useMemo(() => newArrivals(12), [])
  const drop = useMemo(() => ['tyka-force-match-titanium-grill', 'legacy-team-wheelie', 'gravix-ball-pro-145-gm', 'cricket-shoes-velocity-rubber-stud'].map(getProduct).filter(Boolean), [])
  const dropHero = getProduct('strike-320-l-shoe') || drop[0]
  const sportCounts = useMemo(() => Object.fromEntries(SPORTS.map((s) => [s.slug, queryProducts({ sport: s.slug }).length])), [])

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
          <SectionHead eyebrow="Collections" title="Pick your lane" text="Four collections, one standard: gear that performs when it matters." />
          <div className="bento">
            {CATEGORY_TILES.map((t) => (
              <Link to={`/c/${t.slug}`} className={cx('tile', t.size === 'xl' && 'tile--xl', t.size === 'wide' && 'tile--wide')} key={t.slug}>
                <img src={t.img} alt={t.name} loading="lazy" style={t.pos ? { objectPosition: t.pos } : undefined} />
                <span className="tile__pill">{t.slug === 'men' ? 'Most shopped' : t.slug === 'cricket' ? 'In season' : 'Collection'}</span>
                <div className="tile__cap"><div><h3>{t.name}</h3><span>{t.sub}</span></div><span className="arrow"><ArrowRight /></span></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--tight" style={{ paddingTop: 0 }}>
        <div className="container">
          <Rail items={arrivals} eyebrow="Just landed" title="New arrivals" to="/new" />
        </div>
      </section>

      <section className="section section--bg">
        <div className="container">
          <SectionHead eyebrow="Shop by sport" title="What do you play?" />
          <div className="sports">
            {SPORTS.map((s, i) => (
              <Link to={`/sport/${s.slug}`} className="sport" key={s.slug}>
                <span className="sport__num">0{i + 1}</span>
                <div className="sport__img"><img src={s.img} alt="" loading="lazy" /></div>
                <div><b>{s.name}</b><br /><small>{sportCounts[s.slug]} products</small></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead
            eyebrow="Most wanted"
            title="Trending this week"
            action={<div className="tabs">{TABS.map((t) => <button key={t.key} className={cx('tab', tab === t.key && 'active')} onClick={() => setTab(t.key)}>{t.label}</button>)}</div>}
          />
          <div className="grid">{trending.map((p) => <ProductCard key={p.slug} p={p} />)}</div>
          <div className="load-more"><Link to={tab === 'all' ? '/shop' : `/c/${tab}`} className="btn btn--outline">Shop all {tab === 'all' ? 'products' : tab}</Link></div>
        </div>
      </section>

      <section className="section section--ink">
        <div className="container drop">
          <div className="drop__media">
            <img src={dropHero?.image} alt="" loading="lazy" />
            <span className="badge badge--new">Cricket edit</span>
          </div>
          <div>
            <span className="eyebrow">Featured drop</span>
            <h2 style={{ marginTop: 12 }}>The 22-yard<br />starter kit</h2>
            <p>Everything a serious weekend cricketer needs before the first ball: pro-grade helmet, match balls, whites that move and a wheelie that carries it all.</p>
            <div className="drop__list">
              {drop.map((p) => (
                <Link to={`/product/${p.slug}`} className="drop__row" key={p.slug}>
                  <img src={p.image} alt="" loading="lazy" />
                  <div><b>{p.name}</b><span>{p.colors.length} colour{p.colors.length === 1 ? '' : 's'} · ★ {p.rating}</span></div>
                  <em>{formatPrice(p.price)}</em>
                </Link>
              ))}
            </div>
            <Link to="/c/cricket" className="btn btn--accent" style={{ marginTop: 22 }}>Shop the full cricket range <ArrowRight width={16} height={16} /></Link>
          </div>
        </div>
      </section>

      <section className="section section--tight">
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
            <Rail items={sale} eyebrow="Limited time" title="Season sale" text="Best prices of the season on pro-grade kit." to="/sale" linkText="All deals" />
          </div>
        </section>
      )}

      <section className="section section--bg">
        <div className="container">
          <SectionHead eyebrow="Athlete reviews" title="Trusted on the field" center />
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
