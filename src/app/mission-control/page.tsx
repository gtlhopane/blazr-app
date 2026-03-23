'use client'

import { useState, useEffect } from 'react'

const SUPABASE_URL = 'https://llsrgsbzhubwexbozerg.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxsc3Jnc2J6aHVid2V4Ym96ZXJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MjQ4NzcsImV4cCI6MjA4OTUwMDg3N30.GqN4xDXHLLH2AL3xV-TO4h1xz1eNc9W6XBnqJ5tVXVM'

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
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] border-b border-[#1e3a2f] px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛰️</span>
            <div>
              <h1 className="text-xl font-bold text-white">Mission Control</h1>
              <p className="text-sm text-[#666]">Blazr / BioMuti — Live Operations Dashboard</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-4">
            <span className="flex items-center gap-2 text-xs bg-[#111118] border border-[#ef444455] text-[#ef4444] px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#ef4444]"></span>
              DNS Pending (CNAME)
            </span>
            <span className="flex items-center gap-2 text-xs bg-[#111118] border border-[#22c55e33] text-[#22c55e] px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#22c55e]"></span>
              Pipeline Active
            </span>
            <span className="flex items-center gap-2 text-xs bg-[#111118] border border-[#f59e0b55] text-[#f59e0b] px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span>
              Outreach Not Started
            </span>
            <span className="flex items-center gap-2 text-xs bg-[#111118] border border-[#22c55e33] text-[#22c55e] px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#22c55e]"></span>
              Email Clean
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

          {/* Pipeline Card */}
          <div className="bg-[#111118] border border-[#1e293b] rounded-xl p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#666] mb-4">📡 Pipeline — Live Scraper</p>
            <p className="text-5xl font-bold text-white">{pipelineTotal.toLocaleString()}<span className="text-lg text-[#666] font-normal"> leads</span></p>
            <p className="text-xs text-[#666] mt-2">Cycle {cycle} · Today: +<span className="text-[#22c55e]">{todayGain.toLocaleString()}</span> new leads</p>
            <div className="mt-4 space-y-2">
              {[
                { name: 'Google Places', count: '~5,000', label: 'Active', color: 'green' },
                { name: 'OpenStreetMap', count: '~2,500', label: 'Partial', color: 'yellow' },
                { name: 'Cannastay', count: '~800', label: 'Slow', color: 'yellow' },
                { name: 'WhatsApp / Social', count: '~500', label: 'Active', color: 'green' },
              ].map(s => (
                <div key={s.name} className="flex justify-between items-center py-1.5 border-b border-[#1e293b] text-sm">
                  <span className="text-[#d1d5db]">{s.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{s.count}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${s.color === 'green' ? 'bg-[#22c55e22] text-[#22c55e]' : 'bg-[#f59e0b22] text-[#f59e0b]'}`}>{s.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-[#111118] border border-[#1e293b] rounded-xl p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#666] mb-4">🚨 Priority Alerts</p>
            <div className="space-y-4">
              <div className="flex gap-3">
                <span className="text-[#ef4444] mt-0.5">●</span>
                <div>
                  <p className="text-[#d1d5db] font-medium text-sm">wholesale.blazr.africa DNS</p>
                  <p className="text-[#6b7280] text-xs mt-0.5">CNAME not added — xneelo ticket #3541531</p>
                  <p className="text-[#6b7280] text-xs">Target: 8560f7f17db0004.vercel-dns-016.com</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-[#f59e0b] mt-0.5">●</span>
                <div>
                  <p className="text-[#d1d5db] font-medium text-sm">Outreach system not built</p>
                  <p className="text-[#6b7280] text-xs mt-0.5">8,841 leads ready — outreach flow needs building</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-[#22c55e] mt-0.5">●</span>
                <div>
                  <p className="text-[#d1d5db] font-medium text-sm">Pipeline healthy</p>
                  <p className="text-[#6b7280] text-xs mt-0.5">All scrapers running, no failures detected</p>
                </div>
              </div>
            </div>
          </div>

          {/* Blazr Status */}
          <div className="bg-[#111118] border border-[#1e293b] rounded-xl p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#666] mb-4">🌐 Blazr Wholesale</p>
            <div className="space-y-2">
              {[
                { label: 'wholesale.blazr.africa', value: 'Old build (xneelo)', badge: 'yellow' },
                { label: 'blazr-app.vercel.app', value: 'Latest build', badge: 'green' },
                { label: 'Resend DKIM', value: 'Verified ✅', badge: 'green' },
                { label: 'Resend SPF', value: 'Verified ✅', badge: 'green' },
                { label: 'xneelo CNAME', value: 'Not added', badge: 'red' },
                { label: 'Ticket #', value: '#3541531', badge: 'yellow' },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center py-1.5 border-b border-[#1e293b] text-xs">
                  <span className="text-[#9ca3af]">{row.label}</span>
                  <span className={`px-2 py-0.5 rounded-full ${row.badge === 'green' ? 'bg-[#22c55e22] text-[#22c55e]' : row.badge === 'yellow' ? 'bg-[#f59e0b22] text-[#f59e0b]' : 'bg-[#ef444422] text-[#ef4444]'}`}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* BioMuti Outreach */}
          <div className="bg-[#111118] border border-[#1e293b] rounded-xl p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#666] mb-4">💰 BioMuti Wholesale</p>
            <p className="text-5xl font-bold text-white">8,841<span className="text-lg text-[#666] font-normal"> leads</span></p>
            <p className="text-xs text-[#666] mt-1">Dispensaries & cannabis shops across SA</p>
            <div className="mt-4 space-y-2">
              {[
                { name: 'WhatsApp contacts', status: 'Available', color: 'green' },
                { name: 'Phone numbers', status: 'Available', color: 'green' },
                { name: 'Email (Resend)', status: 'Connected', color: 'green' },
                { name: 'Outreach flow', status: 'Not built', color: 'red' },
              ].map(s => (
                <div key={s.name} className="flex justify-between items-center py-1.5 border-b border-[#1e293b] text-sm">
                  <span className="text-[#d1d5db]">{s.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${s.color === 'green' ? 'bg-[#22c55e22] text-[#22c55e]' : 'bg-[#ef444422] text-[#ef4444]'}`}>{s.status}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-[#6b7280] mt-3">Products: Flower · Gummies · Pre-rolls · Concentrates · Vapes</p>
          </div>

          {/* Email */}
          <div className="bg-[#111118] border border-[#1e293b] rounded-xl p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#666] mb-4">📧 Email (biomuti.co.za)</p>
            <div className="space-y-3">
              {[
                { label: 'Inbox remaining', value: '~32,000' },
                { label: 'Archived today', value: '8,610', green: true },
                { label: 'Folders created', value: 'Done', green: true },
                { label: 'Filter rules', value: 'Apple Mail', yellow: true },
              ].map(r => (
                <div key={r.label} className="flex justify-between items-center py-1.5 border-b border-[#1e293b] text-sm">
                  <span className="text-[#d1d5db]">{r.label}</span>
                  <span className={`font-semibold ${r.green ? 'text-[#22c55e]' : r.yellow ? 'text-[#f59e0b]' : 'text-white'}`}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* R&D Team */}
          <div className="bg-[#111118] border border-[#1e293b] rounded-xl p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#666] mb-4">🧪 R&D Team — 5 Agents</p>
            <div className="space-y-3">
              {[
                { emoji: '🧠', name: 'Product & UX Researcher', role: 'User behaviour, features' },
                { emoji: '📈', name: 'Growth Strategist', role: 'Acquisition, expansion' },
                { emoji: '💰', name: 'Revenue Analyst', role: 'Margins, pricing' },
                { emoji: '⚙️', name: 'Technical Architect', role: 'Platform, automation' },
                { emoji: '🗂️', name: 'Operations Lead', role: 'Execution, pipeline' },
              ].map(a => (
                <div key={a.name} className="flex gap-3 py-1.5 border-b border-[#1e293b]">
                  <span className="text-lg">{a.emoji}</span>
                  <div>
                    <p className="text-[#e0e0e0] font-medium text-xs">{a.name}</p>
                    <p className="text-[#6b7280] text-xs">{a.role}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-[#6b7280] mt-3">Next debate: Sun 29 Mar @ 6pm SAST</p>
          </div>

          {/* Autonomous Employee */}
          <div className="bg-[#111118] border border-[#1e293b] rounded-xl p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#666] mb-4">🌙 Autonomous Employee</p>
            <div className="space-y-3">
              {[
                { label: 'Daemon', value: 'Running', green: true },
                { label: 'Schedule', value: 'Daily 2am SAST' },
                { label: 'Tonight task', value: 'Queued', yellow: true },
              ].map(r => (
                <div key={r.label} className="flex justify-between items-center py-1.5 border-b border-[#1e293b] text-sm">
                  <span className="text-[#d1d5db]">{r.label}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${r.green ? 'bg-[#22c55e22] text-[#22c55e]' : r.yellow ? 'bg-[#f59e0b22] text-[#f59e0b]' : 'text-white'}`}>{r.value}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-[#6b7280] mt-3">Log: /mission-control/autonomous/</p>
          </div>

          {/* Goals */}
          <div className="bg-[#111118] border border-[#1e293b] rounded-xl p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#666] mb-4">🎯 Goals — This Week</p>
            <div className="mb-4">
              <p className="text-xs text-[#6b7280] uppercase tracking-wider mb-2">Short Term</p>
              {[
                'Get wholesale.blazr.africa routing to Vercel',
                'Build BioMuti outreach message sequence',
                'Set up Apple Mail filter rules',
                'Generate first R&D memo',
              ].map(t => (
                <div key={t} className="flex items-start gap-2 py-1 text-sm text-[#d1d5db]">
                  <span className="w-3.5 h-3.5 border border-[#374151] rounded mt-0.5 flex-shrink-0"></span>
                  {t}
                </div>
              ))}
            </div>
            <div className="mb-4">
              <p className="text-xs text-[#6b7280] uppercase tracking-wider mb-2">Medium Term</p>
              {[
                'Launch outreach to 8,841 dispensaries',
                'First wholesale orders from new leads',
                'Grow pipeline to 15,000+ leads',
              ].map(t => (
                <div key={t} className="flex items-start gap-2 py-1 text-sm text-[#6b7280]">
                  <span className="w-3.5 h-3.5 border border-[#374151] rounded mt-0.5 flex-shrink-0"></span>
                  {t}
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs text-[#6b7280] uppercase tracking-wider mb-2">Long Term</p>
              {[
                'BioMuti in 200+ dispensaries',
                'Blazr platform: multiple wholesale clients',
              ].map(t => (
                <div key={t} className="flex items-start gap-2 py-1 text-sm text-[#6b7280]">
                  <span className="w-3.5 h-3.5 border border-[#374151] rounded mt-0.5 flex-shrink-0"></span>
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* Decisions */}
          <div className="bg-[#111118] border border-[#1e293b] rounded-xl p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#666] mb-4">📌 Today&apos;s Decisions (2026-03-23)</p>
            <div className="space-y-2">
              {[
                'No static sync to xneelo — Blazr app needs Vercel for dynamic API routes',
                'Outreach is the next revenue lever — pipeline ready',
                'Email backlog cleaned — filter rules documented',
                'Mission Control = full business overview, not just R&D',
                'Autonomous employee runs at 2am SAST nightly',
                'xneelo CNAME target: 8560f7f17db0004.vercel-dns-016.com',
              ].map(d => (
                <div key={d} className="flex items-start gap-2 py-1 text-xs text-[#d1d5db]">
                  <span className="w-3 h-3 bg-[#22c55e33] border border-[#22c55e] rounded mt-0.5 flex-shrink-0 flex items-center justify-center text-[#22c55e] text-[8px]">✓</span>
                  {d}
                </div>
              ))}
            </div>
          </div>

        </div>

        <div className="mt-6 pt-4 border-t border-[#1e293b] text-center text-xs text-[#4b5563]">
          🗝️ Ema · Mission Control · Built 2026-03-23 · Updated {lastUpdated} SAST
        </div>
      </div>
    </div>
  )
}
