import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BRAND } from '../data/content'
import { WhatsApp, ArrowRight, Zap, Shield, Check, X, Wind, Droplet, ShieldCheck, Clipboard, ZoomIn, Download } from './Icons'

const DESIGNS = [
  { id: 6, code: 'DESIGN 6', name: 'Stealth Force', colors: ['#111111', '#c59b27', '#ffffff'], desc: 'BLACK · GOLD · WHITE' },
  { id: 7, code: 'DESIGN 7', name: 'Midnight Strike', colors: ['#0f2240', '#ea580c', '#ffffff'], desc: 'NAVY BLUE · ORANGE · WHITE' },
  { id: 8, code: 'DESIGN 8', name: 'Steel Titanium', colors: ['#374151', '#84cc16', '#ffffff'], desc: 'CHARCOAL · LIME GREEN · WHITE' },
  { id: 9, code: 'DESIGN 9', name: 'Crimson Edge', colors: ['#7f1d1d', '#c59b27', '#111111'], desc: 'MAROON · GOLD · BLACK' },
  { id: 10, code: 'DESIGN 10', name: 'Arctic Impact', colors: ['#1d4ed8', '#ffffff', '#111111'], desc: 'ROYAL BLUE · WHITE · BLACK' },
  { id: 11, code: 'DESIGN 11', name: 'Forest Guard', colors: ['#14532d', '#111111', '#ffffff'], desc: 'FOREST GREEN · BLACK · WHITE' },
  { id: 12, code: 'DESIGN 12', name: 'Sunset Blaze', colors: ['#111111', '#dc2626', '#ffffff'], desc: 'BLACK · RED · WHITE' },
  { id: 13, code: 'DESIGN 13', name: 'Copper Rush', colors: ['#111111', '#b45309', '#ffffff'], desc: 'BLACK · COPPER · WHITE' },
  { id: 14, code: 'DESIGN 14', name: 'Ocean Depth', colors: ['#0284c7', '#06b6d4', '#ffffff'], desc: 'OCEAN BLUE · CYAN · WHITE' },
  { id: 15, code: 'DESIGN 15', name: 'Voltage', colors: ['#111111', '#eab308', '#ffffff'], desc: 'BLACK · NEON YELLOW · WHITE' },
  { id: 16, code: 'DESIGN 16', name: 'Purple Haze', colors: ['#581c87', '#111111', '#c59b27'], desc: 'PURPLE · BLACK · GOLD' },
  { id: 17, code: 'DESIGN 17', name: 'Sandstorm', colors: ['#c2a677', '#111111', '#ffffff'], desc: 'SAND · BLACK · WHITE' },
]

const FEATURES = [
  { icon: Wind, title: 'Breathable Fabric', text: 'Stay cool and comfortable all day long.', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.12)', border: 'rgba(56, 189, 248, 0.28)' },
  { icon: Droplet, title: 'Moisture Wicking', text: 'Keeps sweat away and dries fast.', color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.12)', border: 'rgba(96, 165, 250, 0.28)' },
  { icon: ShieldCheck, title: 'Durable & Comfort', text: 'Built to last with superior comfort.', color: '#34d399', bg: 'rgba(52, 211, 153, 0.12)', border: 'rgba(52, 211, 153, 0.28)' },
  { icon: Zap, title: 'High Performance', text: 'Lightweight fabric for maximum performance.', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.28)' },
]

export default function RSConstructionSection() {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedDesign, setSelectedDesign] = useState(DESIGNS[1]) // Design 7 as default
  const [zoomLevel, setZoomLevel] = useState(1)
  const phone = BRAND.phoneIntl.replace('+', '')

  const getWaLink = (design) => {
    const text = `Hi Rishikar Sports, I am interested in the RS Construction Series - *${design.code}: ${design.name}* (${design.desc}). Please share fabric options and team bulk pricing.`
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
  }

  return (
    <section className="section" style={{ background: '#0a0f1d', color: '#fff', position: 'relative', overflow: 'hidden' }}>
      {/* Decorative ambient background glows */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '20%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(249, 115, 22, 0.12) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        right: '15%',
        width: '450px',
        height: '450px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Section Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '20px', marginBottom: '32px' }}>
          <div style={{ maxWidth: '680px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(249, 115, 22, 0.15)',
              border: '1px solid rgba(249, 115, 22, 0.35)',
              color: '#fb923c',
              fontSize: '12px',
              fontWeight: '700',
              padding: '5px 12px',
              borderRadius: '20px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '14px'
            }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#f97316', display: 'inline-block' }} />
              Official Sublimation Team Series
            </span>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: '800', lineHeight: '1.15', margin: '0 0 10px', color: '#ffffff' }}>
              RS CONSTRUCTION <span style={{ color: '#f97316' }}>SERIES</span>
            </h2>
            <p style={{ fontSize: '15px', color: '#94a3b8', lineHeight: '1.6', margin: 0 }}>
              <b>BUILT STRONG. DELIVERED RIGHT.</b> 12 Signature match designs crafted for clubs, academies, and tournaments. Order any design in your chosen fabric from our official rate list.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', width: '100%', maxWidth: '380px' }}>
            <button
              onClick={() => { setZoomLevel(1); setModalOpen(true) }}
              className="btn btn--accent"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 18px',
                fontSize: '13px',
                fontWeight: '700',
                borderRadius: '8px',
                flex: '1 1 150px'
              }}
            >
              <ZoomIn width={16} height={16} /> View Full HD Details
            </button>
            <Link
              to="/rate-list"
              className="btn btn--outline"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 18px',
                fontSize: '13px',
                fontWeight: '600',
                borderRadius: '8px',
                color: '#fff',
                borderColor: '#334155',
                flex: '1 1 150px'
              }}
            >
              <Clipboard width={16} height={16} /> Check Fabric Rates
            </Link>
          </div>
        </div>

        {/* Main High-Res Image Display Card */}
        <div
          onClick={() => { setZoomLevel(1); setModalOpen(true) }}
          style={{
            position: 'relative',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            background: '#040711',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 30px rgba(249, 115, 22, 0.08)',
            cursor: 'pointer',
            transition: 'transform 0.25s ease, border-color 0.25s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(249, 115, 22, 0.5)'
            e.currentTarget.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
          title="Click to view full image in high-resolution"
        >
          <img
            src="/images/rs-construction-catalog.jpg"
            alt="RS Construction Sublimation Teamwear Catalog - 12 Designs"
            loading="lazy"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              transition: 'opacity 0.2s ease'
            }}
          />

          {/* Floating Click-To-Zoom Banner */}
          <div style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            left: '12px',
            maxWidth: '320px',
            marginLeft: 'auto',
            background: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#fff',
            padding: '8px 14px',
            borderRadius: '24px',
            fontSize: '11.5px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.5)'
          }}>
            <ZoomIn width={15} height={15} />
            <span>Tap to Zoom & View Full Poster</span>
          </div>
        </div>

        {/* Feature Highlights bar from the poster */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          marginTop: '20px'
        }}>
          {FEATURES.map((f, i) => {
            const Icon = f.icon
            return (
              <div key={i} style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: f.bg || 'rgba(255, 255, 255, 0.06)',
                  border: `1px solid ${f.border || 'rgba(255, 255, 255, 0.1)'}`,
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0
                }}>
                  <Icon width={20} height={20} style={{ color: f.color }} />
                </div>
                <div>
                  <b style={{ display: 'block', fontSize: '13px', color: '#f1f5f9' }}>{f.title}</b>
                  <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>{f.text}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* 12 Designs Interactive Selector */}
        <div style={{
          marginTop: '24px',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '18px'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: '700', margin: '0 0 4px', color: '#ffffff' }}>
                All 12 Catalog Designs & Color Codes
              </h3>
              <p style={{ fontSize: '12.5px', color: '#94a3b8', margin: 0 }}>
                Tap any design below to see color codes & order for your squad:
              </p>
            </div>
          </div>

          {/* Active Selected Design Highlight Card */}
          {selectedDesign && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.16) 0%, rgba(15, 23, 42, 0.85) 100%)',
              border: '1.5px solid rgba(249, 115, 22, 0.45)',
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '16px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {selectedDesign.colors.map((c, idx) => (
                    <span key={idx} style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      background: c,
                      border: '2px solid rgba(255,255,255,0.4)',
                      display: 'inline-block'
                    }} />
                  ))}
                </div>
                <div>
                  <b style={{ color: '#fff', fontSize: '14px', display: 'block' }}>
                    {selectedDesign.code}: {selectedDesign.name}
                  </b>
                  <span style={{ color: '#fb923c', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {selectedDesign.desc}
                  </span>
                </div>
              </div>

              <a
                href={getWaLink(selectedDesign)}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#22c55e',
                  color: '#fff',
                  padding: '9px 16px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  textDecoration: 'none'
                }}
              >
                <WhatsApp width={16} height={16} /> Order {selectedDesign.code} on WhatsApp
              </a>
            </div>
          )}

          {/* Grid of Designs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '10px'
          }}>
            {DESIGNS.map((d) => {
              const isSelected = selectedDesign?.id === d.id
              return (
                <div
                  key={d.id}
                  onClick={() => setSelectedDesign(d)}
                  style={{
                    background: isSelected ? 'rgba(249, 115, 22, 0.16)' : 'rgba(255, 255, 255, 0.02)',
                    border: isSelected ? '1.5px solid #f97316' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    padding: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: isSelected ? '#f97316' : '#94a3b8', letterSpacing: '0.04em' }}>
                      {d.code}
                    </span>
                    <div style={{ display: 'flex', gap: '3px' }}>
                      {d.colors.map((c, idx) => (
                        <span key={idx} style={{
                          width: '9px',
                          height: '9px',
                          borderRadius: '50%',
                          background: c,
                          border: '1px solid rgba(255,255,255,0.3)',
                          display: 'inline-block'
                        }} />
                      ))}
                    </div>
                  </div>
                  <b style={{ display: 'block', fontSize: '12.5px', color: '#fff', marginBottom: '3px' }}>{d.name}</b>
                  <span style={{ display: 'block', fontSize: '9.5px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {d.desc}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Fullscreen High-Resolution Lightbox Modal */}
      {modalOpen && (
        <div
          onClick={() => setModalOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(3, 7, 18, 0.96)',
            backdropFilter: 'blur(10px)',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '12px'
          }}
        >
          {/* Modal Header Bar */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px',
              padding: '10px 14px',
              background: 'rgba(15, 23, 42, 0.92)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              marginBottom: '8px'
            }}
          >
            <div>
              <b style={{ color: '#fff', fontSize: '14px', display: 'block' }}>RS CONSTRUCTION · 12 Designs Sublimation Catalog</b>
              <span style={{ display: 'block', color: '#94a3b8', fontSize: '11px' }}>Tap / Scroll to zoom details</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={() => setZoomLevel((z) => (z >= 2 ? 1 : z + 0.5))}
                style={{
                  background: '#1e293b',
                  color: '#fff',
                  border: '1px solid #334155',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  cursor: 'pointer'
                }}
              >
                {zoomLevel}x
              </button>
              <a
                href="/images/rs-construction-catalog.jpg"
                download="RS_Construction_Catalog_Rishikar_Sports.jpg"
                style={{
                  background: '#f97316',
                  color: '#fff',
                  border: 'none',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Download width={14} height={14} /> Poster
              </a>
              <button
                onClick={() => setModalOpen(false)}
                style={{
                  background: '#334155',
                  color: '#fff',
                  border: 'none',
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px'
                }}
                aria-label="Close"
              >
                <X width={16} height={16} />
              </button>
            </div>
          </div>

          {/* Modal Scrollable Image Container */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              flex: 1,
              overflow: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px'
            }}
          >
            <img
              src="/images/rs-construction-catalog.jpg"
              alt="RS Construction Sublimation Teamwear Catalog"
              style={{
                maxWidth: zoomLevel === 1 ? '100%' : `${zoomLevel * 100}%`,
                maxHeight: zoomLevel === 1 ? '82vh' : 'none',
                width: zoomLevel > 1 ? `${zoomLevel * 100}%` : 'auto',
                height: 'auto',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
                cursor: zoomLevel > 1 ? 'grab' : 'zoom-in',
                transition: 'transform 0.2s ease'
              }}
              onClick={() => setZoomLevel((z) => (z >= 2 ? 1 : z + 0.5))}
            />
          </div>

          {/* Modal Footer Quick Actions */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '10px',
              paddingTop: '8px'
            }}
          >
            <a
              href={`https://wa.me/${phone}?text=${encodeURIComponent('Hi Rishikar Sports, I am viewing the RS Construction 12-design catalog poster and want to place a bulk team order.')}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: '#22c55e',
                color: '#fff',
                padding: '10px 18px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '700',
                textDecoration: 'none',
                flex: '1 1 200px',
                maxWidth: '340px'
              }}
            >
              <WhatsApp width={16} height={16} /> Chat on WhatsApp
            </a>
            <button
              onClick={() => setModalOpen(false)}
              style={{
                background: '#1e293b',
                color: '#cbd5e1',
                border: '1px solid #334155',
                padding: '10px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                cursor: 'pointer',
                flex: '0 1 auto'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
