import { useState, useRef, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as XLSX from 'xlsx'
import { useStore } from '../context/StoreContext'
import { BRAND } from '../data/content'
import { formatPrice } from '../lib/utils'
import { JerseyCanvas, PRESET_CRESTS } from '../components/JerseyCanvas'
import { Crumbs } from '../components/Shared'
import {
  WhatsApp,
  ArrowRight,
  Check,
  Zap,
  Trash,
  Plus,
  Refresh,
  Shield,
  ShieldCheck,
  Truck,
  Shirt,
  RotateCcw,
  Palette,
  Users,
  Tag,
  Printer,
  Type,
  Upload,
  Clipboard,
  Eye,
  Info,
  X,
  Cube3D,
  Ruler,
  Download,
  Share,
} from '../components/Icons'
import '../styles/customizer.css'

// Curated athletic sportswear colors
const PALETTES = [
  { name: 'Midnight Navy', hex: '#0E2140' },
  { name: 'Rishikar Orange', hex: '#F5821F' },
  { name: 'Royal Blue', hex: '#1D4ED8' },
  { name: 'Cricket Gold', hex: '#D97706' },
  { name: 'Jet Black', hex: '#111827' },
  { name: 'Crisp White', hex: '#FFFFFF' },
  { name: 'Crimson Red', hex: '#DC2626' },
  { name: 'Forest Green', hex: '#15803D' },
  { name: 'Deep Maroon', hex: '#7F1D1D' },
  { name: 'Cyber Cyan', hex: '#06B6D4' },
]

// Popular team preset colorways
const PRESET_COMBOS = [
  { name: 'India Pro Blue', primary: '#1D4ED8', accent: '#F5821F', collar: '#FFFFFF' },
  { name: 'Chapra Kings', primary: '#0E2140', accent: '#D97706', collar: '#D97706' },
  { name: 'Black Panther', primary: '#111827', accent: '#F5821F', collar: '#111827' },
  { name: 'Celtic Green', primary: '#15803D', accent: '#FFFFFF', collar: '#FFFFFF' },
  { name: 'Red Devils', primary: '#DC2626', accent: '#111827', collar: '#FFFFFF' },
  { name: 'Miami Cyan', primary: '#0E2140', accent: '#06B6D4', collar: '#06B6D4' },
]

// Sportswear fabrics manufactured at Rishikar Sports
const FABRIC_OPTIONS = [
  { id: 'dotknit', name: 'Dotknit Breathable', baseRate: 420, gsm: '160 GSM', tag: 'Most Popular for Matches' },
  { id: 'superpoly', name: 'Superpoly Durable', baseRate: 350, gsm: '180 GSM', tag: 'Value & Tough Durability' },
  { id: 'pmc', name: 'PMC Poly Mesh', baseRate: 400, gsm: '150 GSM', tag: 'Ultra-Light Training' },
  { id: 'lycra', name: '4-Way Lycra Stretch', baseRate: 450, gsm: '190 GSM', tag: 'Athletic Muscle Fit' },
  { id: 'jacquard', name: 'Jacquard Pro Weave', baseRate: 550, gsm: '210 GSM', tag: 'Elite Sublimation Finish' },
]

// Kit Package Options (Jersey Only vs Full Kit with Lower/Pant & Cap)
const KIT_PACKAGES = [
  {
    id: 'jersey',
    name: 'Match Jersey Only',
    badge: 'Standard Top',
    extraPrice: 0,
    desc: 'Sublimated Pro Match Jersey with Name & Number',
  },
  {
    id: 'kit',
    name: 'Jersey + Lower Set',
    badge: 'Best Seller for Clubs',
    extraPrice: 320,
    desc: 'Matching Dry-Fit Athletic Track Pant / Lower with Team Piping',
  },
  {
    id: 'pro',
    name: 'Full Pro Kit (+ Cap)',
    badge: 'Complete Match Pro Kit',
    extraPrice: 440,
    desc: 'Jersey + Lower + Custom Sublimated Athletic Team Cap',
  },
]

// Jersey Number & Name Font Styles
const FONT_OPTIONS = [
  { id: 'impact', name: 'Pro Athletic', desc: 'Bold Solid' },
  { id: 'collegiate', name: 'Varsity Block', desc: 'Classic College' },
  { id: 'cyber', name: 'Cyber Speed', desc: 'Dynamic Italic' },
  { id: 'stencil', name: 'Tactical Stencil', desc: 'Combat Tech' },
]

// Accurate Size Chart Guide Data
const SIZE_GUIDE_DATA = [
  { size: 'XS', chest: '34"', length: '26"', lowerLength: '37"', fit: 'Youth / Slim Fit' },
  { size: 'S', chest: '36"', length: '27"', lowerLength: '38"', fit: 'Height 5\'2" – 5\'5"' },
  { size: 'M', chest: '38"', length: '28"', lowerLength: '39"', fit: 'Height 5\'5" – 5\'8"' },
  { size: 'L', chest: '40"', length: '29"', lowerLength: '40"', fit: 'Standard Men (5\'8" – 5\'11")' },
  { size: 'XL', chest: '42"', length: '30"', lowerLength: '41"', fit: 'Broad Athletic (5\'11" – 6\'2")' },
  { size: 'XXL', chest: '44"', length: '31"', lowerLength: '42"', fit: 'Heavy Build (6\'0"+)' },
  { size: '3XL', chest: '46"', length: '32"', lowerLength: '43"', fit: 'Extra Plus Fit' },
  { size: '4XL', chest: '48"', length: '33"', lowerLength: '44"', fit: 'Jumbo Match Fit' },
]

// Default 11-player squad template
const DEFAULT_XI = [
  { id: 1, name: 'GULSHAN KUMAR', number: '45', size: 'XL', sleeve: 'Half', role: 'Captain (C)' },
  { id: 2, name: 'Manish KOHLI', number: '10', size: 'L', sleeve: 'Full', role: 'Player' },
  { id: 3, name: 'Mehra GILL', number: '77', size: 'M', sleeve: 'Half', role: 'Player' },
  { id: 4, name: 'Sevaklal YADAV', number: '63', size: 'L', sleeve: 'Half', role: 'Vice-Captain (VC)' },
  { id: 5, name: 'Anuj PANT', number: '17', size: 'L', sleeve: 'Half', role: 'Wicketkeeper (WK)' },
  { id: 6, name: 'Sourav PANDYA', number: '33', size: 'L', sleeve: 'Half', role: 'Player' },
  { id: 7, name: 'Jian JADEJA', number: '08', size: 'M', sleeve: 'Full', role: 'Player' },
  { id: 8, name: 'Axar PATIL', number: '20', size: 'M', sleeve: 'Full', role: 'Player' },
  { id: 9, name: 'Aukhvinder YADAV', number: '23', size: 'M', sleeve: 'Half', role: 'Player' },
  { id: 10, name: 'JASPRIT Kumar', number: '93', size: 'L', sleeve: 'Half', role: 'Player' },
  { id: 11, name: 'Arjun YADAV', number: '13', size: 'M', sleeve: 'Half', role: 'Player' },
]

export default function JerseyCustomizer() {
  const { addToCart, toast } = useStore()
  const nav = useNavigate()
  const canvasRef = useRef(null)

  // View & Mode State
  const [view, setView] = useState('front') // 'front' | 'back'
  const [activeTab, setActiveTab] = useState('visual') // 'visual' | 'identity' | 'roster' | 'pricing'

  // Customizer Visual Options
  const [pattern, setPattern] = useState('cricket-pro')
  const [collar, setCollar] = useState('polo')
  const [primaryColor, setPrimaryColor] = useState('#0E2140') // Navy
  const [accentColor, setAccentColor] = useState('#F5821F') // Orange
  const [collarColor, setCollarColor] = useState('#F5821F')
  const [teamName, setTeamName] = useState('CHAPRA KINGS')
  const [playerNumber, setPlayerNumber] = useState('07')
  const [playerName, setPlayerName] = useState('ROHIT')
  const [customLogoUrl, setCustomLogoUrl] = useState(null)
  const [selectedCrest, setSelectedCrest] = useState('lion')
  const [selectedFabric, setSelectedFabric] = useState(FABRIC_OPTIONS[0])
  const [selectedKit, setSelectedKit] = useState(KIT_PACKAGES[0])
  const [fontStyle, setFontStyle] = useState('impact')
  const [sponsorText, setSponsorText] = useState('')

  // Squad Roster State
  const [roster, setRoster] = useState(DEFAULT_XI)
  const [pasteModalOpen, setPasteModalOpen] = useState(false)
  const [sizeChartOpen, setSizeChartOpen] = useState(false)
  const [rawPasteText, setRawPasteText] = useState('')
  const [downloadingImg, setDownloadingImg] = useState(false)

  // Roster helpers
  const addPlayer = () => {
    const nextId = roster.length ? Math.max(...roster.map((r) => r.id)) + 1 : 1
    const newPlayer = {
      id: nextId,
      name: `PLAYER ${nextId}`,
      number: String(nextId).padStart(2, '0'),
      size: 'L',
      sleeve: 'Half',
      role: 'Player',
    }
    setRoster([...roster, newPlayer])
  }

  const updatePlayer = (id, key, val) => {
    setRoster(roster.map((p) => (p.id === id ? { ...p, [key]: val } : p)))
  }

  const removePlayer = (id) => {
    if (roster.length <= 1) {
      toast('At least 1 player is required in the roster', { tone: 'error' })
      return
    }
    setRoster(roster.filter((p) => p.id !== id))
  }

  const previewPlayer = (p) => {
    setPlayerName(p.name)
    setPlayerNumber(p.number)
    setView('back')
    toast(`Previewing #${p.number} ${p.name} on jersey back`)
  }

  // Size distribution summary
  const sizeDistribution = useMemo(() => {
    const counts = {}
    roster.forEach((p) => {
      counts[p.size] = (counts[p.size] || 0) + 1
    })
    return counts
  }, [roster])

  // Dynamic Tiered Volume Pricing Calculations
  const totalCount = roster.length
  const baseRate = selectedFabric.baseRate + selectedKit.extraPrice

  const { discountPct, tierName, unitRate, totalAmount, totalSavings } = useMemo(() => {
    let pct = 0
    let tier = 'Single / Retail'
    if (totalCount >= 51) {
      pct = 30
      tier = 'Tournament Bulk (30% Off)'
    } else if (totalCount >= 26) {
      pct = 22
      tier = 'Club Wholesale (22% Off)'
    } else if (totalCount >= 11) {
      pct = 15
      tier = 'Team XI (15% Off - MOQ Met)'
    }

    const rate = Math.round(baseRate * (1 - pct / 100))
    const total = rate * totalCount
    const mrpTotal = Math.round(baseRate * 1.5) * totalCount
    const savings = mrpTotal - total

    return {
      discountPct: pct,
      tierName: tier,
      unitRate: rate,
      totalAmount: total,
      totalSavings: savings,
    }
  }, [totalCount, baseRate])

  // Quick 1-Click Primary & Accent Color Swap
  const handleSwapColors = () => {
    const temp = primaryColor
    setPrimaryColor(accentColor)
    setAccentColor(temp)
    toast('Swapped Primary and Accent Colors!')
  }

  // Export Roster Directly to Excel (.xlsx)
  const handleExportExcel = () => {
    try {
      const data = roster.map((p, idx) => ({
        '#': idx + 1,
        'Player Name': p.name,
        'Jersey No': p.number,
        'Size': p.size,
        'Sleeve': p.sleeve,
        'Role': p.role,
        'Team': teamName,
        'Kit Package': selectedKit.name,
        'Fabric': selectedFabric.name,
        'Sponsor': sponsorText || 'N/A',
      }))
      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Squad Roster')
      XLSX.writeFile(wb, `${teamName.replace(/\s+/g, '_')}_Squad_Roster.xlsx`)
      toast('Squad roster exported to Excel (.xlsx)!')
    } catch {
      toast('Failed to export Excel. Please try again.', { tone: 'error' })
    }
  }

  // Share Design Link / WhatsApp Preview
  const handleShareDesign = () => {
    const shareText =
      `🏏 *${teamName} Custom Team Kit Design — Rishikar Sports*%0A` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━%0A` +
      `• *Kit Type:* ${selectedKit.name}%0A` +
      `• *Fabric:* ${selectedFabric.name} (${selectedFabric.gsm})%0A` +
      `• *Colors:* ${primaryColor} & ${accentColor}%0A` +
      `• *Squad Size:* ${totalCount} Players%0A` +
      `• *Tier Rate:* ₹${unitRate}/pc (${discountPct}% Team Discount)%0A` +
      (sponsorText ? `• *Sponsor:* ${sponsorText}%0A` : '') +
      `%0ADesigned with 3D Sublimation at Rishikar Sports Studio.`
    const url = `https://wa.me/?text=${shareText}`
    window.open(url, '_blank')
    toast('Opening WhatsApp to share design!')
  }

  // Custom logo image upload handler
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 3 * 1024 * 1024) {
      toast('Please upload an image smaller than 3MB', { tone: 'error' })
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      setCustomLogoUrl(ev.target.result)
      toast('Team logo uploaded successfully!')
    }
    reader.readAsDataURL(file)
  }

  // Smart Paste Parser for WhatsApp / Excel lists
  const handleSmartPaste = () => {
    if (!rawPasteText.trim()) return
    const lines = rawPasteText.split('\n').filter((l) => l.trim().length > 0)
    const validSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL']

    const parsed = lines.map((line, idx) => {
      const clean = line.replace(/^\d+[\.\-\)]\s*/, '').trim()
      const parts = clean.split(/[\-\,\t\|]+/).map((s) => s.trim())

      const name = (parts[0] || `PLAYER ${idx + 1}`).toUpperCase()
      const numMatch = clean.match(/\b\d{1,2}\b/)
      const number = numMatch ? numMatch[0].padStart(2, '0') : String(idx + 1).padStart(2, '0')

      let size = 'L'
      for (const s of validSizes) {
        const regex = new RegExp(`\\b${s}\\b`, 'i')
        if (regex.test(clean)) {
          size = s.toUpperCase()
          break
        }
      }

      const sleeve = /full/i.test(clean) ? 'Full' : 'Half'

      return {
        id: idx + 1,
        name,
        number,
        size,
        sleeve,
        role: idx === 0 ? 'Captain (C)' : 'Player',
      }
    })

    if (parsed.length > 0) {
      setRoster(parsed)
      setPasteModalOpen(false)
      setRawPasteText('')
      toast(`Imported ${parsed.length} players into team roster!`)
    }
  }

  // Download Mockup Image (PNG)
  const handleDownloadMockup = async () => {
    if (!canvasRef.current) return
    setDownloadingImg(true)
    try {
      const dataUrl = await canvasRef.current.exportToImage()
      if (dataUrl) {
        const a = document.createElement('a')
        a.href = dataUrl
        a.download = `${teamName.replace(/\s+/g, '_')}_Jersey_Mockup.png`
        a.click()
        toast('High-Resolution Jersey Mockup Downloaded!')
      }
    } catch {
      toast('Could not export image. Please try again.', { tone: 'error' })
    } finally {
      setDownloadingImg(false)
    }
  }

  // Generate WhatsApp Enquiry Message
  const getWhatsAppMessage = () => {
    const rosterLines = roster
      .map(
        (p, i) =>
          `${i + 1}. ${p.name} | #${p.number} | Size: ${p.size} | ${p.sleeve} Sleeve${p.role !== 'Player' ? ` (${p.role})` : ''
          }`
      )
      .join('%0A')

    const sizeSummary = Object.entries(sizeDistribution)
      .map(([s, c]) => `${s}: ${c}`)
      .join(', ')

    return (
      `🏏 *RISHIKAR SPORTS — PRO TEAM ORDER SPECIFICATION*%0A` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━%0A` +
      `*Team Name:* ${teamName}%0A` +
      `*Kit Package:* ${selectedKit.name}%0A` +
      (sponsorText ? `*Front Sponsor:* ${sponsorText}%0A` : '') +
      `*Pattern Style:* ${pattern.toUpperCase()}%0A` +
      `*Collar:* ${collar.toUpperCase()}%0A` +
      `*Number Font:* ${FONT_OPTIONS.find((f) => f.id === fontStyle)?.name || 'Pro Athletic'}%0A` +
      `*Colors:* Primary ${primaryColor} | Accent ${accentColor} | Collar ${collarColor}%0A` +
      `*Fabric:* ${selectedFabric.name} (${selectedFabric.gsm})%0A` +
      `*Total Quantity:* ${totalCount} Sets%0A` +
      `*Tier Rate:* ₹${unitRate}/pc (${tierName})%0A` +
      `*Estimated Order Value:* ${formatPrice(totalAmount)}%0A` +
      `*Sizes Summary:* ${sizeSummary}%0A%0A` +
      `📋 *SQUAD ROSTER (${totalCount} Players):*%0A` +
      rosterLines +
      `%0A%0A*Action:* Please verify production proof & delivery date.`
    )
  }

  // Add Full Custom Team Order to Cart
  const handleAddToCart = async () => {
    let previewImage = '/products/rs/rs-prod-35.jpg'
    try {
      if (canvasRef.current) {
        const exported = await canvasRef.current.exportToImage()
        if (exported) previewImage = exported
      }
    } catch { }

    const customProduct = {
      id: 9901,
      slug: 'rs-custom-team-jersey-kit',
      name: `Custom Team Kit (${teamName}) - ${selectedKit.name}`,
      price: unitRate,
      mrp: Math.round(unitRate * 1.4),
      image: previewImage,
      colors: [{ name: `${primaryColor} & ${accentColor}`, image: previewImage }],
      sizes: Object.keys(sizeDistribution),
      stock: 999,
      categories: ['jerseys'],
    }

    const customDetails = {
      id: `custom_team_${Date.now()}`,
      teamName,
      kitPackage: selectedKit.name,
      fontStyle,
      sponsorText: sponsorText || 'N/A',
      pattern,
      collar,
      primaryColor,
      accentColor,
      collarColor,
      fabric: selectedFabric.name,
      roster,
      rosterSummary: `${totalCount} Pcs (${Object.entries(sizeDistribution)
        .map(([s, c]) => `${c}${s}`)
        .join(', ')})`,
      previewImage,
    }

    addToCart(customProduct, `${primaryColor} / ${accentColor}`, selectedKit.name, totalCount, {
      open: true,
      fabric: selectedFabric.name,
      price: unitRate,
      customDetails,
    })

    toast(`Team Kit for ${teamName} (${totalCount} Sets · ${selectedKit.name}) added to bag!`)
  }

  const handlePrintSheet = () => {
    const prevTitle = document.title
    document.title = `Rishikar_Sports_Factory_Spec_Sheet_${teamName.replace(/[^a-zA-Z0-9]/g, '_')}`
    window.print()
    setTimeout(() => {
      document.title = prevTitle
    }, 1500)
  }

  return (
    <div className="customizer-page">
      {/* ── Compact Pro Studio Topbar ── */}
      <div className="studio-header">
        <div className="container studio-header__inner">
          <div className="studio-header__left">
            <Crumbs items={[{ label: 'Custom Team Kit Studio' }]} />
            <div className="studio-title-wrap">
              <h1 className="studio-title">Rishikar Pro Kit Studio</h1>
              <span className="studio-pill-badge">
                <Cube3D width={13} height={13} /> Live 3D Sublimation
              </span>
            </div>
          </div>

          <div className="studio-header__right">
            <span className="studio-quick-feature">
              <Shield width={14} height={14} style={{ color: 'var(--orange)' }} /> Direct Unit Pricing
            </span>
            <span className="studio-quick-feature">
              <Truck width={14} height={14} style={{ color: 'var(--success)' }} /> Pan-India Delivery
            </span>
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={() => {
                setTeamName('CHAPRA KINGS')
                setPrimaryColor('#0E2140')
                setAccentColor('#F5821F')
                setCollarColor('#F5821F')
                setPattern('cricket-pro')
                setCollar('polo')
                setSelectedKit(KIT_PACKAGES[0])
                setFontStyle('impact')
                setSponsorText('')
                setRoster(DEFAULT_XI)
                toast('Studio reset to default template')
              }}
            >
              <Refresh width={13} height={13} /> Reset
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Main 2-Column Grid */}
        <div className="customizer-grid">
          {/* ──────── LEFT: 3D STADIUM STAGE ──────── */}
          <div className="customizer-stage">
            <div className="stage-topbar">
              <div className="stage-view-toggles">
                <button
                  type="button"
                  className={`stage-toggle-btn ${view === 'front' ? 'active' : ''}`}
                  onClick={() => setView('front')}
                >
                  <Shirt width={14} height={14} /> Front View
                </button>
                <button
                  type="button"
                  className={`stage-toggle-btn ${view === 'back' ? 'active' : ''}`}
                  onClick={() => setView('back')}
                >
                  <RotateCcw width={14} height={14} /> Back View
                </button>
              </div>

              <div className="stage-actions">
                <button
                  type="button"
                  className="stage-icon-btn"
                  title="Flip View"
                  onClick={() => setView(view === 'front' ? 'back' : 'front')}
                >
                  <Refresh width={15} height={15} />
                </button>
                <button
                  type="button"
                  className="stage-icon-btn"
                  title="Share Team Design on WhatsApp"
                  onClick={handleShareDesign}
                >
                  <Share width={15} height={15} />
                </button>
                <button
                  type="button"
                  className="stage-icon-btn"
                  title="Download High-Res Mockup PNG"
                  onClick={handleDownloadMockup}
                  disabled={downloadingImg}
                >
                  <Zap width={15} height={15} />
                </button>
              </div>
            </div>

            {/* SVG Canvas Stage */}
            <div className="stage-canvas-wrap">
              <JerseyCanvas
                ref={canvasRef}
                view={view}
                pattern={pattern}
                collar={collar}
                primaryColor={primaryColor}
                accentColor={accentColor}
                collarColor={collarColor}
                teamName={teamName}
                playerNumber={playerNumber}
                playerName={playerName}
                customLogoUrl={customLogoUrl}
                selectedCrest={selectedCrest}
                fontStyle={fontStyle}
                sponsorText={sponsorText}
              />
            </div>

            {/* Meta Strip */}
            <div className="stage-meta-strip">
              <div>
                <b>{teamName || 'Custom Team Kit'}</b> ·{' '}
                <span style={{ opacity: 0.8 }}>
                  {view === 'front' ? 'Chest Print' : `#${playerNumber} ${playerName}`}
                </span>
              </div>
              <span className="stage-pill-tag">
                <Check width={12} height={12} /> 100% Sublimation
              </span>
            </div>
          </div>

          {/* ──────── RIGHT: COMMAND CENTER TABS ──────── */}
          <div className="customizer-controls">
            {/* Modern Segmented Tab Bar */}
            <div className="customizer-tabs">
              <button
                type="button"
                className={`customizer-tab-btn ${activeTab === 'visual' ? 'active' : ''}`}
                onClick={() => setActiveTab('visual')}
              >
                <Palette width={14} height={14} /> 1. Style
              </button>
              <button
                type="button"
                className={`customizer-tab-btn ${activeTab === 'identity' ? 'active' : ''}`}
                onClick={() => setActiveTab('identity')}
              >
                <ShieldCheck width={14} height={14} /> 2. Badges
              </button>
              <button
                type="button"
                className={`customizer-tab-btn ${activeTab === 'roster' ? 'active' : ''}`}
                onClick={() => setActiveTab('roster')}
              >
                <Users width={14} height={14} /> 3. Roster <span className="badge-count">{roster.length}</span>
              </button>
              <button
                type="button"
                className={`customizer-tab-btn ${activeTab === 'pricing' ? 'active' : ''}`}
                onClick={() => setActiveTab('pricing')}
              >
                <Tag width={14} height={14} /> 4. Pricing
              </button>
            </div>

            {/* ──────── STEP 1: STYLE & COLORS ──────── */}
            {activeTab === 'visual' && (
              <div className="tab-pane">
                {/* Patterns Card */}
                <div className="customizer-card">
                  <div className="card-title-row">
                    <h3>
                      <Zap width={16} height={16} style={{ color: 'var(--orange)' }} /> Sublimation Pattern Design
                    </h3>
                    <span>5 Pro Sport Templates</span>
                  </div>
                  <div className="pattern-grid">
                    {[
                      { id: 'cricket-pro', name: 'Cricket Pro', sub: 'Angular Energy' },
                      { id: 'classic-stripes', name: 'Athletic Stripes', sub: 'Football / Club' },
                      { id: 'cyber-waves', name: 'Cyber Waves', sub: 'Speed Streaks' },
                      { id: 'hex-armor', name: 'Hex Armor', sub: 'Honeycomb Pro' },
                      { id: 'dual-tone', name: 'Minimalist', sub: 'Raglan Contrast' },
                    ].map((p) => (
                      <div
                        key={p.id}
                        className={`pattern-card ${pattern === p.id ? 'active' : ''}`}
                        onClick={() => setPattern(p.id)}
                      >
                        <div
                          className="pattern-card-preview"
                          style={{
                            background:
                              p.id === 'cricket-pro'
                                ? `linear-gradient(135deg, ${primaryColor} 40%, ${accentColor} 41%, ${primaryColor} 60%)`
                                : p.id === 'classic-stripes'
                                  ? `repeating-linear-gradient(90deg, ${primaryColor}, ${primaryColor} 12px, ${accentColor} 12px, ${accentColor} 24px)`
                                  : p.id === 'cyber-waves'
                                    ? `radial-gradient(circle, ${accentColor} 10%, ${primaryColor} 90%)`
                                    : p.id === 'hex-armor'
                                      ? `linear-gradient(180deg, ${primaryColor} 0%, ${accentColor} 100%)`
                                      : `linear-gradient(90deg, ${accentColor} 30%, ${primaryColor} 30%)`,
                          }}
                        />
                        <div className="pattern-card-title">{p.name}</div>
                        <div className="pattern-card-sub">{p.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Color Schemes Card */}
                <div className="customizer-card">
                  <div className="card-title-row">
                    <h3>
                      <Palette width={16} height={16} style={{ color: 'var(--orange)' }} /> Sportswear Colorways
                    </h3>
                    <button
                      type="button"
                      className="btn btn--outline btn--sm"
                      onClick={handleSwapColors}
                      title="Swap Primary & Accent Colors"
                      style={{ padding: '4px 10px', fontSize: 11 }}
                    >
                      ⇄ Swap Colors
                    </button>
                  </div>

                  {/* Quick Preset Combos */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: '0.05em' }}>
                      POPULAR TEAM PRESET COMBINATIONS
                    </label>
                    <div className="combo-pills">
                      {PRESET_COMBOS.map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          className="combo-pill-btn"
                          onClick={() => {
                            setPrimaryColor(c.primary)
                            setAccentColor(c.accent)
                            setCollarColor(c.collar)
                          }}
                        >
                          <div className="combo-dots">
                            <span className="combo-dot" style={{ background: c.primary }} />
                            <span className="combo-dot" style={{ background: c.accent }} />
                            <span className="combo-dot" style={{ background: c.collar }} />
                          </div>
                          <span>{c.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Primary Color Swatches */}
                  <div style={{ marginTop: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: '0.05em' }}>
                        1. PRIMARY BODY COLOR
                      </label>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink)' }}>
                        {PALETTES.find((p) => p.hex === primaryColor)?.name || primaryColor}
                      </span>
                    </div>
                    <div className="color-swatches-grid">
                      {PALETTES.map((c) => (
                        <button
                          key={c.hex}
                          type="button"
                          className={`color-swatch-circle ${primaryColor === c.hex ? 'active' : ''}`}
                          style={{ background: c.hex }}
                          title={c.name}
                          onClick={() => setPrimaryColor(c.hex)}
                        />
                      ))}
                      <label className="color-swatch-custom" title="Choose custom color hex">
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                        />
                        <span>+</span>
                      </label>
                    </div>
                  </div>

                  {/* Accent Color Swatches */}
                  <div style={{ marginTop: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: '0.05em' }}>
                        2. ACCENT / PATTERN COLOR
                      </label>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink)' }}>
                        {PALETTES.find((p) => p.hex === accentColor)?.name || accentColor}
                      </span>
                    </div>
                    <div className="color-swatches-grid">
                      {PALETTES.map((c) => (
                        <button
                          key={c.hex}
                          type="button"
                          className={`color-swatch-circle ${accentColor === c.hex ? 'active' : ''}`}
                          style={{ background: c.hex }}
                          title={c.name}
                          onClick={() => setAccentColor(c.hex)}
                        />
                      ))}
                      <label className="color-swatch-custom" title="Choose custom color hex">
                        <input
                          type="color"
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value)}
                        />
                        <span>+</span>
                      </label>
                    </div>
                  </div>

                  {/* Collar Color Swatches */}
                  <div style={{ marginTop: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: '0.05em' }}>
                        3. COLLAR & CUFF TRIM COLOR
                      </label>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink)' }}>
                        {PALETTES.find((p) => p.hex === collarColor)?.name || collarColor}
                      </span>
                    </div>
                    <div className="color-swatches-grid">
                      {PALETTES.map((c) => (
                        <button
                          key={c.hex}
                          type="button"
                          className={`color-swatch-circle ${collarColor === c.hex ? 'active' : ''}`}
                          style={{ background: c.hex }}
                          title={c.name}
                          onClick={() => setCollarColor(c.hex)}
                        />
                      ))}
                      <label className="color-swatch-custom" title="Choose custom color hex">
                        <input
                          type="color"
                          value={collarColor}
                          onChange={(e) => setCollarColor(e.target.value)}
                        />
                        <span>+</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={() => setActiveTab('identity')}
                  >
                    Next: Add Badges & Team Name <ArrowRight width={16} height={16} />
                  </button>
                </div>
              </div>
            )}

            {/* ──────── STEP 2: BADGES & IDENTITY ──────── */}
            {activeTab === 'identity' && (
              <div className="tab-pane">
                {/* Team & Player Identity Card */}
                <div className="customizer-card">
                  <div className="card-title-row">
                    <h3>
                      <Type width={16} height={16} style={{ color: 'var(--orange)' }} /> Team Name & Player Typography
                    </h3>
                    <span>Rendered live on front & back</span>
                  </div>

                  <div className="text-controls-grid">
                    <div className="field">
                      <label>Team / Club Name (Front Chest)</label>
                      <input
                        className="input"
                        value={teamName}
                        maxLength={22}
                        onChange={(e) => setTeamName(e.target.value.toUpperCase())}
                        placeholder="e.g. CHAPRA KINGS"
                      />
                    </div>
                    <div className="field">
                      <label>Belly Sponsor Banner (Optional)</label>
                      <input
                        className="input"
                        value={sponsorText}
                        maxLength={18}
                        onChange={(e) => setSponsorText(e.target.value.toUpperCase())}
                        placeholder="e.g. DREAM11 / TATA / JIO"
                      />
                    </div>
                    <div className="field">
                      <label>Front Chest Number</label>
                      <input
                        className="input"
                        value={playerNumber}
                        maxLength={2}
                        onChange={(e) => setPlayerNumber(e.target.value.replace(/\D/g, '').slice(0, 2))}
                        placeholder="07"
                      />
                    </div>
                    <div className="field">
                      <label>Sample Player Name (Back View)</label>
                      <input
                        className="input"
                        value={playerName}
                        maxLength={16}
                        onChange={(e) => setPlayerName(e.target.value.toUpperCase())}
                        placeholder="ROHIT"
                      />
                    </div>
                    <div className="field">
                      <label>Collar & Neckline Style</label>
                      <select
                        className="select"
                        value={collar}
                        onChange={(e) => setCollar(e.target.value)}
                      >
                        <option value="polo">Sublimated Sports Polo (Button Placket)</option>
                        <option value="vneck">Athletic V-Neck</option>
                        <option value="round">Crew Round Neck</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Number & Name Font Typography Style Card */}
                <div className="customizer-card">
                  <div className="card-title-row">
                    <h3>
                      <Type width={16} height={16} style={{ color: 'var(--orange)' }} /> Jersey Number Font Style
                    </h3>
                    <span>4 Pro Sports Typography Styles</span>
                  </div>
                  <div className="font-options-grid">
                    {FONT_OPTIONS.map((f) => {
                      const isSel = fontStyle === f.id
                      return (
                        <div
                          key={f.id}
                          className={`font-option-card ${isSel ? 'active' : ''}`}
                          onClick={() => setFontStyle(f.id)}
                        >
                          <div className={`font-option-sample font-sample--${f.id}`}>07</div>
                          <div className="font-option-name">{f.name}</div>
                          <div className="font-option-sub">{f.desc}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Team Crest & Sponsor Logo */}
                <div className="customizer-card">
                  <div className="card-title-row">
                    <h3>
                      <Shield width={16} height={16} style={{ color: 'var(--orange)' }} /> Team Crest / Logo (Left Chest)
                    </h3>
                    <span>Pick a pre-made vector badge or upload PNG</span>
                  </div>

                  <div className="logo-picker-row">
                    {PRESET_CRESTS.map((crest) => (
                      <button
                        key={crest.id}
                        type="button"
                        className={`crest-btn ${selectedCrest === crest.id && !customLogoUrl ? 'active' : ''}`}
                        title={crest.name}
                        onClick={() => {
                          setSelectedCrest(crest.id)
                          setCustomLogoUrl(null)
                        }}
                      >
                        <svg viewBox="0 0 24 24">{crest.render(accentColor)}</svg>
                      </button>
                    ))}

                    <label className="upload-crest-box">
                      <input
                        type="file"
                        accept="image/png, image/jpeg"
                        style={{ display: 'none' }}
                        onChange={handleLogoUpload}
                      />
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <Upload width={14} height={14} /> {customLogoUrl ? 'Change Uploaded Logo' : 'Upload Club Logo (PNG)'}
                      </span>
                    </label>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14 }}>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => setActiveTab('visual')}
                  >
                    ← Back to Style & Colors
                  </button>
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={() => setActiveTab('roster')}
                  >
                    Next: Squad Roster ({roster.length} Players) →
                  </button>
                </div>
              </div>
            )}

            {/* ──────── STEP 3: SQUAD ROSTER MATRIX ──────── */}
            {activeTab === 'roster' && (
              <div className="tab-pane">
                <div className="customizer-card">
                  <div className="roster-header-bar">
                    <div>
                      <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Users width={16} height={16} style={{ color: 'var(--orange)' }} /> Team Squad Roster
                      </h3>
                      <p className="muted small" style={{ marginTop: 2 }}>
                        Enter player names and numbers. Minimum {BRAND.moq} pieces qualifies for team wholesale pricing.
                      </p>
                    </div>

                    <div className="roster-quick-actions">
                      <button
                        type="button"
                        className="btn btn--outline btn--sm"
                        onClick={() => setSizeChartOpen(true)}
                        title="View Measurements & Size Guide"
                      >
                        <Ruler width={13} height={13} /> Size Guide
                      </button>
                      <button
                        type="button"
                        className="btn btn--outline btn--sm"
                        onClick={handleExportExcel}
                        title="Export Squad Roster to Excel (.xlsx)"
                      >
                        <Download width={13} height={13} /> Excel (.xlsx)
                      </button>
                      <button
                        type="button"
                        className="btn btn--outline btn--sm"
                        onClick={() => setPasteModalOpen(true)}
                      >
                        <Clipboard width={13} height={13} /> Fast Paste
                      </button>
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        onClick={() => setRoster(DEFAULT_XI)}
                      >
                        <Refresh width={13} height={13} /> Reset 11
                      </button>
                      <button
                        type="button"
                        className="btn btn--accent btn--sm"
                        onClick={addPlayer}
                      >
                        <Plus width={14} height={14} /> Add Player
                      </button>
                    </div>
                  </div>

                  {/* Roster Table */}
                  <div className="roster-table-wrap">
                    <table className="roster-table">
                      <thead>
                        <tr>
                          <th style={{ width: 44 }}>#</th>
                          <th>Player Name</th>
                          <th style={{ width: 85 }}>No.</th>
                          <th style={{ width: 105 }}>Size</th>
                          <th style={{ width: 110 }}>Sleeve</th>
                          <th style={{ width: 140 }}>Role / Badge</th>
                          <th style={{ width: 80 }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {roster.map((p, idx) => (
                          <tr key={p.id}>
                            <td>
                              <b style={{ color: 'var(--muted)' }}>{idx + 1}</b>
                            </td>
                            <td>
                              <input
                                className="roster-input roster-input-name"
                                value={p.name}
                                maxLength={22}
                                onChange={(e) => updatePlayer(p.id, 'name', e.target.value.toUpperCase())}
                                placeholder="PLAYER NAME"
                              />
                            </td>
                            <td>
                              <input
                                className="roster-input"
                                value={p.number}
                                maxLength={2}
                                onChange={(e) => updatePlayer(p.id, 'number', e.target.value.replace(/\D/g, ''))}
                                placeholder="07"
                              />
                            </td>
                            <td>
                              <select
                                className="roster-select"
                                value={p.size}
                                onChange={(e) => updatePlayer(p.id, 'size', e.target.value)}
                              >
                                {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'].map((s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <select
                                className="roster-select"
                                value={p.sleeve}
                                onChange={(e) => updatePlayer(p.id, 'sleeve', e.target.value)}
                              >
                                <option value="Half">Half Sleeve</option>
                                <option value="Full">Full Sleeve</option>
                              </select>
                            </td>
                            <td>
                              <select
                                className="roster-select"
                                value={p.role}
                                onChange={(e) => updatePlayer(p.id, 'role', e.target.value)}
                              >
                                <option value="Player">Player</option>
                                <option value="Captain (C)">Captain (C)</option>
                                <option value="Vice-Captain (VC)">Vice-Captain (VC)</option>
                                <option value="Wicketkeeper (WK)">Keeper (WK)</option>
                              </select>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: 4 }}>
                                <button
                                  type="button"
                                  className="roster-del-btn"
                                  title="Preview on Jersey Back"
                                  onClick={() => previewPlayer(p)}
                                >
                                  <Eye width={14} height={14} />
                                </button>
                                <button
                                  type="button"
                                  className="roster-del-btn"
                                  title="Delete Player"
                                  onClick={() => removePlayer(p.id)}
                                >
                                  <Trash width={14} height={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Size Summary */}
                  <div className="size-chips-bar">
                    <b>Size Breakdown:</b>
                    {Object.entries(sizeDistribution).map(([sz, cnt]) => (
                      <span className="size-chip" key={sz}>
                        Size {sz}: <b>{cnt}</b>
                      </span>
                    ))}
                    <span className="size-chip" style={{ background: 'var(--ink)', color: '#fff', marginLeft: 'auto' }}>
                      Total Squad: <b>{totalCount}</b>
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14 }}>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => setActiveTab('identity')}
                  >
                    ← Back to Badges & Text
                  </button>
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={() => setActiveTab('pricing')}
                  >
                    Next: Choose Fabric & Pricing →
                  </button>
                </div>
              </div>
            )}

            {/* ──────── STEP 4: FABRIC & BULK PRICING ──────── */}
            {activeTab === 'pricing' && (
              <div className="tab-pane">
                {/* Kit Package Level Selector Card */}
                <div className="customizer-card">
                  <div className="card-title-row">
                    <h3>
                      <Shirt width={16} height={16} style={{ color: 'var(--orange)' }} /> Kit Package Level
                    </h3>
                    <span>Match Jersey vs Full Team Kit</span>
                  </div>

                  <div className="kit-packages-grid">
                    {KIT_PACKAGES.map((kit) => {
                      const isSel = selectedKit.id === kit.id
                      return (
                        <div
                          key={kit.id}
                          className={`kit-package-card ${isSel ? 'active' : ''}`}
                          onClick={() => setSelectedKit(kit)}
                        >
                          <div className="kit-package-top">
                            <span className="kit-package-badge">{kit.badge}</span>
                            <span className="kit-package-price">
                              {kit.extraPrice === 0 ? 'Base Rate' : `+₹${kit.extraPrice}/pc`}
                            </span>
                          </div>
                          <div className="kit-package-name">{kit.name}</div>
                          <div className="kit-package-desc">{kit.desc}</div>
                          <div className="kit-package-check">
                            <span className={`kit-radio-circle ${isSel ? 'checked' : ''}`} />
                            <b>{isSel ? 'Selected Package' : 'Select'}</b>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Fabric Selector Card */}
                <div className="customizer-card">
                  <div className="card-title-row">
                    <h3>
                      <Shirt width={16} height={16} style={{ color: 'var(--orange)' }} /> Sportswear Fabric Selection
                    </h3>
                    <span>Direct Factory Unit Pricing</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {FABRIC_OPTIONS.map((f) => {
                      const isSel = selectedFabric.id === f.id
                      return (
                        <div
                          key={f.id}
                          onClick={() => setSelectedFabric(f)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '14px 18px',
                            borderRadius: '10px',
                            border: `2px solid ${isSel ? 'var(--orange)' : 'var(--line)'}`,
                            background: isSel ? '#fffaf5' : '#ffffff',
                            cursor: 'pointer',
                            transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
                            boxShadow: isSel ? '0 4px 14px rgba(245, 130, 31, 0.12)' : 'none',
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <b style={{ fontSize: 14, color: 'var(--ink)' }}>{f.name}</b>
                              <span style={{ fontSize: 11, background: 'var(--paper)', padding: '2px 8px', borderRadius: 4, fontWeight: 700, color: 'var(--muted)' }}>
                                {f.gsm}
                              </span>
                            </div>
                            <div className="small muted" style={{ marginTop: 2 }}>{f.tag}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <b style={{ fontSize: 16, color: 'var(--ink)' }}>₹{f.baseRate + selectedKit.extraPrice}</b>
                            <span className="small muted" style={{ display: 'block' }}>/set ({selectedKit.name})</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Tier Progress Widget */}
                <div className="tier-progress-card">
                  <div className="tier-stats-row">
                    <div className="tier-stat-box">
                      <span>Total Squad</span>
                      <b>{totalCount} Sets</b>
                    </div>
                    <div className="tier-stat-box">
                      <span>Rate Per Set</span>
                      <b style={{ color: '#86efac' }}>₹{unitRate}</b>
                    </div>
                    <div className="tier-stat-box">
                      <span>Estimated Order Value</span>
                      <b>{formatPrice(totalAmount)}</b>
                    </div>
                    {discountPct > 0 ? (
                      <span className="tier-badge-pill">
                        <Check width={12} height={12} /> {discountPct}% Team Discount Applied
                      </span>
                    ) : (
                      <span className="tier-badge-pill" style={{ background: 'var(--orange)' }}>
                        Add {11 - totalCount} more for 15% Team Rate
                      </span>
                    )}
                  </div>

                  {/* 4 Discount Steps */}
                  <div className="tier-bars-wrap">
                    {[
                      { title: 'Retail', range: '1–10 pcs', rate: `₹${baseRate}`, disc: 'Base Price', active: totalCount < 11 },
                      { title: 'Team XI', range: '11–25 pcs', rate: `₹${Math.round(baseRate * 0.85)}`, disc: '15% Off', active: totalCount >= 11 && totalCount <= 25 },
                      { title: 'Club', range: '26–50 pcs', rate: `₹${Math.round(baseRate * 0.78)}`, disc: '22% Off', active: totalCount >= 26 && totalCount <= 50 },
                      { title: 'Tournament', range: '51+ pcs', rate: `₹${Math.round(baseRate * 0.70)}`, disc: '30% Off', active: totalCount >= 51 },
                    ].map((step) => (
                      <div key={step.title} className={`tier-step-box ${step.active ? 'active' : ''}`}>
                        <div className="tier-step-title">{step.title}</div>
                        <div className="tier-step-rate">{step.range}</div>
                        <div className="tier-step-discount">{step.disc}</div>
                      </div>
                    ))}
                  </div>

                  <p className="small" style={{ opacity: 0.85, marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Info width={14} height={14} style={{ color: 'var(--orange)', flexShrink: 0 }} /> All custom orders include free 3D design proof, individual name/number printing, and club crest sublimation.
                  </p>
                </div>
              </div>
            )}

            {/* ──────── BOTTOM CHECKOUT & ACTION BAR ──────── */}
            <div className="customizer-checkout-bar">
              <div className="checkout-totals-summary">
                <span>
                  {teamName} ({totalCount} Sets · {selectedFabric.name} · {selectedKit.name})
                </span>
                <b>
                  {formatPrice(totalAmount)}{' '}
                  {totalSavings > 0 && (
                    <span className="small" style={{ color: 'var(--success)', fontWeight: 700 }}>
                      (Saved {formatPrice(totalSavings)})
                    </span>
                  )}
                </b>
              </div>

              <div className="checkout-buttons-group">
                <button
                  type="button"
                  className="btn btn--outline"
                  onClick={handleShareDesign}
                  title="Share Team Design on WhatsApp"
                >
                  <Share width={15} height={15} /> Share
                </button>

                <button
                  type="button"
                  className="btn btn--outline"
                  onClick={handlePrintSheet}
                  title="Print Factory Order Sheet"
                >
                  <Printer width={15} height={15} /> Print Sheet
                </button>

                <a
                  className="btn btn--accent"
                  href={`https://wa.me/${BRAND.phoneIntl.replace('+', '')}?text=${getWhatsAppMessage()}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <WhatsApp width={16} height={16} /> WhatsApp Proof
                </a>

                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={handleAddToCart}
                >
                  Add Team Kit to Bag <ArrowRight width={16} height={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ──────── FAST PASTE MODAL ──────── */}
      {pasteModalOpen && (
        <div className="custom-modal-overlay" onClick={() => setPasteModalOpen(false)}>
          <div className="custom-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="custom-modal-head">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clipboard width={16} height={16} style={{ color: 'var(--orange)' }} /> Fast Paste Player List
              </h3>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setPasteModalOpen(false)}
              >
                <X width={16} height={16} />
              </button>
            </div>
            <div className="custom-modal-body">
              <p className="small muted" style={{ marginBottom: 10 }}>
                Paste your player roster from WhatsApp or Excel. Example format:
                <br />
                <code>1. Rohit Sharma - 45 - XL - Half</code>
                <br />
                <code>2. Virat Kohli - 18 - L - Full</code>
              </p>
              <textarea
                placeholder={`1. Rohit Sharma - 45 - XL\n2. Virat Kohli - 18 - L\n3. Hardik Pandya - 33 - L`}
                value={rawPasteText}
                onChange={(e) => setRawPasteText(e.target.value)}
              />
            </div>
            <div className="custom-modal-foot">
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => setPasteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn--primary btn--sm"
                onClick={handleSmartPaste}
              >
                Parse & Add to Roster
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────── PRO SIZE GUIDE & MEASUREMENTS MODAL ──────── */}
      {sizeChartOpen && (
        <div className="custom-modal-overlay" onClick={() => setSizeChartOpen(false)}>
          <div className="custom-modal-box custom-modal-box--wide" onClick={(e) => e.stopPropagation()}>
            <div className="custom-modal-head">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Ruler width={18} height={18} style={{ color: 'var(--orange)' }} /> Rishikar Athletic Pro Size Guide & Measurements
              </h3>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setSizeChartOpen(false)}
              >
                <X width={16} height={16} />
              </button>
            </div>
            <div className="custom-modal-body">
              <p className="small muted" style={{ marginBottom: 14 }}>
                All measurements are in inches. Standard Indian athletic match-cut tailoring with zero color fade guarantee.
              </p>

              <div className="size-guide-table-wrap">
                <table className="size-guide-table">
                  <thead>
                    <tr>
                      <th>Size</th>
                      <th>Chest (Around)</th>
                      <th>Jersey Length</th>
                      <th>Lower (Pant) Length</th>
                      <th>Recommended Fit / Height</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SIZE_GUIDE_DATA.map((row) => (
                      <tr key={row.size}>
                        <td><b>{row.size}</b></td>
                        <td>{row.chest}</td>
                        <td>{row.length}</td>
                        <td>{row.lowerLength}</td>
                        <td><span className="fit-pill">{row.fit}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="size-guide-tips">
                <div className="size-tip-box">
                  <b>📐 How to Measure Chest:</b>
                  <span>Measure around the fullest part of your chest, keeping the measuring tape flat under the armpits.</span>
                </div>
                <div className="size-tip-box">
                  <b>🏏 Match Fit vs Pad Room:</b>
                  <span>For active batting & fielding, choose your exact size. For loose comfort over thigh/chest pads, pick 1 size larger.</span>
                </div>
              </div>
            </div>
            <div className="custom-modal-foot">
              <button
                type="button"
                className="btn btn--primary btn--sm"
                onClick={() => setSizeChartOpen(false)}
              >
                Got It, Return to Roster
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────── PRINTABLE FACTORY PRODUCTION SPEC SHEET (PRINT ONLY) ──────── */}
      <div className="print-production-sheet">
        <div className="pps-header">
          <div className="pps-brand">
            <img src="/logo.png" alt="Rishikar Sports" className="pps-logo" />
            <div>
              <h1 className="pps-brand-title">RISHIKAR SPORTS</h1>
              <p className="pps-brand-sub">Official Custom Teamwear Factory Production Spec Sheet</p>
            </div>
          </div>
          <div className="pps-meta">
            <div className="pps-meta-row">Order Ref: <b>RS-{teamName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase() || 'CUSTOM'}</b></div>
            <div className="pps-meta-row">Date: <b>{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</b></div>
            <div className="pps-meta-badge">100% Sublimation Verified</div>
          </div>
        </div>

        {/* 3-Box Spec Overview */}
        <div className="pps-specs-grid">
          <div className="pps-spec-card">
            <div className="pps-spec-heading">Team & Kit Details</div>
            <div className="pps-spec-row"><span>Team Name:</span> <b>{teamName}</b></div>
            <div className="pps-spec-row"><span>Kit Package:</span> <b>{selectedKit.name}</b></div>
            <div className="pps-spec-row"><span>Squad Size:</span> <b>{totalCount} Sets</b></div>
            <div className="pps-spec-row"><span>Fabric:</span> <b>{selectedFabric.name} ({selectedFabric.gsm})</b></div>
            <div className="pps-spec-row"><span>Collar Style:</span> <b>{collar === 'polo' ? 'Sports Polo Collar' : collar === 'vneck' ? 'Athletic V-Neck' : 'Round Crew Neck'}</b></div>
          </div>

          <div className="pps-spec-card">
            <div className="pps-spec-heading">Color & Design Specs</div>
            <div className="pps-spec-row"><span>Pattern:</span> <b>{pattern.replace(/-/g, ' ').toUpperCase()}</b></div>
            <div className="pps-spec-row"><span>Number Font:</span> <b>{FONT_OPTIONS.find((f) => f.id === fontStyle)?.name || 'Pro Athletic'}</b></div>
            <div className="pps-spec-row"><span>Belly Sponsor:</span> <b>{sponsorText || 'N/A'}</b></div>
            <div className="pps-spec-row">
              <span>Primary Body:</span>
              <span className="pps-color-preview">
                <i style={{ background: primaryColor }} /> {primaryColor}
              </span>
            </div>
            <div className="pps-spec-row">
              <span>Accent Color:</span>
              <span className="pps-color-preview">
                <i style={{ background: accentColor }} /> {accentColor}
              </span>
            </div>
            <div className="pps-spec-row">
              <span>Collar Color:</span>
              <span className="pps-color-preview">
                <i style={{ background: collarColor }} /> {collarColor}
              </span>
            </div>
          </div>

          <div className="pps-spec-card">
            <div className="pps-spec-heading">Commercial Estimate</div>
            <div className="pps-spec-row"><span>Pricing Tier:</span> <b>{tierName}</b></div>
            <div className="pps-spec-row"><span>Unit Rate:</span> <b>₹{unitRate} / piece</b></div>
            <div className="pps-spec-row"><span>Total Amount:</span> <b className="pps-price-highlight">₹{totalAmount.toLocaleString('en-IN')}</b></div>
            <div className="pps-spec-row"><span>Status:</span> <b style={{ color: '#16a34a' }}>Approved for Production</b></div>
          </div>
        </div>

        {/* Dual Jersey Mockup Previews */}
        <div className="pps-visual-section">
          <div className="pps-section-title">Jersey Visual Specifications</div>
          <div className="pps-mockups-row">
            <div className="pps-mockup-card">
              <div className="pps-mockup-tag">FRONT VIEW · CHEST PRINT & CREST</div>
              <div className="pps-mockup-canvas">
                <JerseyCanvas
                  pattern={pattern}
                  collar={collar}
                  primaryColor={primaryColor}
                  accentColor={accentColor}
                  collarColor={collarColor}
                  view="front"
                  teamName={teamName}
                  customLogoUrl={customLogoUrl}
                  selectedCrest={selectedCrest}
                  fontStyle={fontStyle}
                  sponsorText={sponsorText}
                />
              </div>
            </div>
            <div className="pps-mockup-card">
              <div className="pps-mockup-tag">BACK VIEW · NAME & NUMBER TEMPLATE</div>
              <div className="pps-mockup-canvas">
                <JerseyCanvas
                  pattern={pattern}
                  collar={collar}
                  primaryColor={primaryColor}
                  accentColor={accentColor}
                  collarColor={collarColor}
                  view="back"
                  playerName={roster[0]?.name || playerName}
                  playerNumber={roster[0]?.number || playerNumber}
                  fontStyle={fontStyle}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Size & Sleeve Breakdown Bar */}
        <div className="pps-breakdown-bar">
          <div className="pps-breakdown-col">
            <span className="pps-breakdown-label">SIZE BREAKDOWN:</span>
            <span className="pps-breakdown-vals">
              {Object.entries(sizeDistribution)
                .map(([sz, cnt]) => `${sz}: ${cnt}`)
                .join('   |   ')}
            </span>
          </div>
          <div className="pps-breakdown-col">
            <span className="pps-breakdown-label">SLEEVE BREAKDOWN:</span>
            <span className="pps-breakdown-vals">
              Half Sleeve: {roster.filter((p) => p.sleeve === 'Half').length} &nbsp;|&nbsp; Full Sleeve: {roster.filter((p) => p.sleeve === 'Full').length}
            </span>
          </div>
        </div>

        {/* Complete Squad Roster Checklist Table */}
        <div className="pps-roster-section">
          <div className="pps-section-title">
            Team Squad Roster & Tailoring Checklist ({totalCount} Jerseys)
          </div>
          <table className="pps-table">
            <thead>
              <tr>
                <th style={{ width: '35px' }}>#</th>
                <th>Player Name (Printed on Back)</th>
                <th style={{ width: '65px', textAlign: 'center' }}>Jersey #</th>
                <th style={{ width: '55px', textAlign: 'center' }}>Size</th>
                <th style={{ width: '85px' }}>Sleeve</th>
                <th>Role</th>
                <th style={{ width: '125px', textAlign: 'center' }}>QC Checklist</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((p, idx) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 'bold' }}>{idx + 1}</td>
                  <td className="pps-player-name">{p.name}</td>
                  <td style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '12px' }}>#{p.number}</td>
                  <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{p.size}</td>
                  <td>{p.sleeve} Sleeve</td>
                  <td>{p.role}</td>
                  <td style={{ textAlign: 'center', fontSize: '9px', color: '#64748b' }}>
                    [ &nbsp; ] Sublimated &nbsp; [ &nbsp; ] Pass
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Factory Footer & Signatures */}
        <div className="pps-footer">
          <div className="pps-signatures">
            <div className="pps-sig-box">
              <div className="pps-sig-line" />
              <span>Client / Team Representative</span>
            </div>
            <div className="pps-sig-box">
              <div className="pps-sig-line" />
              <span>Sublimation Master</span>
            </div>
            <div className="pps-sig-box">
              <div className="pps-sig-line" />
              <span>Quality Control Inspector</span>
            </div>
          </div>
          <div className="pps-factory-note">
            Rishikar Sports Manufacturing Unit · Chapra, Saran, Bihar 841301 · Helpline: {BRAND.phone} · WhatsApp: {BRAND.phoneIntl} · Email: {BRAND.email}
          </div>
        </div>
      </div>
    </div>
  )
}
