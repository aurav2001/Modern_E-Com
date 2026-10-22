import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { ChevronLeft, ChevronRight, Star, StarHalf, Check, X, Minus, Plus, Play, Pause, ArrowRight } from './Icons'
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
        {eyebrow && (
          <span className="eyebrow">
            <span className="eyebrow__dot" />
            {eyebrow}
          </span>
        )}
        <h2>{title}</h2>
        {text && <p>{text}</p>}
      </div>
      {action}
    </div>
  )
}

export function Rail({
  items = [],
  eyebrow,
  title,
  text,
  to,
  linkText = 'View all',
  autoSlide = true,
  interval = 3500,
  showProgress = true,
  showDots = true,
  showControls = true,
}) {
  const ref = useRef(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)
  const [slideKey, setSlideKey] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const isDraggingRef = useRef(false)
  const startXRef = useRef(0)
  const scrollLeftRef = useRef(0)
  const hasMovedRef = useRef(false)
  const pauseTimeoutRef = useRef(null)

  // Calculate card step size including gap
  const getStep = () => {
    if (!ref.current) return 300
    const card = ref.current.firstElementChild
    return card ? card.offsetWidth + 16 : ref.current.clientWidth * 0.75
  }

  const updateScrollState = () => {
    if (!ref.current) return
    const { scrollLeft, scrollWidth, clientWidth } = ref.current
    setCanScrollLeft(scrollLeft > 15)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 15)

    const step = getStep()
    if (step > 0 && items.length > 0) {
      const idx = Math.min(items.length - 1, Math.max(0, Math.round(scrollLeft / step)))
      setActiveIndex(idx)
    }
  }

  const scrollByStep = (direction) => {
    if (!ref.current) return
    const step = getStep()
    const { scrollLeft, scrollWidth, clientWidth } = ref.current
    const maxScroll = scrollWidth - clientWidth

    if (direction > 0 && scrollLeft >= maxScroll - 20) {
      ref.current.scrollTo({ left: 0, behavior: 'smooth' })
    } else if (direction < 0 && scrollLeft <= 20) {
      ref.current.scrollTo({ left: maxScroll, behavior: 'smooth' })
    } else {
      ref.current.scrollBy({ left: direction * step, behavior: 'smooth' })
    }
    setSlideKey((k) => k + 1)
  }

  const handleManualScroll = (direction) => {
    scrollByStep(direction)
    setIsPaused(true)
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current)
    pauseTimeoutRef.current = setTimeout(() => setIsPaused(false), 3000)
  }

  const scrollToDot = (idx) => {
    if (!ref.current) return
    const step = getStep()
    ref.current.scrollTo({ left: idx * step, behavior: 'smooth' })
    setActiveIndex(idx)
    setSlideKey((k) => k + 1)
    setIsPaused(true)
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current)
    pauseTimeoutRef.current = setTimeout(() => setIsPaused(false), 3000)
  }

  // Auto slide effect
  useEffect(() => {
    if (!autoSlide || !isPlaying || isPaused || isDragging || items.length <= 1) return

    const timer = setInterval(() => {
      scrollByStep(1)
    }, interval)

    return () => clearInterval(timer)
  }, [autoSlide, isPlaying, isPaused, isDragging, interval, items.length])

  // Scroll and resize listeners
  useEffect(() => {
    const el = ref.current
    if (!el) return
    updateScrollState()
    const onScroll = () => {
      requestAnimationFrame(updateScrollState)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', updateScrollState)
    return () => {
      el.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', updateScrollState)
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current)
    }
  }, [items.length])

  // Pause on hidden document tab
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) setIsPaused(true)
      else setIsPaused(false)
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  // Mouse drag handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0 || !ref.current) return
    isDraggingRef.current = true
    hasMovedRef.current = false
    startXRef.current = e.pageX - ref.current.offsetLeft
    scrollLeftRef.current = ref.current.scrollLeft
    setIsDragging(true)
  }

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current || !ref.current) return
    const x = e.pageX - ref.current.offsetLeft
    const walk = (x - startXRef.current) * 1.3
    if (Math.abs(walk) > 5) {
      hasMovedRef.current = true
    }
    ref.current.scrollLeft = scrollLeftRef.current - walk
  }

  const handleMouseUp = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false
      setIsDragging(false)
      updateScrollState()
      setSlideKey((k) => k + 1)
    }
  }

  const handleClickCapture = (e) => {
    if (hasMovedRef.current) {
      e.preventDefault()
      e.stopPropagation()
      hasMovedRef.current = false
    }
  }

  const totalDots = Math.min(items.length, 8)

  return (
    <div
      className="rail"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        setIsPaused(false)
        if (isDraggingRef.current) {
          isDraggingRef.current = false
          setIsDragging(false)
        }
      }}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => {
        if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current)
        pauseTimeoutRef.current = setTimeout(() => setIsPaused(false), 2000)
      }}
    >
      <div className="sec-head">
        <div>
          {eyebrow && (
            <span className="eyebrow">
              <span className="eyebrow__dot" />
              {eyebrow}
            </span>
          )}
          <h2 className="rail__title">{title}</h2>
          {text && <p>{text}</p>}
        </div>
        <div className="rail__actions">
          {to && (
            <Link to={to} className="btn btn--sm btn--rail-view">
              <span>{linkText}</span>
              <ArrowRight width={14} height={14} className="rail__view-arrow" />
            </Link>
          )}
          {showControls && (
            <div className="rail__btns">
              {autoSlide && (
                <button
                  className={cx('rail__btn', 'rail__btn--play', !isPlaying && 'paused')}
                  onClick={() => setIsPlaying((p) => !p)}
                  aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
                  title={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
                >
                  {isPlaying ? <Pause width={13} height={13} /> : <Play width={13} height={13} />}
                </button>
              )}
              <button
                className={cx('rail__btn', !canScrollLeft && 'rail__btn--disabled')}
                onClick={() => handleManualScroll(-1)}
                aria-label="Scroll left"
              >
                <ChevronLeft />
              </button>
              <button
                className={cx('rail__btn', !canScrollRight && 'rail__btn--disabled')}
                onClick={() => handleManualScroll(1)}
                aria-label="Scroll right"
              >
                <ChevronRight />
              </button>
            </div>
          )}
        </div>
      </div>

      {autoSlide && showProgress && (
        <div className="rail__progress-wrap" aria-hidden="true">
          <div
            key={slideKey}
            className={cx('rail__progress-bar', (!isPlaying || isPaused || isDragging) && 'rail__progress-bar--paused')}
            style={{ animationDuration: `${interval}ms` }}
          />
        </div>
      )}

      <div className="rail__wrap">
        <div className={cx('rail__fade', 'rail__fade--left', canScrollLeft && 'visible')} />
        <div className={cx('rail__fade', 'rail__fade--right', canScrollRight && 'visible')} />

        <div
          className={cx('rail__track', isDragging && 'is-dragging')}
          ref={ref}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onClickCapture={handleClickCapture}
        >
          {items.map((p) => (
            <ProductCard key={p.slug} p={p} />
          ))}
        </div>
      </div>

      {showDots && totalDots > 1 && (
        <div className="rail__footer">
          <div className="rail__dots">
            {Array.from({ length: totalDots }).map((_, i) => (
              <button
                key={i}
                className={cx('rail__dot', activeIndex % totalDots === i && 'active')}
                onClick={() => scrollToDot(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
          <div className="rail__counter">
            <span className="rail__counter-current">{String((activeIndex % totalDots) + 1).padStart(2, '0')}</span>
            <span className="rail__counter-sep">/</span>
            <span className="rail__counter-total">{String(totalDots).padStart(2, '0')}</span>
          </div>
        </div>
      )}
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

export function Modal({ title, onClose, children, width, className, style }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.classList.add('no-scroll')
    return () => { window.removeEventListener('keydown', onKey); document.body.classList.remove('no-scroll') }
  }, [onClose])
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className={cx('modal', className)} style={{ ...(width ? { maxWidth: width } : {}), ...style }} onClick={(e) => e.stopPropagation()} role="dialog" aria-label={title}>
        <div className="modal__head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><X /></button>
        </div>
        {children}
      </div>
    </div>
  )
}
