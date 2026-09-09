import React, { useState, useRef } from 'react';
import { X, Upload, CheckCircle2, AlertTriangle, XCircle, FileText, Cpu, ShieldCheck, Download, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { samplePreloads } from '../data/bidsData';
import { useLanguage } from '../context/LanguageContext';
import { gemApi } from '../services/api';

export default function BidVerificationModal({ isOpen, onClose, onAddVerifiedBid }) {
  if (!isOpen) return null;

  const { t } = useLanguage();
  const fileInputRef = useRef(null);
  const [bidForm, setBidForm] = useState({
    vendorName: '',
    tenderId: '',
    category: '',
    bidAmount: '',
    gstin: '',
    pan: '',
    miiDeclared: '',
    turnoverClaim: '',
    msmeRegNo: '',
    experienceClaim: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanStep, setScanStep] = useState(0); // 0: Idle, 1: OCR, 2: Rule Engine, 3: Scored
  const [result, setResult] = useState(null);

  const stepsList = [
    "Ingesting documents & running EasyOCR / Tesseract...",
    "Extracting GSTIN, PAN, ITR Turnover & Local Content...",
    "Validating against GFR 2017 & DPIIT Rules (210 checks)...",
    "Running OpenCV forensics & Anomaly ML Scoring..."
  ];

  const handlePreload = (type) => {
    if (type === 'perfect') setBidForm(samplePreloads.perfectBid);
    if (type === 'flagged') setBidForm(samplePreloads.flaggedBid);
    if (type === 'fraud') setBidForm(samplePreloads.fraudBid);
    setResult(null);
    setScanStep(0);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      try {
        const uploadRes = await gemApi.uploadDocument(file);
        console.log('[GeM OCR Forensics] Document parsed:', uploadRes);
        if (uploadRes.fileId) {
          setBidForm(prev => ({ ...prev, fileId: uploadRes.fileId }));
        }
      } catch (err) {
        console.warn('OCR upload inspection:', err);
      }
    }
  };

  const isValidPAN = (pan) => /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan);
  const isValidGSTIN = (gstin) => /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(gstin);
  const isValidTenderId = (tenderId) => /^GEM\/[0-9]{4}\/[A-Z]\/[0-9]{6}$/.test(tenderId);

  const getValidationState = (value, validator) => {
    if (!value) return null;
    return validator(value) ? 'valid' : 'invalid';
  };

  const tenderIdState = getValidationState(bidForm.tenderId, isValidTenderId);
  const gstinState = getValidationState(bidForm.gstin, isValidGSTIN);
  const panState = getValidationState(bidForm.pan, isValidPAN);

  const renderValidationMsg = (state, invalidMsg) => {
    if (state === null) return <span style={{fontSize: '0.7rem', color: '#f59e0b', display: 'block', marginTop: '0.25rem'}}>⚠ Required</span>;
    if (state === 'valid') return <span style={{fontSize: '0.7rem', color: '#10b981', display: 'block', marginTop: '0.25rem'}}>✓ Valid format</span>;
    return <span style={{fontSize: '0.7rem', color: '#ef4444', display: 'block', marginTop: '0.25rem'}}>✕ {invalidMsg}</span>;
  };

  const isFormValid = bidForm.vendorName && tenderIdState === 'valid' && gstinState === 'valid' && panState === 'valid';

  const handleStartVerification = async () => {
    if (!isFormValid) {
      setResult({
        error: true,
        message: "Validation Error: Ensure all required fields have a valid format before proceeding."
      });
      return;
    }

    setIsProcessing(true);
    setScanStep(1);
    setResult(null);

    // Step animations
    setTimeout(() => setScanStep(2), 600);
    setTimeout(() => setScanStep(3), 1200);

    try {
      // Call live FastAPI backend verification
      const evalResult = await gemApi.verifyBid(bidForm);

      setTimeout(() => {
        setIsProcessing(false);
        setScanStep(4);
        setResult(evalResult);

        if (evalResult.status === 'Compliant') {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 }
          });
        }

        if (onAddVerifiedBid) {
          onAddVerifiedBid(evalResult);
        }
      }, 1800);
    } catch (err) {
      console.warn('Verification error, fallback:', err);
      setIsProcessing(false);
      
      let errorMsg = "Verification service unavailable. Please ensure backend is running.";
      if (err.message && err.message !== "Failed to fetch") {
        errorMsg = err.message;
      }
      
      setResult({
        error: true,
        message: errorMsg
      });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '920px' }}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <span className="section-tag" style={{ marginBottom: '0.2rem' }}>{t('verifierTag')}</span>
            <h3 className="modal-title">{t('verifierTitle')}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Quick Preload Presets */}
          <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '0.5rem' }}>
              {t('selectScenario')}
            </span>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handlePreload('perfect')}
                style={{
                  padding: '0.35rem 0.85rem',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  borderRadius: '6px',
                  border: '1px solid #10b981',
                  backgroundColor: '#ecfdf5',
                  color: '#065f46',
                  cursor: 'pointer'
                }}
              >
                {t('scenarioPerfect')}
              </button>
              <button
                type="button"
                onClick={() => handlePreload('flagged')}
                style={{
                  padding: '0.35rem 0.85rem',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  borderRadius: '6px',
                  border: '1px solid #f59e0b',
                  backgroundColor: '#fffbeb',
                  color: '#92400e',
                  cursor: 'pointer'
                }}
              >
                {t('scenarioFlagged')}
              </button>
              <button
                type="button"
                onClick={() => handlePreload('fraud')}
                style={{
                  padding: '0.35rem 0.85rem',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  borderRadius: '6px',
                  border: '1px solid #ef4444',
                  backgroundColor: '#fef2f2',
                  color: '#991b1b',
                  cursor: 'pointer'
                }}
              >
                {t('scenarioFraud')}
              </button>
            </div>
          </div>

          {/* Form & Upload Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
            {/* Left: Metadata Inputs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                    {t('vendorNameLabel')} <span style={{color: '#ef4444'}}>*</span>
                  </label>
                  <input
                    type="text"
                    value={bidForm.vendorName}
                    onChange={(e) => setBidForm({ ...bidForm, vendorName: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                    Tender ID <span style={{color: '#ef4444'}}>*</span>
                  </label>
                  <input
                    type="text"
                    value={bidForm.tenderId}
                    onChange={(e) => setBidForm({ ...bidForm, tenderId: e.target.value.trim().toUpperCase() })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                  {renderValidationMsg(tenderIdState, "Expected GEM/YYYY/X/NNNNNN, e.g. GEM/2026/B/891244")}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                    {t('tenderCategoryLabel')}
                  </label>
                  <input
                    type="text"
                    value={bidForm.category}
                    onChange={(e) => setBidForm({ ...bidForm, category: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                    {t('bidAmountLabel')}
                  </label>
                  <input
                    type="text"
                    value={bidForm.bidAmount}
                    onChange={(e) => setBidForm({ ...bidForm, bidAmount: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                    {t('gstinLabel')} <span style={{color: '#ef4444'}}>*</span>
                  </label>
                  <input
                    type="text"
                    value={bidForm.gstin}
                    onChange={(e) => setBidForm({ ...bidForm, gstin: e.target.value.trim().toUpperCase() })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem', fontFamily: 'monospace' }}
                  />
                  {renderValidationMsg(gstinState, "Enter a valid 15-character GSTIN")}
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                    {t('panLabel')} <span style={{color: '#ef4444'}}>*</span>
                  </label>
                  <input
                    type="text"
                    value={bidForm.pan}
                    onChange={(e) => setBidForm({ ...bidForm, pan: e.target.value.trim().toUpperCase() })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem', fontFamily: 'monospace' }}
                  />
                  {renderValidationMsg(panState, "Expected 5 letters, 4 digits, and 1 letter (e.g. ABCDE1234F)")}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                    {t('miiLabel')}
                  </label>
                  <input
                    type="text"
                    value={bidForm.miiDeclared}
                    onChange={(e) => setBidForm({ ...bidForm, miiDeclared: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                    {t('turnoverLabel')}
                  </label>
                  <input
                    type="text"
                    value={bidForm.turnoverClaim}
                    onChange={(e) => setBidForm({ ...bidForm, turnoverClaim: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                </div>
              </div>
            </div>

            {/* Right: Drag & Drop Upload Zone */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569' }}>
                {t('uploadTitle')}
              </label>
              <div
                style={{
                  border: '2px dashed #94a3b8',
                  borderRadius: '10px',
                  padding: '1.5rem 1rem',
                  textAlign: 'center',
                  backgroundColor: '#f8fafc',
                  cursor: 'pointer',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'border-color 0.2s ease'
                }}
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.click();
                  } else {
                    setSelectedFile({ name: `${bidForm.vendorName.replace(/\s+/g, '_')}_Docs_Bundle.pdf`, size: "4.8 MB" });
                  }
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  accept=".pdf,.png,.jpg,.jpeg"
                />
                <Upload size={32} color="#0f2847" style={{ marginBottom: '0.5rem' }} />
                <span style={{ fontSize: '0.88rem', fontWeight: '600', color: '#0f172a' }}>
                  {selectedFile ? selectedFile.name : 'Click to Upload or Drag & Drop'}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                  {t('uploadHint')}
                </span>
              </div>

              <button
                type="button"
                onClick={handleStartVerification}
                disabled={isProcessing}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  backgroundColor: '#0b1a2d',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  fontWeight: '700',
                  border: 'none',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(11, 26, 45, 0.25)'
                }}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="animate-spin" size={18} />
                    {t('analyzingText')}
                  </>
                ) : (
                  <>
                    <Cpu size={18} />
                    {t('runVerification')}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Processing Animation Step Banner */}
          {isProcessing && (
            <div style={{ backgroundColor: '#0f2238', color: '#ffffff', padding: '1rem 1.25rem', borderRadius: '8px', border: '1px solid #1e385b' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#7dd3fc', fontFamily: 'monospace' }}>
                  {stepsList[scanStep - 1] || "Processing..."}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#f5a623', fontWeight: '700' }}>
                  {scanStep * 25}% Complete
                </span>
              </div>
              <div style={{ width: '100%', height: '4px', backgroundColor: '#1e385b', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ width: `${scanStep * 25}%`, height: '100%', backgroundColor: '#f59e0b', transition: 'width 0.4s ease' }}></div>
              </div>
            </div>
          )}

          {/* Error Message Panel */}
          {result && result.error && !isProcessing && (
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '1.5rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <AlertTriangle size={24} />
              <span style={{ fontSize: '0.95rem', fontWeight: '600' }}>{result.message}</span>
            </div>
          )}

          {/* Verification Results Panel */}
          {result && !result.error && !isProcessing && (
            <div style={{ backgroundColor: '#081729', border: '1px solid #1e385b', borderRadius: '12px', padding: '1.5rem', color: '#ffffff' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #162c47', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#7dd3fc', fontFamily: 'monospace' }}>
                    AUDIT REPORT #{result.bidId}
                  </span>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0.2rem 0' }}>
                    {result.vendor}
                  </h4>
                  <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                    Tender: {result.tenderId} | Category: {result.category}
                  </span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '2rem', fontWeight: '900', fontFamily: 'Lora, serif', color: result.status === 'Compliant' ? '#34d399' : result.status === 'Flagged' ? '#fbbf24' : '#f87171' }}>
                    {result.score}<span style={{ fontSize: '1rem', color: '#94a3b8' }}>/100</span>
                  </div>
                  <span
                    className={`d-status-badge ${result.status.toLowerCase()}`}
                    style={{ fontSize: '0.82rem', padding: '0.25rem 0.75rem' }}
                  >
                    {result.status === 'Compliant' ? t('compliant') : result.status === 'Flagged' ? t('flagged') : t('rejected')}
                  </span>
                </div>
              </div>

              {/* Grid of Verified Parameters */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ backgroundColor: '#0f2238', padding: '0.75rem', borderRadius: '6px', border: '1px solid #1e385b' }}>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>{t('localContent')}</span>
                  <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#ffffff' }}>{result.miiVerified}</span>
                </div>
                <div style={{ backgroundColor: '#0f2238', padding: '0.75rem', borderRadius: '6px', border: '1px solid #1e385b' }}>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>GST & Tax Standing</span>
                  <span style={{ fontSize: '0.88rem', fontWeight: '700', color: result.gstVerified === 'LOCAL_VALIDATION_PASSED' || result.gstVerified === 'EXTERNAL_VERIFICATION_NOT_CONFIGURED' ? '#34d399' : result.gstVerified === 'MISSING_EVIDENCE' ? '#fbbf24' : '#f87171' }}>{result.gstVerified}</span>
                </div>
                <div style={{ backgroundColor: '#0f2238', padding: '0.75rem', borderRadius: '6px', border: '1px solid #1e385b' }}>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>{t('ocrConfidence')}</span>
                  <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#38bdf8' }}>{result.ocrConfidence}</span>
                </div>
              </div>

              {/* Flags / Discrepancies */}
              {result.flags.length > 0 ? (
                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                    <AlertTriangle size={16} /> {t('discrepanciesTitle')} ({result.flags.length})
                  </span>
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.82rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {result.flags.map((flag, idx) => (
                      <li key={idx}>{flag}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', padding: '0.85rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontSize: '0.85rem', fontWeight: '600' }}>
                  <CheckCircle2 size={18} />
                  {t('allPassedTitle')}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    backgroundColor: 'transparent',
                    border: '1px solid #1e385b',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Download size={15} /> {t('downloadPdf')}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '0.5rem 1.25rem',
                    borderRadius: '6px',
                    backgroundColor: '#f59e0b',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  {t('doneClose')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
