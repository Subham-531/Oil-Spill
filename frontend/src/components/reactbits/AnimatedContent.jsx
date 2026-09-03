import React from 'react'
import { motion } from 'framer-motion'

/**
 * AnimatedContent — React Bits component restyled to Graphite Bridge
 * Section entrance with 60ms stagger per Section 6
 */
export default function AnimatedContent({
  children,
  delay = 0,
  stagger = 0.06, // 60ms stagger per spec
  className = '',
  style = {},
}) {
  const containerVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.32,
        delay,
        ease: [0.2, 0, 0, 1],
        staggerChildren: stagger,
      },
    },
  }

  return (
    <motion.div
      className={className}
      style={style}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
    >
      {children}
    </motion.div>
  )
}
