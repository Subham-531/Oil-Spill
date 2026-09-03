import React from 'react'
import { X, FileDown, ShieldCheck, Printer } from 'lucide-react'
import PaperTape from '../primitives/PaperTape'
import Stamp from '../primitives/Stamp'
import BtnCap from '../primitives/BtnCap'

/**
 * EvidencePdfModal — Forensic Evidence Dossier Modal
 * Previews the official signed and timestamped evidence dossier.
 */
export default function EvidencePdfModal({ isOpen, onClose, onDownload }) {
  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(2px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '540px',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '-16px',
            right: '-16px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#26221C',
            border: '1px solid var(--line)',
            color: 'var(--fg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
          }}
          title="Close preview"
        >
          <X size={16} />
        </button>

        <PaperTape
          header="SWACHH TRACK // OFFICIAL MARITIME FORENSIC DOSSIER"
          tilt={false}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#201B14' }}>
                INCIDENT REPORT: INCIDENT-2024-001
              </div>
              <div style={{ fontSize: '10px', color: '#6E6656' }}>
                MARPOL ANNEX I TRIBUNAL COMPLIANT
              </div>
            </div>
            <Stamp variant="complete" text="COMPLETE" />
          </div>

          <div style={{ fontSize: '11px', lineHeight: 1.8, marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #B7AC93' }}>
              <span>DETECTION ENGINE:</span>
              <span style={{ fontWeight: 600 }}>PYTORCH U-NET SAR SEGMENTATION</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #B7AC93' }}>
              <span>OCEAN DRIFT MODEL:</span>
              <span style={{ fontWeight: 600 }}>OPENDRIFT LAGRANGIAN (CMEMS/ERA5)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #B7AC93' }}>
              <span>CORRELATION DATABASE:</span>
              <span style={{ fontWeight: 600 }}>7.28M AIS RECORDS (DUCKDB)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #B7AC93' }}>
              <span>SLICK CENTROID:</span>
              <span style={{ fontWeight: 600 }}>19.4974° N, 72.5443° E</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #B7AC93' }}>
              <span>RECONSTRUCTED ORIGIN:</span>
              <span style={{ fontWeight: 600 }}>19.3642° N, 72.5394° E</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>SURFACE EXTENT:</span>
              <span style={{ fontWeight: 600 }}>8.48 KM² (CONFIDENCE: 88%)</span>
            </div>
          </div>

          {/* Prime Suspect Card */}
          <div
            style={{
              padding: '12px',
              background: '#E2D7C3',
              borderRadius: '4px',
              border: '1px solid #C9BFA9',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <Stamp variant="prime-suspect" text="PRIME SUSPECT" />
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#C9452F' }}>
                SUSPICION SCORE: 94/100
              </span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700 }}>
              MT STEALTH VOYAGER
            </div>
            <div style={{ fontSize: '11px', color: '#6E6656' }}>
              MMSI: 419001234 · TYPE: CRUDE OIL TANKER · FLAG: PANAMA
            </div>
          </div>

          <div
            style={{
              fontSize: '10px',
              color: '#6E6656',
              marginBottom: '20px',
              padding: '8px',
              background: '#DFD4BE',
              borderRadius: '4px',
              fontFamily: 'var(--font-mono)',
            }}
          >
            DIGITAL HASH: SHA-256 e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <BtnCap
              variant="alarm"
              icon={FileDown}
              onClick={onDownload}
              style={{ flex: 1 }}
            >
              Download PDF Report
            </BtnCap>

            <BtnCap
              variant="ghost"
              icon={Printer}
              onClick={() => window.print()}
              style={{ flex: 1 }}
            >
              Print Dossier
            </BtnCap>
          </div>
        </PaperTape>
      </div>
    </div>
  )
}
