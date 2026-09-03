import React from 'react'
import MetalPanel from '../primitives/MetalPanel'
import Lamp from '../primitives/Lamp'

/**
 * PipelineSection — Section 7.3
 * "From raw radar to a named vessel in three steps."
 * Three .metal-panel instrument cards connected by flowing conduit lines.
 * Loop animations: 01 scanline, 02 drift particles, 03 concentric ship pings.
 */
export default function PipelineSection() {
  const steps = [
    {
      num: '01',
      title: 'SAR Segmentation',
      subtitle: 'PYTORCH U-NET INFERENCE',
      desc: 'High-resolution Sentinel-1 C-band SAR radar imagery is processed to detect dark surface backscatter anomalies characteristic of petroleum slicks.',
      lamp: 'complete',
      renderAnimation: () => (
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '120px',
            background: '#131110',
            borderRadius: '6px',
            border: '1px solid var(--line)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Background grid */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)',
              backgroundSize: '16px 16px',
              opacity: 0.35,
            }}
          />

          {/* Oil Slick Anomaly */}
          <svg viewBox="0 0 160 80" style={{ width: '80%', height: '80%', zIndex: 1 }}>
            <path
              d="M 30,40 Q 55,20 90,35 T 140,42 Q 130,65 95,55 T 30,40 Z"
              fill="#1D1A16"
              stroke="#F0A11B"
              strokeWidth="1.5"
              strokeDasharray="4 2"
            />
          </svg>

          {/* Vertical Radar Sweep Line */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              width: '2px',
              backgroundColor: 'var(--signal)',
              boxShadow: '0 0 8px 1px var(--signal)',
              animation: 'scanSweep 2.8s linear infinite',
              zIndex: 2,
            }}
          />
        </div>
      ),
    },
    {
      num: '02',
      title: 'Drift Simulation',
      subtitle: 'OPENDRIFT OCEAN PHYSICS',
      desc: 'Lagrangian particle tracking integrates Copernicus CMEMS ocean currents and ERA5 wind fields to back-cast the spill trajectory to its exact point and time of origin.',
      lamp: 'complete',
      renderAnimation: () => (
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '120px',
            background: '#131110',
            borderRadius: '6px',
            border: '1px solid var(--line)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Animated Particles flowing along curved field */}
          <svg viewBox="0 0 200 100" style={{ width: '100%', height: '100%' }}>
            {/* Streamlines */}
            <path
              d="M 10,75 C 60,65 120,40 190,20"
              fill="none"
              stroke="#3A342B"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <path
              d="M 15,85 C 65,75 125,50 195,30"
              fill="none"
              stroke="#3A342B"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <path
              d="M 5,65 C 55,55 115,30 185,10"
              fill="none"
              stroke="#3A342B"
              strokeWidth="1"
              strokeDasharray="3 3"
            />

            {/* Amber and Red Flowing Particles */}
            <circle cx="0" cy="0" r="2.5" fill="#F0A11B">
              <animateMotion
                path="M 190,20 C 120,40 60,65 10,75"
                dur="3s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="0" cy="0" r="3" fill="#C9452F">
              <animateMotion
                path="M 195,30 C 125,50 65,75 15,85"
                dur="3.4s"
                begin="0.8s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="0" cy="0" r="2" fill="#F0A11B">
              <animateMotion
                path="M 185,10 C 115,30 55,55 5,65"
                dur="2.6s"
                begin="1.5s"
                repeatCount="indefinite"
              />
            </circle>
          </svg>

          {/* Origin reticle marker */}
          <div
            style={{
              position: 'absolute',
              bottom: '18px',
              left: '20px',
              width: '12px',
              height: '12px',
              border: '1px solid var(--alarm)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '4px',
                height: '4px',
                backgroundColor: 'var(--alarm)',
                borderRadius: '50%',
              }}
            />
          </div>
        </div>
      ),
    },
    {
      num: '03',
      title: 'AIS Attribution',
      subtitle: '7.28M DUCKDB SPATIAL QUERY',
      desc: 'High-speed analytical spatio-temporal queries correlate all commercial vessel tracks against the release window, scoring proximity, speed anomalies, and vessel type.',
      lamp: 'complete',
      renderAnimation: () => (
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '120px',
            background: '#131110',
            borderRadius: '6px',
            border: '1px solid var(--line)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Concentric Radar Rings */}
          <svg viewBox="0 0 120 120" style={{ width: '100px', height: '100px' }}>
            <circle cx="60" cy="60" r="48" fill="none" stroke="#3A342B" strokeWidth="1" />
            <circle cx="60" cy="60" r="32" fill="none" stroke="#3A342B" strokeWidth="1" />
            <circle cx="60" cy="60" r="16" fill="none" stroke="#3A342B" strokeWidth="1" />
            <line x1="60" y1="12" x2="60" y2="108" stroke="#3A342B" strokeWidth="1" />
            <line x1="12" y1="60" x2="108" y2="60" stroke="#3A342B" strokeWidth="1" />

            {/* Expanding Ping Wave */}
            <circle cx="60" cy="60" r="10" fill="none" stroke="#F0A11B" strokeWidth="1.5">
              <animate
                attributeName="r"
                from="10"
                to="50"
                dur="2s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                from="0.8"
                to="0"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>

            {/* Target Blip (Culprit Ship) */}
            <circle cx="68" cy="48" r="3.5" fill="#C9452F" />
            <line x1="64" y1="48" x2="72" y2="48" stroke="#EDE4D3" strokeWidth="1" />
            <line x1="68" y1="44" x2="68" y2="52" stroke="#EDE4D3" strokeWidth="1" />
          </svg>
        </div>
      ),
    },
  ]

  return (
    <section
      id="pipeline"
      style={{
        padding: '96px 24px',
        borderBottom: '1px solid var(--line)',
        background: 'var(--ink-950)',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Section Header */}
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
            PRECISION FORENSICS WORKFLOW
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
            From raw radar to a named vessel in three steps.
          </h2>
        </div>

        {/* 3 Pipeline Cards with Animated Conduit */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '32px',
            position: 'relative',
          }}
          className="pipeline-grid"
        >
          {steps.map((step, idx) => (
            <div key={idx} style={{ position: 'relative' }}>
              <MetalPanel
                title={`${step.num} / ${step.subtitle}`}
                headerRight={<Lamp state={step.lamp} />}
                style={{ height: '100%' }}
              >
                {/* Visual loop */}
                <div style={{ marginBottom: '20px' }}>
                  {step.renderAnimation()}
                </div>

                {/* Content */}
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
                  {step.title}
                </h3>

                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '14px',
                    lineHeight: 1.6,
                    color: 'var(--fg-dim)',
                  }}
                >
                  {step.desc}
                </p>
              </MetalPanel>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes scanSweep {
          0% { left: 0%; opacity: 0.2; }
          50% { opacity: 1; }
          100% { left: 100%; opacity: 0.2; }
        }
      `}</style>
    </section>
  )
}
