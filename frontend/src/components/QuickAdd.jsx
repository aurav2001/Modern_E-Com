import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { formatPrice, discountPct, cx } from '../lib/utils'
import { sortSizes } from '../lib/catalog'
import { X, Bag, Ruler, Check } from './Icons'

export default function QuickAdd({ p, onClose }) {
  const { addToCart } = useStore()
  const [color, setColor] = useState(p.colors[0]?.name)
  const [size, setSize] = useState(p.sizes.length === 1 ? p.sizes[0] : null)
  const [err, setErr] = useState('')
  const [added, setAdded] = useState(false)
  const img = p.colors.find((c) => c.name === color)?.image || p.image
  const pct = discountPct(p)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.classList.add('no-scroll')
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.classList.remove('no-scroll')
    }
  }, [onClose])

  const add = () => {
    if (p.sizes.length && !size) {
      setErr('Please select a size')
      return
    }
    addToCart(p, color, size, 1)
    setAdded(true)
    setTimeout(() => {
      onClose()
    }, 400)
  }

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal modal--quickadd"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={`Quick add ${p.name}`}
      >
        <div className="quickadd-head">
          <span className="quickadd-tag">
            <span className="quickadd-tag-dot" /> Quick Add
          </span>
          <button
            type="button"
            className="quickadd-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X width={17} height={17} />
          </button>
        </div>

        <div className="quickadd-grid">
          <div className="quickadd-media">
            <img src={img} alt={p.name} className="quickadd-img" />
            {pct > 0 && <span className="quickadd-badge-discount">-{pct}%</span>}
          </div>

          <div className="quickadd-info">
            <div>
              <h3 className="quickadd-title">{p.name}</h3>
              <div className="quickadd-price-row">
                <span className="quickadd-price">{formatPrice(p.price)}</span>
                {p.mrp > p.price && (
                  <>
                    <span className="quickadd-mrp">{formatPrice(p.mrp)}</span>
                    <span className="quickadd-discount-pill">-{pct}% OFF</span>
                  </>
                )}
              </div>
            </div>

            {p.colors.length > 0 && (
              <div className="quickadd-opt">
                <div className="quickadd-opt-label">
                  Colour: <b>{color}</b>
                </div>
                <div className="quickadd-swatches">
                  {p.colors.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      className={cx('quickadd-swatch', color === c.name && 'active')}
                      onClick={() => setColor(c.name)}
                      title={c.name}
                      aria-label={c.name}
                    >
                      <i style={{ background: c.hex }} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {p.sizes.length > 0 && (
              <div className="quickadd-opt">
                <div className="quickadd-opt-header">
                  <span className="quickadd-opt-label">
                    Size: {size && <b>{size.replace('UK-', 'UK ')}</b>}
                  </span>
                  <Link to="/size-chart" className="quickadd-sizeguide" onClick={onClose}>
                    <Ruler width={13} height={13} /> Size guide
                  </Link>
                </div>
                <div className="quickadd-sizes">
                  {sortSizes(p.sizes).map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={cx('quickadd-size-btn', size === s && 'active')}
                      onClick={() => {
                        setSize(s)
                        setErr('')
                      }}
                    >
                      {s.replace('UK-', 'UK ')}
                    </button>
                  ))}
                </div>
                {err && <span className="quickadd-error">{err}</span>}
              </div>
            )}

            <button
              type="button"
              className={cx('quickadd-btn', added && 'quickadd-btn--success')}
              onClick={add}
              disabled={added}
            >
              {added ? (
                <>
                  <Check width={17} height={17} /> Added to Bag!
                </>
              ) : (
                <>
                  <Bag width={17} height={17} /> Add to Bag
                </>
              )}
            </button>

            <Link
              to={`/product/${p.slug}`}
              className="quickadd-link"
              onClick={onClose}
            >
              View full details →
            </Link>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
