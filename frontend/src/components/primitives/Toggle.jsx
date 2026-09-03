import React from 'react'

/**
 * Toggle — Physical maritime instrument switch
 * 44x24 inset well, 20px metal lever turning amber when active
 */
export default function Toggle({
  checked = false,
  onChange,
  label,
  id,
  className = '',
  style = {},
  disabled = false,
}) {
  const handleClick = () => {
    if (!disabled && onChange) {
      onChange(!checked)
    }
  }

  const handleKeyDown = (e) => {
    if ((e.key === ' ' || e.key === 'Enter') && !disabled && onChange) {
      e.preventDefault()
      onChange(!checked)
    }
  }

  return (
    <div
      className={`toggle-control ${className}`}
      style={{ ...style, opacity: disabled ? 0.45 : 1 }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="switch"
      aria-checked={checked}
      tabIndex={disabled ? -1 : 0}
      id={id}
    >
      <div className={`toggle-track ${checked ? 'toggle-track--active' : ''}`}>
        <div className="toggle-lever" />
      </div>
      {label && (
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: checked ? 'var(--fg)' : 'var(--fg-dim)',
          }}
        >
          {label}
        </span>
      )}
    </div>
  )
}
