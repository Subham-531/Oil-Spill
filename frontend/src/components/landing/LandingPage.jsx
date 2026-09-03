import React from 'react'
import LandingNav from './LandingNav'
import HeroSection from './HeroSection'
import StatsBand from './StatsBand'
import PipelineSection from './PipelineSection'
import ConsolePreviewSection from './ConsolePreviewSection'
import FeaturesGrid from './FeaturesGrid'
import UseCasesSection from './UseCasesSection'
import EvidenceSection from './EvidenceSection'
import LandingFooter from './LandingFooter'

/**
 * LandingPage — Full marketing surface for Swachh Track
 * Warm "analog bridge console" skeuomorphic design system
 */
export default function LandingPage({ onOpenConsole, onExportEvidence }) {
  const handleSeePipeline = () => {
    const el = document.getElementById('pipeline')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100%', backgroundColor: 'var(--ink-950)' }}>
      {/* 4% Opacity Grain Overlay over landing */}
      <div className="grain-overlay" aria-hidden="true" />

      {/* 7.0 Nav */}
      <LandingNav onOpenConsole={onOpenConsole} />

      {/* 7.1 Hero */}
      <HeroSection onOpenConsole={onOpenConsole} onSeePipeline={handleSeePipeline} />

      {/* 7.2 Stats Band */}
      <StatsBand />

      {/* 7.3 Pipeline */}
      <PipelineSection />

      {/* 7.4 Console Preview */}
      <ConsolePreviewSection onOpenConsole={onOpenConsole} />

      {/* 7.5 Features */}
      <FeaturesGrid />

      {/* 7.6 Use Cases */}
      <UseCasesSection />

      {/* 7.7 Evidence Dossier */}
      <EvidenceSection onExportEvidence={onExportEvidence || onOpenConsole} />

      {/* 7.9 Footer */}
      <LandingFooter onOpenConsole={onOpenConsole} />
    </div>
  )
}
