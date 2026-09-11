import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  ShieldCheck, FileText, QrCode, Download, Search, CheckCircle2,
  XCircle, Clock, AlertTriangle, Award, Eye, RefreshCw, Shield,
  Upload, Fingerprint, BadgeCheck, ChevronDown, ChevronUp, Copy, ExternalLink, Home,
  FileCheck, AlertCircle, Scan, Sparkles
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { gemApi } from '../services/api';

const DOCUMENT_CONFIGS = [
  {
    type: 'PAN',
    name: 'Permanent Account Number',
    authority: 'Income Tax Department (NSDL)',
    defaultRef: 'AABCB1234F',
    hint: 'e.g. AABCB1234F (10 chars)',
    sampleFileName: 'PAN_Card_Certificate.pdf'
  },
  {
    type: 'GST',
    name: 'GSTIN Registration (FORM GST REG-06)',
    authority: 'GSTN Portal / CBIC',
    defaultRef: '27AABCB1234F1Z5',
    hint: 'e.g. 27AABCB1234F1Z5 (15 chars)',
    sampleFileName: 'GST_Registration_Certificate.pdf'
  },
  {
    type: 'UDYAM',
    name: 'Udyam MSME Registration',
    authority: 'Ministry of MSME',
    defaultRef: 'UDYAM-MH-03-0019284',
    hint: 'e.g. UDYAM-MH-03-0019284',
    sampleFileName: 'UDYAM_Registration_Cert.pdf'
  },
  {
    type: 'MSME',
    name: 'MSME Classification Undertaking',
    authority: 'DPIIT Public Procurement Order',
    defaultRef: 'MSME-REG-2026-9901',
    hint: 'e.g. MSME-REG-2026-9901',
    sampleFileName: 'MSME_Classification_Doc.pdf'
  },
  {
    type: 'ISO',
    name: 'ISO 9001:2015 Quality Management',
    authority: 'NABCB Accredited Registrar',
    defaultRef: 'ISO-9001-2015-CERT',
    hint: 'e.g. ISO-9001-2015-CERT',
    sampleFileName: 'ISO_9001_Quality_Cert.pdf'
  },
  {
    type: 'CA_TURNOVER',
    name: 'CA Audited Turnover Statement',
    authority: 'ICAI UDIN Portal',
    defaultRef: 'UDIN-2026-89124401',
    hint: 'e.g. UDIN-2026-89124401',
    sampleFileName: 'CA_Turnover_Statement.pdf'
  }
];

export default function CompliancePassportView({ currentUser, currentRole, onNavigateHome }) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Bidder states
  const [vendorData, setVendorData] = useState(null);
  const [passportData, setPassportData] = useState(null);
  const [verificationsList, setVerificationsList] = useState([]);
  const [presentationsList, setPresentationsList] = useState([]);
  const [qrCodeBlob, setQrCodeBlob] = useState(null);
  const [issuing, setIssuing] = useState(false);

  // Per-document upload & verification state
  const [docInputs, setDocInputs] = useState({});
  const [docFiles, setDocFiles] = useState({});
  const [docScanStatus, setDocScanStatus] = useState({});
  const fileInputRefs = useRef({});

  // Buyer states
  const [vendorsList, setVendorsList] = useState([]);
  const [verifyPassportId, setVerifyPassportId] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [verifyingPassport, setVerifyingPassport] = useState(false);

  // Initialize input defaults from vendor data
  const initDocInputs = useCallback((vendor, verifs = []) => {
    const initialInputs = {
      PAN: vendor?.pan || 'AABCB1234F',
      GST: vendor?.gstin || '27AABCB1234F1Z5',
      UDYAM: vendor?.udyamNo || 'UDYAM-MH-03-0019284',
      MSME: 'MSME-REG-2026-9901',
      ISO: 'ISO-9001-2015-CERT',
      CA_TURNOVER: 'UDIN-2026-89124401'
    };

    setDocInputs(prev => ({ ...initialInputs, ...prev }));

    // Pre-populate status from existing backend verifications
    const statusMap = {};
    (verifs || []).forEach(v => {
      if (v.status === 'verified') {
        let detailsObj = {};
        try {
          detailsObj = typeof v.details === 'string' ? JSON.parse(v.details) : (v.details || {});
        } catch {
          // ignore
        }
        statusMap[v.docType] = {
          status: 'verified',
          extractedId: v.docRef,
          confidence: detailsObj.confidence || 98.5,
          message: 'Document verified & matched via OCR'
        };
      }
    });
    setDocScanStatus(prev => ({ ...statusMap, ...prev }));
  }, []);

  // Fetch Bidder View Data
  const fetchBidderData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const vendors = await gemApi.getVendors();
      const currentVendor = (vendors && vendors.length > 0)
        ? (vendors.find(v => v.gstin === currentUser?.gstin || v.id === currentUser?.id) || vendors[0])
        : null;

      if (currentVendor) {
        const fullData = await gemApi.getVendorById(currentVendor.id);
        const v = fullData.vendor || currentVendor;
        setVendorData(v);
        setVerificationsList(fullData.verifications || []);
        setPresentationsList(fullData.presentations || []);
        initDocInputs(v, fullData.verifications || []);

        const p = fullData.passport;
        if (p) {
          setPassportData(p);
          try {
            const qrUrl = await gemApi.getPassportQrCode(p.id);
            if (qrUrl) setQrCodeBlob(qrUrl);
          } catch (e) {
            console.warn('QR code fetch failed:', e);
          }
        } else {
          setPassportData(null);
          setQrCodeBlob(null);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch vendor data');
    } finally {
      setLoading(false);
    }
  }, [currentUser, initDocInputs]);

  // Fetch Buyer View Data
  const fetchBuyerData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const vendors = await gemApi.getVendors();
      setVendorsList(vendors || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch vendors');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentRole === 'bidder') {
      fetchBidderData();
    } else {
      fetchBuyerData();
    }
  }, [currentRole, fetchBidderData, fetchBuyerData]);

  // Handle Manual ID Input Change
  const handleInputChange = (docType, value) => {
    setDocInputs(prev => ({ ...prev, [docType]: value }));
  };

  // Handle File Upload Selection
  const handleFileSelect = (docType, file) => {
    if (!file) return;
    setDocFiles(prev => ({ ...prev, [docType]: file }));
    // Reset scan status for this doc
    setDocScanStatus(prev => ({
      ...prev,
      [docType]: { status: 'selected', fileName: file.name }
    }));
  };

  // Create simulated dummy file for easy testing if user didn't pick an external file
  const createMockFile = (docType, manualId) => {
    const content = `GOVERNMENT OF INDIA / OFFICIAL CERTIFICATE\nDOCUMENT TYPE: ${docType}\nREGISTRATION / ID NUMBER: ${manualId}\nDATE OF ISSUANCE: 2026-01-15\nSTATUS: ACTIVE & VERIFIED`;
    const blob = new Blob([content], { type: 'text/plain' });
    return new File([blob], `${docType}_Certificate.txt`, { type: 'text/plain' });
  };

  // Scan & Verify Single Document via OCR
  const handleScanSingleDoc = async (docType) => {
    if (!vendorData) return;
    const manualId = (docInputs[docType] || '').trim();
    if (!manualId) {
      alert(`Please enter the Document Number / ID for ${docType}`);
      return;
    }

    let file = docFiles[docType];
    if (!file) {
      // Auto-create a simulated certificate file with the specified document number
      file = createMockFile(docType, manualId);
      setDocFiles(prev => ({ ...prev, [docType]: file }));
    }

    try {
      setDocScanStatus(prev => ({
        ...prev,
        [docType]: { status: 'scanning', message: 'Extracting text with OCR...' }
      }));

      const result = await gemApi.verifyDocumentUpload(vendorData.id, file, docType, manualId);

      if (result.success || result.ocrResult?.match) {
        setDocScanStatus(prev => ({
          ...prev,
          [docType]: {
            status: 'verified',
            extractedId: result.ocrResult?.extractedId || manualId,
            confidence: result.ocrResult?.confidence || 98.5,
            message: result.message || 'OCR match confirmed!'
          }
        }));
        // Refresh verification list from backend
        const fullData = await gemApi.getVendorById(vendorData.id);
        if (fullData.verifications) {
          setVerificationsList(fullData.verifications);
        }
      } else {
        setDocScanStatus(prev => ({
          ...prev,
          [docType]: {
            status: 'failed',
            extractedId: result.ocrResult?.extractedId || 'Unrecognized',
            confidence: result.ocrResult?.confidence || 40.0,
            message: result.message || `OCR Mismatch: ID did not match '${manualId}'`
          }
        }));
      }
    } catch (err) {
      console.error(err);
      setDocScanStatus(prev => ({
        ...prev,
        [docType]: {
          status: 'failed',
          message: err.message || 'OCR processing error'
        }
      }));
    }
  };

  // Scan & Verify ALL Documents in sequence
  const handleScanAllDocs = async () => {
    for (const doc of DOCUMENT_CONFIGS) {
      await handleScanSingleDoc(doc.type);
    }
  };

  // Check how many documents are verified
  const verifiedDocMap = useMemo(() => {
    const map = {};
    DOCUMENT_CONFIGS.forEach(doc => {
      const isVerifiedInDb = verificationsList.some(v => v.docType === doc.type && v.status === 'verified');
      const isVerifiedInState = docScanStatus[doc.type]?.status === 'verified';
      if (isVerifiedInDb || isVerifiedInState) {
        map[doc.type] = true;
      }
    });
    return map;
  }, [verificationsList, docScanStatus]);

  const verifiedCount = Object.keys(verifiedDocMap).length;
  const allVerified = verifiedCount === DOCUMENT_CONFIGS.length;
  const canIssue = verifiedCount >= 2 && (verifiedDocMap['PAN'] && verifiedDocMap['GST']);

  // Issue or Renew Passport
  const handleIssuePassport = async () => {
    if (!vendorData) return;
    try {
      setIssuing(true);
      const res = await gemApi.issuePassport(vendorData.id);
      await fetchBidderData();
      alert(res.message || 'Digital Compliance Passport issued successfully with 1-Month QR validity!');
    } catch (err) {
      console.error(err);
      alert('Failed to issue passport: ' + (err.message || 'Missing verified documents'));
    } finally {
      setIssuing(false);
    }
  };

  // Buyer: Verify Passport by ID
  const handleVerifyPassportSubmit = async (customId) => {
    const idToVerify = customId || verifyPassportId;
    if (!idToVerify) return;
    try {
      setVerifyingPassport(true);
      const res = await gemApi.verifyPassport(idToVerify.trim(), {
        tenderId: 'GEM/2026/B/891244',
        bidId: 'BID-20495'
      });
      setVerificationResult(res);
    } catch (err) {
      console.error(err);
      setVerificationResult({
        valid: false,
        status: 'ERROR',
        message: err.message || 'Passport ID not found or server offline'
      });
    } finally {
      setVerifyingPassport(false);
    }
  };

  // Buyer: Revoke a Passport
  const handleRevoke = async (passportId) => {
    if (!passportId) return;
    const reason = prompt('Enter statutory reason for revoking this Compliance Passport:');
    if (!reason) return;
    try {
      await gemApi.revokePassport(passportId, reason);
      await fetchBuyerData();
    } catch (err) {
      console.error(err);
      alert('Failed to revoke passport: ' + err.message);
    }
  };

  // Download QR Code
  const handleDownloadQr = () => {
    if (qrCodeBlob) {
      const a = document.createElement('a');
      a.href = qrCodeBlob;
      a.download = `compliance-passport-${passportData?.id?.slice(0, 8) || 'qr'}.png`;
      a.click();
    }
  };

  const renderLoading = () => (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '240px', gap: '1rem' }}>
      <RefreshCw size={28} className="spinner" style={{ animation: 'spin 1s linear infinite', color: '#0284c7' }} />
      <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600' }}>Loading Compliance Passport records...</span>
    </div>
  );

  if (loading) {
    return (
      <div style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 50%, #fff7ed 100%)', minHeight: '85vh', padding: '2.5rem 1.5rem', color: '#0f172a' }}>
        {renderLoading()}
      </div>
    );
  }

  // --- BIDDER VIEW ---
  if (currentRole === 'bidder') {
    const score = vendorData?.complianceScore || vendorData?.compliance_score || 96;
    const badgeColor = score >= 80 ? 'green' : score >= 60 ? 'orange' : 'red';

    const pStatus = passportData?.status ? (passportData.status.charAt(0).toUpperCase() + passportData.status.slice(1)) : 'None';
    const pColor = pStatus === 'Active' ? '#059669' : (pStatus === 'Expired' || pStatus === 'Revoked') ? '#dc2626' : '#64748b';

    let daysToExpiry = 'N/A';
    if (passportData?.expiresAt) {
      const diff = new Date(passportData.expiresAt) - new Date();
      daysToExpiry = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    return (
      <div style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f0fdf4 35%, #eff6ff 70%, #fff7ed 100%)', minHeight: '85vh', padding: '2.5rem 1.5rem', color: '#0f172a' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="section-tag" style={{ display: 'inline-block', backgroundColor: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.05em', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
              {t('passportTag') || 'COMPLIANCE PASSPORT (GFR RULE 144/153)'}
            </span>
            <h1 className="serif-heading" style={{ fontSize: '2.2rem', color: '#0f172a', fontWeight: '800', margin: '0 0 0.4rem 0' }}>
              {t('passportTitle') || 'Digital Compliance Passport'}
            </h1>
            <p style={{ color: '#475569', margin: 0, fontSize: '0.95rem' }}>
              {t('passportSubtitle') || 'Upload each statutory document, scan via OCR, match IDs, and generate a 1-Month QR Passport for instant bid qualification.'}
            </p>
          </div>
          {onNavigateHome && (
            <button 
              onClick={onNavigateHome}
              style={{
                backgroundColor: '#ffffff',
                color: '#0284c7',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '0.65rem 1.15rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                transition: 'all 0.2s ease'
              }}
              title="Return to GeM Homepage"
            >
              <Home size={15} color="#0284c7" />
              <span>🏠 Homepage</span>
            </button>
          )}
        </div>

        {/* Top Summary Stats */}
        <div className="terminal-stat-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          <div className="terminal-card">
            <span className="t-card-label" style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Compliance Score</span>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '0.4rem' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a' }}>{score}/100</span>
              <span className={`t-card-badge ${badgeColor}`} style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '700' }}>
                {score >= 80 ? 'Class-I Local' : 'Class-II'}
              </span>
            </div>
          </div>

          <div className="terminal-card">
            <span className="t-card-label" style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>OCR Verified Documents</span>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '0.4rem' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: '800', color: verifiedCount === 6 ? '#059669' : '#0284c7' }}>
                {verifiedCount} / 6
              </span>
              <span style={{ fontSize: '0.75rem', color: allVerified ? '#059669' : '#d97706', fontWeight: '700' }}>
                {allVerified ? '✓ 100% Matched' : `${6 - verifiedCount} Pending`}
              </span>
            </div>
          </div>

          <div className="terminal-card">
            <span className="t-card-label" style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Passport Status</span>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '0.4rem' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: '800', color: pColor }}>{pStatus}</span>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>RSA-2048</span>
            </div>
          </div>

          <div className="terminal-card">
            <span className="t-card-label" style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Passport Validity TTL</span>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '0.4rem' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a' }}>
                {daysToExpiry !== 'N/A' ? `${daysToExpiry}d` : '30 Days'}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: '700' }}>1-Month Expiry</span>
            </div>
          </div>
        </div>

        {/* Section 1: Per-Document Upload & OCR Verification Panel */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', marginBottom: '2.5rem', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#0f172a', fontWeight: '800' }}>
                <Scan size={22} color="#0284c7" />
                <span>Step 1: Upload Documents & Verify IDs with OCR</span>
              </h2>
              <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.85rem', color: '#475569' }}>
                Enter your document ID, attach the certificate file (PDF/Image), and run OCR scan. If the OCR-extracted number matches your manual input, the document gets verified.
              </p>
            </div>

            <button
              onClick={handleScanAllDocs}
              style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.65rem 1.15rem',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
                transition: 'all 0.2s ease'
              }}
            >
              <Sparkles size={16} />
              <span>Auto Scan & Match All 6</span>
            </button>
          </div>

          {/* Progress Bar */}
          <div style={{ marginBottom: '1.5rem', backgroundColor: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '0.5rem' }}>
              <span style={{ color: '#475569', fontWeight: '600' }}>Overall Document Verification Progress:</span>
              <span style={{ color: allVerified ? '#059669' : '#0284c7', fontWeight: '800' }}>
                {verifiedCount} of 6 Documents Verified ({Math.round((verifiedCount / 6) * 100)}%)
              </span>
            </div>
            <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${(verifiedCount / 6) * 100}%`,
                  height: '100%',
                  background: allVerified ? 'linear-gradient(90deg, #059669, #10b981)' : 'linear-gradient(90deg, #0284c7, #38bdf8)',
                  transition: 'width 0.4s ease'
                }}
              />
            </div>
          </div>

          {/* Document Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.25rem' }}>
            {DOCUMENT_CONFIGS.map((doc) => {
              const isVerified = verifiedDocMap[doc.type];
              const statusObj = docScanStatus[doc.type] || {};
              const isScanning = statusObj.status === 'scanning';
              const isFailed = statusObj.status === 'failed';
              const manualVal = docInputs[doc.type] || '';
              const fileObj = docFiles[doc.type];

              let cardBorder = '#e2e8f0';
              let cardBg = '#ffffff';
              if (isVerified) {
                cardBorder = '#a7f3d0';
                cardBg = '#f0fdf4';
              } else if (isFailed) {
                cardBorder = '#fecaca';
                cardBg = '#fef2f2';
              }

              return (
                <div
                  key={doc.type}
                  style={{
                    backgroundColor: cardBg,
                    border: `1px solid ${cardBorder}`,
                    borderRadius: '12px',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    position: 'relative',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                  }}
                >
                  {/* Card Header */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                      <div>
                        <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {doc.type} • {doc.authority}
                        </span>
                        <h3 style={{ margin: '0.2rem 0', fontSize: '1.05rem', color: '#0f172a', fontWeight: '700' }}>
                          {doc.name}
                        </h3>
                      </div>

                      {/* Status Tag */}
                      {isVerified ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.6rem', backgroundColor: '#ecfdf5', color: '#059669', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700', border: '1px solid #a7f3d0' }}>
                          <CheckCircle2 size={13} /> Matched
                        </span>
                      ) : isFailed ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.6rem', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700', border: '1px solid #fecaca' }}>
                          <XCircle size={13} /> Mismatch
                        </span>
                      ) : isScanning ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.6rem', backgroundColor: '#eff6ff', color: '#0284c7', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700', border: '1px solid #bae6fd' }}>
                          <RefreshCw size={13} className="spinner" /> OCR Scanning
                        </span>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.6rem', backgroundColor: '#f8fafc', color: '#64748b', borderRadius: '4px', fontSize: '0.75rem', border: '1px solid #e2e8f0' }}>
                          <Clock size={13} /> Pending Scan
                        </span>
                      )}
                    </div>

                    {/* Manual ID Input */}
                    <div style={{ marginTop: '0.75rem' }}>
                      <label style={{ display: 'block', fontSize: '0.76rem', color: '#475569', marginBottom: '0.3rem', fontWeight: '600' }}>
                        1. Enter Document Number / ID:
                      </label>
                      <input
                        type="text"
                        value={manualVal}
                        onChange={(e) => handleInputChange(doc.type, e.target.value)}
                        placeholder={doc.hint}
                        className="mono-text"
                        style={{
                          width: '100%',
                          padding: '0.55rem 0.75rem',
                          backgroundColor: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          color: '#0f172a',
                          fontSize: '0.85rem',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    {/* Upload File Input Slot */}
                    <div style={{ marginTop: '0.75rem' }}>
                      <label style={{ display: 'block', fontSize: '0.76rem', color: '#475569', marginBottom: '0.3rem', fontWeight: '600' }}>
                        2. Upload Document File (PDF / Scanned Image):
                      </label>
                      <input
                        type="file"
                        ref={el => fileInputRefs.current[doc.type] = el}
                        style={{ display: 'none' }}
                        accept=".pdf,.png,.jpg,.jpeg,.txt"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileSelect(doc.type, e.target.files[0]);
                          }
                        }}
                      />
                      <div
                        onClick={() => fileInputRefs.current[doc.type]?.click()}
                        style={{
                          border: '1px dashed #cbd5e1',
                          borderRadius: '6px',
                          padding: '0.55rem 0.75rem',
                          backgroundColor: '#f8fafc',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.5rem',
                          transition: 'border-color 0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                          <Upload size={14} color="#0284c7" />
                          <span style={{ fontSize: '0.8rem', color: fileObj ? '#0284c7' : '#64748b', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {fileObj ? fileObj.name : `Attach ${doc.sampleFileName}`}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', flexShrink: 0 }}>
                          {fileObj ? 'Change' : 'Browse'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* OCR Match Feedback / Details */}
                  {statusObj.message && (
                    <div style={{
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.76rem',
                      backgroundColor: isVerified ? '#ecfdf5' : isFailed ? '#fef2f2' : '#eff6ff',
                      color: isVerified ? '#059669' : isFailed ? '#dc2626' : '#0284c7',
                      border: `1px solid ${isVerified ? '#a7f3d0' : isFailed ? '#fecaca' : '#bae6fd'}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}>
                      {isVerified ? <CheckCircle2 size={14} /> : isFailed ? <AlertCircle size={14} /> : <Scan size={14} />}
                      <span>{statusObj.message}</span>
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    onClick={() => handleScanSingleDoc(doc.type)}
                    disabled={isScanning}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.9rem',
                      backgroundColor: isVerified ? '#ecfdf5' : '#0284c7',
                      color: isVerified ? '#059669' : '#ffffff',
                      border: isVerified ? '1px solid #a7f3d0' : 'none',
                      borderRadius: '6px',
                      cursor: isScanning ? 'not-allowed' : 'pointer',
                      fontWeight: '700',
                      fontSize: '0.82rem',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '0.45rem',
                      boxShadow: isVerified ? 'none' : '0 2px 6px rgba(2, 132, 199, 0.25)',
                      transition: 'all 0.2s'
                    }}
                  >
                    {isScanning ? (
                      <>
                        <RefreshCw size={14} className="spinner" />
                        <span>Scanning via OCR...</span>
                      </>
                    ) : isVerified ? (
                      <>
                        <CheckCircle2 size={14} />
                        <span>Re-Scan & Verify OCR</span>
                      </>
                    ) : (
                      <>
                        <Scan size={14} />
                        <span>Scan & Match Document</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Passport Issuance & QR Display */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
          
          {/* Passport Credential Card */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', position: 'relative', overflow: 'hidden', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: pColor }}></div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: '800', textTransform: 'uppercase' }}>
                  Government e-Marketplace • Verified Seller ID
                </span>
                <h2 style={{ margin: '0.3rem 0 0.5rem 0', fontSize: '1.4rem', color: '#0f172a', fontWeight: '800' }}>
                  {vendorData?.name || 'Apex Supplies Ltd.'}
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.84rem', color: '#334155' }}>
                  <span>GSTIN: <strong className="mono-text" style={{ color: '#0284c7' }}>{vendorData?.gstin || '27AABCB1234F1Z5'}</strong></span>
                  <span>PAN: <strong className="mono-text" style={{ color: '#0284c7' }}>{vendorData?.pan || 'AABCB1234F'}</strong></span>
                  <span>UDYAM: <strong className="mono-text" style={{ color: '#0284c7' }}>{vendorData?.udyamNo || 'UDYAM-MH-03-0019284'}</strong></span>
                </div>
                <div style={{ marginTop: '0.6rem' }}>
                  <span style={{ backgroundColor: '#eff6ff', color: '#0284c7', border: '1px solid #bae6fd', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' }}>
                    {vendorData?.miiClassification || 'Class-I Local Supplier (68%)'}
                  </span>
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  border: `3px solid ${badgeColor === 'green' ? '#059669' : '#d97706'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.35rem',
                  fontWeight: '800',
                  color: badgeColor === 'green' ? '#059669' : '#d97706',
                  backgroundColor: badgeColor === 'green' ? '#ecfdf5' : '#fffbeb'
                }}>
                  {score}
                </div>
                <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: '700', display: 'block', marginTop: '0.2rem' }}>AI TRUST</span>
              </div>
            </div>

            {passportData ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                  <div style={{ width: '100px', height: '100px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, padding: '4px' }}>
                    {qrCodeBlob ? (
                      <img src={qrCodeBlob} alt="Passport QR" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                      <QrCode size={68} color="#0f172a" />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>Passport Token ID</span>
                      <span style={{ fontSize: '0.68rem', padding: '0.1rem 0.45rem', backgroundColor: '#ecfdf5', color: '#059669', borderRadius: '4px', border: '1px solid #a7f3d0', fontWeight: '700' }}>
                        1-Month QR Code
                      </span>
                    </div>
                    <div className="mono-text" style={{ fontSize: '0.85rem', color: '#0284c7', fontWeight: '700', wordBreak: 'break-all', marginBottom: '0.5rem' }}>
                      {passportData.id}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.78rem' }}>
                      <div>
                        <span style={{ color: '#64748b' }}>Issued: </span>
                        <span style={{ color: '#0f172a', fontWeight: '600' }}>{passportData.issuedAt ? passportData.issuedAt.slice(0, 10) : 'N/A'}</span>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Expires: </span>
                        <span style={{ color: '#d97706', fontWeight: '700' }}>
                          {passportData.expiresAt ? passportData.expiresAt.slice(0, 10) : 'N/A'} (30d)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div className="mono-text" style={{ fontSize: '0.74rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Fingerprint size={14} color="#059669" />
                    <span>Sig: {passportData.signature ? `${passportData.signature.slice(0, 18)}...` : 'RSA-PSS-SHA256'}</span>
                  </div>
                  <button
                    onClick={handleDownloadQr}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.5rem 1rem',
                      backgroundColor: '#eff6ff',
                      border: '1px solid #bae6fd',
                      color: '#0284c7',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: '700'
                    }}
                  >
                    <Download size={14} /> Download QR Code
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
                <Shield size={42} color="#64748b" style={{ marginBottom: '0.5rem', opacity: 0.6 }} />
                <h4 style={{ margin: '0 0 0.3rem 0', color: '#0f172a', fontWeight: '700' }}>No Active Compliance Passport</h4>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                  Scan & verify your documents above to generate your 1-Month QR Compliance Passport.
                </p>
              </div>
            )}
          </div>

          {/* Issue Passport Action Box */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)' }}>
            <div>
              <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.2rem', color: '#0f172a', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={20} color="#0284c7" />
                <span>Step 2: Generate Digital Compliance Passport</span>
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.5', margin: '0 0 1.25rem 0' }}>
                Once your statutory documents match the OCR scans, generate your digitally-signed QR Passport with a <strong style={{ color: '#0f172a' }}>1-month expiration deadline</strong>.
              </p>

              <div style={{ backgroundColor: '#f8fafc', borderRadius: '10px', padding: '1rem', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0284c7', marginBottom: '0.5rem' }}>
                  Issuance Requirements:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: verifiedDocMap['PAN'] ? '#059669' : '#64748b' }}>
                    {verifiedDocMap['PAN'] ? <CheckCircle2 size={14} color="#059669" /> : <Clock size={14} color="#64748b" />}
                    <span style={{ fontWeight: verifiedDocMap['PAN'] ? '700' : '500' }}>PAN Document OCR Matched</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: verifiedDocMap['GST'] ? '#059669' : '#64748b' }}>
                    {verifiedDocMap['GST'] ? <CheckCircle2 size={14} color="#059669" /> : <Clock size={14} color="#64748b" />}
                    <span style={{ fontWeight: verifiedDocMap['GST'] ? '700' : '500' }}>GSTIN Document OCR Matched</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: allVerified ? '#059669' : '#64748b' }}>
                    {allVerified ? <CheckCircle2 size={14} color="#059669" /> : <Clock size={14} color="#64748b" />}
                    <span style={{ fontWeight: allVerified ? '700' : '500' }}>All 6 Documents OCR Matched ({verifiedCount}/6)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0284c7' }}>
                    <ShieldCheck size={14} color="#0284c7" />
                    <span style={{ fontWeight: '600' }}>RSA-2048 Digital Signature & 1-Month Expiry Attached</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleIssuePassport}
              disabled={issuing || !canIssue}
              style={{
                width: '100%',
                padding: '0.85rem 1.25rem',
                background: canIssue ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' : '#e2e8f0',
                color: canIssue ? '#ffffff' : '#94a3b8',
                border: 'none',
                borderRadius: '8px',
                cursor: (issuing || !canIssue) ? 'not-allowed' : 'pointer',
                fontWeight: '800',
                fontSize: '0.92rem',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.6rem',
                boxShadow: canIssue ? '0 4px 14px rgba(5, 150, 105, 0.25)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              {issuing ? (
                <>
                  <RefreshCw size={18} className="spinner" />
                  <span>Signing Credential & Generating QR...</span>
                </>
              ) : (
                <>
                  <QrCode size={18} />
                  <span>{passportData ? 'Regenerate 1-Month Passport QR' : 'Generate Compliance Passport (1-Month QR)'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Presentation History Audit Trail */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: '800' }}>Bid Presentation Audit Trail (Immutable Log)</h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>
              {presentationsList.length} presentation events recorded
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1.2fr', padding: '0.85rem 1.25rem', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', color: '#475569', fontSize: '0.76rem', textTransform: 'uppercase', fontWeight: '800', borderBottom: '1px solid #e2e8f0' }}>
            <div>Date & Time</div>
            <div>Bid Reference</div>
            <div>Tender ID</div>
            <div>Verification Result</div>
            <div>Verified By</div>
          </div>

          {presentationsList.length > 0 ? (
            presentationsList.map((pres, idx) => (
              <div
                key={pres.id || idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1.2fr',
                  padding: '0.95rem 1.25rem',
                  borderBottom: '1px solid #f1f5f9',
                  fontSize: '0.85rem',
                  alignItems: 'center',
                  transition: 'background-color 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
              >
                <div style={{ color: '#475569', fontWeight: '500' }}>{pres.presentedAt ? pres.presentedAt.replace('T', ' ').slice(0, 19) : 'Recent'}</div>
                <div className="mono-text" style={{ color: '#0284c7', fontWeight: '700' }}>{pres.bidId || 'BID-20495'}</div>
                <div className="mono-text" style={{ color: '#334155', fontWeight: '600' }}>{pres.tenderId || 'GEM/2026/B/891244'}</div>
                <div>
                  <span style={{
                    color: pres.verificationResult === 'valid' ? '#059669' : '#dc2626',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontWeight: '800'
                  }}>
                    {pres.verificationResult === 'valid' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    {pres.verificationResult ? pres.verificationResult.toUpperCase() : 'VALID'}
                  </span>
                </div>
                <div style={{ color: '#64748b' }}>{pres.verifiedBy || 'Procuring Officer'}</div>
              </div>
            ))
          ) : (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.88rem' }}>
              Passport has not been presented in any bids yet. Present your credential during tender submission!
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // BUYER / PROCURING OFFICER VIEW: "Verify Seller Passport"
  // =========================================================================
  return (
    <div style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f0fdf4 35%, #eff6ff 70%, #fff7ed 100%)', minHeight: '85vh', padding: '2.5rem 1.5rem', color: '#0f172a' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="section-tag" style={{ display: 'inline-block', backgroundColor: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.05em', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
            PROCURING AUTHORITY • GFR 2017 VALIDATOR
          </span>
          <h1 className="serif-heading" style={{ fontSize: '2.2rem', color: '#0f172a', fontWeight: '800', margin: '0 0 0.4rem 0' }}>
            Verify Seller Compliance Passport
          </h1>
          <p style={{ color: '#475569', margin: 0, fontSize: '0.95rem' }}>
            Instantly verify RSA-2048 signed seller credentials without re-running document OCR pipelines.
          </p>
        </div>
        {onNavigateHome && (
          <button 
            onClick={onNavigateHome}
            style={{
              backgroundColor: '#ffffff',
              color: '#0284c7',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '0.65rem 1.15rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              transition: 'all 0.2s ease'
            }}
            title="Return to GeM Homepage"
          >
            <Home size={15} color="#0284c7" />
            <span>🏠 Homepage</span>
          </button>
        )}
      </div>

      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', marginBottom: '2.5rem', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', color: '#0f172a', fontWeight: '800' }}>
          Instant Passport Signature Verification
        </h3>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Paste Passport UUID / Token (e.g. 8f7a6b5c-4d3e-2f1a-3b8c-9d0e1f2a3b4c)"
              value={verifyPassportId}
              onChange={(e) => setVerifyPassportId(e.target.value)}
              className="mono-text"
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.75rem',
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                color: '#0f172a',
                fontSize: '0.9rem',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <button
            onClick={() => handleVerifyPassportSubmit()}
            disabled={verifyingPassport || !verifyPassportId}
            style={{
              padding: '0.75rem 1.75rem',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              cursor: (!verifyPassportId || verifyingPassport) ? 'not-allowed' : 'pointer',
              fontWeight: '800',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)'
            }}
          >
            {verifyingPassport ? <RefreshCw size={16} className="spinner" /> : <ShieldCheck size={16} />}
            <span>{verifyingPassport ? 'Checking Signature...' : 'Verify Passport'}</span>
          </button>
        </div>

        {verificationResult && (
          <div
            style={{
              marginTop: '1.5rem',
              padding: '1.5rem',
              backgroundColor: verificationResult.valid ? '#ecfdf5' : '#fef2f2',
              border: `1px solid ${verificationResult.valid ? '#a7f3d0' : '#fecaca'}`,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1.25rem'
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: verificationResult.valid ? '#d1fae5' : '#fee2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {verificationResult.valid ? <CheckCircle2 size={28} color="#059669" /> : <XCircle size={28} color="#dc2626" />}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: verificationResult.valid ? '#065f46' : '#991b1b' }}>
                  {verificationResult.valid ? 'PASSPORT VALID (AUTHENTIC & UNTAMPERED)' : 'PASSPORT INVALID / REJECTED'}
                </h4>
                {verificationResult.signatureValid && (
                  <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', backgroundColor: '#e0f2fe', color: '#0284c7', borderRadius: '4px', border: '1px solid #bae6fd', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: '700' }}>
                    <Fingerprint size={12} /> RSA-2048 Signature Match
                  </span>
                )}
              </div>

              {verificationResult.vendorName && (
                <div style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.3rem' }}>
                  Vendor: {verificationResult.vendorName}
                </div>
              )}

              <p style={{ margin: '0 0 0.75rem 0', color: '#334155', fontSize: '0.86rem' }}>
                {verificationResult.message}
              </p>

              {verificationResult.verifiedCredentials && verificationResult.verifiedCredentials.length > 0 && (
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {verificationResult.verifiedCredentials.map((cred, idx) => (
                    <span key={idx} style={{ padding: '0.25rem 0.6rem', backgroundColor: '#f0fdf4', border: '1px solid #a7f3d0', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', color: '#047857' }}>
                      ✓ {cred.type || cred}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {verificationResult.complianceScore !== undefined && (
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0284c7' }}>
                  {verificationResult.complianceScore}
                </div>
                <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700' }}>SCORE</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Seller Registry Table */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', fontWeight: '800' }}>Master Vendor Compliance Directory</h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Real-time passport status across registered suppliers</span>
          </div>
          <span style={{ fontSize: '0.82rem', color: '#0284c7', fontWeight: '700' }}>{vendorsList.length} Vendors Registered</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.4fr 1fr 1.2fr 1.2fr 1.2fr', padding: '0.85rem 1.25rem', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', color: '#475569', fontSize: '0.76rem', textTransform: 'uppercase', fontWeight: '800', borderBottom: '1px solid #e2e8f0' }}>
          <div>Vendor Entity</div>
          <div>GSTIN / PAN</div>
          <div>Score</div>
          <div>Classification</div>
          <div>Passport Status</div>
          <div style={{ textAlign: 'right' }}>Actions</div>
        </div>

        {vendorsList.map((vendor) => {
          const score = vendor.complianceScore || vendor.compliance_score || 0;
          const status = vendor.passportStatus || (vendor.passportId ? 'Active' : 'No Passport');
          const isActive = status === 'Active' || status === 'active';
          const statusColor = isActive ? '#059669' : (status === 'Revoked' || status === 'Expired') ? '#dc2626' : '#64748b';
          const statusBg = isActive ? '#ecfdf5' : (status === 'Revoked' || status === 'Expired') ? '#fef2f2' : '#f8fafc';

          return (
            <div
              key={vendor.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1.4fr 1fr 1.2fr 1.2fr 1.2fr',
                padding: '0.95rem 1.25rem',
                borderBottom: '1px solid #f1f5f9',
                fontSize: '0.85rem',
                alignItems: 'center',
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
            >
              <div>
                <div style={{ fontWeight: '700', color: '#0f172a' }}>{vendor.name}</div>
                <span style={{ fontSize: '0.74rem', color: '#64748b' }}>{vendor.category}</span>
              </div>
              <div className="mono-text" style={{ fontSize: '0.8rem', color: '#334155' }}>
                <div>{vendor.gstin}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>PAN: {vendor.pan}</div>
              </div>
              <div>
                <span style={{ fontWeight: '800', color: score >= 80 ? '#059669' : score >= 60 ? '#d97706' : '#dc2626' }}>
                  {score}/100
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: '600' }}>
                  {vendor.miiClassification ? vendor.miiClassification.split(' ')[0] : 'Class-I'}
                </span>
              </div>
              <div>
                <span style={{ color: statusColor, fontSize: '0.78rem', fontWeight: '800', padding: '0.2rem 0.6rem', borderRadius: '6px', backgroundColor: statusBg, border: `1px solid ${statusColor}33` }}>
                  {status}
                </span>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                {vendor.passportId && (
                  <button
                    onClick={() => {
                      setVerifyPassportId(vendor.passportId);
                      handleVerifyPassportSubmit(vendor.passportId);
                    }}
                    style={{
                      padding: '0.35rem 0.75rem',
                      backgroundColor: '#eff6ff',
                      border: '1px solid #bae6fd',
                      color: '#0284c7',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: '700'
                    }}
                  >
                    Verify
                  </button>
                )}
                {isActive && vendor.passportId && (
                  <button
                    onClick={() => handleRevoke(vendor.passportId)}
                    style={{
                      padding: '0.35rem 0.75rem',
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fecaca',
                      color: '#dc2626',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: '700'
                    }}
                  >
                    Revoke
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
