import React from 'react'
import CountUp from '../reactbits/CountUp'

/**
 * StatsBand — Section 7.2
 * 4 cells separated by hairlines, each with CountUp mono number (40px, --fg)
 * and Barlow Condensed uppercase label (--fg-dim).
 */
export default function StatsBand() {
  const stats = [
    {
      value: 7280000,
      decimals: 0,
      separator: ',',
      suffix: '',
      label: '7,280,000 AIS POSITIONS',
    },
    {
      value: 8.5,
      decimals: 1,
      separator: '',
      suffix: ' KM²',
      label: '8.5 KM² MEDIAN DETECTION',
    },
    {
      value: 88,
      decimals: 0,
      separator: '',
      suffix: ' S',
      label: '88 S FULL PIPELINE',
    },
    {
      value: 24,
      decimals: 0,
      separator: '',
      suffix: ' H',
      label: '24 H EVIDENCE WINDOW',
    },
  ]

  return (
    <section
      style={{
        borderBottom: '1px solid var(--line)',
        background: 'linear-gradient(180deg, #1D1A16 0%, #131110 100%)',
        position: 'relative',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
        }}
        className="stats-band-grid"
      >
        {stats.map((stat, idx) => (
          <div
            key={idx}
            style={{
              padding: '40px 24px',
              borderRight: idx < 3 ? '1px solid var(--line)' : 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              position: 'relative',
            }}
            className="stats-cell"
          >
            {/* Screw rivet dot on top hairline */}
            <div
              style={{
                position: 'absolute',
                top: '-4px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#474136',
                border: '1px solid #131110',
              }}
              aria-hidden="true"
            />

            <div style={{ marginBottom: '8px' }}>
              <CountUp
                to={stat.value}
                decimals={stat.decimals}
                separator={stat.separator}
                suffix={stat.suffix}
                duration={1.2}
                style={{
                  fontSize: '40px',
                  fontWeight: 600,
                  color: 'var(--fg)',
                  letterSpacing: '-0.02em',
                }}
              />
            </div>

            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--fg-dim)',
              }}
            >
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
