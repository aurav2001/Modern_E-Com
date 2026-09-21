import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { queryProducts, PRODUCTS } from '../lib/catalog'
import { formatPrice } from '../lib/utils'
import { Search, X, ArrowRight } from './Icons'

const POPULAR = ['polo', 'helmet', 'tracksuit', 'shoes', 'socks', 'compression', 'wheelie bag', 'tights']

export default function SearchOverlay() {
  const { searchOpen, setSearchOpen, recent } = useStore()
  const [q, setQ] = useState('')
  const ref = useRef(null)
  const nav = useNavigate()
  const loc = useLocation()

  useEffect(() => setSearchOpen(false), [loc.pathname, loc.search, setSearchOpen])
  useEffect(() => {
    if (!searchOpen) return
    document.body.classList.add('no-scroll')
    setTimeout(() => ref.current?.focus(), 20)
    const onKey = (e) => e.key === 'Escape' && setSearchOpen(false)
    window.addEventListener('keydown', onKey)
    return () => { document.body.classList.remove('no-scroll'); window.removeEventListener('keydown', onKey) }
  }, [searchOpen, setSearchOpen])

  const results = useMemo(() => (q.trim().length >= 2 ? queryProducts({ q }).slice(0, 8) : []), [q])
  const recentProducts = recent.map((s) => PRODUCTS.find((p) => p.slug === s)).filter(Boolean).slice(0, 4)

  if (!searchOpen) return null
  const submit = (e) => { e.preventDefault(); if (q.trim()) nav(`/search?q=${encodeURIComponent(q.trim())}`) }

  return (
    <div className="search-overlay">
      <div className="container">
        <form className="search-overlay__bar" onSubmit={submit}>
          <Search />
          <input ref={ref} className="search-overlay__input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search polos, helmets, shoes…" aria-label="Search" />
          <button type="button" className="icon-btn" onClick={() => setSearchOpen(false)} aria-label="Close search"><X /></button>
        </form>
        <div className="search-results">
          {q.trim().length < 2 ? (
            <>
              <span className="eyebrow">Popular searches</span>
              <div className="search-chips">
                {POPULAR.map((t) => <button key={t} className="chip" onClick={() => setQ(t)}>{t}</button>)}
              </div>
              {recentProducts.length > 0 && (
                <>
                  <span className="eyebrow" style={{ display: 'block', marginTop: 28 }}>Recently viewed</span>
                  <div className="search-list">
                    {recentProducts.map((p) => <Row key={p.slug} p={p} />)}
                  </div>
                </>
              )}
            </>
          ) : results.length === 0 ? (
            <div className="empty"><h3>No results for “{q}”</h3><p>Try a different spelling or a broader term like “jacket” or “cricket”.</p></div>
          ) : (
            <>
              <div className="search-list">{results.map((p) => <Row key={p.slug} p={p} />)}</div>
              <button className="btn btn--outline" style={{ marginTop: 18 }} onClick={submit}>See all results for “{q}” <ArrowRight width={16} height={16} /></button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({ p }) {
  return (
    <Link to={`/product/${p.slug}`} className="search-row">
      <img src={p.image} alt="" />
      <div><b>{p.name}</b><span>{p.categories.join(' · ')}</span></div>
      <em>{formatPrice(p.price)}</em>
    </Link>
  )
}
