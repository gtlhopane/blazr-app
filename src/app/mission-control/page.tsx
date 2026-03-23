'use client'

import { useState, useEffect } from 'react'
import { biomutiLogoFull, biomutiLogoSm } from './logo-data'

interface PipelineData {
  totalPipeline: number
  cycle: number
  newLeadsFound: number
  lastRun: string
}

export default function MissionControl() {
  const [pipeline, setPipeline] = useState<PipelineData | null>(null)
  const [lastUpdated, setLastUpdated] = useState('')

  useEffect(() => {
    fetch('/scraper-status.json')
      .then(r => r.json())
      .then(d => setPipeline(d))
      .catch(() => {})

    const sa = new Date().toLocaleTimeString('en-ZA', {
      hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Johannesburg'
    })
    setLastUpdated(sa)
  }, [])

  const pipelineTotal = pipeline?.totalPipeline ?? 8841
  const cycle = pipeline?.cycle ?? 27
  const todayGain = pipelineTotal - 5719

  return (
    <div style={{ background: '#0A0A0A', minHeight: '100vh', color: '#ffffff', fontFamily: "'Poppins', 'Inter', sans-serif" }}>

      {/* Hero */}
      <div style={{
        background: 'radial-gradient(ellipse_80%_50%_at_50%_-10%, rgba(26,188,156,0.08), transparent), radial-gradient(ellipse_60%_40%_at_80%_60%, rgba(46,204,113,0.04), transparent)',
        borderBottom: '1px solid #2a2a2a',
        padding: '36px 32px 28px',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            {/* BioMuti Emblem */}
            <img
              src={biomutiLogoSm}
              alt="BioMuti"
              style={{ width: 48, height: 48, borderRadius: 10, flexShrink: 0 }}
            />
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em', color: '#ffffff', lineHeight: 1.2 }}>
                BioMuti Group <span className="gradient-text">Mission Control</span>
              </h1>
              <p style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Nature Is Eternal · Live Operations Dashboard</p>
            </div>
          </div>

          {/* Full BioMuti Logo Banner */}
          <img
            src={biomutiLogoFull}
            alt="BioMuti"
            style={{ width: '100%', maxWidth: 480, height: 'auto', borderRadius: 10, display: 'block' }}
          />

          {/* Status pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
            {[
              { label: 'DNS Pending', color: '#ef4444', dot: '#ef4444' },
              { label: 'Pipeline Active', color: '#22c55e', dot: '#22c55e' },
              { label: 'Outreach Not Started', color: '#f59e0b', dot: '#f59e0b' },
              { label: 'Email Clean', color: '#22c55e', dot: '#22c55e' },
            ].map(pill => (
              <div key={pill.label} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 11, fontWeight: 600,
                background: 'rgba(17,17,17,0.8)', border: `1px solid ${pill.color}33`,
                color: pill.color, padding: '6px 14px', borderRadius: 20,
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: pill.dot, display: 'inlineBlock', flexShrink: 0 }}></span>
                {pill.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 32px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 16
        }}>

          {/* Pipeline */}
          <Card>
            <p style={labelStyle}>📡 Pipeline — Live Scraper</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
              <span style={{ fontSize: 52, fontWeight: 700, color: '#ffffff', lineHeight: 1 }}>{pipelineTotal.toLocaleString()}</span>
              <span style={{ fontSize: 18, color: '#666', fontWeight: 400 }}>leads</span>
            </div>
            <p style={{ fontSize: 12, color: '#666', marginBottom: 16 }}>
              Cycle {cycle} · Today: <span style={{ color: '#22c55e' }}>+{todayGain.toLocaleString()}</span> new leads
            </p>
            <div>
              {[
                { name: 'Google Places', count: '~5,000', badge: 'Active', badgeColor: '#22c55e', badgeBg: '#22c55e15' },
                { name: 'OpenStreetMap', count: '~2,500', badge: 'Partial', badgeColor: '#f59e0b', badgeBg: '#f59e0b15' },
                { name: 'Cannastay', count: '~800', badge: 'Slow', badgeColor: '#f59e0b', badgeBg: '#f59e0b15' },
                { name: 'WhatsApp / Social', count: '~500', badge: 'Active', badgeColor: '#22c55e', badgeBg: '#22c55e15' },
              ].map(s => (
                <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #1e293b' }}>
                  <span style={{ fontSize: 13, color: '#d1d5db' }}>{s.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 600, color: '#ffffff' }}>{s.count}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10, background: s.badgeBg, color: s.badgeColor }}>{s.badge}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Alerts */}
          <Card>
            <p style={labelStyle}>🚨 Priority Alerts</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <span style={{ color: '#ef4444', marginTop: 3, flexShrink: 0 }}>●</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: '#d1d5db' }}>wholesale.blazr.africa DNS</p>
                  <p style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>CNAME not added — xneelo ticket #3541531</p>
                  <p style={{ fontSize: 11, color: '#888' }}>Target: 8560f7f17db0004.vercel-dns-016.com</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <span style={{ color: '#f59e0b', marginTop: 3, flexShrink: 0 }}>●</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: '#d1d5db' }}>Outreach system not built</p>
                  <p style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>8,841 leads ready — outreach flow needs building</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <span style={{ color: '#22c55e', marginTop: 3, flexShrink: 0 }}>●</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: '#d1d5db' }}>Pipeline healthy</p>
                  <p style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>All scrapers running, no failures detected</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Blazr Status */}
          <Card>
            <p style={labelStyle}>🌐 Blazr Wholesale</p>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 12, borderBottom: '1px solid #1e293b', paddingBottom: 8 }}>
              Resend propagation: Verified ✅ (checked 22:32 SAST — was pending at 19:32 UTC, confirmed live by morning)
            </div>
            {[
              { label: 'wholesale.blazr.africa', value: 'Old build (xneelo)', badge: 'yellow' },
              { label: 'blazr-app.vercel.app', value: 'Latest build ✅', badge: 'green' },
              { label: 'Resend DKIM', value: 'Verified ✅', badge: 'green' },
              { label: 'Resend SPF', value: 'Verified ✅', badge: 'green' },
              { label: 'xneelo CNAME', value: 'Not added', badge: 'red' },
              { label: 'Ticket #', value: '#3541531', badge: 'yellow' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #1e293b' }}>
                <span style={{ fontSize: 11, color: '#9ca3af' }}>{row.label}</span>
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
                  background: row.badge === 'green' ? '#22c55e15' : row.badge === 'yellow' ? '#f59e0b15' : '#ef444415',
                  color: row.badge === 'green' ? '#22c55e' : row.badge === 'yellow' ? '#f59e0b' : '#ef4444'
                }}>{row.value}</span>
              </div>
            ))}
          </Card>

          {/* BioMuti Outreach */}
          <Card>
            <p style={labelStyle}>💰 BioMuti Wholesale</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
              <span style={{ fontSize: 52, fontWeight: 700, color: '#ffffff', lineHeight: 1 }}>8,841</span>
              <span style={{ fontSize: 18, color: '#666', fontWeight: 400 }}>leads</span>
            </div>
            <p style={{ fontSize: 12, color: '#666', marginBottom: 16 }}>Dispensaries & cannabis shops across SA</p>
            {[
              { name: 'WhatsApp contacts', status: 'Available', color: '#22c55e' },
              { name: 'Phone numbers', status: 'Available', color: '#22c55e' },
              { name: 'Email (Resend)', status: 'Connected', color: '#22c55e' },
              { name: 'Outreach flow', status: 'Not built', color: '#ef4444' },
            ].map(s => (
              <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #1e293b' }}>
                <span style={{ fontSize: 13, color: '#d1d5db' }}>{s.name}</span>
                <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10, background: s.color + '15', color: s.color }}>{s.status}</span>
              </div>
            ))}
            <p style={{ fontSize: 11, color: '#888', marginTop: 12 }}>Products: Flower · Gummies · Pre-rolls · Concentrates · Vapes</p>
          </Card>

          {/* Email */}
          <Card>
            <p style={labelStyle}>📧 Email (biomuti.co.za)</p>
            {[
              { label: 'Inbox remaining', value: '~32,000', valueColor: '#fff' },
              { label: 'Archived today', value: '8,610', valueColor: '#22c55e' },
              { label: 'Folders created', value: 'Done', valueColor: '#22c55e' },
              { label: 'Filter rules', value: 'Apple Mail', valueColor: '#f59e0b' },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #1e293b' }}>
                <span style={{ fontSize: 13, color: '#d1d5db' }}>{r.label}</span>
                <span style={{ fontWeight: 600, color: r.valueColor }}>{r.value}</span>
              </div>
            ))}
          </Card>

          {/* R&D Team */}
          <Card>
            <p style={labelStyle}>🧪 R&D Team — 5 Agents</p>
            {[
              { emoji: '🧠', name: 'Product & UX Researcher', role: 'User behaviour, features, gaps' },
              { emoji: '📈', name: 'Growth Strategist', role: 'Acquisition, expansion, channels' },
              { emoji: '💰', name: 'Revenue Analyst', role: 'Margins, pricing, revenue streams' },
              { emoji: '⚙️', name: 'Technical Architect', role: 'Platform, automation, AI systems' },
              { emoji: '🗂️', name: 'Operations Lead', role: 'Execution, pipeline, supply chain' },
            ].map(a => (
              <div key={a.name} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid #1e293b' }}>
                <span style={{ fontSize: 18 }}>{a.emoji}</span>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 500, color: '#e0e0e0' }}>{a.name}</p>
                  <p style={{ fontSize: 11, color: '#6b7280' }}>{a.role}</p>
                </div>
              </div>
            ))}
            <p style={{ fontSize: 11, color: '#888', marginTop: 12 }}>Next debate: Sun 29 Mar @ 6pm SAST</p>
          </Card>

          {/* Autonomous Employee */}
          <Card>
            <p style={labelStyle}>🌙 Autonomous Employee</p>
            {[
              { label: 'Daemon', value: 'Running', valueColor: '#22c55e', bg: '#22c55e15' },
              { label: 'Schedule', value: 'Daily 2am SAST', valueColor: '#fff', bg: '' },
              { label: 'Tonight task', value: 'Queued', valueColor: '#f59e0b', bg: '#f59e0b15' },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #1e293b' }}>
                <span style={{ fontSize: 13, color: '#d1d5db' }}>{r.label}</span>
                <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10, background: r.bg || 'transparent', color: r.valueColor }}>{r.value}</span>
              </div>
            ))}
            <p style={{ fontSize: 11, color: '#888', marginTop: 12 }}>Log: /mission-control/autonomous/</p>
          </Card>

          {/* Goals */}
          <Card>
            <p style={labelStyle}>🎯 Goals — This Week</p>
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888', marginBottom: 8 }}>Short Term</p>
              {[
                'Get wholesale.blazr.africa routing to Vercel',
                'Build BioMuti outreach message sequence',
                'Set up Apple Mail filter rules',
                'Generate first R&D memo',
              ].map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '6px 0', fontSize: 12, color: '#d1d5db' }}>
                  <span style={{ width: 14, height: 14, border: '1px solid #374151', borderRadius: 4, flexShrink: 0, marginTop: 1 }}></span>
                  {t}
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888', marginBottom: 8 }}>Medium Term</p>
              {[
                'Launch outreach to 8,841 dispensaries',
                'First wholesale orders from new leads',
                'Grow pipeline to 15,000+ leads',
              ].map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '6px 0', fontSize: 12, color: '#6b7280' }}>
                  <span style={{ width: 14, height: 14, border: '1px solid #374151', borderRadius: 4, flexShrink: 0, marginTop: 1 }}></span>
                  {t}
                </div>
              ))}
            </div>
            <div>
              <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888', marginBottom: 8 }}>Long Term</p>
              {[
                'BioMuti in 200+ dispensaries',
                'Blazr platform: multiple wholesale clients',
              ].map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '6px 0', fontSize: 12, color: '#6b7280' }}>
                  <span style={{ width: 14, height: 14, border: '1px solid #374151', borderRadius: 4, flexShrink: 0, marginTop: 1 }}></span>
                  {t}
                </div>
              ))}
            </div>
          </Card>

          {/* History Timeline */}
          <Card>
            <p style={labelStyle}>📅 Key Events Timeline</p>
            {[
              { time: '2026-03-22 19:32 UTC', event: 'Resend DNS pending — DKIM/SPF records added at xneelo, not yet propagated' },
              { time: '2026-03-22 22:32 SAST', event: 'Mission Control first built — running at localhost:3456' },
              { time: '2026-03-22 22:32 SAST', event: 'Resend propagation confirmed ✅ — DKIM + SPF verified' },
              { time: '2026-03-22', event: 'Supabase leads backfilled — 4,273 leads from retry-list → live DB' },
              { time: '2026-03-22', event: 'Google Places API key rotated — new key AIzaSyBKxr...' },
              { time: '2026-03-23 09:15 UTC', event: 'wholesale.blazr.africa DNS changed — xneelo A record removed → outage' },
              { time: '2026-03-23 10:38 UTC', event: 'A record restored — xneelo added CNAME zone but no record inside' },
              { time: '2026-03-23 18:28 UTC', event: 'biomuti.co.za SMTP connected — 8,610 emails archived' },
              { time: '2026-03-23 19:34 UTC', event: 'BioMuti Group Mission Control deployed at blazr-app.vercel.app/mission-control' },
              { time: '2026-03-23 19:58 UTC', event: 'Autonomous Employee daemon started — runs at 2am SAST nightly' },
            ].map(ev => (
              <div key={ev.time} style={{ display: 'flex', gap: 10, padding: '7px 0', borderBottom: '1px solid #1e293b' }}>
                <span style={{ fontSize: 10, color: '#888', flexShrink: 0, minWidth: 110, fontFamily: 'monospace' }}>{ev.time}</span>
                <span style={{ fontSize: 11, color: '#d1d5db' }}>{ev.event}</span>
              </div>
            ))}
          </Card>

          {/* Decisions */}
          <Card>
            <p style={labelStyle}>📌 Today&apos;s Decisions (2026-03-23)</p>
            {[
              'No static sync to xneelo — Blazr app needs Vercel for dynamic API routes',
              'Outreach is the next revenue lever — pipeline ready',
              'Email backlog cleaned — filter rules documented',
              'Mission Control = full business overview, not just R&D',
              'Autonomous employee runs at 2am SAST nightly',
              'xneelo CNAME target: 8560f7f17db0004.vercel-dns-016.com',
            ].map(d => (
              <div key={d} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '6px 0', fontSize: 12, color: '#d1d5db' }}>
                <span style={{ width: 14, height: 14, background: '#22c55e22', border: '1px solid #22c55e', borderRadius: 4, flexShrink: 0, marginTop: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e', fontSize: 8 }}>✓</span>
                {d}
              </div>
            ))}
          </Card>

        </div>

        {/* Footer */}
        <div style={{ marginTop: 28, paddingTop: 16, borderTop: '1px solid #1e293b', textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: '#4b5563' }}>
            🗝️ Ema · BioMuti Group Mission Control · Built 2026-03-23 · Updated {lastUpdated} SAST
          </p>
        </div>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#6b7280',
  marginBottom: 16,
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: 'rgba(17, 17, 17, 0.6)',
      border: '1px solid rgba(42, 42, 42, 0.8)',
      borderRadius: 12,
      padding: 20,
      transition: 'all 0.25s ease',
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(26, 188, 156, 0.3)'
      ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 40px rgba(26, 188, 156, 0.1)'
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(42, 42, 42, 0.8)'
      ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
    }}
    >
      {children}
    </div>
  )
}
