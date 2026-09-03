import React, { useEffect, useState, useRef } from 'react'

/**
 * CountUp — React Bits component restyled to Graphite Bridge
 * Smoothly interpolates numeric values from 0 to target
 */
export default function CountUp({
  to = 0,
  from = 0,
  duration = 1.2, // 1.2s per Section 9
  decimals = 0,
  separator = ',',
  prefix = '',
  suffix = '',
  className = '',
  style = {},
}) {
  const [current, setCurrent] = useState(from)
  const startTimeRef = useRef(null)
  const reqRef = useRef(null)

  useEffect(() => {
    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setCurrent(to)
      return
    }

    const startVal = from
    const endVal = to
    const durMs = duration * 1000

    const step = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / durMs, 1)

      // Cubic-bezier(0.2, 0, 0, 1) easing approximation
      const ease = 1 - Math.pow(1 - progress, 3)
      const val = startVal + (endVal - startVal) * ease

      setCurrent(val)

      if (progress < 1) {
        reqRef.current = requestAnimationFrame(step)
      } else {
        setCurrent(endVal)
      }
    }

    startTimeRef.current = null
    reqRef.current = requestAnimationFrame(step)

    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current)
    }
  }, [to, from, duration])

  const formatted = decimals > 0
    ? current.toFixed(decimals)
    : Math.round(current).toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator)

  return (
    <span
      className={className}
      style={{
        fontFamily: 'var(--font-mono)',
        fontVariantNumeric: 'tabular-nums',
        ...style,
      }}
    >
      {prefix}{formatted}{suffix}
    </span>
  )
}
