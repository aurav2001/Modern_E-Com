import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { ChevronLeft, ChevronRight, Star, StarHalf, Check, X, Minus, Plus } from './Icons'
import { cx } from '../lib/utils'
import ProductCard from './ProductCard'

export function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [pathname])
  return null
}

export function SectionHead({ eyebrow, title, text, action, center }) {
  return (
    <div className={cx('sec-head', center && 'sec-head--center')}>
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
        {text && <p>{text}</p>}
      </div>
      {action}
    </div>
  )
}

export function Rail({ items, eyebrow, title, text, to, linkText = 'View all' }) {
  const ref = useRef(null)
  const scroll = (dir) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: 'smooth' })
  return (
    <div className="rail">
      <div className="sec-head">
        <div>
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h2>{title}</h2>
          {text && <p>{text}</p>}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {to && <Link to={to} className="btn btn--sm btn--ghost">{linkText}</Link>}
          <div className="rail__btns">
            <button className="rail__btn" onClick={() => scroll(-1)} aria-label="Scroll left"><ChevronLeft /></button>
            <button className="rail__btn" onClick={() => scroll(1)} aria-label="Scroll right"><ChevronRight /></button>
          </div>
        </div>
      </div>
      <div className="rail__track" ref={ref}>
        {items.map((p) => <ProductCard key={p.slug} p={p} />)}
      </div>
    </div>
  )
}

export function Stars({ value, size = 16 }) {
  const full = Math.floor(value), half = value - full >= 0.5
  return (
    <span className="stars" aria-label={`${value} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) =>
        i < full ? <Star key={i} width={size} height={size} /> : i === full && half ? <StarHalf key={i} width={size} height={size} /> : <Star key={i} width={size} height={size} style={{ color: '#d9dbe3' }} />
      )}
    </span>
  )
}

export function Crumbs({ items }) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      <Link to="/">Home</Link>
      {items.map((it, i) => (
        <span key={i} style={{ display: 'contents' }}>
          <ChevronRight />
          {it.to && i < items.length - 1 ? <Link to={it.to}>{it.label}</Link> : <span>{it.label}</span>}
        </span>
      ))}
    </nav>
  )
}

export function Qty({ value, onChange, small, max = 10 }) {
  return (
    <div className={cx('qty', small && 'qty--sm')}>
      <button onClick={() => onChange(Math.max(1, value - 1))} aria-label="Decrease"><Minus /></button>
      <span>{value}</span>
      <button onClick={() => onChange(Math.min(max, value + 1))} aria-label="Increase"><Plus /></button>
    </div>
  )
}

export function Toasts() {
  const { toasts } = useStore()
  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={cx('toast', t.tone === 'error' && 'toast--error')}>
          {t.tone === 'error' ? <X /> : <Check />} {t.message}
        </div>
      ))}
    </div>
  )
}

export function Accordion({ items, defaultOpen = 0 }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="acc">
      {items.map((it, i) => (
        <div className={cx('acc__item', open === i && 'open')} key={i}>
          <button className="acc__btn" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
            {it.title} <Plus />
          </button>
          <div className="acc__body">{it.body}</div>
        </div>
      ))}
    </div>
  )
}

export function Reveal({ children, className, as: Tag = 'div' }) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || !('IntersectionObserver' in window)) return setInView(true)
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); io.disconnect() } }, { rootMargin: '0px 0px -10% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return <Tag ref={ref} className={cx('reveal', inView && 'in', className)}>{children}</Tag>
}

export function Modal({ title, onClose, children, width }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.classList.add('no-scroll')
    return () => { window.removeEventListener('keydown', onKey); document.body.classList.remove('no-scroll') }
  }, [onClose])
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={width ? { maxWidth: width } : undefined} onClick={(e) => e.stopPropagation()} role="dialog" aria-label={title}>
        <div className="modal__head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><X /></button>
        </div>
        {children}
      </div>
    </div>
  )
}
