import { useState } from 'react'
import { Link } from 'react-router-dom'
import rateData from '../data/rateList.json'
import { getSettings } from '../lib/db'
import { Crumbs } from '../components/Shared'
import { WhatsApp, ArrowRight, Check, Shield, Truck, Zap } from '../components/Icons'

export default function RateList() {
  const [activeTab, setActiveTab] = useState('jerseys')
  const phone = getSettings().phoneIntl.replace('+', '')

  const waLink = (item, fabric, rate) => {
    const text = `Hi Rishikar Sports, I am checking your official Rate List for: *${item}* (${fabric ? fabric + ' - ' : ''}₹${rate}). Please share details for a team order.`
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
  }

  return (
    <div className="rate-list-page" style={{ padding: '24px 0 60px' }}>
      <div className="container">
        <Crumbs items={[{ label: 'Home', to: '/' }, { label: 'Rate List' }]} />

        {/* Header Hero */}
        <div style={{
          background: 'linear-gradient(135deg, #0e1e38 0%, #1e3a8a 100%)',
          color: '#fff',
          padding: '36px 30px',
          borderRadius: '16px',
          margin: '20px 0 30px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px'
        }}>
          <div style={{ maxWidth: '640px' }}>
            <span style={{
              display: 'inline-block',
              background: '#f97316',
              color: '#fff',
              fontSize: '12px',
              fontWeight: '700',
              padding: '4px 10px',
              borderRadius: '20px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: '12px'
            }}>
              Official Manufacturing Rates
            </span>
            <h1 style={{ fontSize: '32px', fontWeight: '800', lineHeight: '1.2', margin: '0 0 10px', color: '#fff' }}>
              Rishikar Sports - Rate List
            </h1>
            <p style={{ fontSize: '15px', color: '#cbd5e1', lineHeight: '1.6', margin: 0 }}>
              Transparent factory pricing directly from our manufacturing unit in Chapra, Bihar.
              All jersey rates include full digital sublimation, unlimited colours, team logos, player names & numbers.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <a
              href="/Rishikar_Sports_Rate_List.xlsx"
              download="Rishikar_Sports_Rate_List.xlsx"
              className="btn btn--accent"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: '700',
                borderRadius: '8px',
                background: '#f97316',
                color: '#fff',
                textDecoration: 'none'
              }}
            >
              📥 Download Excel Rate Sheet (.xlsx)
            </a>
            <a
              href={`https://wa.me/${phone}?text=${encodeURIComponent('Hi Rishikar Sports, I am looking at your official Rate List and want to inquire about bulk ordering.')}`}
              target="_blank"
              rel="noreferrer"
              className="btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: '600',
                borderRadius: '8px',
                background: '#22c55e',
                color: '#fff',
                textDecoration: 'none'
              }}
            >
              <WhatsApp width={16} height={16} /> Chat for Bulk Pricing
            </a>
          </div>
        </div>

        {/* Tabs Bar */}
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          borderBottom: '2px solid #e2e8f0',
          marginBottom: '28px',
          paddingBottom: '2px'
        }}>
          {[
            { id: 'jerseys', label: '👕 Jerseys (Round Neck & Collar)' },
            { id: 'combo', label: '⚡ Combo Fabric Jerseys' },
            { id: 'bottoms', label: '🩳 Shorts & Lowers' },
            { id: 'other', label: '🧢 Caps, Tracksuits & Gear' },
            { id: 'terms', label: '📋 GST, Shipping & Terms' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: '12px 20px',
                fontWeight: activeTab === t.id ? '700' : '500',
                fontSize: '14px',
                cursor: 'pointer',
                border: 'none',
                background: 'transparent',
                color: activeTab === t.id ? '#f97316' : '#64748b',
                borderBottom: activeTab === t.id ? '3px solid #f97316' : '3px solid transparent',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Jerseys */}
        {activeTab === 'jerseys' && (
          <div>
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '18px 22px',
              marginBottom: '24px',
              fontSize: '14px',
              color: '#475569'
            }}>
              💡 <b>Jersey Pricing Guide:</b> Rates listed below are per piece. Full edge-to-edge sublimation printing is included with zero setup charge for sponsor logos, crests, player names, and numbers.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {Object.entries(rateData.jerseys).map(([title, list]) => (
                <div key={title} style={{
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    background: title.includes('COLLAR') ? '#0e2140' : '#1e3a8a',
                    color: '#fff',
                    padding: '14px 18px',
                    fontWeight: '700',
                    fontSize: '15px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span>{title}</span>
                    <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px' }}>
                      8 Fabrics
                    </span>
                  </div>

                  <div style={{ padding: '8px 16px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #f1f5f9', color: '#64748b' }}>
                          <th style={{ textAlign: 'left', padding: '8px 4px', fontWeight: '600' }}>Fabric</th>
                          <th style={{ textAlign: 'right', padding: '8px 4px', fontWeight: '600' }}>Factory Rate</th>
                          <th style={{ textAlign: 'right', padding: '8px 4px', fontWeight: '600' }}>Enquire</th>
                        </tr>
                      </thead>
                      <tbody>
                        {list.map((it, idx) => (
                          <tr key={idx} style={{
                            borderBottom: idx === list.length - 1 ? 'none' : '1px solid #f8fafc',
                            background: idx % 2 === 0 ? '#fff' : '#fcfcfd'
                          }}>
                            <td style={{ padding: '10px 4px', fontWeight: '600', color: '#1e293b' }}>
                              {it.fabric}
                              {it.fabric === 'DOTKNIT' && <span style={{ fontSize: '10px', color: '#f97316', marginLeft: '6px' }}>★ Most Popular</span>}
                              {it.fabric === 'JACQUARD' && <span style={{ fontSize: '10px', color: '#3b82f6', marginLeft: '6px' }}>Elite</span>}
                            </td>
                            <td style={{ textAlign: 'right', padding: '10px 4px', fontWeight: '700', color: '#0f172a', fontSize: '14px' }}>
                              ₹{it.rate}
                            </td>
                            <td style={{ textAlign: 'right', padding: '10px 4px' }}>
                              <a
                                href={waLink(title, it.fabric, it.rate)}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  color: '#16a34a',
                                  background: '#dcfce7',
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  textDecoration: 'none'
                                }}
                              >
                                <WhatsApp width={12} height={12} /> WhatsApp
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ padding: '10px 16px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
                    <Link to="/c/jerseys" className="btn btn--outline" style={{ fontSize: '12px', padding: '6px 14px' }}>
                      Browse Matching Jerseys →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Combo Fabric */}
        {activeTab === 'combo' && (
          <div>
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '18px 22px',
              marginBottom: '24px',
              fontSize: '14px',
              color: '#475569'
            }}>
              ⚡ <b>Combo Fabric Jerseys:</b> Dual-fabric construction engineered for high ventilation. Main torso body in ultra-durable PMC knit with specialized airflow inserts (Fusion, Airmesh, or Jacquard) for rapid cooling during tournament play.
            </div>

            <div style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
            }}>
              <div style={{
                background: '#0e2140',
                color: '#fff',
                padding: '16px 20px',
                fontWeight: '700',
                fontSize: '16px'
              }}>
                COMBO FABRIC JERSEY RATE LIST
              </div>
              <div style={{ overflowX: 'auto', padding: '16px 20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', minWidth: '600px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                      <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: '700' }}>FABRIC COMBINATION</th>
                      <th style={{ textAlign: 'center', padding: '12px 8px', fontWeight: '700' }}>ROUND NECK<br /><small style={{ fontWeight: '400', color: '#64748b' }}>HALF SLEEVE</small></th>
                      <th style={{ textAlign: 'center', padding: '12px 8px', fontWeight: '700' }}>ROUND NECK<br /><small style={{ fontWeight: '400', color: '#64748b' }}>FULL SLEEVE</small></th>
                      <th style={{ textAlign: 'center', padding: '12px 8px', fontWeight: '700' }}>COLLAR<br /><small style={{ fontWeight: '400', color: '#64748b' }}>HALF SLEEVE</small></th>
                      <th style={{ textAlign: 'center', padding: '12px 8px', fontWeight: '700' }}>COLLAR<br /><small style={{ fontWeight: '400', color: '#64748b' }}>FULL SLEEVE</small></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rateData.comboJerseys.map((c, i) => (
                      <tr key={i} style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: i % 2 === 0 ? '#fff' : '#f8fafc'
                      }}>
                        <td style={{ padding: '14px 8px', fontWeight: '700', color: '#1e293b' }}>
                          {c.fabric}
                        </td>
                        <td style={{ textAlign: 'center', padding: '14px 8px', fontWeight: '700', color: '#f97316' }}>
                          ₹{c.roundNeckHalf}
                        </td>
                        <td style={{ textAlign: 'center', padding: '14px 8px', fontWeight: '700', color: '#f97316' }}>
                          ₹{c.roundNeckFull}
                        </td>
                        <td style={{ textAlign: 'center', padding: '14px 8px', fontWeight: '700', color: '#0ea5e9' }}>
                          ₹{c.collarHalf}
                        </td>
                        <td style={{ textAlign: 'center', padding: '14px 8px', fontWeight: '700', color: '#0ea5e9' }}>
                          ₹{c.collarFull}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ padding: '16px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <span style={{ fontSize: '13px', color: '#64748b' }}>Want a customized combo jersey for your team?</span>
                <Link to="/product/rs-combo-fabric-sublimated-jersey" className="btn btn--accent" style={{ fontSize: '13px' }}>
                  View Combo Jersey Product Details →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Bottoms & Lowers */}
        {activeTab === 'bottoms' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              {/* Plain Shorts */}
              <div style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
              }}>
                <div style={{ background: '#0e2140', color: '#fff', padding: '14px 18px', fontWeight: '700' }}>
                  PLAIN SHORTS
                </div>
                <div style={{ padding: '12px 18px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #f1f5f9', color: '#64748b' }}>
                        <th style={{ textAlign: 'left', padding: '8px 0' }}>Fabric</th>
                        <th style={{ textAlign: 'right', padding: '8px 0' }}>Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rateData.bottoms.plainShorts.map((s, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                          <td style={{ padding: '10px 0', fontWeight: '600' }}>{s.fabric}</td>
                          <td style={{ textAlign: 'right', padding: '10px 0', fontWeight: '700', color: '#0f172a' }}>₹{s.rate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ padding: '12px 18px', background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
                  <Link to="/product/rs-classic-training-plain-shorts" className="btn btn--outline" style={{ fontSize: '12px', width: '100%', justifyContent: 'center' }}>
                    Shop Plain Shorts →
                  </Link>
                </div>
              </div>

              {/* Sublimation Shorts */}
              <div style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
              }}>
                <div style={{ background: '#f97316', color: '#fff', padding: '14px 18px', fontWeight: '700' }}>
                  SUBLIMATION SHORTS
                </div>
                <div style={{ padding: '12px 18px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #f1f5f9', color: '#64748b' }}>
                        <th style={{ textAlign: 'left', padding: '8px 0' }}>Fabric</th>
                        <th style={{ textAlign: 'right', padding: '8px 0' }}>Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rateData.bottoms.sublimationShorts.map((s, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                          <td style={{ padding: '10px 0', fontWeight: '600' }}>{s.fabric}</td>
                          <td style={{ textAlign: 'right', padding: '10px 0', fontWeight: '700', color: '#0f172a' }}>₹{s.rate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ padding: '12px 18px', background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
                  <Link to="/product/rs-sublimation-pro-match-shorts" className="btn btn--accent" style={{ fontSize: '12px', width: '100%', justifyContent: 'center' }}>
                    Shop Sublimation Shorts →
                  </Link>
                </div>
              </div>

              {/* Plain Lowers */}
              <div style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
              }}>
                <div style={{ background: '#1e3a8a', color: '#fff', padding: '14px 18px', fontWeight: '700' }}>
                  PLAIN LOWERS / TRACK PANTS
                </div>
                <div style={{ padding: '12px 18px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #f1f5f9', color: '#64748b' }}>
                        <th style={{ textAlign: 'left', padding: '8px 0' }}>Fabric</th>
                        <th style={{ textAlign: 'right', padding: '8px 0' }}>Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rateData.bottoms.plainLower.map((l, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                          <td style={{ padding: '10px 0', fontWeight: '600' }}>{l.fabric}</td>
                          <td style={{ textAlign: 'right', padding: '10px 0', fontWeight: '700', color: '#0f172a' }}>₹{l.rate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ padding: '12px 18px', background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
                  <Link to="/product/rs-plain-athletic-training-lower" className="btn btn--outline" style={{ fontSize: '12px', width: '100%', justifyContent: 'center' }}>
                    Shop Plain Lowers →
                  </Link>
                </div>
              </div>

              {/* Sublimation Lowers */}
              <div style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
              }}>
                <div style={{ background: '#047857', color: '#fff', padding: '14px 18px', fontWeight: '700' }}>
                  SUBLIMATION LOWERS (PRINTED PANTS)
                </div>
                <div style={{ padding: '12px 18px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #f1f5f9', color: '#64748b' }}>
                        <th style={{ textAlign: 'left', padding: '8px 0' }}>Fabric</th>
                        <th style={{ textAlign: 'right', padding: '8px 0' }}>Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rateData.bottoms.sublimationLower.map((l, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                          <td style={{ padding: '10px 0', fontWeight: '600' }}>{l.fabric}</td>
                          <td style={{ textAlign: 'right', padding: '10px 0', fontWeight: '700', color: '#0f172a' }}>₹{l.rate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ padding: '12px 18px', background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
                  <Link to="/product/rs-pro-sublimation-lowers" className="btn btn--accent" style={{ fontSize: '12px', width: '100%', justifyContent: 'center' }}>
                    Shop Sublimation Lowers →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Other Gear */}
        {activeTab === 'other' && (
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '16px'
            }}>
              {rateData.otherDetails.map((it, idx) => (
                <div key={idx} style={{
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
                }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>
                      {it.category}
                    </span>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '6px 0 10px', color: '#0f172a' }}>
                      {it.item}
                    </h3>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '20px', fontWeight: '800', color: '#f97316' }}>
                      ₹{it.rate}
                    </span>
                    <a
                      href={waLink(it.item, '', it.rate)}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#16a34a',
                        background: '#dcfce7',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        textDecoration: 'none'
                      }}
                    >
                      <WhatsApp width={14} height={14} /> Enquire
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Terms & GST */}
        {activeTab === 'terms' && (
          <div style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '30px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}>
            <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '16px', color: '#0f172a' }}>
              Terms, Taxes & Transportation Charges
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              {rateData.terms.map((term, i) => (
                <div key={i} style={{
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'flex-start',
                  background: '#f8fafc',
                  padding: '16px 20px',
                  borderRadius: '10px',
                  borderLeft: '4px solid #f97316'
                }}>
                  <span style={{ color: '#f97316', fontWeight: 'bold', fontSize: '18px' }}>✓</span>
                  <p style={{ margin: 0, fontSize: '14px', color: '#334155', lineHeight: '1.6' }}>{term}</p>
                </div>
              ))}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '20px',
              padding: '20px',
              background: '#f1f5f9',
              borderRadius: '12px'
            }}>
              <div>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>GST on Apparel Items</span>
                <h4 style={{ fontSize: '18px', fontWeight: '800', margin: '4px 0 0', color: '#0f172a' }}>5% GST</h4>
                <small style={{ color: '#64748b' }}>Applicable on jerseys, lowers, shorts, caps, hoodies, tracksuits</small>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>GST on Kit Bags</span>
                <h4 style={{ fontSize: '18px', fontWeight: '800', margin: '4px 0 0', color: '#0f172a' }}>18% GST</h4>
                <small style={{ color: '#64748b' }}>Applicable on heavy-duty team wheelie kit bags</small>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Transportation</span>
                <h4 style={{ fontSize: '18px', fontWeight: '800', margin: '4px 0 0', color: '#0f172a' }}>Location-Based</h4>
                <small style={{ color: '#64748b' }}>Actual freight charges via trusted road cargo / courier</small>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
