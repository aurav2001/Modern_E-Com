import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { formatPrice, cx } from '../lib/utils'
import { sortSizes } from '../lib/catalog'
import { X } from './Icons'

export default function QuickAdd({ p, onClose }) {
  const { addToCart } = useStore()
  const [color, setColor] = useState(p.colors[0]?.name)
  const [size, setSize] = useState(p.sizes.length === 1 ? p.sizes[0] : null)
  const [err, setErr] = useState('')
  const img = p.colors.find((c) => c.name === color)?.image || p.image

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.classList.add('no-scroll')
    return () => { window.removeEventListener('keydown', onKey); document.body.classList.remove('no-scroll') }
  }, [onClose])

  const add = () => {
    if (p.sizes.length && !size) return setErr('Please select a size')
    addToCart(p, color, size, 1)
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={`Quick add ${p.name}`}>
        <div className="modal__head">
          <span className="eyebrow">Quick add</span>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><X /></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 20 }}>
          <img src={img} alt="" style={{ width: 120, aspectRatio: '4/5', objectFit: 'cover', borderRadius: 10, background: 'var(--bg)' }} />
          <div style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
            <div>
              <h3 style={{ fontSize: 22 }}>{p.name}</h3>
              <div className="price" style={{ marginTop: 4 }}><b>{formatPrice(p.price)}</b>{p.mrp > p.price && <s>{formatPrice(p.mrp)}</s>}</div>
            </div>
            {p.colors.length > 0 && (
              <div className="opt">
                <div className="opt__head"><b>Colour: <span>{color}</span></b></div>
                <div className="colors">
                  {p.colors.map((c) => (
                    <button key={c.name} className={cx('color', color === c.name && 'active')} onClick={() => setColor(c.name)} title={c.name} aria-label={c.name}><i style={{ background: c.hex }} /></button>
                  ))}
                </div>
              </div>
            )}
            {p.sizes.length > 0 && (
              <div className="opt">
                <div className="opt__head"><b>Size</b><Link to="/size-chart" onClick={onClose}>Size guide</Link></div>
                <div className="sizes">
                  {sortSizes(p.sizes).map((s) => (
                    <button key={s} className={cx('size', size === s && 'active')} onClick={() => { setSize(s); setErr('') }}>{s.replace('UK-', 'UK ')}</button>
                  ))}
                </div>
                {err && <span className="opt__error">{err}</span>}
              </div>
            )}
            <button className="btn btn--primary btn--lg" onClick={add}>Add to bag</button>
            <Link to={`/product/${p.slug}`} className="btn btn--link" style={{ justifySelf: 'start' }} onClick={onClose}>View full details</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
