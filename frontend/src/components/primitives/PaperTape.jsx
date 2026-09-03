import React from 'react'

/**
 * PaperTape — Skeuomorphic teleprinter cream paper tape
 * Perforated tear-off edge, mono type, tactile print feel
 */
export default function PaperTape({
  children,
  header = null,
  className = '',
  style = {},
  tilt = true,
}) {
  return (
    <div className={tilt ? 'paper-tape-container' : ''}>
      <div className={`paper-tape ${className}`} style={style}>
        {/* Perforated edge at top */}
        <div className="paper-perforation" aria-hidden="true" />

        {header && (
          <div
            style={{
              padding: '12px 16px 8px 16px',
              fontFamily: 'var(--font-display)',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--ink-text)',
              borderBottom: '1px dashed #B7AC93',
            }}
          >
            {header}
          </div>
        )}

        <div style={{ padding: '12px 16px' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
