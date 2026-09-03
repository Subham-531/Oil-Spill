import React, { useState } from 'react'
import { Check, ShieldCheck } from 'lucide-react'
import MetalPanel from '../primitives/MetalPanel'

/**
 * UseCasesSection — Section 7.6
 * Tabbed interface: Coast Guard, Insurers, Port Authority, Research.
 * 3 bullet rows with lucide Check icons + one engraved quote line. No stock photos.
 */
export default function UseCasesSection() {
  const [activeTab, setActiveTab] = useState('coast-guard')

  const tabs = [
    {
      id: 'coast-guard',
      label: 'Coast Guard',
      quote: '"We cut incident attribution time from three days of manual plotting to 90 seconds of verifiable math."',
      author: '— Maritime Operations Directorate, Coastal Command',
      bullets: [
        'Immediate interdiction dispatch based on back-cast discharge coordinates and timestamped suspect vectors.',
        'High-confidence vessel filtering eliminates false positives from anchored ships or innocent passersby.',
        'Court-ready forensic export packages admissible under international maritime pollution tribunals (MARPOL Annex I).',
      ],
    },
    {
      id: 'insurers',
      label: 'Marine Insurers',
      quote: '"Subrogation recovery claims succeed or fail on indisputable physical back-casting. This gives us the proof."',
      author: '— Head of Marine Claims & Environmental Liability, P&I Club',
      bullets: [
        'Definitive attribution of bunker discharge liability to the offending vessel P&I policy.',
        'Deterministic hindcast trajectory verifying whether slick was active prior to entering insured navigational waters.',
        'Complete spatial-temporal audit log for reinsurance risk underwriting and claim dispute defense.',
      ],
    },
    {
      id: 'port-authority',
      label: 'Port Authorities',
      quote: '"Harbor approaches and tanker anchorages require zero-tolerance enforcement against night-time bilge cleaning."',
      author: '— Chief Harbor Master, Major Energy Terminal',
      bullets: [
        'Automated surveillance of vessel departure corridors and offshore lightering operations.',
        'Rapid correlation of radar anomalies against mandatory port reporting and transponder logs.',
        'Integration with terminal dispatch systems to detain suspect hulls prior to international water transit.',
      ],
    },
    {
      id: 'research',
      label: 'Marine Research',
      quote: '"Understanding cumulative petroleum transport dynamics requires coupling real SAR detections with Lagrangian drift physics."',
      author: '— Ocean Modeling Group, Marine Environmental Institute',
      bullets: [
        'Longitudinal ecological impact assessment over marine protected reserves and coral reef corridors.',
        'Validation of Lagrangian particle drift parameters against high-resolution CMEMS hydrodynamic outputs.',
        'Open analytical schema for publishing peer-reviewed oceanographic forensics and environmental studies.',
      ],
    },
  ]

  const currentTab = tabs.find((t) => t.id === activeTab) || tabs[0]

  return (
    <section
      style={{
        padding: '96px 24px',
        borderBottom: '1px solid var(--line)',
        background: 'linear-gradient(180deg, #1D1A16 0%, #131110 100%)',
      }}
    >
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--fg-dim)',
              marginBottom: '12px',
            }}
          >
            MISSION PROFILES
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '40px',
              fontWeight: 700,
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              color: 'var(--fg)',
            }}
          >
            Calibrated for High-Stakes Operations
          </h2>
        </div>

        {/* Tab Selector Buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '32px',
            flexWrap: 'wrap',
          }}
        >
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '14px',
                  fontWeight: 600,
                  letterSpacing: '0.10em',
                  textTransform: 'uppercase',
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-control)',
                  border: '1px solid',
                  borderColor: isActive ? '#8A5C05' : 'var(--line)',
                  background: isActive
                    ? 'linear-gradient(180deg, #F5B23C 0%, #E0900C 55%, #C87F0A 100%)'
                    : 'linear-gradient(180deg, #26221C 0%, #1D1A16 100%)',
                  color: isActive ? 'var(--ink-text)' : 'var(--fg)',
                  boxShadow: isActive
                    ? 'inset 0 1px 0 rgba(255, 255, 255, 0.35), 0 4px 10px rgba(0, 0, 0, 0.45)'
                    : 'none',
                  cursor: 'pointer',
                  transition: 'all 120ms ease',
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Active Tab Panel */}
        <MetalPanel
          title={`OPERATIONAL PROFILE // ${currentTab.label.toUpperCase()}`}
          headerRight={<ShieldCheck size={18} color="#7CB342" />}
        >
          {/* Bullets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
            {currentTab.bullets.map((bullet, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '4px',
                    background: 'rgba(124, 179, 66, 0.15)',
                    border: '1px solid #7CB342',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  <Check size={13} color="#7CB342" strokeWidth={3} />
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '15px',
                    color: 'var(--fg)',
                    lineHeight: 1.5,
                  }}
                >
                  {bullet}
                </span>
              </div>
            ))}
          </div>

          {/* Engraved Quote Line */}
          <div
            style={{
              padding: '16px 20px',
              background: '#131110',
              borderRadius: '6px',
              border: '1px solid var(--line)',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                fontStyle: 'italic',
                color: 'var(--fg-dim)',
                marginBottom: '6px',
              }}
            >
              {currentTab.quote}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--fg-mute)',
                letterSpacing: '0.04em',
              }}
            >
              {currentTab.author}
            </div>
          </div>
        </MetalPanel>
      </div>
    </section>
  )
}
