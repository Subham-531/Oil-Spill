import React from 'react'

/**
 * Lamp — 10px LED indicator lamp
 * States: 'idle' | 'run' | 'complete' | 'error'
 */
export default function Lamp({ state = 'idle', className = '', style = {}, title = '' }) {
  const stateClass = `lamp--${state}`

  return (
    <span
      className={`lamp ${stateClass} ${className}`}
      style={style}
      title={title || `Status: ${state}`}
      aria-label={`Status LED: ${state}`}
    />
  )
}
