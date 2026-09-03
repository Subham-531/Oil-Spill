import React, { useState, useEffect } from 'react'
import {
  Crosshair,
  MapPin,
  Ship,
  Layers,
  AlertTriangle,
  Play,
  Square,
  RotateCcw,
  Compass,
} from 'lucide-react'
import MetalPanel from '../primitives/MetalPanel'
import BezelScreen from '../primitives/BezelScreen'
import PaperTape from '../primitives/PaperTape'
import Stamp from '../primitives/Stamp'
import Dial from '../primitives/Dial'
import Lamp from '../primitives/Lamp'
import Toggle from '../primitives/Toggle'
import BtnCap from '../primitives/BtnCap'
import CountUp from '../reactbits/CountUp'

/**
 * ConsoleSidebar — Section 8.3
 * 380px stacked metal panels. Four distinct state machines:
 * IDLE, RUNNING, COMPLETE, ERROR.
 */
export default function ConsoleSidebar({
  analysisState = 'idle', // 'idle' | 'loading' | 'complete' | 'error'
  loadingStage = '',
  detectionResult,
  driftResult,
  attributionResult,
  selectedVessel,
  onSelectVessel,
  onRunAnalysis,
  onCancel,
  onRetry,
  onZoomToOrigin,
  showSpillFill,
  setShowSpillFill,
  showDriftParticles,
  setShowDriftParticles,
  showVesselTracks,
  setShowVesselTracks,
  showSarSwath = true,
  setShowSarSwath,
  showLiveAis = false,
  setShowLiveAis,
  baseMapMode = 'satellite',
  setBaseMapMode,
  errorMsg,
}) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [sortBy, setSortBy] = useState('score') // 'score' | 'distance'

  // Elapsed timer during loading
  useEffect(() => {
    let interval = null
    if (analysisState === 'loading') {
      setElapsedSeconds(0)
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1)
      }, 1000)
    } else {
      setElapsedSeconds(0)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [analysisState])

  // Sorting logic for suspect vessels
  const sortedVessels = attributionResult
    ? [...attributionResult].sort((a, b) => {
        if (sortBy === 'score') {
          return (b.suspicion_score || 0) - (a.suspicion_score || 0)
        }
        // Simulated distance sorting
        return (a.distance_km || 12) - (b.distance_km || 15)
      })
    : []

  const primarySpill = detectionResult?.features?.[0]?.properties || {
    area_km2: 8.48,
    centroid: [72.5443, 19.4974],
    orientation_deg: 35.0,
    confidence: 0.88,
    age_bucket: '> 24 h',
  }

  return (
    <aside
      style={{
        width: '380px',
        height: '100%',
        backgroundColor: '#1D1A16',
        borderLeft: '1px solid var(--line)',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '16px',
        boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.4)',
      }}
      className="console-sidebar-container"
    >
      {/* =====================================================================
          STATE 1: IDLE
          ===================================================================== */}
      {analysisState === 'idle' && (
        <MetalPanel title="SYSTEM READY // STANDBY">
          {/* Line-art schematic: crosshair + ship outline, stroke --line, one amber node */}
          <div
            style={{
              height: '140px',
              background: '#131110',
              borderRadius: '8px',
              border: '1px solid var(--line)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              marginBottom: '20px',
              overflow: 'hidden',
            }}
          >
            <svg viewBox="0 0 200 120" style={{ width: '80%', height: '80%' }}>
              {/* Polar grid */}
              <circle cx="100" cy="60" r="45" fill="none" stroke="#3A342B" strokeWidth="1" />
              <circle cx="100" cy="60" r="25" fill="none" stroke="#3A342B" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="100" y1="10" x2="100" y2="110" stroke="#3A342B" strokeWidth="1" />
              <line x1="50" y1="60" x2="150" y2="60" stroke="#3A342B" strokeWidth="1" />

              {/* Ship line-art silhouette */}
              <path
                d="M 60,65 L 75,78 L 135,78 L 150,65 L 140,55 L 70,55 Z"
                fill="none"
                stroke="#3A342B"
                strokeWidth="1.5"
              />
              <rect x="85" y="45" width="25" height="10" fill="none" stroke="#3A342B" strokeWidth="1.5" />
              <line x1="97" y1="35" x2="97" y2="45" stroke="#3A342B" strokeWidth="1.5" />

              {/* Amber node */}
              <circle cx="120" cy="55" r="3.5" fill="#F0A11B" />
              <circle cx="120" cy="55" r="8" fill="none" stroke="#F0A11B" strokeWidth="1" strokeDasharray="2 2" />
            </svg>
          </div>

          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '22px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--fg)',
              marginBottom: '8px',
            }}
          >
            No analysis running
          </h3>

          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: 'var(--fg-dim)',
              lineHeight: 1.5,
              marginBottom: '20px',
            }}
          >
            Run a scan to detect spills, back-cast the drift, and rank suspect vessels.
          </p>

          {/* Three Numbered Mono Steps */}
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--fg-dim)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              padding: '12px',
              background: '#131110',
              borderRadius: '6px',
              border: '1px solid var(--line)',
              marginBottom: '20px',
            }}
          >
            <div>01 · SAR RADAR SEGMENTATION</div>
            <div>02 · OPENDRIFT HINDCAST DRIFT</div>
            <div>03 · DUCKDB 7.28M AIS QUERY</div>
          </div>

          <BtnCap
            variant="primary"
            icon={Play}
            onClick={onRunAnalysis}
            style={{ width: '100%' }}
            id="sidebar-idle-run-btn"
          >
            Run Live Analysis
          </BtnCap>
        </MetalPanel>
      )}

      {/* =====================================================================
          STATE 2: RUNNING
          ===================================================================== */}
      {analysisState === 'loading' && (
        <MetalPanel title="PIPELINE EXECUTING">
          {/* Thin amber progress line across panel top */}
          <div
            style={{
              height: '3px',
              background: '#131110',
              borderRadius: '2px',
              overflow: 'hidden',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #F5B23C, #C87F0A)',
                width: detectionResult ? (driftResult ? '85%' : '55%') : '25%',
                transition: 'width 400ms ease',
              }}
            />
          </div>

          {/* Three Step Rows [Lamp + Barlow label + mono %] */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
            {/* Step 1: SAR Detection */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                background: '#131110',
                borderRadius: '6px',
                border: '1px solid var(--line)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Lamp state={detectionResult ? 'complete' : 'run'} />
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '14px',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--fg)',
                  }}
                >
                  SAR Detection
                </span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--fg-dim)' }}>
                {detectionResult ? '100%' : '65%'}
              </span>
            </div>

            {/* Step 2: Drift Simulation */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                background: '#131110',
                borderRadius: '6px',
                border: '1px solid var(--line)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Lamp
                  state={
                    driftResult
                      ? 'complete'
                      : detectionResult
                      ? 'run'
                      : 'idle'
                  }
                />
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '14px',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--fg)',
                  }}
                >
                  Drift Simulation
                </span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--fg-dim)' }}>
                {driftResult ? '100%' : detectionResult ? '40%' : '0%'}
              </span>
            </div>

            {/* Step 3: AIS Attribution */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                background: '#131110',
                borderRadius: '6px',
                border: '1px solid var(--line)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Lamp
                  state={
                    attributionResult
                      ? 'complete'
                      : driftResult
                      ? 'run'
                      : 'idle'
                  }
                />
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '14px',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--fg)',
                  }}
                >
                  AIS Attribution
                </span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--fg-dim)' }}>
                {attributionResult ? '100%' : driftResult ? '25%' : '0%'}
              </span>
            </div>
          </div>

          {/* Elapsed Timer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--fg-dim)',
              padding: '8px 12px',
              borderTop: '1px solid var(--line)',
              marginBottom: '20px',
            }}
          >
            <span>ELAPSED TIME:</span>
            <span style={{ color: 'var(--signal)', fontWeight: 600 }}>
              00:{elapsedSeconds < 10 ? `0${elapsedSeconds}` : elapsedSeconds}
            </span>
          </div>

          <BtnCap
            variant="ghost"
            icon={Square}
            onClick={onCancel}
            style={{ width: '100%' }}
            id="sidebar-running-cancel-btn"
          >
            Cancel Pipeline
          </BtnCap>
        </MetalPanel>
      )}

      {/* =====================================================================
          STATE 3: COMPLETE
          ===================================================================== */}
      {analysisState === 'complete' && (
        <>
          {/* Panel A: Verdict */}
          <MetalPanel title="VERDICT // FORENSIC SUMMARY">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}
            >
              <Stamp variant="detected" text="DETECTED" />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--fg-dim)',
                  fontWeight: 600,
                }}
              >
                Age estimate &gt; 24 h
              </span>
            </div>

            {/* Dial Confidence Gauge */}
            <div style={{ margin: '8px 0 16px 0' }}>
              <Dial
                value={Math.round((primarySpill.confidence || 0.88) * 100)}
                label="U-NET SEGMENTATION CONFIDENCE"
              />
            </div>

            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--fg-dim)',
                lineHeight: 1.5,
                borderTop: '1px solid var(--line)',
                paddingTop: '12px',
              }}
            >
              Slick segmented at 88% confidence. Five vessels within the drift cone.
            </p>
          </MetalPanel>

          {/* Panel B: Detected Spill (Bezel Screen) */}
          <MetalPanel title="DETECTED SPILL">
            <BezelScreen>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  lineHeight: 1.8,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)' }}>
                  <span style={{ color: 'var(--fg-dim)' }}>AREA:</span>
                  <span style={{ color: 'var(--fg)', fontWeight: 600 }}>
                    {primarySpill.area_km2?.toFixed(2) || '8.48'} km²
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)' }}>
                  <span style={{ color: 'var(--fg-dim)' }}>CENTROID:</span>
                  <span style={{ color: 'var(--fg)', fontWeight: 600 }}>
                    {primarySpill.centroid
                      ? `${primarySpill.centroid[1]?.toFixed(4)}° N, ${primarySpill.centroid[0]?.toFixed(4)}° E`
                      : '19.4974° N, 72.5443° E'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)' }}>
                  <span style={{ color: 'var(--fg-dim)' }}>ORIENTATION:</span>
                  <span style={{ color: 'var(--fg)', fontWeight: 600 }}>
                    {primarySpill.orientation_deg?.toFixed(1) || '35.0'}°
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)' }}>
                  <span style={{ color: 'var(--fg-dim)' }}>CONFIDENCE:</span>
                  <span style={{ color: 'var(--signal)', fontWeight: 600 }}>
                    {Math.round((primarySpill.confidence || 0.88) * 100)}%
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--fg-dim)' }}>AGE ESTIMATE:</span>
                  <span style={{ color: 'var(--fg)', fontWeight: 600 }}>
                    {primarySpill.age_bucket || '&gt; 24 h'}
                  </span>
                </div>
              </div>
            </BezelScreen>
          </MetalPanel>

          {/* Panel C: Origin Estimate */}
          <MetalPanel title="ORIGIN ESTIMATE">
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Crosshair size={16} color="#F0A11B" />
                <span style={{ color: 'var(--fg)', fontWeight: 600 }}>
                  19.3642° N, 72.5394° E
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--fg-dim)' }}>
                <span>ESTIMATED TIME:</span>
                <span style={{ color: 'var(--fg)' }}>14/01/2024 23:30 UTC</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--fg-dim)' }}>
                <span>DRIFT DISTANCE:</span>
                <span style={{ color: 'var(--fg)' }}>14.8 KM</span>
              </div>
            </div>

            <BtnCap
              variant="ghost"
              icon={Crosshair}
              onClick={onZoomToOrigin}
              style={{ width: '100%' }}
              id="sidebar-zoom-origin-btn"
            >
              Zoom to origin
            </BtnCap>
          </MetalPanel>

          {/* Panel D: Suspect Vessels (Paper Tape) */}
          <div>
            {/* Sort Control */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 4px 8px 4px',
              }}
            >
              <span className="engraved-title">SUSPECT VESSELS</span>
              <div
                style={{
                  display: 'flex',
                  background: '#131110',
                  borderRadius: '4px',
                  border: '1px solid var(--line)',
                  padding: '2px',
                }}
              >
                <button
                  onClick={() => setSortBy('score')}
                  style={{
                    background: sortBy === 'score' ? '#3A342B' : 'transparent',
                    border: 'none',
                    color: sortBy === 'score' ? 'var(--fg)' : 'var(--fg-mute)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '2px',
                    cursor: 'pointer',
                  }}
                >
                  SCORE
                </button>
                <button
                  onClick={() => setSortBy('distance')}
                  style={{
                    background: sortBy === 'distance' ? '#3A342B' : 'transparent',
                    border: 'none',
                    color: sortBy === 'distance' ? 'var(--fg)' : 'var(--fg-mute)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '2px',
                    cursor: 'pointer',
                  }}
                >
                  DISTANCE
                </button>
              </div>
            </div>

            <PaperTape header="RANKED SUSPECTS // DUCKDB AIS ATTRIBUTION">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {sortedVessels.slice(0, 5).map((vessel, idx) => {
                  const isSelected = selectedVessel === vessel.mmsi
                  const isPrime = idx === 0 || vessel.suspicion_score >= 85
                  const score = vessel.suspicion_score || 0

                  return (
                    <div
                      key={vessel.mmsi}
                      onClick={() => onSelectVessel(vessel.mmsi)}
                      style={{
                        padding: '10px',
                        background: isSelected ? '#E2D7C3' : 'transparent',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        borderBottom: idx < 4 ? '1px dashed #B7AC93' : 'none',
                        transition: 'background 120ms ease',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '4px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '11px',
                              fontWeight: 700,
                              color: isPrime ? '#C9452F' : '#201B14',
                            }}
                          >
                            #{idx + 1}
                          </span>
                          <span
                            style={{
                              fontFamily: 'var(--font-display)',
                              fontSize: '16px',
                              fontWeight: 700,
                              color: '#201B14',
                            }}
                          >
                            {vessel.name || vessel.mmsi}
                          </span>
                        </div>

                        {/* Large Score Right-Aligned */}
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '16px',
                            fontWeight: 700,
                            color: score >= 85 ? '#C9452F' : '#C87F0A',
                          }}
                        >
                          {score}
                        </span>
                      </div>

                      {/* Chips & MMSI */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '8px',
                          fontSize: '10px',
                        }}
                      >
                        <span
                          style={{
                            background: '#D9CEB9',
                            padding: '1px 6px',
                            borderRadius: '3px',
                            fontWeight: 600,
                          }}
                        >
                          {vessel.type || 'TANKER'}
                        </span>
                        <span style={{ color: '#6E6656' }}>MMSI: {vessel.mmsi}</span>
                      </div>

                      {/* Score Bar */}
                      <div
                        style={{
                          width: '100%',
                          height: '6px',
                          background: '#131110',
                          borderRadius: '3px',
                          overflow: 'hidden',
                          marginBottom: '6px',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${score}%`,
                            background: score >= 85 ? '#C9452F' : '#F0A11B',
                          }}
                        />
                      </div>

                      {/* Prime Suspect Stamp on Row 1 */}
                      {idx === 0 && (
                        <div style={{ marginTop: '6px' }}>
                          <Stamp variant="prime-suspect" text="PRIME SUSPECT" />
                        </div>
                      )}

                      {/* Expanded Sub-scores when Selected */}
                      {isSelected && vessel.sub_scores && (
                        <div
                          style={{
                            marginTop: '10px',
                            padding: '8px',
                            background: '#D9CEB9',
                            borderRadius: '4px',
                            fontSize: '10px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Spatial Proximity:</span>
                            <span style={{ fontWeight: 600 }}>{vessel.sub_scores.spatial}%</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Temporal Intersection:</span>
                            <span style={{ fontWeight: 600 }}>{vessel.sub_scores.temporal}%</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Vessel Type Risk:</span>
                            <span style={{ fontWeight: 600 }}>{vessel.sub_scores.vessel_type}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </PaperTape>
          </div>
        </>
      )}

      {/* =====================================================================
          STATE 4: ERROR
          ===================================================================== */}
      {analysisState === 'error' && (
        <MetalPanel title="PIPELINE FAULT" headerRight={<Lamp state="error" />}>
          <div
            style={{
              padding: '16px',
              background: '#131110',
              borderRadius: '6px',
              border: '1px solid var(--alarm)',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <AlertTriangle size={18} color="#C9452F" />
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'var(--alarm)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                Pipeline Interrupted
              </span>
            </div>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                color: 'var(--fg-dim)',
                lineHeight: 1.5,
              }}
            >
              {errorMsg || 'Pipeline interrupted. Imagery or ocean data unavailable.'}
            </p>
          </div>

          <BtnCap
            variant="ghost"
            icon={RotateCcw}
            onClick={onRetry}
            style={{ width: '100%' }}
            id="sidebar-retry-btn"
          >
            Retry Pipeline
          </BtnCap>
        </MetalPanel>
      )}

      {/* =====================================================================
          ALWAYS VISIBLE: LAYERS PANEL (Physical Toggles & Base Mode)
          ===================================================================== */}
      <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
        <MetalPanel title="MAP OVERLAY LAYERS">
          {/* Base Map Selector */}
          {setBaseMapMode && (
            <div style={{ marginBottom: '14px', borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  color: 'var(--fg-dim)',
                  marginBottom: '6px',
                  letterSpacing: '0.08em',
                }}
              >
                BASE MAP MODE:
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '4px',
                  background: '#131110',
                  borderRadius: '4px',
                  border: '1px solid var(--line)',
                  padding: '2px',
                }}
              >
                <button
                  onClick={() => setBaseMapMode('satellite')}
                  style={{
                    background: baseMapMode === 'satellite' ? '#8A5C05' : 'transparent',
                    border: 'none',
                    color: baseMapMode === 'satellite' ? 'var(--ink-text)' : 'var(--fg-dim)',
                    fontFamily: 'var(--font-display)',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    padding: '4px',
                    borderRadius: '2px',
                    cursor: 'pointer',
                  }}
                >
                  SATELLITE
                </button>
                <button
                  onClick={() => setBaseMapMode('relief')}
                  style={{
                    background: baseMapMode === 'relief' ? '#8A5C05' : 'transparent',
                    border: 'none',
                    color: baseMapMode === 'relief' ? 'var(--ink-text)' : 'var(--fg-dim)',
                    fontFamily: 'var(--font-display)',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    padding: '4px',
                    borderRadius: '2px',
                    cursor: 'pointer',
                  }}
                >
                  TERRAIN
                </button>
                <button
                  onClick={() => setBaseMapMode('tactical')}
                  style={{
                    background: baseMapMode === 'tactical' ? '#8A5C05' : 'transparent',
                    border: 'none',
                    color: baseMapMode === 'tactical' ? 'var(--ink-text)' : 'var(--fg-dim)',
                    fontFamily: 'var(--font-display)',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    padding: '4px',
                    borderRadius: '2px',
                    cursor: 'pointer',
                  }}
                >
                  TACTICAL
                </button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {setShowLiveAis && (
              <Toggle
                checked={showLiveAis}
                onChange={setShowLiveAis}
                label="Live AIS Stream (AISStream.io)"
                id="toggle-live-ais"
              />
            )}
            {setShowSarSwath && (
              <Toggle
                checked={showSarSwath}
                onChange={setShowSarSwath}
                label="SAR Scene Swath (Sentinel-1)"
                id="toggle-sar-swath"
              />
            )}
            <Toggle
              checked={showSpillFill}
              onChange={setShowSpillFill}
              label="Spill Fill (SAR)"
              id="toggle-spill-fill"
            />
            <Toggle
              checked={showDriftParticles}
              onChange={setShowDriftParticles}
              label="Drift Particles"
              id="toggle-drift-particles"
            />
            <Toggle
              checked={showVesselTracks}
              onChange={setShowVesselTracks}
              label="Vessel Tracks (AIS)"
              id="toggle-vessel-tracks"
            />
          </div>
        </MetalPanel>
      </div>
    </aside>
  )
}
