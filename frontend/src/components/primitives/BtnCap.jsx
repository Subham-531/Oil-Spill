import React from 'react'

/**
 * BtnCap — Tactile push-button cap
 * Variants:
 *  - primary: Amber cap, ink text
 *  - ghost: Graphite cap, fg text
 *  - alarm: Red cap, paper text
 */
export default function BtnCap({
  variant = 'primary', // 'primary' | 'ghost' | 'alarm'
  icon: Icon = null,
  children,
  onClick,
  disabled = false,
  className = '',
  style = {},
  type = 'button',
  title = '',
  id = '',
}) {
  const variantClass = `btn-cap--${variant}`

  return (
    <button
      id={id || undefined}
      type={type}
      className={`btn-cap ${variantClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={style}
      title={title}
    >
      {Icon && <Icon size={16} strokeWidth={2.2} style={{ flexShrink: 0 }} />}
      {children && <span>{children}</span>}
    </button>
  )
}
