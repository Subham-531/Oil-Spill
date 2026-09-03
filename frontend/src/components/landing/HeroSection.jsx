import React from 'react'
import { Radar, ArrowRight, Activity, Cpu, Timer } from 'lucide-react'
import SplitText from '../reactbits/SplitText'
import Particles from '../reactbits/Particles'
import BtnCap from '../primitives/BtnCap'
import GlobeHero3D from './GlobeHero3D'

/**
 * HeroSection — Section 7.1
 * Two-column: technical copy + CTAs + specs on left; R3F globe scene on right.
 */
export default function HeroSection({ onOpenConsole, onSeePipeline }) {
  return (
    <section
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        paddingTop: '96px',
        paddingBottom: '64px',
        overflow: 'hidden',
        borderBottom: '1px solid var(--line)',
      }}
    >
      {/* Particles behind hero only, <=6% opacity */}
      <Particles count={32} maxOpacity={0.06} />

      <div
        style={{
          maxWidth: '1280px',
          width: '100%',
          margin: '0 auto',
          padding: '0 24px',
          display: 'grid',
          gridTemplateColumns: '55fr 45fr',
          gap: '48px',
          alignItems: 'center',
          position: 'relative',
          zIndex: 2,
        }}
        className="hero-grid"
      >
        {/* Left Column (55%) */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Mono Kicker */}
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--fg-dim)',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'var(--signal)',
              }}
            />
            SAR DETECTION · DRIFT PHYSICS · AIS ATTRIBUTION
          </div>

          {/* H1 SplitText Reveal */}
          <SplitText
            text="Find the spill. Trace the ship."
            staggerDuration={0.03}
            className="hero-title"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '64px',
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              color: 'var(--fg)',
              marginBottom: '24px',
            }}
          />

          {/* Subtitle */}
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '17px',
              lineHeight: 1.6,
              color: 'var(--fg-dim)',
              maxWidth: '52ch',
              marginBottom: '32px',
            }}
          >
            Upload Sentinel-1 SAR imagery or run a live scan. A real PyTorch U-Net segments the slick,
            OpenDrift rewinds ocean physics, and a 7.28M-record AIS database names the vessels that
            were there.
          </p>

          {/* CTAs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '40px',
              flexWrap: 'wrap',
            }}
          >
            <BtnCap
              variant="primary"
              icon={Radar}
              onClick={onOpenConsole}
              id="hero-run-analysis-cta"
            >
              Run Live Analysis
            </BtnCap>

            <BtnCap
              variant="ghost"
              icon={ArrowRight}
              onClick={onSeePipeline}
              id="hero-see-pipeline-cta"
            >
              See the pipeline
            </BtnCap>
          </div>

          {/* Three Mono Spec Chips */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-chip)',
                background: 'var(--ink-900)',
                border: '1px solid var(--line)',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--fg-dim)',
                letterSpacing: '0.06em',
              }}
            >
              <Cpu size={14} color="#F0A11B" />
              U-NET F1 0.91
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-chip)',
                background: 'var(--ink-900)',
                border: '1px solid var(--line)',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--fg-dim)',
                letterSpacing: '0.06em',
              }}
            >
              <Activity size={14} color="#7CB342" />
              OPENDRIFT v2024.11
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-chip)',
                background: 'var(--ink-900)',
                border: '1px solid var(--line)',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--fg-dim)',
                letterSpacing: '0.06em',
              }}
            >
              <Timer size={14} color="#F0A11B" />
              RUNTIME &lt; 90 S
            </div>
          </div>
        </div>

        {/* Right Column (45%): R3F Scene / Static Fallback */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <GlobeHero3D />
        </div>
      </div>
    </section>
  )
}
