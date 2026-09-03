import React from 'react'
import { GitBranch, Globe, Mail, Radar } from 'lucide-react'

/**
 * LandingFooter — Section 7.9
 * Three columns (Product, Data sources, Contact), mono legal line,
 * lucide icons, hairline top.
 */
export default function LandingFooter({ onOpenConsole }) {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--line)',
        background: '#131110',
        padding: '64px 24px 32px 24px',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Three Columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr',
            gap: '48px',
            marginBottom: '48px',
          }}
          className="footer-grid"
        >
          {/* Col 1: Brand & Mission */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Radar size={22} color="#F0A11B" />
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '20px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  color: 'var(--fg)',
                }}
              >
                SWACHH TRACK
              </span>
            </div>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                lineHeight: 1.6,
                color: 'var(--fg-dim)',
                maxWidth: '38ch',
              }}
            >
              Precision geospatial forensics console for autonomous satellite oil spill detection,
              Lagrangian ocean drift reconstruction, and vessel attribution.
            </p>
          </div>

          {/* Col 2: Product */}
          <div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--fg)',
                marginBottom: '16px',
              }}
            >
              Product
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <button
                  onClick={onOpenConsole}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontFamily: 'var(--font-body)',
                    fontSize: '14px',
                    color: 'var(--fg-dim)',
                    cursor: 'pointer',
                  }}
                >
                  Live Forensics Console
                </button>
              </li>
              <li>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--fg-dim)' }}>
                  PyTorch U-Net Model
                </span>
              </li>
              <li>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--fg-dim)' }}>
                  OpenDrift Lagrangian Engine
                </span>
              </li>
              <li>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--fg-dim)' }}>
                  Evidence Dossier Generator
                </span>
              </li>
            </ul>
          </div>

          {/* Col 3: Data Sources */}
          <div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--fg)',
                marginBottom: '16px',
              }}
            >
              Data Sources
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--fg-dim)' }}>
                Copernicus Sentinel-1 SAR
              </li>
              <li style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--fg-dim)' }}>
                CMEMS Hydrodynamic Currents
              </li>
              <li style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--fg-dim)' }}>
                ECMWF ERA5 Atmospheric Winds
              </li>
              <li style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--fg-dim)' }}>
                Global AIS Terrestrial &amp; Satellite
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Social */}
          <div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--fg)',
                marginBottom: '16px',
              }}
            >
              System Access
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--fg-dim)',
                  textDecoration: 'none',
                  fontSize: '14px',
                }}
              >
                <GitBranch size={16} color="#A89F8C" />
                Repository
              </a>

              <a
                href="#how-it-works"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--fg-dim)',
                  textDecoration: 'none',
                  fontSize: '14px',
                }}
              >
                <Globe size={16} color="#A89F8C" />
                Documentation
              </a>

              <a
                href="mailto:contact@swachhtrack.maritime"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--fg-dim)',
                  textDecoration: 'none',
                  fontSize: '14px',
                }}
              >
                <Mail size={16} color="#A89F8C" />
                Ops Dispatch
              </a>
            </div>
          </div>
        </div>

        {/* Hairline + Verbatim Legal Copy */}
        <div
          style={{
            borderTop: '1px solid var(--line)',
            paddingTop: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--fg-mute)',
              letterSpacing: '0.04em',
            }}
          >
            SWACHH TRACK — SAR imagery: Copernicus Sentinel-1. Ocean model: CMEMS. Vessel data: AIS archive.
          </div>

          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--fg-mute)',
            }}
          >
            PRECISION ANALOG MARITIME INSTRUMENTATION SYSTEM
          </div>
        </div>
      </div>
    </footer>
  )
}
