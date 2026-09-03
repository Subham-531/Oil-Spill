import React from 'react'
import { Terminal, ArrowRight, Crosshair, Ship } from 'lucide-react'
import BezelScreen from '../primitives/BezelScreen'
import BtnCap from '../primitives/BtnCap'
import Stamp from '../primitives/Stamp'

/**
 * ConsolePreviewSection — Section 7.4
 * Full-width bezel-screen framing console interface with engraved caption.
 */
export default function ConsolePreviewSection({ onOpenConsole }) {
  return (
    <section
      id="how-it-works"
      style={{
        padding: '96px 24px',
        borderBottom: '1px solid var(--line)',
        background: 'linear-gradient(180deg, #131110 0%, #1D1A16 100%)',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: '32px',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--fg-dim)',
                marginBottom: '8px',
              }}
            >
              OPERATIONAL INTERFACE
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '36px',
                fontWeight: 700,
                letterSpacing: '0.10em',
                textTransform: 'uppercase',
                color: 'var(--fg)',
              }}
            >
              Tactile Precision at Operational Scale
            </h2>
          </div>

          <BtnCap
            variant="primary"
            icon={ArrowRight}
            onClick={onOpenConsole}
            id="preview-open-console-cta"
          >
            Open the console
          </BtnCap>
        </div>

        {/* Bezel Screen Frame */}
        <BezelScreen
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '12px',
            border: '2px solid var(--line)',
            background: '#131110',
            padding: '24px',
            boxShadow: 'inset 0 4px 20px rgba(0, 0, 0, 0.9), 0 16px 40px rgba(0, 0, 0, 0.6)',
          }}
        >
          {/* Console Header Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '16px',
              borderBottom: '1px solid var(--line)',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--ok)',
                  boxShadow: '0 0 8px 1px var(--ok)',
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '15px',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--fg)',
                }}
              >
                LIVE CONSOLE — MUMBAI OFFSHORE, 14 JAN 2024
              </span>
            </div>

            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--fg-dim)',
              }}
            >
              LAT: 19.4974° N · LON: 72.5443° E · SATELLITE: SENTINEL-1A
            </div>
          </div>

          {/* Miniature Layout */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 340px',
              gap: '20px',
              minHeight: '380px',
            }}
            className="preview-inner-grid"
          >
            {/* Map Simulator with Reticle */}
            <div
              style={{
                position: 'relative',
                background: '#181512',
                borderRadius: '8px',
                border: '1px solid var(--line)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Map grid lines */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage:
                    'radial-gradient(circle, #3A342B 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                  opacity: 0.4,
                }}
              />

              {/* Coastal contour line sketch */}
              <svg viewBox="0 0 500 300" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                {/* Coastline */}
                <path
                  d="M 380,0 Q 360,90 390,180 T 430,300"
                  fill="none"
                  stroke="#3A342B"
                  strokeWidth="2"
                />
                <text x="400" y="80" fill="#6E6656" fontFamily="var(--font-mono)" fontSize="11">
                  MUMBAI SHORELINE
                </text>

                {/* Spill Polygon */}
                <path
                  d="M 210,140 Q 240,120 275,135 T 310,145 Q 295,165 260,160 T 210,140 Z"
                  fill="#131110"
                  stroke="#F0A11B"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />

                {/* Centroid Reticle */}
                <circle cx="260" cy="145" r="16" fill="none" stroke="#F0A11B" strokeWidth="1" />
                <line x1="240" y1="145" x2="280" y2="145" stroke="#F0A11B" strokeWidth="1" />
                <line x1="260" y1="125" x2="260" y2="165" stroke="#F0A11B" strokeWidth="1" />

                {/* Vessel Culprit Track */}
                <path
                  d="M 120,230 Q 190,190 250,150 T 320,110"
                  fill="none"
                  stroke="#C9452F"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                />
                <circle cx="250" cy="150" r="4" fill="#C9452F" />
                <text x="130" y="245" fill="#C9452F" fontFamily="var(--font-mono)" fontSize="11" fontWeight="600">
                  CULPRIT: STEALTH VOYAGER (MMSI 419001234)
                </text>
              </svg>

              {/* Verified Stamp Badge */}
              <div style={{ position: 'absolute', top: '16px', left: '16px' }}>
                <Stamp variant="detected" text="DETECTED · 8.48 KM²" />
              </div>
            </div>

            {/* Right Mini Console Panel */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {/* Verdict Summary */}
              <div
                style={{
                  background: 'linear-gradient(180deg, #26221C 0%, #1D1A16 100%)',
                  borderRadius: '8px',
                  border: '1px solid var(--line)',
                  padding: '16px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                  }}
                >
                  <span className="engraved-title">PRIMARY ATTRIBUTION</span>
                  <Stamp variant="prime-suspect" text="PRIME SUSPECT" />
                </div>

                <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--fg)' }}>
                  MT STEALTH VOYAGER
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--fg-dim)', marginBottom: '12px' }}>
                  CRUDE OIL TANKER · FLAG: PANAMA
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: '#131110',
                    borderRadius: '4px',
                    border: '1px solid var(--line)',
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--fg-dim)' }}>
                    SUSPICION SCORE
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 700, color: 'var(--alarm)' }}>
                    94 / 100
                  </span>
                </div>
              </div>

              {/* Data Rows */}
              <div
                style={{
                  background: 'var(--paper)',
                  color: 'var(--ink-text)',
                  borderRadius: '6px',
                  padding: '12px 16px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  lineHeight: 1.8,
                  border: '1px solid var(--paper-dim)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #B7AC93' }}>
                  <span>ORIGIN COORD:</span>
                  <span style={{ fontWeight: 600 }}>19.364°N, 72.539°E</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #B7AC93' }}>
                  <span>EST. DISCHARGE:</span>
                  <span style={{ fontWeight: 600 }}>14 JAN 2024 23:30Z</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>CONFIDENCE:</span>
                  <span style={{ fontWeight: 600, color: '#8A5C05' }}>88% MATCH</span>
                </div>
              </div>
            </div>
          </div>
        </BezelScreen>
      </div>
    </section>
  )
}
