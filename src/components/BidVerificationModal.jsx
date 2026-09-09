import React, { useState, useRef, useEffect } from 'react';
import {
  X, Upload, CheckCircle2, AlertTriangle, XCircle, FileText, Cpu,
  ShieldCheck, Download, RefreshCw, Send, Check, Layers, Sparkles, FileCheck, ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { samplePreloads, verifiedKycRecords } from '../data/bidsData';
import { useLanguage } from '../context/LanguageContext';
import { gemApi } from '../services/api';

export default function BidVerificationModal({
  isOpen,
  onClose,
  selectedTender = null,
  onAddVerifiedBid
}) {
  if (!isOpen) return null;

  const { t } = useLanguage();
  const fileInputRef = useRef(null);

  // Form State - Defaulting to User 1 (Sumit Deshmukh)
  const [vendorName, setVendorName] = useState('DESHMUKH CONSTRUCTION PVT LTD');
  const [category, setCategory] = useState(selectedTender?.category || 'Infrastructure & Civil Works');
  const [tenderId, setTenderId] = useState(selectedTender?.id || 'GEM/2026/B/891244');
  const [tenderValue, setTenderValue] = useState(selectedTender?.estimatedValue || '₹1.45 Cr');
  const [bidAmount, setBidAmount] = useState('₹1.45 Cr');
  const [aadharNo, setAadharNo] = useState('387055087722');
  const [gstin, setGstin] = useState('GTSIN27ABCDE1234F1Z1');
  const [pan, setPan] = useState('ISOPD1145K');
  const [miiDeclared, setMiiDeclared] = useState('78%');
  const [turnoverClaim, setTurnoverClaim] = useState('₹15.2 Cr');
  const [experienceClaim, setExperienceClaim] = useState('7 Years');
  const [msmeRegNo, setMsmeRegNo] = useState('UDYAM-MH-03-0098112');

  // Documents uploaded
  const [uploadedFiles, setUploadedFiles] = useState([
    { name: 'Aadhaar_Card_387055087722.pdf', size: '1.1 MB', status: 'Ready' },
    { name: 'Income_Tax_PAN_ISOPD1145K.pdf', size: '1.2 MB', status: 'Ready' },
    { name: 'GST_Registration_GTSIN27ABCDE1234F1Z1.pdf', size: '2.4 MB', status: 'Ready' },
    { name: 'UDYAM_MSME_Certificate.pdf', size: '850 KB', status: 'Ready' },
    { name: 'CA_Audited_Turnover_FY25.pdf', size: '3.1 MB', status: 'Ready' },
    { name: 'Make_In_India_Declaration.pdf', size: '640 KB', status: 'Ready' }
  ]);

  // Verification Pipeline States
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanStep, setScanStep] = useState(0); // 0: Idle, 1..8: Stages, 9: Complete
  const [result, setResult] = useState(null);
  const [isSentToBuyer, setIsSentToBuyer] = useState(false);

  const verificationStages = [
    { num: 1, title: 'Uploaded Documents OCR & Ingestion', desc: 'Running EasyOCR on Aadhaar, PAN, GST, CA Statement & MII' },
    { num: 2, title: 'Entity & Data Extraction', desc: 'Extracting Aadhaar No, legal names, GSTIN, PAN, turnover & UDIN' },
    { num: 3, title: 'Document Validation & Forensics', desc: 'UIDAI e-KYC validation, OpenCV gradient & tampering detection' },
    { num: 4, title: 'Cross-Document Matching', desc: 'Matching Aadhaar <-> PAN <-> GSTIN <-> CA Statement' },
    { num: 5, title: 'Bid Requirement Matching', desc: 'Comparing extracted parameters against selected Tender criteria' },
    { num: 6, title: 'AI Compliance Scoring (0-100)', desc: 'Calculating rule deductions under GFR 2017 & DPIIT orders' },
    { num: 7, title: 'Status & Risk Determination', desc: 'Classifying application as Compliant, Flagged, or Non-Compliant' },
    { num: 8, title: 'Compliance Report Generation', desc: 'Generating structured compliance report & buyer dossier' }
  ];

  useEffect(() => {
    if (selectedTender) {
      setTenderId(selectedTender.id);
      setCategory(selectedTender.category || 'Infrastructure & Civil Works');
      setTenderValue(selectedTender.estimatedValue || '₹1.45 Cr');
    }
  }, [selectedTender]);

  const handlePreload = (scenario) => {
    setResult(null);
    setScanStep(0);
    setIsSentToBuyer(false);

    if (scenario === 'sumit') {
      setVendorName('DESHMUKH CONSTRUCTION PVT LTD');
      setAadharNo('387055087722');
      setPan('ISOPD1145K');
      setGstin('GTSIN27ABCDE1234F1Z1');
      setCategory('Infrastructure & Civil Works');
      setMiiDeclared('78%');
      setTurnoverClaim('₹15.2 Cr');
      setExperienceClaim('7 Years');
      setMsmeRegNo('UDYAM-MH-03-0098112');
      setBidAmount('₹1.45 Cr');
      setUploadedFiles([
        { name: 'Aadhaar_Card_387055087722.pdf', size: '1.1 MB', status: 'Ready' },
        { name: 'PAN_Card_ISOPD1145K.pdf', size: '1.2 MB', status: 'Ready' },
        { name: 'GST_Registration_GTSIN27ABCDE1234F1Z1.pdf', size: '2.4 MB', status: 'Ready' },
        { name: 'UDYAM_MSME_Certificate.pdf', size: '850 KB', status: 'Ready' },
        { name: 'CA_Audited_Turnover_FY25.pdf', size: '3.1 MB', status: 'Ready' },
        { name: 'Make_In_India_Declaration.pdf', size: '640 KB', status: 'Ready' }
      ]);
    } else if (scenario === 'aniket') {
      setVendorName('APEX TECHNOLOGY');
      setAadharNo('387055087723');
      setPan('ISOPD1145M');
      setGstin('GTSIN27ABCDE1234F1Z2');
      setCategory('IT Hardware');
      setMiiDeclared('72%');
      setTurnoverClaim('₹12.4 Cr');
      setExperienceClaim('5 Years');
      setMsmeRegNo('UDYAM-MH-03-0019284');
      setBidAmount('₹1.38 Cr');
      setUploadedFiles([
        { name: 'Aadhaar_Card_387055087723.pdf', size: '1.0 MB', status: 'Ready' },
        { name: 'PAN_Card_ISOPD1145M.pdf', size: '1.1 MB', status: 'Ready' },
        { name: 'GST_Registration_GTSIN27ABCDE1234F1Z2.pdf', size: '2.2 MB', status: 'Ready' },
        { name: 'UDYAM_MSME_Certificate.pdf', size: '780 KB', status: 'Ready' },
        { name: 'CA_Audited_Turnover_FY25.pdf', size: '2.9 MB', status: 'Ready' },
        { name: 'Make_In_India_Declaration.pdf', size: '590 KB', status: 'Ready' }
      ]);
    } else if (scenario === 'krushna') {
      setVendorName('KK PVT LTD');
      setAadharNo('387055087724');
      setPan('ISOPD1145N');
      setGstin('GTSIN27ABCDE1234F1Z3');
      setCategory('Heavy Electricals');
      setMiiDeclared('85%');
      setTurnoverClaim('₹18.6 Cr');
      setExperienceClaim('6 Years');
      setMsmeRegNo('UDYAM-MH-03-0044192');
      setBidAmount('₹1.92 Cr');
      setUploadedFiles([
        { name: 'Aadhaar_Card_387055087724.pdf', size: '1.2 MB', status: 'Ready' },
        { name: 'PAN_Card_ISOPD1145N.pdf', size: '1.0 MB', status: 'Ready' },
        { name: 'GST_Registration_GTSIN27ABCDE1234F1Z3.pdf', size: '2.5 MB', status: 'Ready' },
        { name: 'UDYAM_MSME_Certificate.pdf', size: '900 KB', status: 'Ready' },
        { name: 'CA_Audited_Turnover_FY25.pdf', size: '3.2 MB', status: 'Ready' },
        { name: 'Make_In_India_Declaration.pdf', size: '620 KB', status: 'Ready' }
      ]);
    } else if (scenario === 'mismatch_test') {
      // Intentionally uses Sumit's Aadhaar with a different name to test mismatch detection
      setVendorName('XYZ Fake Traders Ltd.');
      setAadharNo('387055087722');
      setPan('ABCDE1234F');
      setGstin('06UNIV0000Z1Z0');
      setMiiDeclared('15%');
      setTurnoverClaim('₹80 Lakhs');
      setExperienceClaim('1 Year');
      setMsmeRegNo('UDYAM-HR-00-INVALID');
      setBidAmount('₹1.20 Cr');
      setUploadedFiles([
        { name: 'Aadhaar_Card_387055087722.pdf', size: '1.1 MB', status: 'Mismatch Alert' },
        { name: 'Income_Tax_PAN_Card.pdf', size: '1.0 MB', status: 'Mismatch Alert' },
        { name: 'GST_Registration_Suspended.pdf', size: '2.3 MB', status: 'Suspended' },
        { name: 'UDYAM_MSME_Invalid.pdf', size: '600 KB', status: 'Invalid' },
        { name: 'CA_Turnover_Tampered.pdf', size: '3.0 MB', status: 'Tampering Alert' }
      ]);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newDocs = files.map(f => ({
        name: f.name,
        size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
        status: 'Uploaded'
      }));
      setUploadedFiles(prev => [...newDocs, ...prev]);
    }
  };

  const handleStartVerification = async () => {
    setIsProcessing(true);
    setScanStep(1);
    setResult(null);
    setIsSentToBuyer(false);

    // Live animated pipeline progression
    const interval = setInterval(() => {
      setScanStep(prev => {
        if (prev < 8) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 300);

    try {
      const payload = {
        vendorName,
        category,
        tenderId,
        tenderValue,
        bidAmount,
        aadharNo,
        gstin,
        pan,
        miiDeclared,
        turnoverClaim,
        experienceClaim,
        msmeRegNo,
        uploadedDocNames: uploadedFiles.map(f => f.name)
      };

      const evalResult = await gemApi.verifyBid(payload);

      setTimeout(() => {
        setIsProcessing(false);
        setScanStep(9);
        setResult(evalResult);

        if (evalResult.status === 'Compliant') {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 }
          });
        }
      }, 2600);
    } catch (err) {
      console.warn('Verification error:', err);
      setIsProcessing(false);
    }
  };

  const handleSendToBuyer = () => {
    setIsSentToBuyer(true);
    if (onAddVerifiedBid && result) {
      onAddVerifiedBid(result);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content-box"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '960px', maxHeight: '92vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="modal-header">
          <div>
            <span className="section-tag" style={{ marginBottom: '0.2rem', backgroundColor: '#10b981', color: '#ffffff' }}>
              BIDDER FLOW • OCR & AI VERIFICATION PIPELINE
            </span>
            <h3 className="modal-title" style={{ fontSize: '1.3rem' }}>
              🏢 Autonomous Bidder Document Verification & Report Generation
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
              Uploaded Documents → OCR → Entity Extraction → Document Forensics → Cross-Doc Match → Tender Requirement Match → AI Compliance Score → Report
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem 0' }}>
          {/* Quick Scenario Preload Bar */}
          <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#0f2238', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <ShieldCheck size={16} color="#0284c7" /> Stored User KYC Profiles (Select for Autonomous Verification):
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => handlePreload('sumit')}
                style={{
                  padding: '0.55rem 0.75rem',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  borderRadius: '6px',
                  border: aadharNo === '387055087722' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                  backgroundColor: aadharNo === '387055087722' ? 'rgba(2, 132, 199, 0.1)' : '#ffffff',
                  color: '#0f2238',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ fontWeight: '800', color: '#0284c7' }}>1. Sumit Anandrao Deshmukh</div>
                <div style={{ fontSize: '0.72rem', color: '#475569' }}>Deshmukh Construction Pvt Ltd</div>
                <div style={{ fontSize: '0.7rem', color: '#10b981', fontFamily: 'monospace' }}>Aadhaar: 387055087722</div>
              </button>

              <button
                type="button"
                onClick={() => handlePreload('aniket')}
                style={{
                  padding: '0.55rem 0.75rem',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  borderRadius: '6px',
                  border: aadharNo === '387055087723' ? '2px solid #10b981' : '1px solid #cbd5e1',
                  backgroundColor: aadharNo === '387055087723' ? 'rgba(16, 185, 129, 0.1)' : '#ffffff',
                  color: '#0f2238',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ fontWeight: '800', color: '#059669' }}>2. Aniket Dnyandeo Sawarkar</div>
                <div style={{ fontSize: '0.72rem', color: '#475569' }}>Apex Technology</div>
                <div style={{ fontSize: '0.7rem', color: '#10b981', fontFamily: 'monospace' }}>Aadhaar: 387055087723</div>
              </button>

              <button
                type="button"
                onClick={() => handlePreload('krushna')}
                style={{
                  padding: '0.55rem 0.75rem',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  borderRadius: '6px',
                  border: aadharNo === '387055087724' ? '2px solid #8b5cf6' : '1px solid #cbd5e1',
                  backgroundColor: aadharNo === '387055087724' ? 'rgba(139, 92, 246, 0.1)' : '#ffffff',
                  color: '#0f2238',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ fontWeight: '800', color: '#7c3aed' }}>3. Krushna Santosh Bhende</div>
                <div style={{ fontSize: '0.72rem', color: '#475569' }}>KK Pvt Ltd</div>
                <div style={{ fontSize: '0.7rem', color: '#10b981', fontFamily: 'monospace' }}>Aadhaar: 387055087724</div>
              </button>

              <button
                type="button"
                onClick={() => handlePreload('mismatch_test')}
                style={{
                  padding: '0.55rem 0.75rem',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  borderRadius: '6px',
                  border: '1px dashed #ef4444',
                  backgroundColor: '#fef2f2',
                  color: '#991b1b',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ fontWeight: '800', color: '#dc2626' }}>⚠️ Test Mismatch</div>
                <div style={{ fontSize: '0.72rem', color: '#b91c1c' }}>Aadhaar / Name Discrepancy</div>
                <div style={{ fontSize: '0.7rem', color: '#dc2626' }}>Triggers Forensic Flags</div>
              </button>
            </div>
          </div>

          {/* Form: Application Details & Document Upload Zone */}
          {!result && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.25rem' }}>
              {/* Left Column: Bid Application Parameters */}
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem' }}>
                <h4 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0f2238', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FileText size={16} color="#0284c7" /> Bid Application Parameters
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.2rem' }}>
                        Target Tender ID
                      </label>
                      <input
                        type="text"
                        value={tenderId}
                        onChange={(e) => setTenderId(e.target.value)}
                        style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', fontFamily: 'monospace' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.2rem' }}>
                        Category
                      </label>
                      <input
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.2rem' }}>
                      Vendor Legal Organization Name
                    </label>
                    <input
                      type="text"
                      value={vendorName}
                      onChange={(e) => setVendorName(e.target.value)}
                      style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: '700', color: '#0f2238' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.2rem' }}>
                        Quoted Bid Price
                      </label>
                      <input
                        type="text"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', color: '#0284c7', fontWeight: '700' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.2rem' }}>
                        Tender Estimated Value
                      </label>
                      <input
                        type="text"
                        value={tenderValue}
                        onChange={(e) => setTenderValue(e.target.value)}
                        style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  {/* 3-Column Identity Row: Aadhaar + PAN + GSTIN */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.2fr', gap: '0.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.2rem' }}>
                        Aadhaar Card No (UIDAI)
                      </label>
                      <input
                        type="text"
                        value={aadharNo}
                        onChange={(e) => setAadharNo(e.target.value)}
                        placeholder="e.g. 387055087722"
                        style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', fontFamily: 'monospace', fontWeight: '700', color: '#0284c7' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.2rem' }}>
                        PAN Card Number
                      </label>
                      <input
                        type="text"
                        value={pan}
                        onChange={(e) => setPan(e.target.value)}
                        placeholder="e.g. ISOPD1145K"
                        style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', fontFamily: 'monospace', fontWeight: '700' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.2rem' }}>
                        GSTIN Number
                      </label>
                      <input
                        type="text"
                        value={gstin}
                        onChange={(e) => setGstin(e.target.value)}
                        placeholder="e.g. GTSIN27ABCDE1234F1Z1"
                        style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', fontFamily: 'monospace', fontWeight: '700' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.2rem' }}>
                        Make in India %
                      </label>
                      <input
                        type="text"
                        value={miiDeclared}
                        onChange={(e) => setMiiDeclared(e.target.value)}
                        style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.2rem' }}>
                        Annual Turnover
                      </label>
                      <input
                        type="text"
                        value={turnoverClaim}
                        onChange={(e) => setTurnoverClaim(e.target.value)}
                        style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.2rem' }}>
                        Past Experience
                      </label>
                      <input
                        type="text"
                        value={experienceClaim}
                        onChange={(e) => setExperienceClaim(e.target.value)}
                        style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Upload Required Documents */}
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#166534', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ShieldCheck size={16} color="#10b981" /> Upload Required Documents
                </h4>
                <p style={{ fontSize: '0.75rem', color: '#475569', marginBottom: '0.85rem' }}>
                  OCR & forensic verification will be executed on all attached documents.
                </p>

                {/* Upload Zone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed #86efac',
                    borderRadius: '8px',
                    padding: '1.25rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: '#ffffff',
                    marginBottom: '1rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                  />
                  <Upload size={24} color="#10b981" style={{ margin: '0 auto 0.4rem auto' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#166534', display: 'block' }}>
                    Click or Drag to Upload Documents
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Supports PDF, Scanned Images (PAN, GST, UDYAM, CA Balance Sheet, MII)
                  </span>
                </div>

                {/* Uploaded Documents List */}
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#166534' }}>
                    Attached Documents ({uploadedFiles.length}):
                  </span>
                  {uploadedFiles.map((f, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: '#ffffff',
                        padding: '0.35rem 0.65rem',
                        borderRadius: '4px',
                        border: '1px solid #dcfce7',
                        fontSize: '0.78rem'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#334155', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        <FileCheck size={13} color="#10b981" /> {f.name}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: f.status.includes('Alert') ? '#ef4444' : '#10b981', fontWeight: '600' }}>
                        {f.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Verification Pipeline Execution Animation */}
          {isProcessing && (
            <div style={{ backgroundColor: '#071526', border: '1px solid #1e385b', borderRadius: '10px', padding: '1.5rem', color: '#ffffff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <RefreshCw size={24} color="#38bdf8" className="spin-animation" style={{ animation: 'spin 1.5s linear infinite' }} />
                <div>
                  <h4 style={{ fontSize: '1.1rem', margin: 0, color: '#38bdf8' }}>
                    Executing 8-Stage Autonomous AI Verification Pipeline...
                  </h4>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Stage {scanStep} of 8: {verificationStages[scanStep - 1]?.title || 'Processing'}
                  </span>
                </div>
              </div>

              {/* 8-Stage Pipeline Stepper */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                {verificationStages.map((st) => {
                  const isDone = scanStep > st.num;
                  const isCurrent = scanStep === st.num;

                  return (
                    <div
                      key={st.num}
                      style={{
                        backgroundColor: isCurrent ? 'rgba(56, 189, 248, 0.15)' : (isDone ? 'rgba(16, 185, 129, 0.12)' : '#0c1f36'),
                        border: isCurrent ? '1px solid #38bdf8' : (isDone ? '1px solid #10b981' : '1px solid #1e385b'),
                        borderRadius: '6px',
                        padding: '0.65rem 0.75rem',
                        fontSize: '0.78rem',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem' }}>
                        {isDone ? (
                          <CheckCircle2 size={14} color="#34d399" />
                        ) : isCurrent ? (
                          <RefreshCw size={14} color="#38bdf8" className="spin-animation" style={{ animation: 'spin 1s linear infinite' }} />
                        ) : (
                          <span style={{ width: '14px', height: '14px', borderRadius: '50%', border: '1px solid #64748b', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                            {st.num}
                          </span>
                        )}
                        <strong style={{ color: isDone ? '#34d399' : (isCurrent ? '#38bdf8' : '#94a3b8') }}>
                          Stage {st.num}
                        </strong>
                      </div>
                      <span style={{ color: isDone ? '#e2e8f0' : (isCurrent ? '#ffffff' : '#64748b'), display: 'block', fontSize: '0.75rem', fontWeight: '600' }}>
                        {st.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Verification Results: Complete AI Compliance Report */}
          {result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', backgroundColor: '#071526', border: '1px solid #1e385b', borderRadius: '10px', padding: '1.5rem', color: '#ffffff' }}>
              {/* Report Header Strip */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e385b', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontFamily: 'monospace', fontWeight: '700' }}>
                    REPORT ID: {result.complianceReport?.reportId || 'RPT-2026-AUTON'} • BID ID: {result.bidId}
                  </span>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#ffffff', margin: '0.2rem 0 0 0' }}>
                    AI Compliance Dossier for {result.vendor}
                  </h3>
                  <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                    Target Tender: {result.tenderId} • Quoted Price: <strong style={{ color: '#38bdf8' }}>{result.bidAmount}</strong> (Est: {result.tenderValue})
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>Compliance Score</span>
                    <span style={{ fontSize: '2rem', fontWeight: '900', color: result.status === 'Compliant' ? '#34d399' : (result.status === 'Flagged' ? '#fbbf24' : '#f87171') }}>
                      {result.score}<span style={{ fontSize: '0.9rem', color: '#64748b' }}>/100</span>
                    </span>
                  </div>

                  <div>
                    <span
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        fontWeight: '800',
                        backgroundColor: result.status === 'Compliant' ? 'rgba(16, 185, 129, 0.2)' : (result.status === 'Flagged' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)'),
                        color: result.status === 'Compliant' ? '#34d399' : (result.status === 'Flagged' ? '#fbbf24' : '#f87171'),
                        border: `1px solid ${result.status === 'Compliant' ? '#10b981' : (result.status === 'Flagged' ? '#f59e0b' : '#ef4444')}`,
                        display: 'inline-block'
                      }}
                    >
                      {result.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Statutory ID Verification Status Bar */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.65rem' }}>
                <div style={{ backgroundColor: '#0c1f36', border: '1px solid #1e385b', borderRadius: '6px', padding: '0.6rem 0.8rem', fontSize: '0.78rem' }}>
                  <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.7rem' }}>Aadhaar e-KYC (UIDAI)</span>
                  <strong style={{ color: result.aadharVerified && result.aadharVerified.includes('FAILED') ? '#f87171' : '#34d399', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <ShieldCheck size={13} /> {result.aadharVerified || 'UIDAI e-KYC Verified'}
                  </strong>
                </div>
                <div style={{ backgroundColor: '#0c1f36', border: '1px solid #1e385b', borderRadius: '6px', padding: '0.6rem 0.8rem', fontSize: '0.78rem' }}>
                  <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.7rem' }}>GSTIN Status</span>
                  <strong style={{ color: result.gstVerified && result.gstVerified.includes('FAILED') ? '#f87171' : '#38bdf8' }}>
                    {result.gstVerified || 'ACTIVE & 3B Compliant'}
                  </strong>
                </div>
                <div style={{ backgroundColor: '#0c1f36', border: '1px solid #1e385b', borderRadius: '6px', padding: '0.6rem 0.8rem', fontSize: '0.78rem' }}>
                  <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.7rem' }}>Income Tax PAN</span>
                  <strong style={{ color: result.panVerified && result.panVerified.includes('FAILED') ? '#f87171' : '#38bdf8' }}>
                    {result.panVerified || 'VERIFIED (NSDL API)'}
                  </strong>
                </div>
                <div style={{ backgroundColor: '#0c1f36', border: '1px solid #1e385b', borderRadius: '6px', padding: '0.6rem 0.8rem', fontSize: '0.78rem' }}>
                  <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.7rem' }}>Make-In-India (MII)</span>
                  <strong style={{ color: '#f59e0b' }}>
                    {result.miiVerified}
                  </strong>
                </div>
              </div>

              {/* Buyer Recommendation Banner */}
              <div
                style={{
                  backgroundColor: result.status === 'Compliant' ? 'rgba(16, 185, 129, 0.1)' : (result.status === 'Flagged' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)'),
                  border: `1px solid ${result.status === 'Compliant' ? 'rgba(16, 185, 129, 0.3)' : (result.status === 'Flagged' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)')}`,
                  borderRadius: '8px',
                  padding: '1rem',
                  fontSize: '0.88rem'
                }}
              >
                <strong style={{ display: 'block', color: result.status === 'Compliant' ? '#34d399' : (result.status === 'Flagged' ? '#fbbf24' : '#f87171'), marginBottom: '0.25rem' }}>
                  🤖 AI Recommendation for Government Buyer:
                </strong>
                <p style={{ margin: 0, color: '#e2e8f0', lineHeight: 1.5 }}>
                  {result.complianceReport?.buyerRecommendation || 'Application verified and ready for Buyer review and selection.'}
                </p>
              </div>

              {/* Grid: Extracted Entities & Cross-Document Matching */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* 1. Extracted Statutory Entities */}
                <div style={{ backgroundColor: '#0c1f36', border: '1px solid #1e385b', borderRadius: '8px', padding: '1rem' }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: '800', color: '#38bdf8', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Cpu size={15} /> 1. OCR Extracted Statutory Entities
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem' }}>
                    {(result.extractedEntities || []).map((ent, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid #162c47' }}>
                        <span style={{ color: '#94a3b8' }}>{ent.fieldName}:</span>
                        <span style={{ color: '#ffffff', fontWeight: '700', fontFamily: ent.entityType === 'GSTIN' || ent.entityType === 'PAN' ? 'monospace' : 'inherit' }}>
                          {ent.parsedValue} <span style={{ fontSize: '0.7rem', color: '#38bdf8' }}>({ent.confidence})</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Cross-Document Matching */}
                <div style={{ backgroundColor: '#0c1f36', border: '1px solid #1e385b', borderRadius: '8px', padding: '1rem' }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: '800', color: '#34d399', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <ShieldCheck size={15} /> 2. Cross-Document Consistency Matching
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem' }}>
                    {(result.crossDocMatches || []).map((m, idx) => (
                      <div key={idx} style={{ backgroundColor: '#071526', padding: '0.5rem 0.65rem', borderRadius: '6px', border: m.isMatch ? '1px solid #10b981' : '1px solid #ef4444' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                          <strong style={{ color: '#ffffff' }}>{m.fieldName}</strong>
                          <span style={{ color: m.isMatch ? '#34d399' : '#f87171', fontWeight: '800', fontSize: '0.75rem' }}>
                            {m.isMatch ? '✓ MATCHED' : '✗ MISMATCH'}
                          </span>
                        </div>
                        <span style={{ color: '#94a3b8', fontSize: '0.74rem', display: 'block' }}>{m.remarks}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Bid Requirement Matching vs Tender Criteria */}
              <div style={{ backgroundColor: '#0c1f36', border: '1px solid #1e385b', borderRadius: '8px', padding: '1rem' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: '800', color: '#f59e0b', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Layers size={15} /> 3. Bid Requirement Matching against Tender Criteria
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.8rem' }}>
                  {(result.requirementMatches || []).map((req, idx) => (
                    <div key={idx} style={{ backgroundColor: '#071526', padding: '0.65rem', borderRadius: '6px', border: req.isMet ? '1px solid #1e385b' : '1px solid #ef4444' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{req.requirementName}</span>
                        <span style={{ color: req.isMet ? '#34d399' : '#f87171', fontWeight: '700', fontSize: '0.72rem' }}>
                          {req.isMet ? '✓ SATISFIED' : '✗ DEFICIT'}
                        </span>
                      </div>
                      <div style={{ color: '#ffffff', fontWeight: '700', fontSize: '0.82rem' }}>
                        Claim: {req.bidderClaim}
                      </div>
                      <span style={{ color: '#64748b', fontSize: '0.72rem' }}>Req: {req.tenderRequirement}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Action Strip: Send Report to Buyer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #162c47', paddingTop: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{
                    padding: '0.55rem 1rem',
                    borderRadius: '6px',
                    backgroundColor: '#0c1f36',
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
                  <Download size={15} /> Download / Print Report
                </button>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => { setResult(null); setScanStep(0); }}
                    style={{
                      padding: '0.55rem 1rem',
                      borderRadius: '6px',
                      backgroundColor: '#1e385b',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Re-Verify / Edit
                  </button>

                  <button
                    type="button"
                    onClick={handleSendToBuyer}
                    disabled={isSentToBuyer}
                    style={{
                      padding: '0.55rem 1.5rem',
                      borderRadius: '6px',
                      backgroundColor: isSentToBuyer ? '#10b981' : '#0284c7',
                      color: '#ffffff',
                      fontSize: '0.88rem',
                      fontWeight: '800',
                      border: 'none',
                      cursor: isSentToBuyer ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)'
                    }}
                  >
                    {isSentToBuyer ? (
                      <>
                        <Check size={16} /> Compliance Report Sent to Buyer!
                      </>
                    ) : (
                      <>
                        <Send size={16} /> Send Application & Report to Buyer
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Action Button: Start 8-Stage Verification */}
          {!result && !isProcessing && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '6px',
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  fontWeight: '600',
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartVerification}
                style={{
                  padding: '0.65rem 1.6rem',
                  borderRadius: '6px',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: '800',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
                }}
              >
                <Sparkles size={18} /> Run 8-Stage AI Verification Pipeline
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
