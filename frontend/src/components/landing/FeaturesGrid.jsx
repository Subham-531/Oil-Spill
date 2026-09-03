import React from 'react'
import { Gauge, Route, Ship, FileDown, MapPin, Timer } from 'lucide-react'
import SpotlightCard from '../reactbits/SpotlightCard'

/**
 * FeaturesGrid — Section 7.5
 * 6 SpotlightCards (2x3): Real Inference, Physics Simulation, AIS Attribution,
 * Evidence Export, Regional Coverage, Sub-Minute Runs.
 */
export default function FeaturesGrid() {
  const features = [
    {
      icon: Gauge,
      title: 'Real Inference',
      desc: 'PyTorch U-Net architecture fine-tuned on Sentinel-1 SAR imagery with 0.91 F1-score for dark backscatter segmentation.',
    },
    {
      icon: Route,
      title: 'Physics Simulation',
      desc: 'Lagrangian backward drift modeling powered by OpenDrift, CMEMS ocean currents, and ERA5 surface winds.',
    },
    {
      icon: Ship,
      title: 'AIS Attribution',
      desc: 'DuckDB-accelerated spatial queries indexing 7.28M vessel positions to establish court-admissible ship paths.',
    },
    {
      icon: FileDown,
      title: 'Evidence Export',
      desc: 'Official forensic PDF dossier generator with cryptographic SHA-256 tamper-proof timestamps and coordinates.',
    },
    {
      icon: MapPin,
      title: 'Regional Coverage',
      desc: 'Seamless pan-oceanic coverage calibrated for major tanker transit corridors and sensitive marine EEZs.',
    },
    {
      icon: Timer,
      title: 'Sub-Minute Runs',
      desc: 'Fully optimized end-to-end pipeline execution delivering attribution verdict in under 90 seconds.',
    },
  ]

  return (
    <section
      style={{
        padding: '96px 24px',
        borderBottom: '1px solid var(--line)',
        background: 'var(--ink-950)',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
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
            PRECISION CAPABILITIES
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
            Built for Forensics, Not Estimates
          </h2>
        </div>

        {/* 2x3 Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
          }}
          className="features-grid-layout"
        >
          {features.map((feat, idx) => {
            const Icon = feat.icon
            return (
              <SpotlightCard key={idx}>
                {/* Amber Icon Chip */}
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-control)',
                    background: 'rgba(240, 161, 27, 0.1)',
                    border: '1px solid #8A5C05',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px',
                  }}
                >
                  <Icon size={20} color="#F0A11B" strokeWidth={2.2} />
                </div>

                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '22px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--fg)',
                    marginBottom: '8px',
                  }}
                >
                  {feat.title}
                </h3>

                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '14px',
                    lineHeight: 1.6,
                    color: 'var(--fg-dim)',
                  }}
                >
                  {feat.desc}
                </p>
              </SpotlightCard>
            )
          })}
        </div>
      </div>
    </section>
  )
}
