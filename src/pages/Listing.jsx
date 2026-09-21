import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams, useLocation } from 'react-router-dom'
import { queryProducts, facets, subsForCategory, subMeta, CATEGORY_META, SPORTS, sortSizes } from '../lib/catalog'
import { Crumbs } from '../components/Shared'
import ProductCard from '../components/ProductCard'
import { Filter, X, ChevronDown } from '../components/Icons'
import { cx, formatPrice, titleCase } from '../lib/utils'

const PAGE = 24
const SORTS = [
  ['popular', 'Most popular'],
  ['newest', 'Newest first'],
  ['price-asc', 'Price: low to high'],
  ['price-desc', 'Price: high to low'],
  ['discount', 'Biggest discount'],
]

export default function Listing({ mode }) {
  const { cat, sub, sport } = useParams()
  const [sp, setSp] = useSearchParams()
  const loc = useLocation()
  const [drawer, setDrawer] = useState(false)
  const [limit, setLimit] = useState(PAGE)

  const q = sp.get('q') || ''
  const sort = sp.get('sort') || 'popular'
  const colors = sp.getAll('color')
  const sizes = sp.getAll('size')
  const minP = sp.get('min') ? +sp.get('min') : null
  const maxP = sp.get('max') ? +sp.get('max') : null

  const base = useMemo(() => queryProducts({ category: cat, sub, sport, q, onlyNew: mode === 'new', onlySale: mode === 'sale' }), [cat, sub, sport, q, mode])
  const list = useMemo(() => queryProducts({ category: cat, sub, sport, q, onlyNew: mode === 'new', onlySale: mode === 'sale', colors, sizes, minPrice: minP, maxPrice: maxP, sort }), [cat, sub, sport, q, mode, colors.join(), sizes.join(), minP, maxP, sort])
  const f = useMemo(() => facets(base), [base])

  useEffect(() => setLimit(PAGE), [loc.pathname, loc.search])
  useEffect(() => { document.body.classList.toggle('no-scroll', drawer); return () => document.body.classList.remove('no-scroll') }, [drawer])

  const set = (key, values) => {
    const next = new URLSearchParams(sp)
    next.delete(key)
    ;[].concat(values).filter((v) => v !== null && v !== undefined && v !== '').forEach((v) => next.append(key, v))
    setSp(next, { replace: true })
  }
  const toggle = (key, v) => { const cur = sp.getAll(key); set(key, cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]) }
  const clearAll = () => { const next = new URLSearchParams(); if (q) next.set('q', q); setSp(next, { replace: true }) }
  const activeCount = colors.length + sizes.length + (minP != null || maxP != null ? 1 : 0)

  // Title / crumbs
  const subInfo = sub ? subMeta(sub) : null
  const sportInfo = sport ? SPORTS.find((s) => s.slug === sport) : null
  let title = 'All products', text = 'Every style in one place.', crumbs = [{ label: 'Shop', to: '/shop' }]
  if (mode === 'new') { title = 'New arrivals'; text = 'Fresh drops, straight from the design floor.'; crumbs = [{ label: 'New arrivals' }] }
  else if (mode === 'sale') { title = 'Sale'; text = 'Season-best prices on pro-grade kit. While stocks last.'; crumbs = [{ label: 'Sale' }] }
  else if (q) { title = `Results for “${q}”`; text = `${list.length} product${list.length === 1 ? '' : 's'} found`; crumbs = [{ label: 'Search' }] }
  else if (sportInfo) { title = sportInfo.name; text = `Everything you need for ${sportInfo.name.toLowerCase()} — apparel, footwear and accessories.`; crumbs = [{ label: 'Sport' }, { label: sportInfo.name }] }
  else if (subInfo) { title = subInfo.name; text = `${subInfo.categoryName} · ${subInfo.group}`; crumbs = [{ label: subInfo.categoryName, to: `/c/${subInfo.category}` }, { label: subInfo.name }] }
  else if (cat) { title = CATEGORY_META[cat]?.name || titleCase(cat); text = CATEGORY_META[cat]?.tagline; crumbs = [{ label: title }] }

  const subs = cat ? subsForCategory(cat) : []
  const shown = list.slice(0, limit)

  const filtersEl = (
    <div className="filters">
      {activeCount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12 }}><b>Filters ({activeCount})</b><button className="fclear" onClick={clearAll}>Clear all</button></div>}
      {cat && subs.length > 0 && (
        <FGroup title="Category">
          <Link to={`/c/${cat}`} className={cx('fopt')} style={{ fontWeight: !sub ? 600 : 400 }}>All {CATEGORY_META[cat]?.name}<small>{queryProducts({ category: cat }).length}</small></Link>
          {subs.map((s) => (
            <Link key={s.slug} to={`/c/${cat}/${s.slug}`} className="fopt" style={{ fontWeight: sub === s.slug ? 600 : 400, color: sub === s.slug ? 'var(--accent-ink)' : undefined }}>{s.name}<small>{s.count}</small></Link>
          ))}
        </FGroup>
      )}
      <FGroup title="Price">
        <div className="frange">
          <input className="input" type="number" placeholder={`Min ${f.min}`} value={minP ?? ''} onChange={(e) => set('min', e.target.value)} aria-label="Minimum price" />
          <span>–</span>
          <input className="input" type="number" placeholder={`Max ${f.max}`} value={maxP ?? ''} onChange={(e) => set('max', e.target.value)} aria-label="Maximum price" />
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
          {[[0, 999], [1000, 1999], [2000, 3999], [4000, null]].map(([a, b]) => (
            <button key={a} className={cx('chip', minP === a && maxP === b && 'active')} onClick={() => { const n = new URLSearchParams(sp); n.set('min', a); b ? n.set('max', b) : n.delete('max'); setSp(n, { replace: true }) }}>
              {b ? `${formatPrice(a)} – ${formatPrice(b)}` : `${formatPrice(a)}+`}
            </button>
          ))}
        </div>
      </FGroup>
      {f.colors.length > 0 && (
        <FGroup title="Colour">
          <div className="fcolors">
            {f.colors.map(([name, hex]) => (
              <button key={name} className={cx('fcolor', colors.includes(name) && 'active')} onClick={() => toggle('color', name)}><i style={{ background: hex }} />{name}</button>
            ))}
          </div>
        </FGroup>
      )}
      {f.sizes.length > 0 && (
        <FGroup title="Size">
          <div className="fsizes">
            {f.sizes.map((s) => <button key={s} className={cx('fsize', sizes.includes(s) && 'active')} onClick={() => toggle('size', s)}>{s.replace('UK-', 'UK ')}</button>)}
          </div>
        </FGroup>
      )}
    </div>
  )

  return (
    <div className="container">
      <div className="page-head">
        <Crumbs items={crumbs} />
        <h1>{title}</h1>
        {text && <p>{text}</p>}
        {cat && subs.length > 0 && (
          <div className="subnav">
            <Link to={`/c/${cat}`} className={cx('chip', !sub && 'active')}>All</Link>
            {subs.map((s) => <Link key={s.slug} to={`/c/${cat}/${s.slug}`} className={cx('chip', sub === s.slug && 'active')}>{s.name}</Link>)}
          </div>
        )}
      </div>

      <div className="listing">
        {filtersEl}
        <div>
          <div className="toolbar">
            <span className="toolbar__count">{list.length} product{list.length === 1 ? '' : 's'}</span>
            <div className="toolbar__right">
              <button className="btn btn--sm btn--ghost toolbar__filter-btn" onClick={() => setDrawer(true)}><Filter width={16} height={16} /> Filters {activeCount > 0 && `(${activeCount})`}</button>
              <select className="select" value={sort} onChange={(e) => set('sort', e.target.value)} aria-label="Sort by">
                {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>
          {activeCount > 0 && (
            <div className="active-filters">
              {colors.map((c) => <button key={c} className="chip active" onClick={() => toggle('color', c)}>{c} <X width={14} height={14} /></button>)}
              {sizes.map((s) => <button key={s} className="chip active" onClick={() => toggle('size', s)}>{s.replace('UK-', 'UK ')} <X width={14} height={14} /></button>)}
              {(minP != null || maxP != null) && <button className="chip active" onClick={() => { const n = new URLSearchParams(sp); n.delete('min'); n.delete('max'); setSp(n, { replace: true }) }}>{minP != null ? formatPrice(minP) : '₹0'} – {maxP != null ? formatPrice(maxP) : 'any'} <X width={14} height={14} /></button>}
            </div>
          )}
          {shown.length === 0 ? (
            <div className="empty">
              <h3>Nothing matches those filters</h3>
              <p>Try removing a filter or two, or browse the full range.</p>
              <button className="btn btn--outline" style={{ marginTop: 16 }} onClick={clearAll}>Clear filters</button>
            </div>
          ) : (
            <>
              <div className="grid">{shown.map((p) => <ProductCard key={p.slug} p={p} showCat={!sub} />)}</div>
              {limit < list.length && (
                <div className="load-more">
                  <button className="btn btn--outline" onClick={() => setLimit(limit + PAGE)}>Load more ({list.length - limit} remaining)</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {drawer && (
        <>
          <div className="drawer-backdrop" onClick={() => setDrawer(false)} />
          <aside className="drawer drawer--left" aria-label="Filters">
            <div className="drawer__head"><h3>Filters</h3><button className="icon-btn" onClick={() => setDrawer(false)} aria-label="Close"><X /></button></div>
            <div className="drawer__body">{filtersEl}</div>
            <div className="drawer__foot" style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn--ghost" onClick={clearAll} style={{ flex: 1 }}>Clear</button>
              <button className="btn btn--primary" onClick={() => setDrawer(false)} style={{ flex: 2 }}>Show {list.length} products</button>
            </div>
          </aside>
        </>
      )}
    </div>
  )
}

function FGroup({ title, children }) {
  const [open, setOpen] = useState(true)
  return (
    <div className={cx('fgroup', !open && 'closed')}>
      <button className="fgroup__head" onClick={() => setOpen(!open)} aria-expanded={open}>{title} <ChevronDown /></button>
      <div className="fgroup__body">{children}</div>
    </div>
  )
}
