import React from 'react'

/**
 * BezelScreen — Inset CRT / instrument monitor well
 * Deep near-black background with subtle inner border bevel
 */
export default function BezelScreen({
  children,
  className = '',
  style = {},
  onClick,
}) {
  return (
    <div
      className={`bezel-screen ${className}`}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
