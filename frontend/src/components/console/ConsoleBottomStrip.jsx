import React, { useState, useEffect } from 'react'

/**
 * ConsoleBottomStrip — Section 8.4
 * 32px height, mono 11px, --fg-mute (#6E6656)
 * Live cursor lat/lon · zoom level · run ID · UTC clock · tile attribution
 */
export default function ConsoleBottomStrip({
  cursorCoords = { lat: 19.4974, lng: 72.5443 },
  zoomLevel = 9,
  runId = 'SW-2024-01-998',
  baseMapMode = 'satellite',
}) {
  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toUTCString().replace('GMT', 'UTC'))
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <footer
      style={{
        height: '32px',
        backgroundColor: '#131110',
        borderTop: '1px solid var(--line)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        color: 'var(--fg-mute)',
        userSelect: 'none',
        zIndex: 50,
      }}
    >
      {/* Left: Coords & Zoom */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <span>
          LAT/LON:{' '}
          <span style={{ color: 'var(--fg-dim)' }}>
            {cursorCoords.lat.toFixed(4)}° N, {cursorCoords.lng.toFixed(4)}° E
          </span>
        </span>

        <span>
          ZOOM: <span style={{ color: 'var(--fg-dim)' }}>{zoomLevel}</span>
        </span>

        <span>
          RUN ID: <span style={{ color: 'var(--fg-dim)' }}>{runId}</span>
        </span>
      </div>

      {/* Right: Base Mode, Clock & Data Sources */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <span>
          BASE:{' '}
          <span style={{ color: 'var(--signal)', textTransform: 'uppercase' }}>
            {baseMapMode === 'satellite'
              ? 'SATELLITE IMAGERY'
              : baseMapMode === 'relief'
              ? 'SHADED TERRAIN'
              : 'TACTICAL CANVAS'}
          </span>
        </span>

        <span>
          CLOCK: <span style={{ color: 'var(--fg-dim)' }}>{currentTime}</span>
        </span>

        <span style={{ color: 'var(--line)' }}>|</span>

        <span>COPERNICUS SENTINEL-1 · CMEMS · AIS ARCHIVE</span>
      </div>
    </footer>
  )
}
