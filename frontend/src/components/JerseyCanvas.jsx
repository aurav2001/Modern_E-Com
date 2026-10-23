import { forwardRef, useImperativeHandle, useRef } from 'react'

// Built-in Vector Crests with enhanced 3D sports graphics
export const PRESET_CRESTS = [
  {
    id: 'lion',
    name: 'Royal Lion',
    render: (color = '#f5821f') => (
      <g>
        <circle cx="12" cy="12" r="11" fill="rgba(0,0,0,0.3)" />
        <circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="1.2" />
        <path
          d="M12 4C9 4 6.5 6 6 9c-1.2.8-1.8 2.4-1.2 4 .5 1.4 1.8 2.2 3.2 2.2.4 1.2 1.3 2.5 2.5 3.3L12 21l1.5-2.5c1.2-.8 2.1-2.1 2.5-3.3 1.4 0 2.7-.8 3.2-2.2.6-1.6 0-3.2-1.2-4-.5-3-3-5-6-5zm-2.2 6c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm4.4 0c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z"
          fill={color}
        />
      </g>
    ),
  },
  {
    id: 'cricket',
    name: 'Cricket Pro',
    render: (color = '#f5821f') => (
      <g>
        <circle cx="12" cy="12" r="11" fill="rgba(0,0,0,0.3)" />
        <circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="1.2" />
        <path d="M7 6h2v12H7zm4 0h2v12h-2zm4 0h2v12h-2z" fill={color} />
        <path d="M6 4h12v1.8H6z" fill="#ffffff" />
        <circle cx="17.5" cy="15" r="2.2" fill="#ef4444" stroke="#ffffff" strokeWidth="0.6" />
      </g>
    ),
  },
  {
    id: 'eagle',
    name: 'Flying Falcon',
    render: (color = '#f5821f') => (
      <g>
        <circle cx="12" cy="12" r="11" fill="rgba(0,0,0,0.3)" />
        <circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="1.2" />
        <path d="M12 5l2.5 4.5 4.5-1.5-2.5 6 4.5 1-6 4 1 3.5-5-3.5-5 3.5 1-3.5-6-4 4.5-1-2.5-6 4.5 1.5z" fill={color} />
      </g>
    ),
  },
  {
    id: 'shield',
    name: 'Crown Shield',
    render: (color = '#f5821f') => (
      <g>
        <path d="M12 2L4 5.5v5.5c0 5.2 3.4 10.2 8 11.5 4.6-1.3 8-6.3 8-11.5V5.5L12 2z" fill="rgba(0,0,0,0.35)" />
        <path d="M12 3.5L5.5 6.5v4.5c0 4.5 2.8 8.8 6.5 10 3.7-1.2 6.5-5.5 6.5-10V6.5L12 3.5z" fill="none" stroke={color} strokeWidth="1.2" />
        <path d="M9 10l3-3 3 3v5H9v-5z" fill={color} />
        <circle cx="12" cy="12" r="1.5" fill="#ffffff" />
      </g>
    ),
  },
]

export const JerseyCanvas = forwardRef(function JerseyCanvas(
  {
    view = 'front', // 'front' | 'back'
    pattern = 'cricket-pro', // 'cricket-pro' | 'classic-stripes' | 'cyber-waves' | 'hex-armor' | 'dual-tone'
    collar = 'polo', // 'polo' | 'vneck' | 'round'
    primaryColor = '#0E2140', // Navy
    accentColor = '#F5821F', // Orange
    collarColor = '#F5821F',
    teamName = 'CHAPRA KINGS',
    playerNumber = '07',
    playerName = 'ROHIT',
    customLogoUrl = null,
    selectedCrest = 'lion',
    showFlag = true,
  },
  ref
) {
  const svgRef = useRef(null)

  // Export high-res PNG image
  useImperativeHandle(ref, () => ({
    exportToImage: () => {
      return new Promise((resolve) => {
        if (!svgRef.current) return resolve(null)
        const svgElement = svgRef.current
        const svgString = new XMLSerializer().serializeToString(svgElement)
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
        const URL = window.URL || window.webkitURL || window
        const blobURL = URL.createObjectURL(svgBlob)

        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = 1200
          canvas.height = 1040
          const ctx = canvas.getContext('2d')

          // Premium stadium floor gradient background
          const grad = ctx.createRadialGradient(600, 480, 50, 600, 520, 700)
          grad.addColorStop(0, '#1c283c')
          grad.addColorStop(0.6, '#0f1726')
          grad.addColorStop(1, '#070b13')
          ctx.fillStyle = grad
          ctx.fillRect(0, 0, 1200, 1040)

          // Soft ground shadow under jersey
          ctx.save()
          ctx.beginPath()
          ctx.ellipse(600, 940, 340, 36, 0, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(0, 0, 0, 0.55)'
          ctx.filter = 'blur(20px)'
          ctx.fill()
          ctx.restore()

          // Draw the jersey SVG
          ctx.drawImage(img, 60, 40, 1080, 940)

          // Watermark banner
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
          ctx.font = 'bold 16px sans-serif'
          ctx.textAlign = 'right'
          ctx.fillText('RISHIKAR SPORTS • PRO 3D SUBLIMATION STUDIO', 1160, 1010)

          const dataUrl = canvas.toDataURL('image/png')
          URL.revokeObjectURL(blobURL)
          resolve(dataUrl)
        }
        img.src = blobURL
      })
    },
  }))

  const crestObj = PRESET_CRESTS.find((c) => c.id === selectedCrest) || PRESET_CRESTS[0]

  return (
    <svg
      ref={svgRef}
      viewBox="0 50 500 435"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <defs>
        {/* Soft realistic stadium lighting drop shadow */}
        <filter id="pro-shadow" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="16" stdDeviation="16" floodColor="#000" floodOpacity="0.55" />
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.3" />
        </filter>

        {/* Realistic Torso Silhouette Path */}
        <clipPath id="torso-clip">
          <path d="M 170 85 Q 250 102 330 85 L 375 220 L 334 235 L 330 458 Q 250 472 170 458 L 166 235 L 125 220 Z" />
        </clipPath>

        {/* Sleeves Clips */}
        <clipPath id="left-sleeve-clip">
          <path d="M 170 85 L 125 220 L 65 195 L 105 85 Z" />
        </clipPath>
        <clipPath id="right-sleeve-clip">
          <path d="M 330 85 L 375 220 L 435 195 L 395 85 Z" />
        </clipPath>

        {/* 3D Torso Lighting & Shading Gradient */}
        <linearGradient id="body-lighting" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
          <stop offset="35%" stopColor="#ffffff" stopOpacity="0.04" />
          <stop offset="70%" stopColor="#000000" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.32" />
        </linearGradient>

        {/* Raglan Shoulder Crease Lighting */}
        <linearGradient id="raglan-crease" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#000" stopOpacity="0.35" />
          <stop offset="50%" stopColor="#fff" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.35" />
        </linearGradient>

        {/* Micro Pique / Dry-fit athletic mesh pattern */}
        <pattern id="dryfit-mesh" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="0.75" fill="#ffffff" opacity="0.09" />
          <circle cx="0" cy="0" r="0.5" fill="#000000" opacity="0.12" />
        </pattern>

        {/* Honeycomb Mesh Pattern */}
        <pattern id="hex-mesh" width="20" height="34" patternUnits="userSpaceOnUse">
          <path
            d="M 10 0 L 20 6 L 20 18 L 10 24 L 0 18 L 0 6 Z M 10 34 L 20 28 L 20 16 L 10 22 L 0 16 L 0 28 Z"
            fill="none"
            stroke={accentColor}
            strokeWidth="0.9"
            opacity="0.35"
          />
        </pattern>

        {/* Curved Path for Back Player Name Arched Varsity Typography */}
        <path id="name-arch-path" d="M 155 198 Q 250 168 345 198" fill="none" />
      </defs>

      {/* ───────────────── GROUND SHADOW UNDER JERSEY ───────────────── */}
      <ellipse cx="250" cy="466" rx="140" ry="12" fill="rgba(0,0,0,0.5)" filter="blur(6px)" />

      {/* ───────────────── BASE JERSEY SILHOUETTE ───────────────── */}
      <g className="jersey-base-silhouette">
        {/* Left Sleeve Body */}
        <path
          d="M 170 85 L 125 220 L 65 195 L 105 85 Z"
          fill={pattern === 'dual-tone' ? accentColor : primaryColor}
          stroke="#090d14"
          strokeWidth="1.5"
        />

        {/* Right Sleeve Body */}
        <path
          d="M 330 85 L 375 220 L 435 195 L 395 85 Z"
          fill={pattern === 'dual-tone' ? accentColor : primaryColor}
          stroke="#090d14"
          strokeWidth="1.5"
        />

        {/* Main Torso Body */}
        <path
          d="M 170 85 Q 250 102 330 85 L 375 220 L 334 235 L 330 458 Q 250 472 170 458 L 166 235 L 125 220 Z"
          fill={primaryColor}
          stroke="#090d14"
          strokeWidth="1.5"
        />
      </g>

      {/* ───────────────── INNER NECK TAPE (AUTHENTIC DETAIL) ───────────────── */}
      <g>
        {/* Inner back collar scoop visible inside neck opening */}
        <path d="M 195 85 Q 250 114 305 85 Q 250 134 195 85 Z" fill="#080c14" />
        <path d="M 210 94 Q 250 112 290 94" stroke="#ff821f" strokeWidth="2.5" fill="none" opacity="0.85" />
        <text x="250" y="106" fill="#fff" fontSize="5.5" fontFamily="monospace" fontWeight="900" letterSpacing="0.15em" textAnchor="middle" opacity="0.75">
          RS PRO • DRY-FIT PERFORMANCE • {view === 'front' ? 'SIZE L' : 'CHAPRA'}
        </text>
      </g>

      {/* ───────────────── SUBLIMATION PATTERNS & TEXTURES ───────────────── */}
      <g clipPath="url(#torso-clip)">
        {/* Micro Dry-fit Pique Texture Layer */}
        <rect x="100" y="80" width="300" height="400" fill="url(#dryfit-mesh)" />

        {/* PATTERN 1: Cricket Pro Sublimated Angular Energy Streaks */}
        {pattern === 'cricket-pro' && (
          <g>
            <polygon points="110,460 215,460 380,175 335,175" fill={accentColor} />
            <polygon points="225,460 258,460 380,235 358,235" fill="#ffffff" opacity="0.32" />
            <polygon points="100,310 185,460 145,460 75,340" fill={accentColor} opacity="0.55" />
            <polygon points="270,460 330,460 380,360 360,360" fill={accentColor} />
            {/* Upper shoulder geometric gradient accent */}
            <polygon points="160,85 245,85 180,175" fill={accentColor} opacity="0.3" />
            <line x1="120" y1="460" x2="375" y2="185" stroke="#fff" strokeWidth="1.5" opacity="0.4" />
          </g>
        )}

        {/* PATTERN 2: Classic Vertical Stripes */}
        {pattern === 'classic-stripes' && (
          <g fill={accentColor}>
            <rect x="195" y="80" width="22" height="400" />
            <rect x="238" y="80" width="24" height="400" fill="#ffffff" opacity="0.85" />
            <rect x="283" y="80" width="22" height="400" />
            <rect x="150" y="80" width="20" height="400" />
            <rect x="330" y="80" width="20" height="400" />
            {/* Subtle pinstripes */}
            <line x1="222" y1="80" x2="222" y2="470" stroke="#fff" strokeWidth="1.5" opacity="0.4" />
            <line x1="278" y1="80" x2="278" y2="470" stroke="#fff" strokeWidth="1.5" opacity="0.4" />
          </g>
        )}

        {/* PATTERN 3: Cyber Waves */}
        {pattern === 'cyber-waves' && (
          <g>
            <path d="M 120 460 Q 250 240 380 460 L 380 425 Q 250 205 120 425 Z" fill={accentColor} />
            <path d="M 120 375 Q 250 155 380 375 L 380 345 Q 250 125 120 345 Z" fill="#ffffff" opacity="0.35" />
            <path d="M 120 290 Q 250 70 380 290 L 380 260 Q 250 40 120 260 Z" fill={accentColor} opacity="0.75" />
          </g>
        )}

        {/* PATTERN 4: Hex Armor Honeycomb */}
        {pattern === 'hex-armor' && (
          <g>
            <rect x="120" y="80" width="260" height="400" fill="url(#hex-mesh)" />
            <polygon points="170,135 250,195 330,135 330,165 250,225 170,165" fill={accentColor} />
            <polygon points="170,195 250,255 330,195 330,220 250,280 170,220" fill="#ffffff" opacity="0.4" />
          </g>
        )}

        {/* PATTERN 5: Minimalist Dual-Tone */}
        {pattern === 'dual-tone' && (
          <g>
            <polygon points="170,85 330,85 330,150 170,210" fill={accentColor} opacity="0.9" />
            <line x1="170" y1="210" x2="330" y2="150" stroke="#ffffff" strokeWidth="2" opacity="0.5" />
          </g>
        )}

        {/* ── ERGONOMIC SIDE BREATHABLE VENTILATION PANELS ── */}
        <g opacity="0.9">
          <polygon points="166,235 192,246 186,458 170,458" fill={accentColor} />
          <polygon points="334,235 308,246 314,458 330,458" fill={accentColor} />
          {/* Perforated mesh dot cutouts on side panels */}
          <line x1="178" y1="260" x2="178" y2="445" stroke="#111827" strokeWidth="1.5" strokeDasharray="2 3" opacity="0.5" />
          <line x1="322" y1="260" x2="322" y2="445" stroke="#111827" strokeWidth="1.5" strokeDasharray="2 3" opacity="0.5" />
        </g>

        {/* ── 3D FABRIC SHADING & CONTOUR HIGHLIGHTS ── */}
        <rect x="120" y="80" width="260" height="400" fill="url(#body-lighting)" pointerEvents="none" />

        {/* Flatlock Seam Stitches along Raglan Sleeves */}
        <line x1="170" y1="85" x2="166" y2="235" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" strokeDasharray="2 2" />
        <line x1="330" y1="85" x2="334" y2="235" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" strokeDasharray="2 2" />
      </g>

      {/* ───────────────── SLEEVE DETAILS & CUFF TRIMS ───────────────── */}
      <g>
        {/* Left Sleeve Trim Cuff with double piping */}
        <polygon points="65,195 125,220 123,228 63,203" fill={collarColor} stroke="#090d14" strokeWidth="0.8" />
        <polygon points="66,198 124,222 123,224 65,200" fill="#ffffff" opacity="0.5" />

        {/* Right Sleeve Trim Cuff with double piping */}
        <polygon points="435,195 375,220 377,228 437,203" fill={collarColor} stroke="#090d14" strokeWidth="0.8" />
        <polygon points="434,198 376,222 377,224 435,200" fill="#ffffff" opacity="0.5" />

        {/* Sleeve India Flag / Club Badge with embroidered border */}
        {showFlag && (
          <g transform="translate(86, 138) rotate(-28)">
            <rect x="-1" y="-1" width="24" height="17" fill="#000" rx="1.5" opacity="0.35" />
            <rect x="0" y="0" width="22" height="5" fill="#FF9933" />
            <rect x="0" y="5" width="22" height="5" fill="#FFFFFF" />
            <rect x="0" y="10" width="22" height="5" fill="#138808" />
            <circle cx="11" cy="7.5" r="2" fill="#000080" />
            {/* Gold border embroidery stitch */}
            <rect x="0" y="0" width="22" height="15" fill="none" stroke="#f59e0b" strokeWidth="0.8" rx="1" />
          </g>
        )}
      </g>

      {/* ───────────────── REALISTIC 3D COLLAR ───────────────── */}
      {view === 'front' ? (
        <g id="collar-front">
          {collar === 'polo' ? (
            /* Sublimated Sports Polo with Button Placket */
            <g>
              {/* Placket Base */}
              <path d="M 238 98 L 262 98 L 260 170 L 250 178 L 240 170 Z" fill="#ffffff" stroke="#111827" strokeWidth="1" />
              {/* Placket Stitch Line */}
              <line x1="242" y1="102" x2="242" y2="168" stroke="rgba(0,0,0,0.15)" strokeWidth="0.8" />
              <line x1="258" y1="102" x2="258" y2="168" stroke="rgba(0,0,0,0.15)" strokeWidth="0.8" />
              {/* 3 Real 4-Hole Buttons */}
              <circle cx="250" cy="116" r="3.2" fill="#f8fafc" stroke="#475569" strokeWidth="0.7" />
              <circle cx="250" cy="116" r="1.2" fill="#0f172a" />
              <circle cx="250" cy="136" r="3.2" fill="#f8fafc" stroke="#475569" strokeWidth="0.7" />
              <circle cx="250" cy="136" r="1.2" fill="#0f172a" />
              <circle cx="250" cy="156" r="3.2" fill="#f8fafc" stroke="#475569" strokeWidth="0.7" />
              <circle cx="250" cy="156" r="1.2" fill="#0f172a" />

              {/* 3D Folded Collar Wings with Depth & Shadow */}
              <g filter="drop-shadow(0 4px 6px rgba(0,0,0,0.35))">
                <polygon points="172,85 240,102 212,148 158,94" fill={collarColor} stroke="#090d14" strokeWidth="1.2" />
                <polygon points="328,85 260,102 288,148 342,94" fill={collarColor} stroke="#090d14" strokeWidth="1.2" />
                {/* Collar contrast edge tip */}
                <polygon points="212,148 206,143 238,102 240,102" fill="#ffffff" opacity="0.65" />
                <polygon points="288,148 294,143 262,102 260,102" fill="#ffffff" opacity="0.65" />
              </g>
            </g>
          ) : collar === 'vneck' ? (
            /* Athletic Ribbed V-Neck */
            <g filter="drop-shadow(0 3px 5px rgba(0,0,0,0.3))">
              <path d="M 194 85 Q 250 162 306 85 Q 250 140 194 85 Z" fill={collarColor} stroke="#090d14" strokeWidth="1.2" />
              <polygon points="243,144 250,156 257,144" fill={accentColor} />
              <path d="M 200 85 Q 250 148 300 85" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.5" />
            </g>
          ) : (
            /* Crew Round Neck with Dual-tone Rib */
            <g filter="drop-shadow(0 3px 5px rgba(0,0,0,0.3))">
              <path d="M 188 85 Q 250 148 312 85 Q 250 130 188 85 Z" fill={collarColor} stroke="#090d14" strokeWidth="1.2" />
              <path d="M 194 85 Q 250 138 306 85" fill="none" stroke="#ffffff" strokeWidth="1.2" opacity="0.6" />
            </g>
          )}
        </g>
      ) : (
        /* Back View Collar */
        <g id="collar-back" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))">
          <path d="M 184 85 Q 250 102 316 85 L 313 95 Q 250 112 187 95 Z" fill={collarColor} stroke="#090d14" strokeWidth="1.2" />
          {/* Back Yoke Mesh Cut with Flatlock Stitching */}
          <path d="M 166 138 Q 250 152 334 138" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
        </g>
      )}

      {/* ───────────────── FRONT VIEW GRAPHICS & BADGES ───────────────── */}
      {view === 'front' && (
        <g id="front-graphics">
          {/* Right Chest: RS PRO 3D Silicone Brand Mark */}
          <g transform="translate(304, 155)" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.4))">
            <rect x="0" y="0" width="40" height="16" rx="3.5" fill="#090d14" stroke="#ffffff" strokeWidth="0.8" />
            <text x="20" y="11.5" fill="#ffffff" fontSize="9" fontFamily="'DM Sans', 'Impact', sans-serif" fontWeight="900" textAnchor="middle" letterSpacing="0.08em">
              RS <tspan fill={accentColor}>PRO</tspan>
            </text>
          </g>

          {/* Left Chest: High-Definition Team Crest */}
          <g transform="translate(150, 140)" filter="drop-shadow(0 3px 6px rgba(0,0,0,0.45))">
            {customLogoUrl ? (
              <image href={customLogoUrl} x="0" y="0" width="38" height="38" preserveAspectRatio="xMidYMid meet" />
            ) : (
              <g transform="scale(1.55)">
                {crestObj.render(accentColor === '#ffffff' ? '#f5821f' : accentColor)}
              </g>
            )}
          </g>

          {/* Center Chest: Team / Club Name with 3D athletic typography */}
          <g transform="translate(250, 246)">
            {/* Drop Shadow layer */}
            <text
              x="0"
              y="2"
              fill="rgba(0,0,0,0.7)"
              fontSize="23"
              fontFamily="'Impact', 'Arial Black', sans-serif"
              fontWeight="900"
              letterSpacing="0.08em"
              textAnchor="middle"
            >
              {teamName || 'RISHIKAR'}
            </text>
            {/* Outline stroke for maximum contrast */}
            <text
              x="0"
              y="0"
              fill="#090d14"
              fontSize="23"
              fontFamily="'Impact', 'Arial Black', sans-serif"
              fontWeight="900"
              letterSpacing="0.08em"
              textAnchor="middle"
              stroke="#090d14"
              strokeWidth="4.5"
              strokeLinejoin="round"
            >
              {teamName || 'RISHIKAR'}
            </text>
            {/* Core text */}
            <text
              x="0"
              y="0"
              fill="#ffffff"
              fontSize="23"
              fontFamily="'Impact', 'Arial Black', sans-serif"
              fontWeight="900"
              letterSpacing="0.08em"
              textAnchor="middle"
            >
              {teamName || 'RISHIKAR'}
            </text>
          </g>

          {/* Front Chest Number */}
          <g transform="translate(250, 298)">
            <text
              x="0"
              y="2"
              fill="rgba(0,0,0,0.5)"
              fontSize="36"
              fontFamily="'Impact', sans-serif"
              fontWeight="900"
              textAnchor="middle"
            >
              {playerNumber || '07'}
            </text>
            <text
              x="0"
              y="0"
              fill="#090d14"
              fontSize="36"
              fontFamily="'Impact', sans-serif"
              fontWeight="900"
              textAnchor="middle"
              stroke="#090d14"
              strokeWidth="4"
              strokeLinejoin="round"
            >
              {playerNumber || '07'}
            </text>
            <text
              x="0"
              y="0"
              fill={accentColor}
              fontSize="36"
              fontFamily="'Impact', sans-serif"
              fontWeight="900"
              textAnchor="middle"
            >
              {playerNumber || '07'}
            </text>
          </g>

          {/* Lower Right Hem: Metallic Woven Authentic Patch */}
          <g transform="translate(178, 440)" filter="drop-shadow(0 1px 3px rgba(0,0,0,0.4))">
            <rect x="0" y="0" width="76" height="14" rx="2" fill="#0f172a" stroke="#cbd5e1" strokeWidth="0.7" />
            <text x="38" y="10" fill="#f8fafc" fontSize="6.8" fontFamily="'DM Sans', monospace" fontWeight="bold" textAnchor="middle" letterSpacing="0.08em">
              ★ AUTHENTIC • RS ON-FIELD
            </text>
          </g>
        </g>
      )}

      {/* ───────────────── BACK VIEW GRAPHICS & PLAYER DETAILS ───────────────── */}
      {view === 'back' && (
        <g id="back-graphics">
          {/* Arched Player Name across upper back */}
          <g filter="drop-shadow(0 3px 6px rgba(0,0,0,0.5))">
            {/* Outline Layer */}
            <text
              fill="#090d14"
              fontSize="24"
              fontFamily="'Impact', 'Arial Black', sans-serif"
              fontWeight="900"
              letterSpacing="0.14em"
              stroke="#090d14"
              strokeWidth="4.5"
              strokeLinejoin="round"
            >
              <textPath href="#name-arch-path" startOffset="50%" textAnchor="middle">
                {(playerName || 'PLAYER').toUpperCase()}
              </textPath>
            </text>
            {/* Core Crisp White Typography */}
            <text
              fill="#ffffff"
              fontSize="24"
              fontFamily="'Impact', 'Arial Black', sans-serif"
              fontWeight="900"
              letterSpacing="0.14em"
            >
              <textPath href="#name-arch-path" startOffset="50%" textAnchor="middle">
                {(playerName || 'PLAYER').toUpperCase()}
              </textPath>
            </text>
          </g>

          {/* Big Collegiate Player Number */}
          <g transform="translate(250, 316)" filter="drop-shadow(0 6px 12px rgba(0,0,0,0.55))">
            {/* Dark Drop Shadow Base */}
            <text
              x="0"
              y="4"
              fill="#000000"
              fontSize="114"
              fontFamily="'Impact', 'Arial Black', sans-serif"
              fontWeight="900"
              textAnchor="middle"
              stroke="#000000"
              strokeWidth="10"
              strokeLinejoin="round"
              opacity="0.8"
            >
              {playerNumber || '07'}
            </text>

            {/* White Outer Piping */}
            <text
              x="0"
              y="0"
              fill="#ffffff"
              fontSize="114"
              fontFamily="'Impact', 'Arial Black', sans-serif"
              fontWeight="900"
              textAnchor="middle"
              stroke="#ffffff"
              strokeWidth="6"
              strokeLinejoin="round"
            >
              {playerNumber || '07'}
            </text>

            {/* Accent Fill Core */}
            <text
              x="0"
              y="0"
              fill={accentColor}
              fontSize="114"
              fontFamily="'Impact', 'Arial Black', sans-serif"
              fontWeight="900"
              textAnchor="middle"
            >
              {playerNumber || '07'}
            </text>
          </g>

          {/* Lower Back Team Hashtag / Sponsor Tagline */}
          <g transform="translate(250, 400)">
            <text
              x="0"
              y="0"
              fill="#ffffff"
              fontSize="12.5"
              fontFamily="'DM Sans', sans-serif"
              fontWeight="800"
              letterSpacing="0.16em"
              textAnchor="middle"
              opacity="0.85"
            >
              #RISHIKARSPORTS
            </text>
          </g>

          {/* Bottom Hem Sublimation Guaranteed Tag */}
          <g transform="translate(250, 444)">
            <text x="0" y="0" fill="#94a3b8" fontSize="7.2" fontFamily="'DM Sans', sans-serif" fontWeight="700" textAnchor="middle" letterSpacing="0.12em">
              ORIGINAL UNIT PRODUCTION • ZERO COLOR FADE
            </text>
          </g>
        </g>
      )}
    </svg>
  )
})
