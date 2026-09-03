import React from 'react'
import { motion } from 'framer-motion'

/**
 * Dial — Analog 240-degree maritime arc gauge for Confidence
 * Track: #3A342B, Fill: #F0A11B, needle animated with spring physics
 */
export default function Dial({
  value = 88,
  min = 0,
  max = 100,
  size = 110,
  label = 'CONFIDENCE',
  unit = '%',
}) {
  const clamped = Math.min(Math.max(value, min), max)
  const pct = (clamped - min) / (max - min)

  // 240-degree sweep from -120 deg to +120 deg
  const startAngle = -120
  const totalSweep = 240
  const needleAngle = startAngle + pct * totalSweep

  const radius = 38
  const cx = 50
  const cy = 50
  const circumference = 2 * Math.PI * radius
  const arcLength = (totalSweep / 360) * circumference
  const strokeDashoffset = arcLength * (1 - pct)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        userSelect: 'none',
      }}
    >
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg
          viewBox="0 0 100 100"
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
        >
          {/* Background Track Arc */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="var(--line)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${arcLength} ${circumference}`}
            style={{
              transformOrigin: '50% 50%',
              transform: 'rotate(150deg)',
            }}
          />

          {/* Value Arc (Amber Signal) */}
          <motion.circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="var(--signal)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${arcLength} ${circumference}`}
            initial={{ strokeDashoffset: arcLength }}
            animate={{ strokeDashoffset }}
            transition={{ type: 'spring', stiffness: 60, damping: 12 }}
            style={{
              transformOrigin: '50% 50%',
              transform: 'rotate(150deg)',
            }}
          />

          {/* Center Hub */}
          <circle
            cx={cx}
            cy={cy}
            r="6"
            fill="#26221C"
            stroke="var(--line)"
            strokeWidth="1.5"
          />
          <circle cx={cx} cy={cy} r="2.5" fill="var(--signal)" />

          {/* Needle */}
          <motion.g
            initial={{ rotate: startAngle }}
            animate={{ rotate: needleAngle }}
            transition={{ type: 'spring', stiffness: 60, damping: 12 }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          >
            <line
              x1={cx}
              y1={cy}
              x2={cx}
              y2={cy - radius + 4}
              stroke="var(--signal)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </motion.g>
        </svg>

        {/* Center Readout */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: 0,
            right: 0,
            textAlign: 'center',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '18px',
              fontWeight: 600,
              color: 'var(--fg)',
            }}
          >
            {clamped}{unit}
          </span>
        </div>
      </div>

      {label && (
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--fg-dim)',
            marginTop: '4px',
          }}
        >
          {label}
        </span>
      )}
    </div>
  )
}
