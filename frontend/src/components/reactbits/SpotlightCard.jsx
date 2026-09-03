import React, { useRef, useState } from 'react'

/**
 * SpotlightCard — React Bits component restyled to Graphite Bridge
 * Metal card with mouse-follow radial spotlight in --signal amber. Never blue.
 */
export default function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(240, 161, 27, 0.08)',
  style = {},
}) {
  const cardRef = useRef(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`metal-panel ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-card)',
        padding: '24px',
        transition: 'border-color 200ms cubic-bezier(0.2, 0, 0, 1)',
        borderColor: isHovered ? 'var(--line)' : 'var(--line)',
        ...style,
      }}
    >
      {/* Corner screws */}
      <div className="screw screw-tl" aria-hidden="true" />
      <div className="screw screw-tr" aria-hidden="true" />
      <div className="screw screw-bl" aria-hidden="true" />
      <div className="screw screw-br" aria-hidden="true" />

      {/* Amber Spotlight Radial */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 200ms ease',
          background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 70%)`,
        }}
        aria-hidden="true"
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  )
}
