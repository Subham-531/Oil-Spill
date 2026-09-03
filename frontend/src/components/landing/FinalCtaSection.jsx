import React from 'react'
import { Radar } from 'lucide-react'
import MetalPanel from '../primitives/MetalPanel'
import BtnCap from '../primitives/BtnCap'

/**
 * FinalCtaSection — Section 7.8
 * Full-width engraved panel: "The ocean keeps records. We read them."
 * Primary button "Run your first analysis".
 */
export default function FinalCtaSection({ onOpenConsole }) {
  return (
    <section
      style={{
        padding: '96px 24px',
        borderBottom: '1px solid var(--line)',
        background: 'linear-gradient(180deg, #131110 0%, #1D1A16 100%)',
      }}
    >
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <MetalPanel
          style={{
            textAlign: 'center',
            padding: '64px 32px',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--fg-dim)',
              marginBottom: '16px',
            }}
          >
            PRECISION SURVEILLANCE READINESS
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '48px',
              fontWeight: 700,
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              color: 'var(--fg)',
              marginBottom: '24px',
              maxWidth: '24ch',
              margin: '0 auto 24px auto',
            }}
          >
            The ocean keeps records. We read them.
          </h2>

          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '16px',
              lineHeight: 1.6,
              color: 'var(--fg-dim)',
              maxWidth: '56ch',
              margin: '0 auto 36px auto',
            }}
          >
            Deploy automated SAR imagery segmentation and hydrodynamic attribution to eliminate
            unaccountable marine pollution across sovereign maritime zones.
          </p>

          <BtnCap
            variant="primary"
            icon={Radar}
            onClick={onOpenConsole}
            id="final-run-analysis-cta"
            style={{ minHeight: '48px', padding: '14px 28px', fontSize: '15px' }}
          >
            Run your first analysis
          </BtnCap>
        </MetalPanel>
      </div>
    </section>
  )
}
