import React, { useState } from 'react'
import { Layers, ChevronUp, ChevronDown, Info } from 'lucide-react'

/**
 * MapLegend — Corner Symbology & Color Key
 * Warm "analog bridge console" skeuomorphic design
 * Explains each map layer, line style, and color code.
 */
export default function MapLegend({ showLiveAis = false }) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '58px',
        left: '16px',
        zIndex: 500,
        width: isCollapsed ? 'auto' : '236px',
        background: 'linear-gradient(180deg, #26221C 0%, #1D1A16 100%)',
        border: '1px solid var(--line)',
        borderRadius: '6px',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 8px 24px rgba(0, 0, 0, 0.55)',
        fontFamily: 'var(--font-mono)',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Corner Rivets (Decorative bridge console screws) */}
      {!isCollapsed && (
        <>
          <span className="screw" style={{ top: '4px', left: '4px' }} />
          <span className="screw" style={{ top: '4px', right: '4px' }} />
          <span className="screw" style={{ bottom: '4px', left: '4px' }} />
          <span className="screw" style={{ bottom: '4px', right: '4px' }} />
        </>
      )}

      {/* Header Bar */}
      <div
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '7px 12px',
          background: 'linear-gradient(180deg, #2F2A23 0%, #24201A 100%)',
          borderBottom: isCollapsed ? 'none' : '1px solid var(--line)',
          cursor: 'pointer',
          userSelect: 'none',
        }}
        title={isCollapsed ? 'Expand Map Legend' : 'Collapse Map Legend'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={13} color="#F0A11B" strokeWidth={2.2} />
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--fg)',
            }}
          >
            Map Symbology
          </span>
        </div>

        <button
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            color: 'var(--fg-dim)',
            display: 'flex',
            alignItems: 'center',
          }}
          aria-label={isCollapsed ? 'Expand' : 'Collapse'}
        >
          {isCollapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Expanded Symbology Rows */}
      {!isCollapsed && (
        <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '9px' }}>
          {/* 1. SAR Swath Boundary */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '26px',
                height: '16px',
                border: '1.5px dashed #F0A11B',
                background: 'rgba(240, 161, 27, 0.08)',
                borderRadius: '2px',
                flexShrink: 0,
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--fg)', lineHeight: 1.1 }}>
                SAR Swath Frame
              </span>
              <span style={{ fontSize: '9px', color: 'var(--fg-dim)', lineHeight: 1.2 }}>
                Sentinel-1 C-Band Footprint
              </span>
            </div>
          </div>

          {/* 2. Detected Oil Slick */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '26px',
                height: '16px',
                border: '1.5px dashed #F0A11B',
                background: '#131110',
                borderRadius: '2px',
                flexShrink: 0,
                position: 'relative',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  inset: '3px',
                  background: 'rgba(240, 161, 27, 0.25)',
                  borderRadius: '1px',
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#F5B23C', lineHeight: 1.1 }}>
                Detected Oil Slick
              </span>
              <span style={{ fontSize: '9px', color: 'var(--fg-dim)', lineHeight: 1.2 }}>
                PyTorch U-Net AI Segmentation
              </span>
            </div>
          </div>

          {/* 3. Suspect Vessel Track (Red Alarm) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '26px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '3px',
                  background: 'repeating-linear-gradient(90deg, #C9452F 0 7px, transparent 7px 11px)',
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#E06A55', lineHeight: 1.1 }}>
                Suspect Vessel Track
              </span>
              <span style={{ fontSize: '9px', color: 'var(--fg-dim)', lineHeight: 1.2 }}>
                Score ≥ 85 · Discharge Corridor
              </span>
            </div>
          </div>

          {/* 4. Commercial Vessel AIS Lane */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '26px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '2px',
                  background: 'repeating-linear-gradient(90deg, #EDE4D3 0 5px, transparent 5px 9px)',
                  opacity: 0.65,
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#EDE4D3', lineHeight: 1.1 }}>
                Commercial AIS Track
              </span>
              <span style={{ fontSize: '9px', color: 'var(--fg-dim)', lineHeight: 1.2 }}>
                Normal Transit · 7.28M Archive
              </span>
            </div>
          </div>

          {/* 5. Origin Window / Backcast */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '26px',
                height: '16px',
                border: '1.5px dashed #C9452F',
                background: 'rgba(201, 69, 47, 0.12)',
                borderRadius: '2px',
                flexShrink: 0,
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--fg)', lineHeight: 1.1 }}>
                Spill Origin Window
              </span>
              <span style={{ fontSize: '9px', color: 'var(--fg-dim)', lineHeight: 1.2 }}>
                OpenDrift CMEMS/ERA5 Hindcast
              </span>
            </div>
          </div>

          {/* 6. Live AIS Stream Marker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '26px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: '#EDE4D3',
                  border: '2px solid #F0A11B',
                  boxShadow: '0 0 6px rgba(240, 161, 27, 0.6)',
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#F0A11B', lineHeight: 1.1 }}>
                Live AIS Position
              </span>
              <span style={{ fontSize: '9px', color: 'var(--fg-dim)', lineHeight: 1.2 }}>
                AISStream.io Real-Time Broadcast
              </span>
            </div>
          </div>

          {/* Subtle Footnote */}
          <div
            style={{
              borderTop: '1px solid #2B2620',
              paddingTop: '6px',
              marginTop: '2px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '8.5px',
              color: 'var(--fg-mute)',
            }}
          >
            <Info size={10} color="#7A7160" />
            <span>Click any vessel track to inspect telemetry</span>
          </div>
        </div>
      )}
    </div>
  )
}
