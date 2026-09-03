import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Lamp from './Lamp'

/**
 * Plaque — Skeuomorphic toast notification plaque
 * Floats top-center over map, auto-dismisses after duration.
 */
export default function Plaque({
  message,
  state = 'complete', // 'idle' | 'run' | 'complete' | 'error'
  duration = 4000,
  onClose,
}) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => {
      if (onClose) onClose()
    }, duration)
    return () => clearTimeout(timer)
  }, [message, duration, onClose])

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          className="plaque"
          initial={{ opacity: 0, y: -20, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -20, x: '-50%' }}
          transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
          role="status"
          aria-live="polite"
        >
          <Lamp state={state} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
            {message}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
