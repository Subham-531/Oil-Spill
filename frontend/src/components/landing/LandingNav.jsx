import React, { useState, useEffect } from 'react'
import { Radar, Compass } from 'lucide-react'
import BtnCap from '../primitives/BtnCap'

/**
 * LandingNav — Fixed 64px metal bar
 * Section 7.0: Radar mark + SLICKWATCH + engraved sub + navigation links + Open Console CTA
 */
export default function LandingNav({ onOpenConsole }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '64px',
        zIndex: 900,
        background: 'linear-gradient(180deg, #26221C 0%, #1D1A16 100%)',
        borderBottom: scrolled ? '1px solid var(--line)' : '1px solid transparent',
        boxShadow: scrolled
          ? '0 12px 28px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
          : 'none',
        transition: 'border-color 200ms ease, box-shadow 200ms ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
      }}
    >
      {/* Brand: Radar cap + SLICKWATCH + subline */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'linear-gradient(180deg, #F5B23C 0%, #C87F0A 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.35), 0 2px 6px rgba(0, 0, 0, 0.45)',
          }}
        >
          <Radar size={20} color="#201B14" strokeWidth={2.4} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '20px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: 'var(--fg)',
              lineHeight: 1,
            }}
          >
            SWACHH TRACK
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              fontWeight: 500,
              letterSpacing: '0.14em',
              color: 'var(--fg-dim)',
              marginTop: '2px',
            }}
          >
            SPILL FORENSICS CONSOLE
          </span>
        </div>
      </div>

      {/* Nav Links */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '32px',
        }}
        className="nav-links-desktop"
      >
        <button
          onClick={() => scrollToSection('how-it-works')}
          style={{
            background: 'none',
            border: 'none',
            fontFamily: 'var(--font-display)',
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--fg-dim)',
            cursor: 'pointer',
            transition: 'color 120ms ease',
          }}
          onMouseEnter={(e) => (e.target.style.color = 'var(--fg)')}
          onMouseLeave={(e) => (e.target.style.color = 'var(--fg-dim)')}
        >
          How It Works
        </button>

        <button
          onClick={() => scrollToSection('pipeline')}
          style={{
            background: 'none',
            border: 'none',
            fontFamily: 'var(--font-display)',
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--fg-dim)',
            cursor: 'pointer',
            transition: 'color 120ms ease',
          }}
          onMouseEnter={(e) => (e.target.style.color = 'var(--fg)')}
          onMouseLeave={(e) => (e.target.style.color = 'var(--fg-dim)')}
        >
          Pipeline
        </button>

        <button
          onClick={() => scrollToSection('evidence')}
          style={{
            background: 'none',
            border: 'none',
            fontFamily: 'var(--font-display)',
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--fg-dim)',
            cursor: 'pointer',
            transition: 'color 120ms ease',
          }}
          onMouseEnter={(e) => (e.target.style.color = 'var(--fg)')}
          onMouseLeave={(e) => (e.target.style.color = 'var(--fg-dim)')}
        >
          Evidence
        </button>

        <button
          onClick={onOpenConsole}
          style={{
            background: 'none',
            border: 'none',
            fontFamily: 'var(--font-display)',
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--fg-dim)',
            cursor: 'pointer',
            transition: 'color 120ms ease',
          }}
          onMouseEnter={(e) => (e.target.style.color = 'var(--fg)')}
          onMouseLeave={(e) => (e.target.style.color = 'var(--fg-dim)')}
        >
          Console
        </button>
      </nav>

      {/* Right Action */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <BtnCap
          variant="primary"
          icon={Compass}
          onClick={onOpenConsole}
          id="nav-open-console-btn"
        >
          Open Console
        </BtnCap>
      </div>
    </header>
  )
}
