import React from 'react'

/**
 * Stamp — Forensic rubber stamp
 * Variants:
 *  - 'detected' (ok phosphor green)
 *  - 'prime-suspect' (alarm red)
 *  - 'complete' (ok phosphor green)
 *  - 'running' (signal amber)
 */
export default function Stamp({
  variant = 'detected',
  text,
  className = '',
  style = {},
}) {
  const variantClassMap = {
    'detected': 'stamp--detected',
    'prime-suspect': 'stamp--prime-suspect',
    'complete': 'stamp--complete',
    'running': 'stamp--running',
  }

  const defaultTextMap = {
    'detected': 'DETECTED',
    'prime-suspect': 'PRIME SUSPECT',
    'complete': 'COMPLETE',
    'running': 'RUNNING',
  }

  const stampClass = variantClassMap[variant] || 'stamp--detected'
  const displayText = text || defaultTextMap[variant] || 'VERIFIED'

  return (
    <span
      className={`stamp ${stampClass} ${className}`}
      style={style}
    >
      {displayText}
    </span>
  )
}
