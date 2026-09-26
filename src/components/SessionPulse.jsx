import { useEffect, useState } from 'react'

// Maker's mark. Nothing renders and nothing is logged until the key sequence below is
// typed outside a text field; then the monogram fades in for a few seconds.
const SEQUENCE = 'gpgp'
const WINDOW_MS = 1800
const SHOW_MS = 3800

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
        animation: 'gpFade 3.8s cubic-bezier(0.16, 1, 0.3, 1) both',
      }}
    >
      <style>{`
        @keyframes gpFade {
          0% { opacity: 0; transform: translateY(16px) scale(0.92); }
          12% { opacity: 1; transform: translateY(0) scale(1); }
          82% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(10px) scale(0.96); }
        }
      `}</style>
      <div
        style={{
          position: 'relative',
          width: '110px',
          height: '110px',
          borderRadius: '22px',
          background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
          border: '1.5px solid rgba(245, 130, 31, 0.4)',
          boxShadow: '0 20px 45px rgba(14, 22, 38, 0.16), 0 0 25px rgba(245, 130, 31, 0.12), inset 0 1px 0 #ffffff',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '10px',
          boxSizing: 'border-box',
        }}
      >
        {/* Subtle orange accent top ambient line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '20%',
            right: '20%',
            height: '2.5px',
            background: 'linear-gradient(90deg, transparent, #f5821f, transparent)',
            borderRadius: '2px',
          }}
        />

        <svg viewBox="0 0 120 120" style={{ width: '64px', height: '64px', display: 'block', marginTop: '-2px' }}>
          <defs>
            <linearGradient id="gpGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f5821f" />
              <stop offset="50%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#0e1626" />
            </linearGradient>
            <filter id="gpGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#f5821f" floodOpacity="0.25" />
            </filter>
          </defs>
          {/* G */}
          <path
            d="M62 40 A24 24 0 1 0 62 80 L62 62 L48 62"
            fill="none"
            stroke="url(#gpGrad)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#gpGlow)"
          />
          {/* P */}
          <path
            d="M74 88 L74 34 L88 34 A14 14 0 0 1 88 62 L74 62"
            fill="none"
            stroke="url(#gpGrad)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#gpGlow)"
          />
          <circle cx="60" cy="104" r="3.5" fill="#f5821f" filter="url(#gpGlow)" />
        </svg>

        <span
          style={{
            position: 'absolute',
            bottom: '8px',
            fontSize: '7.5px',
            fontWeight: '800',
            letterSpacing: '0.26em',
            color: '#0e1626',
            textTransform: 'uppercase',
            fontFamily: "var(--font-head, 'Archivo', sans-serif)",
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          CRAFTED BY GP
        </span>
      </div>
    </div>
  )
}
