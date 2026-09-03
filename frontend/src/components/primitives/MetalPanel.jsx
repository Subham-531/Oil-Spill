import React from 'react'

/**
 * MetalPanel — Skeuomorphic brushed graphite instrument panel
 * Four corner screw rivets, engraved uppercase title, subtle bevel.
 */
export default function MetalPanel({
  title,
  headerRight,
  screws = true,
  children,
  className = '',
  style = {},
  onClick,
}) {
  return (
    <div
      className={`metal-panel ${className}`}
      style={style}
      onClick={onClick}
    >
      {screws && (
        <>
          <div className="screw screw-tl" aria-hidden="true" />
          <div className="screw screw-tr" aria-hidden="true" />
          <div className="screw screw-bl" aria-hidden="true" />
          <div className="screw screw-br" aria-hidden="true" />
        </>
      )}

      {(title || headerRight) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px 12px 20px',
            borderBottom: '1px solid var(--line)',
          }}
        >
          {title && <span className="engraved-title">{title}</span>}
          {headerRight && <div>{headerRight}</div>}
        </div>
      )}

      <div style={{ padding: title ? '16px 20px 20px 20px' : '20px' }}>
        {children}
      </div>
    </div>
  )
}
