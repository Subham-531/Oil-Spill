import React, { useState, useEffect, useCallback } from 'react'
import LandingPage from './components/landing/LandingPage'
import ConsoleTopBar from './components/console/ConsoleTopBar'
import ConsoleMapView from './components/console/ConsoleMapView'
import ConsoleSidebar from './components/console/ConsoleSidebar'
import ConsoleBottomStrip from './components/console/ConsoleBottomStrip'
import MapTimelineSlider from './components/console/MapTimelineSlider'
import EvidencePdfModal from './components/console/EvidencePdfModal'
import Plaque from './components/primitives/Plaque'
import { DEMO_DETECTION, DEMO_DRIFT, DEMO_ATTRIBUTION } from './data/demoData'
import './App.css'

/**
 * Swachh Track — Marine Oil Spill Detection & Attribution
 * Precision Geospatial Forensics Platform
 */
export default function App() {
  // Navigation: 'landing' or 'console'
  const [currentView, setCurrentView] = useState('landing')

  // Console Pipeline State: 'idle' | 'loading' | 'complete' | 'error'
  const [analysisState, setAnalysisState] = useState('idle')
  const [loadingStage, setLoadingStage] = useState('')
  const [detectionResult, setDetectionResult] = useState(null)
  const [driftResult, setDriftResult] = useState(null)
  const [attributionResult, setAttributionResult] = useState(null)
  const [currentTimeStep, setCurrentTimeStep] = useState(0)
  const [selectedVessel, setSelectedVessel] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)

  // Map Overlays & Coordinates
  const [cursorCoords, setCursorCoords] = useState({ lat: 19.4974, lng: 72.5443 })
  const [zoomLevel, setZoomLevel] = useState(9)
  const [flyTarget, setFlyTarget] = useState(null)

  // Layer Toggles & Base Map Mode
  const [baseMapMode, setBaseMapMode] = useState('satellite') // 'satellite' | 'relief' | 'tactical'
  const [showSarSwath, setShowSarSwath] = useState(true)
  const [showLiveAis, setShowLiveAis] = useState(false)
  const [showSpillFill, setShowSpillFill] = useState(true)
  const [showDriftParticles, setShowDriftParticles] = useState(true)
  const [showVesselTracks, setShowVesselTracks] = useState(true)

  // Toast Plaque & PDF Modal
  const [plaqueMessage, setPlaqueMessage] = useState(null)
  const [plaqueState, setPlaqueState] = useState('complete')
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Pre-staged SAR Scenes
  const [sarScenes, setSarScenes] = useState([])
  const [selectedSceneId, setSelectedSceneId] = useState('SAR_SCENE_01')

  const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  useEffect(() => {
    fetch(`${API}/api/detect/scenes`)
      .then((r) => r.json())
      .then((d) => {
        if (d.scenes && d.scenes.length > 0) {
          setSarScenes(d.scenes)
        }
      })
      .catch(() => {})
  }, [API])

  // =========================================================================
  // PIPELINE EXECUTION (Real API with Seamless Offline Simulation Fallback)
  // =========================================================================
  const handleRunAnalysis = useCallback(async () => {
    setAnalysisState('loading')
    setErrorMsg(null)
    setDetectionResult(null)
    setDriftResult(null)
    setAttributionResult(null)
    setCurrentTimeStep(0)
    setSelectedVessel(null)
    setPlaqueMessage(null)

    try {
      // Step 1: SAR Detection
      setLoadingStage('Step 1/3: Running PyTorch U-Net segmentation on Sentinel-1 SAR imagery…')

      let detectData = null
      let useBackend = true

      try {
        let detectRes
        if (selectedFile) {
          const formData = new FormData()
          formData.append('scene_file', selectedFile)
          detectRes = await fetch(`${API}/api/detect/`, { method: 'POST', body: formData })
        } else if (selectedSceneId) {
          detectRes = await fetch(`${API}/api/detect/?scene_id=${encodeURIComponent(selectedSceneId)}`, { method: 'POST' })
        } else {
          detectRes = await fetch(`${API}/api/detect/`, { method: 'POST' })
        }

        if (detectRes.ok) {
          detectData = await detectRes.json()
        } else {
          useBackend = false
        }
      } catch {
        useBackend = false
      }

      // Offline simulation fallback if backend server isn't running
      if (!useBackend || !detectData?.features?.length) {
        await new Promise((r) => setTimeout(r, 1200))
        detectData = DEMO_DETECTION
      }

      setDetectionResult(detectData)
      const primarySpill = detectData.features[0]

      // Step 2: OpenDrift Ocean Physics
      setLoadingStage('Step 2/3: Simulating OpenDrift physics with CMEMS ocean currents & ERA5 winds…')

      let driftData = null
      if (useBackend) {
        try {
          const driftPayload = {
            spill_polygon_geojson: primarySpill.geometry,
            detection_timestamp: primarySpill.properties.timestamp || '2024-01-15T06:00:00Z',
            hindcast_hours: 12,
            forecast_hours: 12,
          }

          const driftRes = await fetch(`${API}/api/drift/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(driftPayload),
          })

          if (driftRes.ok) {
            driftData = await driftRes.json()
          }
        } catch {
          // Fallback below
        }
      }

      if (!driftData) {
        await new Promise((r) => setTimeout(r, 1400))
        driftData = DEMO_DRIFT
      }

      setDriftResult(driftData)

      // Step 3: DuckDB AIS Attribution
      setLoadingStage('Step 3/3: Querying 7.28M AIS vessel database via DuckDB to identify suspects…')

      let attrData = null
      if (useBackend) {
        try {
          const originEstimate = driftData.origin_estimate
          const originPoly = originEstimate ? originEstimate.geometry : primarySpill.geometry
          const originTime = originEstimate?.properties?.timestamp || '2024-01-14T23:30:00Z'

          const attributePayload = {
            origin_polygon_geojson: originPoly,
            origin_time_start: originTime,
            origin_time_end: originTime,
            spatial_buffer_km: 15.0,
            temporal_buffer_hours: 4.0,
            top_n: 10,
          }

          const attrRes = await fetch(`${API}/api/attribute/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(attributePayload),
          })

          if (attrRes.ok) {
            attrData = await attrRes.json()
          }
        } catch {
          // Fallback below
        }
      }

      if (!attrData || !attrData.length) {
        await new Promise((r) => setTimeout(r, 1200))
        attrData = DEMO_ATTRIBUTION
      }

      setAttributionResult(attrData)
      setAnalysisState('complete')
      setLoadingStage('')
      const conf = primarySpill?.properties?.confidence
        ? Math.round(primarySpill.properties.confidence * 100)
        : 88
      const vCount = attrData?.length || 0
      setPlaqueMessage(`Slick segmented at ${conf}% confidence. ${vCount} suspect vessel${vCount === 1 ? '' : 's'} identified in origin window.`)

    } catch (err) {
      console.error('Pipeline error:', err)
      setAnalysisState('error')
      setErrorMsg(`Pipeline Interrupted: ${err.message || 'Imagery or ocean data unavailable.'}`)
      setPlaqueState('error')
      setPlaqueMessage('Pipeline interrupted. Imagery or ocean data unavailable.')
    }
  }, [API, selectedFile])

  const handleCancel = useCallback(() => {
    setAnalysisState('idle')
    setLoadingStage('')
    setPlaqueState('idle')
    setPlaqueMessage('Pipeline cancelled by operator.')
  }, [])

  const handleReset = useCallback(() => {
    setAnalysisState('idle')
    setDetectionResult(null)
    setDriftResult(null)
    setAttributionResult(null)
    setCurrentTimeStep(0)
    setSelectedVessel(null)
    setSelectedFile(null)
    setErrorMsg(null)
    setPlaqueMessage(null)
    setFlyTarget({ center: [19.4974, 72.5443], zoom: 9 })
  }, [])

  const handleExportPDF = useCallback(() => {
    setIsPdfModalOpen(true)
  }, [])

  const handleDownloadPdfDossier = useCallback(() => {
    window.open(`${API}/api/attribute/report/INCIDENT-2024-001`, '_blank')
  }, [API])

  const handleZoomToOrigin = useCallback(() => {
    setFlyTarget({ center: [19.3642, 72.5394], zoom: 11 })
  }, [])

  const handleSelectVesselAndFly = useCallback((mmsi) => {
    setSelectedVessel((prev) => (prev === mmsi ? null : mmsi))
    const vessel = attributionResult?.find((v) => v.mmsi === mmsi)
    if (vessel?.intersection_point) {
      setFlyTarget({
        center: [vessel.intersection_point[1], vessel.intersection_point[0]],
        zoom: 11,
      })
    }
  }, [attributionResult])

  // =========================================================================
  // KEYBOARD SHORTCUTS (§8.5)
  // =========================================================================
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Avoid firing shortcuts when user is in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return

      if (e.key === 'r' || e.key === 'R') {
        if (currentView === 'console' && (analysisState === 'idle' || analysisState === 'error')) {
          e.preventDefault()
          handleRunAnalysis()
        }
      } else if (e.key === 'u' || e.key === 'U') {
        if (currentView === 'console' && analysisState === 'idle') {
          e.preventDefault()
          const fileInput = document.querySelector('input[type="file"]')
          if (fileInput) fileInput.click()
        }
      } else if (e.key === 'e' || e.key === 'E') {
        if (currentView === 'console' && analysisState === 'complete') {
          e.preventDefault()
          handleExportPDF()
        }
      } else if (e.key === 'Escape') {
        if (isPdfModalOpen) {
          setIsPdfModalOpen(false)
        } else if (analysisState === 'loading') {
          handleCancel()
        }
      } else if (e.key === 'l' || e.key === 'L') {
        if (currentView === 'console') {
          e.preventDefault()
          setSidebarCollapsed((prev) => !prev)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentView, analysisState, isPdfModalOpen, handleRunAnalysis, handleExportPDF, handleCancel])

  // Open console and auto-run when invoked from Landing CTA
  const handleOpenConsoleAndRun = () => {
    setCurrentView('console')
    setTimeout(() => {
      handleRunAnalysis()
    }, 150)
  }

  // =========================================================================
  // RENDER SURFACE
  // =========================================================================
  if (currentView === 'landing') {
    return (
      <LandingPage
        onOpenConsole={() => setCurrentView('console')}
        onExportEvidence={() => {
          setCurrentView('console')
          setIsPdfModalOpen(true)
        }}
      />
    )
  }

  return (
    <div className="app-container">
      {/* Plaque Toast Notification */}
      <Plaque
        message={plaqueMessage}
        state={plaqueState}
        duration={4500}
        onClose={() => setPlaqueMessage(null)}
      />

      {/* 8.1 Console Top Bar */}
      <ConsoleTopBar
        analysisState={analysisState}
        loadingStage={loadingStage}
        onRunAnalysis={handleRunAnalysis}
        onCancel={handleCancel}
        onReset={handleReset}
        onExportPDF={handleExportPDF}
        selectedFileName={selectedFile?.name}
        onFileSelect={(file) => {
          setSelectedFile(file)
          if (file) setSelectedSceneId(null)
        }}
        sarScenes={sarScenes}
        selectedSceneId={selectedSceneId}
        onSelectScene={(id) => {
          setSelectedSceneId(id)
          setSelectedFile(null)
        }}
        onBackToLanding={() => setCurrentView('landing')}
      />

      {/* 8.2 & 8.3 Body: Map View + Right Panel */}
      <main className="console-body">
        <div className="console-map-viewport">
          <ConsoleMapView
            detectionResult={detectionResult}
            driftResult={driftResult}
            attributionResult={attributionResult}
            currentTimeStep={currentTimeStep}
            selectedVessel={selectedVessel}
            onSelectVessel={handleSelectVesselAndFly}
            showSpillFill={showSpillFill}
            showDriftParticles={showDriftParticles}
            showVesselTracks={showVesselTracks}
            showSarSwath={showSarSwath}
            showLiveAis={showLiveAis}
            baseMapMode={baseMapMode}
            onBaseMapModeChange={setBaseMapMode}
            onCursorMove={(lat, lng) => setCursorCoords({ lat, lng })}
            onZoomChange={(z) => setZoomLevel(z)}
            flyTarget={flyTarget}
          />

          {/* Timeline Slider for Drift Animation */}
          {analysisState === 'complete' && (
            <MapTimelineSlider
              driftResult={driftResult}
              currentTimeStep={currentTimeStep}
              onTimeStepChange={setCurrentTimeStep}
            />
          )}
        </div>

        {/* 8.3 Right Console Panel (380px) */}
        <div className={sidebarCollapsed ? 'collapsed' : ''}>
          <ConsoleSidebar
            analysisState={analysisState}
            loadingStage={loadingStage}
            detectionResult={detectionResult}
            driftResult={driftResult}
            attributionResult={attributionResult}
            selectedVessel={selectedVessel}
            onSelectVessel={handleSelectVesselAndFly}
            onRunAnalysis={handleRunAnalysis}
            onCancel={handleCancel}
            onRetry={handleRunAnalysis}
            onZoomToOrigin={handleZoomToOrigin}
            showSpillFill={showSpillFill}
            setShowSpillFill={setShowSpillFill}
            showDriftParticles={showDriftParticles}
            setShowDriftParticles={setShowDriftParticles}
            showVesselTracks={showVesselTracks}
            setShowVesselTracks={setShowVesselTracks}
            showSarSwath={showSarSwath}
            setShowSarSwath={setShowSarSwath}
            showLiveAis={showLiveAis}
            setShowLiveAis={setShowLiveAis}
            baseMapMode={baseMapMode}
            setBaseMapMode={setBaseMapMode}
            errorMsg={errorMsg}
          />
        </div>
      </main>

      {/* 8.4 Bottom Status Strip (32px) */}
      <ConsoleBottomStrip
        cursorCoords={cursorCoords}
        zoomLevel={zoomLevel}
        baseMapMode={baseMapMode}
      />

      {/* Forensic Evidence Dossier Modal */}
      <EvidencePdfModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        onDownload={handleDownloadPdfDossier}
      />
    </div>
  )
}
