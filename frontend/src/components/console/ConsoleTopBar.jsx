import React, { useRef } from 'react'
import {
  Radar,
  Upload,
  Play,
  Square,
  FileDown,
  RotateCcw,
  Compass,
} from 'lucide-react'
import Lamp from '../primitives/Lamp'
import BtnCap from '../primitives/BtnCap'

/**
 * ConsoleTopBar — Section 8.1
 * Metal-panel top bar (no radius, 64px height).
 * Left: radar mark + title + engraved mono subline.
 * Center: .lamp + status word + running step progress.
 * Right: Upload SAR [ghost] · Run Live [primary] / Cancel [ghost] · Export Evidence [alarm] · Reset [ghost].
 */
export default function ConsoleTopBar({
  analysisState = 'idle', // 'idle' | 'loading' | 'complete' | 'error'
  loadingStage = '',
  onRunAnalysis,
  onCancel,
  onReset,
  onExportPDF,
  selectedFileName = null,
  onFileSelect,
  sarScenes = [],
  selectedSceneId = null,
  onSelectScene,
  onBackToLanding,
}) {
  const fileInputRef = useRef(null)

  const statusConfig = {
    idle: { word: 'READY', lamp: 'idle' },
    loading: { word: 'PROCESSING', lamp: 'run' },
    complete: { word: 'COMPLETE', lamp: 'complete' },
    error: { word: 'ERROR', lamp: 'error' },
  }

  const currentStatus = statusConfig[analysisState] || statusConfig.idle

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0])
    }
  }

  return (
    <header
      style={{
        height: '64px',
        borderBottom: '1px solid var(--line)',
        background: 'linear-gradient(180deg, #26221C 0%, #1D1A16 100%)',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 8px 20px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'relative',
        zIndex: 50,
      }}
    >
      {/* Left: Radar Mark & Brand Subline */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          onClick={onBackToLanding}
          title="Return to Landing Page"
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
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

          <div style={{ textAlign: 'left' }}>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '18px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--fg)',
                lineHeight: 1.1,
              }}
            >
              SWACHH TRACK
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                fontWeight: 500,
                letterSpacing: '0.12em',
                color: 'var(--fg-dim)',
                marginTop: '2px',
              }}
            >
              REAL PYTORCH U-NET · OPENDRIFT · 7.28M AIS DATABASE
            </div>
          </div>
        </button>
      </div>

      {/* Center: Lamp + Status Word + Progress Text */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '6px 16px',
          background: '#131110',
          borderRadius: 'var(--radius-pill)',
          border: '1px solid var(--line)',
        }}
        aria-live="polite"
      >
        <Lamp state={currentStatus.lamp} />
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: currentStatus.lamp === 'error' ? 'var(--alarm)' : 'var(--fg)',
          }}
        >
          {currentStatus.word}
        </span>

        {analysisState === 'loading' && (
          <>
            <span style={{ color: 'var(--line)' }}>|</span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--signal)',
                letterSpacing: '0.04em',
              }}
            >
              {loadingStage || 'STEP 2/3 — OPENDRIFT DRIFT BACK-CAST'}
            </span>
          </>
        )}
      </div>

      {/* Right Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Hidden GeoTIFF file input */}
        <input
          type="file"
          ref={fileInputRef}
          accept=".tif,.tiff"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {/* Pre-staged SAR Scene Selector */}
        {analysisState === 'idle' && sarScenes && sarScenes.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <select
              value={selectedSceneId || ''}
              onChange={(e) => onSelectScene && onSelectScene(e.target.value)}
              title="Select one of 8 pre-staged Sentinel-1 SAR surveillance scenes"
              id="sar-scene-dropdown"
              style={{
                height: '36px',
                padding: '0 12px',
                background: 'linear-gradient(180deg, #2A251E 0%, #1D1A16 100%)',
                border: '1px solid var(--line)',
                borderRadius: '4px',
                color: '#F5B23C',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 2px 4px rgba(0, 0, 0, 0.3)',
              }}
            >
              {sarScenes.map((sc) => (
                <option
                  key={sc.id}
                  value={sc.id}
                  style={{ background: '#1D1A16', color: '#EDE4D3' }}
                >
                  {sc.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Upload Custom SAR (.tif) button [ghost] */}
        {analysisState === 'idle' && (
          <BtnCap
            variant="ghost"
            icon={Upload}
            onClick={() => fileInputRef.current?.click()}
            title="Upload Custom Sentinel-1 SAR GeoTIFF (Keyboard: U)"
            id="console-upload-btn"
          >
            {selectedFileName
              ? selectedFileName.length > 12
                ? `${selectedFileName.slice(0, 10)}…`
                : selectedFileName
              : 'Upload SAR (.tif)'}
          </BtnCap>
        )}

        {/* Run Analysis [primary] or Cancel [ghost] */}
        {analysisState === 'loading' ? (
          <BtnCap
            variant="ghost"
            icon={Square}
            onClick={onCancel}
            title="Cancel analysis (Keyboard: Esc)"
            id="console-cancel-btn"
          >
            Cancel
          </BtnCap>
        ) : (
          <BtnCap
            variant="primary"
            icon={Play}
            onClick={onRunAnalysis}
            title="Run Live Analysis (Keyboard: R)"
            id="console-run-btn"
          >
            Run Live Analysis
          </BtnCap>
        )}

        {/* Completed State Extra Actions: Export Evidence (PDF) [alarm] & Reset */}
        {analysisState === 'complete' && (
          <>
            <BtnCap
              variant="alarm"
              icon={FileDown}
              onClick={onExportPDF}
              title="Export Forensic PDF Dossier (Keyboard: E)"
              id="console-export-pdf-btn"
            >
              Export Evidence (PDF)
            </BtnCap>

            <BtnCap
              variant="ghost"
              icon={RotateCcw}
              onClick={onReset}
              title="Reset Console"
              id="console-reset-btn"
            >
              Reset
            </BtnCap>
          </>
        )}

        {/* Return to Landing link */}
        <button
          onClick={onBackToLanding}
          style={{
            marginLeft: '4px',
            background: 'none',
            border: 'none',
            fontFamily: 'var(--font-display)',
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
            color: 'var(--fg-dim)',
            cursor: 'pointer',
            padding: '8px',
          }}
          title="Switch to Landing View"
        >
          Landing
        </button>
      </div>
    </header>
  )
}
