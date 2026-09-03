import React, { useState, useEffect, useRef } from 'react'
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react'

/**
 * MapTimelineSlider — Drift trajectory and AIS timeline controller
 * Restyled to Graphite Bridge skeuomorphic instrument console.
 */
export default function MapTimelineSlider({
  driftResult,
  currentTimeStep = 0,
  onTimeStepChange,
}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const intervalRef = useRef(null)

  const totalSteps = driftResult?.forecast_track?.length || 0

  const getCurrentLabel = () => {
    if (!driftResult || totalSteps === 0) return '—'
    const step = driftResult.forecast_track?.[currentTimeStep]
    const ts = step?.properties?.timestamp
    return ts ? new Date(ts).toLocaleString() : `STEP ${currentTimeStep + 1}`
  }

  const stepRef = useRef(currentTimeStep)
  stepRef.current = currentTimeStep

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        const next = stepRef.current + 1
        if (next >= totalSteps) {
          setIsPlaying(false)
          clearInterval(intervalRef.current)
          return
        }
        onTimeStepChange(next)
      }, 500)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPlaying, totalSteps, onTimeStepChange])

  if (totalSteps === 0) return null

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 500,
        width: '440px',
        background: 'rgba(29, 26, 22, 0.94)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-card)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        padding: '12px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
      className="timeline-slider-box"
    >
      {/* Top Header: Controls + Time */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Step Back */}
          <button
            onClick={() => onTimeStepChange(Math.max(0, currentTimeStep - 1))}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '4px',
              border: '1px solid var(--line)',
              background: '#26221C',
              color: 'var(--fg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            title="Previous step"
          >
            <SkipBack size={14} />
          </button>

          {/* Play / Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '4px',
              border: '1px solid #8A5C05',
              background: 'linear-gradient(180deg, #F5B23C 0%, #C87F0A 100%)',
              color: 'var(--ink-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
            }}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>

          {/* Step Forward */}
          <button
            onClick={() => onTimeStepChange(Math.min(totalSteps - 1, currentTimeStep + 1))}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '4px',
              border: '1px solid var(--line)',
              background: '#26221C',
              color: 'var(--fg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            title="Next step"
          >
            <SkipForward size={14} />
          </button>

          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--fg-dim)',
              marginLeft: '4px',
            }}
          >
            {currentTimeStep + 1} / {totalSteps}
          </span>
        </div>

        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--signal)',
          }}
        >
          {getCurrentLabel()}
        </span>
      </div>

      {/* Scrub Range Slider */}
      <input
        type="range"
        min={0}
        max={totalSteps - 1}
        value={currentTimeStep}
        onChange={(e) => onTimeStepChange(parseInt(e.target.value))}
        style={{
          width: '100%',
          accentColor: '#F0A11B',
          cursor: 'pointer',
        }}
      />
    </div>
  )
}
