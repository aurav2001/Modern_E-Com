import { useEffect, useState } from 'react'

// Maker's mark. Nothing renders and nothing is logged until the key sequence below is
// typed outside a text field; then the monogram fades in for a few seconds.
const SEQUENCE = 'gpgp'
const WINDOW_MS = 1800
const SHOW_MS = 3500

export default function SessionPulse() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let typed = ''
    let last = 0
    let hideTimer = null

    const onKey = (e) => {
      const tag = e.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable) return
      if (e.key === 'Escape') {
        setVisible(false)
        return
      }
      if (e.key.length !== 1) return

      const now = Date.now()
      typed = (now - last > WINDOW_MS ? '' : typed) + e.key.toLowerCase()
      last = now
      if (!typed.endsWith(SEQUENCE)) return

      typed = ''
      setVisible(true)
      clearTimeout(hideTimer)
      hideTimer = setTimeout(() => setVisible(false), SHOW_MS)
    }

    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      clearTimeout(hideTimer)
    }
  }, [])

  if (!visible) return null

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        bottom: '22px',
        left: '22px',
        zIndex: 2147483000,
        pointerEvents: 'none',
        animation: 'gpFade 3.5s ease-in-out both',
      }}
    >
      <style>{`
        @keyframes gpFade {
          0% { opacity: 0; transform: translateY(14px) scale(.94); }
          12% { opacity: 1; transform: translateY(0) scale(1); }
          80% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(8px) scale(.98); }
        }
      `}</style>
      <div
        style={{
          position: 'relative',
          width: '104px',
          height: '104px',
          borderRadius: '24px',
          background: 'rgba(7, 19, 36, 0.95)',
          border: '1px solid rgba(56, 189, 248, 0.4)',
          boxShadow: '0 18px 50px rgba(0, 0, 0, 0.55), 0 0 25px rgba(56, 189, 248, 0.2)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg viewBox="0 0 120 120" style={{ width: '70px', height: '70px', display: 'block' }}>
          <defs>
            <linearGradient id="gpGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
          {/* G */}
          <path
            d="M62 40 A24 24 0 1 0 62 80 L62 62 L48 62"
            fill="none"
            stroke="url(#gpGrad)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* P */}
          <path
            d="M74 88 L74 34 L88 34 A14 14 0 0 1 88 62 L74 62"
            fill="none"
            stroke="url(#gpGrad)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="60" cy="104" r="3.5" fill="#38bdf8" />
        </svg>
        <span
          style={{
            position: 'absolute',
            bottom: '9px',
            fontSize: '7.5px',
            fontWeight: '800',
            letterSpacing: '0.28em',
            color: 'rgba(186, 230, 253, 0.75)',
            textTransform: 'uppercase',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          CRAFTED BY GP
        </span>
      </div>
    </div>
  )
}
