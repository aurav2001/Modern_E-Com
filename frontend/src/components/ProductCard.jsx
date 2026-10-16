import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { formatPrice, discountPct, cx } from '../lib/utils'
import { subMeta } from '../lib/catalog'
import { Heart, HeartFill, Bag, Star } from './Icons'
import QuickAdd from './QuickAdd'

export default function ProductCard({ p, showCat = true }) {
  const { isWished, toggleWish } = useStore()
  const [quick, setQuick] = useState(false)
  const pct = discountPct(p)
  const alt = p.gallery.find((g) => g !== p.image)
  const wished = isWished(p.slug)
  const cat = p.subs.map(subMeta).find(Boolean)

  return (
    <article className="card">
      <div className="card__media">
        <img className={cx('main', alt && 'has-alt')} src={p.image} alt={p.name} loading="lazy" />
        {alt && <img className="alt" src={alt} alt="" loading="lazy" />}
        <div className="card__badges">
          {pct > 0 && <span className="badge badge--sale">-{pct}%</span>}
          {p.isNew && <span className="badge badge--new">New</span>}
          {p.stock > 0 && p.stock <= 5 && <span className="badge badge--low">Only {p.stock} left</span>}
        </div>
        <button className={cx('card__wish', wished && 'on')} onClick={() => toggleWish(p.slug, p.name)} aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}>
          {wished ? <HeartFill /> : <Heart />}
        </button>
        <button className="card__quick" onClick={() => setQuick(true)} aria-label="Quick add">
          <Bag /> <span>Quick add</span>
        </button>
      </div>
      <div className="card__body">
        {showCat && <span className="card__cat">{cat ? `${cat.categoryName} · ${cat.name}` : p.categories[0]}</span>}
        <h3 className="card__name" style={{ fontFamily: 'var(--font-body)', textTransform: 'none' }}>
          <Link to={`/product/${p.slug}`}>{p.name}</Link>
        </h3>
        <div className="card__row">
          <div className="price">
            <b>{formatPrice(p.price)}</b>
            {pct > 0 && <s>{formatPrice(p.mrp)}</s>}
          </div>
          <span className="rating"><Star /> <b>{p.rating}</b> ({p.reviews})</span>
        </div>
        {p.colors.length > 1 && (
          <div className="swatches">
            {p.colors.slice(0, 5).map((c) => <i key={c.name} className="swatch" style={{ background: c.hex }} title={c.name} />)}
            {p.colors.length > 5 && <small>+{p.colors.length - 5}</small>}
          </div>
        )}
      </div>
      {quick && <QuickAdd p={p} onClose={() => setQuick(false)} />}
    </article>
  )
}
