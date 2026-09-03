import React from 'react'
import { motion } from 'framer-motion'

/**
 * SplitText — React Bits component restyled to Graphite Bridge
 * Staggers words/characters into view with restrained motion
 */
export default function SplitText({
  text = '',
  className = '',
  staggerDuration = 0.03,
  style = {},
}) {
  const words = text.split(' ')

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDuration,
      },
    },
  }

  const wordVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.32,
        ease: [0.2, 0, 0, 1],
      },
    },
  }

  return (
    <motion.h1
      className={className}
      style={{
        display: 'inline-block',
        overflow: 'hidden',
        ...style,
      }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          variants={wordVariants}
          style={{ display: 'inline-block', marginRight: '0.28em' }}
        >
          {word}
        </motion.span>
      ))}
    </motion.h1>
  )
}
