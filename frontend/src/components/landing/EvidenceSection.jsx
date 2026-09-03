import React from 'react'
import { FileDown, FileCheck, Hash, Shield, Clock, MapPin } from 'lucide-react'
import PaperTape from '../primitives/PaperTape'
import Stamp from '../primitives/Stamp'
import BtnCap from '../primitives/BtnCap'

/**
 * EvidenceSection — Section 7.7
 * Split: left technical copy + bullet list; right .paper-tape report mock with
 * COMPLETE stamp and Export Evidence (PDF) alarm button.
 */
export default function EvidenceSection({ onExportEvidence }) {
  const bullets = [
    {
      icon: Clock,
      title: 'Timestamped SAR Detection',
      desc: 'Exact satellite pass timestamp paired with segmented polygon geometry and confidence metrics.',
    },
    {
      icon: MapPin,
      title: 'Lagrangian Drift Back-Cast',
      desc: 'Physics-based hindcast reconstruction powered by CMEMS hydrodynamic flow and ERA5 wind vectors.',
    },
    {
      icon: Shield,
      title: 'Attribution Scoring Matrix',
      desc: 'Explainable decomposition of spatial proximity, temporal intersection, and vessel risk profile.',
    },
    {
      icon: Hash,
      title: 'Cryptographic SHA-256 Seal',
      desc: 'Immutable digital fingerprint securing every artifact against tampering for maritime legal proceedings.',
    },
  ]

  return (
    <section
      id="evidence"
      style={{
        padding: '96px 24px',
        borderBottom: '1px solid var(--line)',
        background: 'var(--ink-950)',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '64px',
          alignItems: 'center',
        }}
        className="evidence-grid"
      >
        {/* Left Column: Forensic Proof Documentation */}
        <div>
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
            LEGAL EVIDENCE PACKAGING
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '40px',
              fontWeight: 700,
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              color: 'var(--fg)',
              marginBottom: '16px',
            }}
          >
            Signed, timestamped, court-ready.
          </h2>

          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '16px',
              lineHeight: 1.6,
              color: 'var(--fg-dim)',
              marginBottom: '32px',
            }}
          >
            Every analysis run generates an audit-grade evidence dossier formatted for international
            maritime pollution tribunals. All intermediate calculations, satellite tiles, and drift
            coefficients are cryptographically bound to the resulting attribution verdict.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {bullets.map((b, idx) => {
              const Icon = b.icon
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-control)',
                      background: 'var(--ink-900)',
                      border: '1px solid var(--line)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  >
                    <Icon size={16} color="#F0A11B" />
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '16px',
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        color: 'var(--fg)',
                        marginBottom: '4px',
                      }}
                    >
                      {b.title}
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '13px',
                        color: 'var(--fg-dim)',
                        lineHeight: 1.5,
                      }}
                    >
                      {b.desc}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Column: Paper Tape Export Dossier Preview */}
        <div style={{ position: 'relative' }}>
          <PaperTape
            header="DOSSIER // MARPOL ANNEX I FORENSIC RECORD"
            style={{
              maxWidth: '460px',
              margin: '0 auto',
            }}
          >
            {/* Stamp & Dossier Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}
            >
              <span style={{ fontSize: '11px', color: '#6E6656', fontWeight: 600 }}>
                INCIDENT ID: 2024-01-S1A-099
              </span>
              <Stamp variant="complete" text="COMPLETE" />
            </div>

            {/* Incident Metadata */}
            <div style={{ fontSize: '11px', lineHeight: 1.8, marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #B7AC93' }}>
                <span>SAR ACQUISITION:</span>
                <span style={{ fontWeight: 600 }}>2024-01-15 06:00:00 UTC</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #B7AC93' }}>
                <span>SLICK CENTROID:</span>
                <span style={{ fontWeight: 600 }}>19.4974° N, 72.5443° E</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #B7AC93' }}>
                <span>EST. DISCHARGE:</span>
                <span style={{ fontWeight: 600 }}>2024-01-14 23:30:00 UTC</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #B7AC93' }}>
                <span>SURFACE AREA:</span>
                <span style={{ fontWeight: 600 }}>8.48 KM² (848 HECTARES)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>U-NET CONFIDENCE:</span>
                <span style={{ fontWeight: 600 }}>88.4% (F1 = 0.91)</span>
              </div>
            </div>

            {/* Prime Suspect Details */}
            <div
              style={{
                padding: '12px',
                background: '#E2D7C3',
                borderRadius: '4px',
                marginBottom: '16px',
                border: '1px solid #C9BFA9',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '6px',
                }}
              >
                <span style={{ fontSize: '10px', fontWeight: 600, color: '#C9452F' }}>
                  RANK 01 // PRIME SUSPECT
                </span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#C9452F' }}>
                  SCORE: 94/100
                </span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700 }}>
                STEALTH VOYAGER
              </div>
              <div style={{ fontSize: '10px', color: '#6E6656' }}>
                MMSI: 419001234 · TANKER · SPEED: 11.4 KTS · HEADING: 198°
              </div>
            </div>

            {/* Cryptographic Hash */}
            <div
              style={{
                fontSize: '9px',
                color: '#6E6656',
                fontFamily: 'var(--font-mono)',
                wordBreak: 'break-all',
                marginBottom: '20px',
                padding: '8px',
                background: '#DFD4BE',
                borderRadius: '4px',
              }}
            >
              SHA-256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
            </div>

            {/* PDF Export Button (Alarm Variant per Spec) */}
            <BtnCap
              variant="alarm"
              icon={FileDown}
              onClick={onExportEvidence}
              style={{ width: '100%' }}
              id="landing-export-evidence-cta"
            >
              Export Evidence (PDF)
            </BtnCap>
          </PaperTape>
        </div>
      </div>
    </section>
  )
}
