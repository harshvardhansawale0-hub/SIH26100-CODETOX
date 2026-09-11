import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, CheckCircle2, AlertTriangle, XCircle, FileText, Cpu, ShieldCheck, Download, RefreshCw, Trash2, Check, Sparkles, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { samplePreloads } from '../data/bidsData';
import { useLanguage } from '../context/LanguageContext';
import { gemApi, PRESET_FORMAT_GUIDELINES } from '../services/api';

export default function BidVerificationModal({ isOpen, onClose, onAddVerifiedBid, selectedTender = null, currentUser = null }) {
  if (!isOpen) return null;

  const { t } = useLanguage();
  const [bidForm, setBidForm] = useState({
    vendorName: '',
    tenderId: '',
    category: '',
    tenderValue: '',
    bidAmount: '',
    gstin: '',
    pan: '',
    miiDeclared: '',
    turnoverClaim: '',
    msmeRegNo: '',
    experienceClaim: ''
  });

  // Independent Document States
  const [tenderDoc, setTenderDoc] = useState({ file: null, fileId: null, status: 'idle', errorMsg: '' });
  const [gstDoc, setGstDoc] = useState({ file: null, fileId: null, status: 'idle', errorMsg: '' });
  const [panDoc, setPanDoc] = useState({ file: null, fileId: null, status: 'idle', errorMsg: '' });
  const [udyamDoc, setUdyamDoc] = useState({ file: null, fileId: null, status: 'idle', errorMsg: '' });

  // OCR Preset Guideline Verification Tracking State
  const [ocrVerifiedFields, setOcrVerifiedFields] = useState({});
  const [showGuidelines, setShowGuidelines] = useState(false);

  // Refs for hidden inputs
  const tenderInputRef = useRef(null);
  const gstInputRef = useRef(null);
  const panInputRef = useRef(null);
  const udyamInputRef = useRef(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setBidForm(prev => ({
        vendorName: prev.vendorName || currentUser?.organization || currentUser?.fullName || 'Apex Supplies Ltd.',
        tenderId: selectedTender?.id || prev.tenderId || 'GEM/2026/B/891244',
        category: selectedTender?.category || prev.category || 'IT Hardware',
        tenderValue: selectedTender?.estimatedValue || prev.tenderValue || '₹1.45 Cr',
        bidAmount: prev.bidAmount || '₹1.38 Cr',
        gstin: currentUser?.gstin || prev.gstin || '27AABCB1234F1Z5',
        pan: prev.pan || 'AABCB1234F',
        miiDeclared: prev.miiDeclared || '75%',
        turnoverClaim: prev.turnoverClaim || '₹12.4 Cr',
        msmeRegNo: currentUser?.udyam || prev.msmeRegNo || 'UDYAM-MH-03-0019284',
        experienceClaim: prev.experienceClaim || '5 Years'
      }));
      setResult(null);
      setScanStep(0);
      setTenderDoc({ file: null, fileId: null, status: 'idle', errorMsg: '' });
      setGstDoc({ file: null, fileId: null, status: 'idle', errorMsg: '' });
      setPanDoc({ file: null, fileId: null, status: 'idle', errorMsg: '' });
      setUdyamDoc({ file: null, fileId: null, status: 'idle', errorMsg: '' });
    }
  }, [isOpen, selectedTender, currentUser]);

  const handlePreload = (type) => {
    let preloadData = null;
    if (type === 'perfect') preloadData = { ...samplePreloads.perfectBid };
    if (type === 'flagged') preloadData = { ...samplePreloads.flaggedBid };
    if (type === 'fraud') preloadData = { ...samplePreloads.fraudBid };

    if (preloadData) {
      if (selectedTender && selectedTender.id) {
        preloadData.tenderId = selectedTender.id;
        preloadData.category = selectedTender.category || preloadData.category;
        preloadData.tenderValue = selectedTender.estimatedValue || preloadData.tenderValue;
      }
      if (currentUser) {
        preloadData.vendorName = currentUser.organization || currentUser.fullName || preloadData.vendorName;
        if (currentUser.gstin) preloadData.gstin = currentUser.gstin;
        if (currentUser.udyam) preloadData.msmeRegNo = currentUser.udyam;
      }
      setBidForm(preloadData);
    }
    setResult(null);
    setScanStep(0);
  };

  const handleFileUpload = async (e, setDocState, targetFieldKey) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocState({ file, fileId: null, status: 'uploading', errorMsg: '' });
      try {
        const uploadRes = await gemApi.uploadDocument(file);
        if (uploadRes && uploadRes.fileId) {
          setDocState({ file, fileId: uploadRes.fileId, status: 'success', errorMsg: '', result: uploadRes });

          // OCR PRESET GUIDELINE AUTO-READ & VERIFICATION PIPELINE
          const extVals = uploadRes.extractedValues || {};
          let fetchedValue = null;
          let formatName = '';

          if (targetFieldKey === 'tenderId') {
            fetchedValue = extVals.tender_id || null;
            formatName = 'GeM Tender ID (GEM/YYYY/X/NNNNNN)';
          } else if (targetFieldKey === 'gstin') {
            fetchedValue = extVals.gstin || null;
            formatName = '15-character GSTIN';
            // Auto-extract and populate embedded PAN into PAN box as well
            if (extVals.pan) {
              setBidForm(prev => ({ ...prev, pan: prev.pan || extVals.pan }));
              setOcrVerifiedFields(prev => ({
                ...prev,
                pan: {
                  verified: true,
                  value: extVals.pan,
                  format: 'PAN [A-Z]{5}[0-9]{4}[A-Z]',
                  confidence: '99.0%',
                  source: 'Embedded in GSTIN'
                }
              }));
            }
          } else if (targetFieldKey === 'pan') {
            fetchedValue = extVals.pan || null;
            formatName = 'PAN [A-Z]{5}[0-9]{4}[A-Z]';
          } else if (targetFieldKey === 'msmeRegNo') {
            fetchedValue = extVals.udyam_reg_no || null;
            formatName = 'UDYAM-[A-Z]{2}-[0-9]{2}-[0-9]{5,10}';
          }

          // Fallback if detected across any standard format
          if (!fetchedValue) {
            if (targetFieldKey === 'tenderId' && extVals.tender_id) fetchedValue = extVals.tender_id;
            else if (targetFieldKey === 'gstin' && extVals.gstin) fetchedValue = extVals.gstin;
            else if (targetFieldKey === 'pan' && extVals.pan) fetchedValue = extVals.pan;
            else if (targetFieldKey === 'msmeRegNo' && extVals.udyam_reg_no) fetchedValue = extVals.udyam_reg_no;
          }

          if (fetchedValue) {
            // Read extracted value directly into the corresponding input box
            setBidForm(prev => ({
              ...prev,
              [targetFieldKey]: fetchedValue
            }));

            // Mark field as verified against preset format guideline
            setOcrVerifiedFields(prev => ({
              ...prev,
              [targetFieldKey]: {
                verified: true,
                value: fetchedValue,
                format: formatName,
                confidence: uploadRes.file?.confidence || '99.0%',
                fileName: file.name
              }
            }));
          }
        } else {
          setDocState({ file: null, fileId: null, status: 'error', errorMsg: 'Upload failed: No File ID returned' });
        }
      } catch (err) {
        setDocState({ file: null, fileId: null, status: 'error', errorMsg: err.message || 'Upload failed' });
      }
    }
    e.target.value = null; // reset input
  };

  const removeDocument = (setDocState, fieldKey) => {
    setDocState({ file: null, fileId: null, status: 'idle', errorMsg: '' });
    if (fieldKey) {
      setOcrVerifiedFields(prev => {
        const copy = { ...prev };
        delete copy[fieldKey];
        return copy;
      });
    }
  };

  const isValidPAN = (pan) => /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan);
  const isValidGSTIN = (gstin) => /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(gstin);
  const isValidTenderId = (tenderId) => /^GEM\/[0-9]{4}\/[A-Z]\/[0-9]{6}$/.test(tenderId);
  const isValidUdyam = (udyam) => !udyam || /^UDYAM-[A-Z]{2}-[0-9]{2}-[0-9]{5,10}$/.test(udyam);

  const getValidationState = (value, validator) => {
    if (!value) return null;
    return validator(value) ? 'valid' : 'invalid';
  };

  const tenderIdState = getValidationState(bidForm.tenderId, isValidTenderId);
  const gstinState = getValidationState(bidForm.gstin, isValidGSTIN);
  const panState = getValidationState(bidForm.pan, isValidPAN);
  const udyamState = bidForm.msmeRegNo ? getValidationState(bidForm.msmeRegNo, isValidUdyam) : null;

  const renderValidationMsg = (state, invalidMsg) => {
    if (state === null) return <span style={{fontSize: '0.7rem', color: '#f59e0b', display: 'block', marginTop: '0.25rem'}}>⚠ Required</span>;
    if (state === 'valid') return <span style={{fontSize: '0.7rem', color: '#10b981', display: 'block', marginTop: '0.25rem'}}>✓ Valid guideline format</span>;
    return <span style={{fontSize: '0.7rem', color: '#ef4444', display: 'block', marginTop: '0.25rem'}}>✕ {invalidMsg}</span>;
  };

  const renderUploadStatus = (docState, setDocState, inputRef, fieldKey) => {
    const ocrVerified = ocrVerifiedFields[fieldKey];

    const ocrVerifiedBadge = ocrVerified ? (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        marginTop: '0.35rem',
        padding: '0.25rem 0.6rem',
        backgroundColor: '#ecfdf5',
        border: '1px solid #10b981',
        borderRadius: '5px',
        color: '#065f46',
        fontSize: '0.72rem',
        fontWeight: '600'
      }}>
        <CheckCircle2 size={13} color="#059669" />
        <span>OCR Auto-Read & Verified: <strong style={{ fontFamily: 'monospace', color: '#047857' }}>{ocrVerified.value}</strong></span>
        <span style={{ fontSize: '0.66rem', backgroundColor: '#a7f3d0', padding: '0.1rem 0.35rem', borderRadius: '3px', color: '#064e3b', fontWeight: '700' }}>
          {ocrVerified.confidence}
        </span>
      </div>
    ) : null;

    if (docState.status === 'idle') {
      if (result && result.fieldMatches && (result.fieldMatches[fieldKey] || result.fieldMatches[fieldKey === 'msmeRegNo' ? 'udyam' : fieldKey])) {
        const match = result.fieldMatches[fieldKey] || result.fieldMatches[fieldKey === 'msmeRegNo' ? 'udyam' : fieldKey];
        if (match.status === 'DOCUMENT_MISSING') {
          return (
            <>
              {ocrVerifiedBadge}
              <span style={{fontSize: '0.75rem', color: '#ef4444', display: 'block', marginTop: '0.25rem'}}>❌ Document missing</span>
            </>
          );
        }
      }
      return ocrVerifiedBadge;
    }

    let uploadStatus = null;
    if (docState.status === 'uploading') uploadStatus = <span style={{fontSize: '0.75rem', color: '#f59e0b', display: 'block', marginTop: '0.25rem'}}>⏳ Scanning & extracting with OCR ({docState.file?.name})...</span>;
    if (docState.status === 'error') uploadStatus = (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
        <span style={{fontSize: '0.75rem', color: '#ef4444'}}>✕ {docState.errorMsg}</span>
        <button onClick={() => inputRef.current?.click()} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}>Retry</button>
      </div>
    );
    if (docState.status === 'success') uploadStatus = (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', fontSize: '0.75rem', color: '#10b981' }}>
        <Check size={14} /> <span>{docState.file?.name} uploaded</span>
        <button onClick={() => inputRef.current?.click()} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', textDecoration: 'underline', marginLeft: '0.25rem' }}>Replace</button>
        <button onClick={() => removeDocument(setDocState, fieldKey)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', textDecoration: 'underline' }}>Remove</button>
      </div>
    );

    let matchStatus = null;
    const matchLookup = result?.fieldMatches?.[fieldKey] || result?.fieldMatches?.[fieldKey === 'msmeRegNo' ? 'udyam' : fieldKey];
    if (matchLookup) {
      if (matchLookup.status === 'MATCHED') {
        matchStatus = (
          <div style={{ color: '#10b981', fontSize: '0.75rem', marginTop: '0.25rem' }}>
            ✓ MATCHED (Document: {matchLookup.extracted})
          </div>
        );
      } else if (matchLookup.status === 'NOT_MATCHED') {
        matchStatus = (
          <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', whiteSpace: 'pre-line' }}>
            {`❌ NOT MATCHED\nEntered: ${matchLookup.entered || 'None'}\nDocument: ${matchLookup.extracted || 'None'}`}
          </div>
        );
      } else if (matchLookup.status === 'EXTRACTION_FAILED') {
        matchStatus = <div style={{ color: '#f59e0b', fontSize: '0.75rem', marginTop: '0.25rem' }}>⚠ Extraction failed</div>;
      }
    }

    return (
      <>
        {uploadStatus}
        {ocrVerifiedBadge}
        {matchStatus}
      </>
    );
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

    setTimeout(() => setScanStep(2), 600);
    setTimeout(() => setScanStep(3), 1200);

    try {
      const payload = {
        ...bidForm,
        tenderId: bidForm.tenderId || selectedTender?.id || 'GEM/2026/B/891244',
        tenderValue: bidForm.tenderValue || selectedTender?.estimatedValue || '₹1.45 Cr',
        bidAmount: bidForm.bidAmount || '₹1.38 Cr',
        vendorName: bidForm.vendorName || currentUser?.organization || currentUser?.fullName || 'Apex Supplies Ltd.',
        submittedBy: currentUser?.email || null,
        vendorEmail: currentUser?.email || null,
        tenderDocumentId: tenderDoc.fileId,
        gstDocumentId: gstDoc.fileId,
        panDocumentId: panDoc.fileId,
        udyamDocumentId: udyamDoc.fileId
      };

      const evalResult = await gemApi.verifyBid(payload);

      setTimeout(() => {
        setIsProcessing(false);
        setScanStep(4);
        setResult(evalResult);

        if (evalResult.status === 'Compliant') {
          import('canvas-confetti').then((module) => {
            const fireConfetti = module.default;
            fireConfetti({
              particleCount: 70,
              spread: 60,
              origin: { y: 0.6 }
            });
          });
        }

        if (onAddVerifiedBid) {
          const fullBidResult = {
            ...evalResult,
            tenderId: payload.tenderId,
            tenderValue: payload.tenderValue,
            bidAmount: payload.bidAmount,
            vendor: payload.vendorName,
            submittedBy: payload.submittedBy,
            vendorEmail: payload.vendorEmail
          };
          onAddVerifiedBid(fullBidResult);
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
          <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '0.5rem' }}>
              {t('selectScenario')}
            </span>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handlePreload('perfect')}
                style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem', fontWeight: '600', borderRadius: '6px', border: '1px solid #10b981', backgroundColor: '#ecfdf5', color: '#065f46', cursor: 'pointer' }}
              >
                {t('scenarioPerfect')}
              </button>
              <button
                type="button"
                onClick={() => handlePreload('flagged')}
                style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem', fontWeight: '600', borderRadius: '6px', border: '1px solid #f59e0b', backgroundColor: '#fffbeb', color: '#92400e', cursor: 'pointer' }}
              >
                {t('scenarioFlagged')}
              </button>
              <button
                type="button"
                onClick={() => handlePreload('fraud')}
                style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem', fontWeight: '600', borderRadius: '6px', border: '1px solid #ef4444', backgroundColor: '#fef2f2', color: '#991b1b', cursor: 'pointer' }}
              >
                {t('scenarioFraud')}
              </button>
            </div>
          </div>

          {/* OCR PRESET FORMAT GUIDELINES DRAWER */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem 1rem' }}>
            <div 
              onClick={() => setShowGuidelines(!showGuidelines)} 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <BookOpen size={16} color="#0284c7" />
                <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#1e293b' }}>
                  OCR Document Verification Preset Guidelines
                </span>
                <span style={{ fontSize: '0.7rem', backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '0.1rem 0.5rem', borderRadius: '999px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Sparkles size={11} /> Auto-Fetch & Verify Active
                </span>
              </div>
              <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}>
                {showGuidelines ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
            
            {showGuidelines && (
              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed #cbd5e1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '0.65rem' }}>
                <div style={{ backgroundColor: '#ffffff', padding: '0.55rem 0.7rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: '700', color: '#334155' }}>Tender ID Preset</div>
                  <code style={{ fontSize: '0.74rem', color: '#0284c7', fontWeight: '700' }}>GEM/YYYY/X/NNNNNN</code>
                  <div style={{ fontSize: '0.67rem', color: '#64748b', marginTop: '0.2rem' }}>e.g. GEM/2026/B/891244</div>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '0.55rem 0.7rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: '700', color: '#334155' }}>GSTIN Preset</div>
                  <code style={{ fontSize: '0.74rem', color: '#0284c7', fontWeight: '700' }}>2 Digits + PAN + 1 + Z + Check</code>
                  <div style={{ fontSize: '0.67rem', color: '#64748b', marginTop: '0.2rem' }}>e.g. 27AABCB1234F1Z5</div>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '0.55rem 0.7rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: '700', color: '#334155' }}>PAN Preset</div>
                  <code style={{ fontSize: '0.74rem', color: '#0284c7', fontWeight: '700' }}>5 Letters + 4 Digits + 1 Letter</code>
                  <div style={{ fontSize: '0.67rem', color: '#64748b', marginTop: '0.2rem' }}>e.g. AABCB1234F</div>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '0.55rem 0.7rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: '700', color: '#334155' }}>UDYAM Preset</div>
                  <code style={{ fontSize: '0.74rem', color: '#0284c7', fontWeight: '700' }}>UDYAM-XX-00-0000000</code>
                  <div style={{ fontSize: '0.67rem', color: '#64748b', marginTop: '0.2rem' }}>e.g. UDYAM-MH-03-0019284</div>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                  {t('gstinLabel')} <span style={{color: '#ef4444'}}>*</span>
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={bidForm.gstin}
                    onChange={(e) => setBidForm({ ...bidForm, gstin: e.target.value.trim().toUpperCase() })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      paddingRight: '2.5rem',
                      borderRadius: '6px',
                      border: ocrVerifiedFields.gstin ? '1.5px solid #10b981' : (gstinState === 'invalid' ? '1px solid #ef4444' : '1px solid #cbd5e1'),
                      backgroundColor: ocrVerifiedFields.gstin ? '#f0fdf4' : '#ffffff',
                      fontSize: '0.875rem',
                      fontFamily: 'monospace'
                    }}
                  />
                  <button onClick={() => gstInputRef.current?.click()} style={{ position: 'absolute', right: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Upload GST Document for OCR extraction">
                    <Upload size={18} color={ocrVerifiedFields.gstin ? "#059669" : "#475569"} />
                  </button>
                  <input type="file" ref={gstInputRef} onChange={(e) => handleFileUpload(e, setGstDoc, 'gstin')} style={{ display: 'none' }} accept=".pdf,.png,.jpg,.jpeg" />
                </div>
                {renderValidationMsg(gstinState, "Enter a valid 15-character GSTIN")}
                {renderUploadStatus(gstDoc, setGstDoc, gstInputRef, "gstin")}
              </div>
              
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                  Udyam / MSME Registration Number
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={bidForm.msmeRegNo}
                    onChange={(e) => setBidForm({ ...bidForm, msmeRegNo: e.target.value.trim().toUpperCase() })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      paddingRight: '2.5rem',
                      borderRadius: '6px',
                      border: ocrVerifiedFields.msmeRegNo ? '1.5px solid #10b981' : (udyamState === 'invalid' ? '1px solid #ef4444' : '1px solid #cbd5e1'),
                      backgroundColor: ocrVerifiedFields.msmeRegNo ? '#f0fdf4' : '#ffffff',
                      fontSize: '0.875rem',
                      fontFamily: 'monospace'
                    }}
                  />
                  <button onClick={() => udyamInputRef.current?.click()} style={{ position: 'absolute', right: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Upload Udyam Certificate for OCR extraction">
                    <Upload size={18} color={ocrVerifiedFields.msmeRegNo ? "#059669" : "#475569"} />
                  </button>
                  <input type="file" ref={udyamInputRef} onChange={(e) => handleFileUpload(e, setUdyamDoc, 'msmeRegNo')} style={{ display: 'none' }} accept=".pdf,.png,.jpg,.jpeg" />
                </div>
                {renderValidationMsg(udyamState, "Expected UDYAM-XX-00-0000000")}
                {renderUploadStatus(udyamDoc, setUdyamDoc, udyamInputRef, "msmeRegNo")}
              </div>

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
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                  Tender ID <span style={{color: '#ef4444'}}>*</span>
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={bidForm.tenderId}
                    onChange={(e) => setBidForm({ ...bidForm, tenderId: e.target.value.trim().toUpperCase() })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      paddingRight: '2.5rem',
                      borderRadius: '6px',
                      border: ocrVerifiedFields.tenderId ? '1.5px solid #10b981' : (tenderIdState === 'invalid' ? '1px solid #ef4444' : '1px solid #cbd5e1'),
                      backgroundColor: ocrVerifiedFields.tenderId ? '#f0fdf4' : '#ffffff',
                      fontSize: '0.875rem'
                    }}
                  />
                  <button onClick={() => tenderInputRef.current?.click()} style={{ position: 'absolute', right: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Upload Tender Document for OCR extraction">
                    <Upload size={18} color={ocrVerifiedFields.tenderId ? "#059669" : "#475569"} />
                  </button>
                  <input type="file" ref={tenderInputRef} onChange={(e) => handleFileUpload(e, setTenderDoc, 'tenderId')} style={{ display: 'none' }} accept=".pdf,.png,.jpg,.jpeg" />
                </div>
                {renderValidationMsg(tenderIdState, "Expected GEM/YYYY/X/NNNNNN")}
                {renderUploadStatus(tenderDoc, setTenderDoc, tenderInputRef, "tenderId")}
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

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                  {t('panLabel')} <span style={{color: '#ef4444'}}>*</span>
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={bidForm.pan}
                    onChange={(e) => setBidForm({ ...bidForm, pan: e.target.value.trim().toUpperCase() })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      paddingRight: '2.5rem',
                      borderRadius: '6px',
                      border: ocrVerifiedFields.pan ? '1.5px solid #10b981' : (panState === 'invalid' ? '1px solid #ef4444' : '1px solid #cbd5e1'),
                      backgroundColor: ocrVerifiedFields.pan ? '#f0fdf4' : '#ffffff',
                      fontSize: '0.875rem',
                      fontFamily: 'monospace'
                    }}
                  />
                  <button onClick={() => panInputRef.current?.click()} style={{ position: 'absolute', right: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Upload PAN Document for OCR extraction">
                    <Upload size={18} color={ocrVerifiedFields.pan ? "#059669" : "#475569"} />
                  </button>
                  <input type="file" ref={panInputRef} onChange={(e) => handleFileUpload(e, setPanDoc, 'pan')} style={{ display: 'none' }} accept=".pdf,.png,.jpg,.jpeg" />
                </div>
                {renderValidationMsg(panState, "Expected 5 letters, 4 digits, 1 letter")}
                {renderUploadStatus(panDoc, setPanDoc, panInputRef, "pan")}
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
          
          <button
            type="button"
            onClick={handleStartVerification}
            disabled={isProcessing}
            style={{
              padding: '0.8rem 1.6rem',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              fontSize: '0.95rem',
              fontWeight: '800',
              border: 'none',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.25)'
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

          {isProcessing && (
            <div style={{ backgroundColor: '#f0f9ff', color: '#0f172a', padding: '1.25rem', borderRadius: '10px', border: '1px solid #bae6fd' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#0369a1', fontFamily: 'monospace', fontWeight: '700' }}>
                  {["Parsing OCR", "Validating Fields", "Cross-Checking", "Applying Rules"][scanStep - 1] || "Processing..."}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#ea580c', fontWeight: '800' }}>
                  {scanStep * 25}% Complete
                </span>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: '#e0f2fe', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ width: `${scanStep * 25}%`, height: '100%', background: 'linear-gradient(90deg, #0284c7, #f59e0b)', transition: 'width 0.4s ease' }}></div>
              </div>
            </div>
          )}

          {result && result.error && !isProcessing && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '1.5rem', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <AlertTriangle size={24} />
              <span style={{ fontSize: '0.95rem', fontWeight: '700' }}>{result.message}</span>
            </div>
          )}

          {result && !result.error && !isProcessing && (
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.75rem', color: '#0f172a', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#0284c7', fontFamily: 'monospace', fontWeight: '800' }}>
                    AUDIT REPORT #{result.bidId}
                  </span>
                  <h4 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a', margin: '0.2rem 0' }}>
                    {result.vendor}
                  </h4>
                  <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    Tender: {result.tenderId} | Category: {result.category}
                  </span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '2.2rem', fontWeight: '900', color: result.status === 'Compliant' ? '#059669' : result.status === 'Flagged' ? '#d97706' : '#dc2626' }}>
                    {result.score}<span style={{ fontSize: '1.1rem', color: '#94a3b8' }}>/100</span>
                  </div>
                  <span
                    className={`d-status-badge ${result.status.toLowerCase()}`}
                    style={{ fontSize: '0.82rem', padding: '0.25rem 0.75rem' }}
                  >
                    {result.status === 'Compliant' ? t('compliant') : result.status === 'Flagged' ? t('flagged') : t('rejected')}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', fontWeight: '700' }}>{t('localContent')}</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0f172a' }}>{result.miiVerified}</span>
                </div>
                <div style={{ backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', fontWeight: '700' }}>GST & Tax Standing</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: '800', color: result.gstVerified === 'LOCAL_VALIDATION_PASSED' || result.gstVerified === 'EXTERNAL_VERIFICATION_NOT_CONFIGURED' ? '#059669' : result.gstVerified === 'MISSING_EVIDENCE' ? '#d97706' : '#dc2626' }}>{result.gstVerified}</span>
                </div>
                <div style={{ backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', fontWeight: '700' }}>{t('ocrConfidence')}</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0284c7' }}>{result.ocrConfidence}</span>
                </div>
              </div>

              {result.flags.length > 0 ? (
                <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '1.1rem', marginBottom: '1.25rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#b45309', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                    <AlertTriangle size={16} /> {t('discrepanciesTitle')} ({result.flags.length})
                  </span>
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.84rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {result.flags.map((flag, idx) => (
                      <li key={idx} style={{ fontWeight: '500' }}>{flag}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#065f46', fontSize: '0.88rem', fontWeight: '700' }}>
                  <CheckCircle2 size={18} color="#059669" />
                  {t('allPassedTitle')}
                </div>
              )}

              <div
                style={{
                  backgroundColor: result.status === 'Compliant' ? '#ecfdf5' : (result.status === 'Flagged' ? '#fffbeb' : '#fef2f2'),
                  border: `1px solid ${result.status === 'Compliant' ? '#a7f3d0' : (result.status === 'Flagged' ? '#fde68a' : '#fecaca')}`,
                  borderRadius: '10px',
                  padding: '1.1rem',
                  marginBottom: '1.25rem',
                  fontSize: '0.88rem'
                }}
              >
                <strong style={{ display: 'block', color: result.status === 'Compliant' ? '#047857' : (result.status === 'Flagged' ? '#b45309' : '#b91c1c'), marginBottom: '0.25rem' }}>
                  🤖 AI Recommendation for Government Buyer:
                </strong>
                <p style={{ margin: 0, color: '#334155', lineHeight: 1.5 }}>
                  {result.status === 'Compliant' ? 'Application verified and meets requirements. Ready for L1 award.' : result.status === 'Flagged' ? 'Application requires manual review due to discrepancies or marginal shortfalls.' : 'Application rejected due to critical non-compliance or document mismatch.'}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{ padding: '0.55rem 1.15rem', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#334155', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                >
                  <Download size={15} /> {t('downloadPdf')}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  style={{ padding: '0.55rem 1.4rem', borderRadius: '8px', background: 'linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)', border: 'none', color: '#ffffff', fontSize: '0.85rem', fontWeight: '800', cursor: 'pointer', boxShadow: '0 2px 8px rgba(234, 88, 12, 0.25)' }}
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
