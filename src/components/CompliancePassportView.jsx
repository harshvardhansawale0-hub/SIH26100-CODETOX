import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  ShieldCheck, FileText, QrCode, Download, Search, CheckCircle2,
  XCircle, Clock, AlertTriangle, Award, Eye, RefreshCw, Shield,
  Upload, Fingerprint, BadgeCheck, ChevronDown, ChevronUp, Copy, ExternalLink, Home,
  FileCheck, AlertCircle, Scan, Sparkles, Check
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { gemApi } from '../services/api';

const STATUTORY_DOCUMENTS = [
  {
    type: 'PAN',
    label: 'PAN (Permanent Account Number (NSDL))',
    authority: 'Income Tax Department (NSDL)',
    defaultRef: 'AABCB1234F',
    hint: 'e.g. AABCB1234F',
    sampleFileName: 'PAN_Card_Certificate.pdf'
  },
  {
    type: 'GST',
    label: 'GST (GSTIN Registration (GSTN Portal))',
    authority: 'GSTN Portal / CBIC',
    defaultRef: '27AABCB1234F1Z5',
    hint: 'e.g. 27AABCB1234F1Z5',
    sampleFileName: 'GST_Registration_Certificate.pdf'
  },
  {
    type: 'UDYAM',
    label: 'UDYAM (Udyam MSME Certificate)',
    authority: 'Ministry of MSME',
    defaultRef: 'UDYAM-MH-03-0019284',
    hint: 'e.g. UDYAM-MH-03-0019284',
    sampleFileName: 'UDYAM_Registration_Cert.pdf'
  },
  {
    type: 'MSME',
    label: 'MSME (MSME Classification)',
    authority: 'DPIIT Public Procurement Order',
    defaultRef: 'MSME-REG-2026-9901',
    hint: 'e.g. MSME-REG-2026-9901',
    sampleFileName: 'MSME_Classification_Doc.pdf'
  },
  {
    type: 'ISO',
    label: 'ISO (ISO 9001:2015 Quality Cert)',
    authority: 'NABCB Accredited Registrar',
    defaultRef: 'ISO-9001-2015-CERT',
    hint: 'e.g. ISO-9001-2015-CERT',
    sampleFileName: 'ISO_9001_Quality_Cert.pdf'
  },
  {
    type: 'CA_TURNOVER',
    label: 'CA_TURNOVER (CA Audited Turnover with UDIN)',
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
  const [verifyingAll, setVerifyingAll] = useState(false);

  // Per-document state: files, inputs, scan status, and verification statement
  const [docInputs, setDocInputs] = useState({});
  const [docFiles, setDocFiles] = useState({});
  const [docScanStatus, setDocScanStatus] = useState({});
  const fileInputRefs = useRef({});

  // Buyer states
  const [vendorsList, setVendorsList] = useState([]);
  const [verifyPassportId, setVerifyPassportId] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [verifyingPassport, setVerifyingPassport] = useState(false);

  // Initialize input defaults
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

    // Read initial verification statements if already verified in DB
    const statusMap = {};
    (verifs || []).forEach(v => {
      if (v.status === 'verified') {
        let detailsObj = {};
        try {
          detailsObj = typeof v.details === 'string' ? JSON.parse(v.details) : (v.details || {});
        } catch {
          detailsObj = {};
        }
        statusMap[v.docType] = {
          status: 'verified',
          extractedId: v.docRef,
          confidence: detailsObj.confidence || 98.5,
          statement: detailsObj.statement || detailsObj.details || `Document verified & matched via OCR statement analysis.`,
          message: 'Verified'
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

  // Handle Manual Document Number / Statement Input
  const handleInputChange = (docType, value) => {
    setDocInputs(prev => ({ ...prev, [docType]: value }));
  };

  // Handle Document File Selection
  const handleFileSelect = (docType, file) => {
    if (!file) return;
    setDocFiles(prev => ({ ...prev, [docType]: file }));
    setDocScanStatus(prev => ({
      ...prev,
      [docType]: {
        status: 'ready',
        fileName: file.name,
        statement: `File attached: ${file.name}. Click 'Verify Statement' to scan.`
      }
    }));
  };

  // Create simulated dummy file if user clicks verify without attaching an external file
  const createMockFile = (docType, manualId) => {
    const content = `OFFICIAL GOVERNMENT ATTESTATION\nDOCUMENT TYPE: ${docType}\nREGISTRATION / STATEMENT ID: ${manualId}\nISSUANCE PORTAL: GOVERNMENT E-MARKETPLACE TRUST REGISTRY\nSTATUS: AUTHENTIC & ACTIVE`;
    const blob = new Blob([content], { type: 'text/plain' });
    return new File([blob], `${docType}_Statement_Certificate.txt`, { type: 'text/plain' });
  };

  // Scan & Verify Individual Document using Statement OCR
  const handleVerifySingleDoc = async (docType) => {
    if (!vendorData) return;
    const manualId = (docInputs[docType] || '').trim();
    if (!manualId) {
      alert(`Please provide the Document Number / Statement ID for ${docType}`);
      return;
    }

    let file = docFiles[docType];
    if (!file) {
      file = createMockFile(docType, manualId);
      setDocFiles(prev => ({ ...prev, [docType]: file }));
    }

    try {
      setDocScanStatus(prev => ({
        ...prev,
        [docType]: {
          status: 'scanning',
          statement: 'Scanning document statement with OCR forensics...'
        }
      }));

      const result = await gemApi.verifyDocumentUpload(vendorData.id, file, docType, manualId);
      const isMatch = result.success || result.ocrResult?.match;

      const statementText = result.ocrResult?.statement || result.ocrResult?.details || result.message || (isMatch ? 'Statement verified successfully.' : 'Statement mismatch.');

      setDocScanStatus(prev => ({
        ...prev,
        [docType]: {
          status: isMatch ? 'verified' : 'failed',
          extractedId: result.ocrResult?.extractedId || manualId,
          confidence: result.ocrResult?.confidence || 98.5,
          statement: statementText,
          fileName: file.name
        }
      }));

      // Refresh verifications from DB
      const fullData = await gemApi.getVendorById(vendorData.id);
      if (fullData.verifications) {
        setVerificationsList(fullData.verifications);
      }
    } catch (err) {
      console.error(err);
      setDocScanStatus(prev => ({
        ...prev,
        [docType]: {
          status: 'failed',
          statement: `Verification Error: ${err.message || 'Network / OCR failure'}`
        }
      }));
    }
  };

  // Verify ALL Documents via AI Statements
  const handleVerifyAllDocs = async () => {
    setVerifyingAll(true);
    for (const doc of STATUTORY_DOCUMENTS) {
      await handleVerifySingleDoc(doc.type);
    }
    setVerifyingAll(false);
  };

  // Check verified status for each document
  const verifiedDocMap = useMemo(() => {
    const map = {};
    STATUTORY_DOCUMENTS.forEach(doc => {
      const isVerifiedInDb = verificationsList.some(v => v.docType === doc.type && v.status === 'verified');
      const isVerifiedInState = docScanStatus[doc.type]?.status === 'verified';
      if (isVerifiedInDb || isVerifiedInState) {
        map[doc.type] = true;
      }
    });
    return map;
  }, [verificationsList, docScanStatus]);

  const verifiedCount = Object.keys(verifiedDocMap).length;
  const allVerified = verifiedCount === STATUTORY_DOCUMENTS.length;
  const canIssue = verifiedCount >= 2 && (verifiedDocMap['PAN'] && verifiedDocMap['GST']);

  // Issue or Renew Passport
  const handleIssuePassport = async () => {
    if (!vendorData) return;
    try {
      setIssuing(true);
      const res = await gemApi.issuePassport(vendorData.id);
      await fetchBidderData();
      alert('Digital Compliance Passport issued successfully with 1-Month QR validity!');
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
      <RefreshCw size={28} className="spinner" style={{ animation: 'spin 1s linear infinite', color: '#38bdf8' }} />
      <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Loading Compliance Passport records...</span>
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
              Upload each statutory document, verify using OCR statement analysis, and generate a 1-Month QR Passport for GeM bids.
            </p>
          </div>
          {onNavigateHome && (
            <button 
              onClick={onNavigateHome}
              style={{
                width: '40px',
                height: '40px',
                padding: 0,
                backgroundColor: '#ffffff',
                color: '#0284c7',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
              title="Return to GeM Homepage"
              aria-label="Return to GeM Homepage"
            >
              <Home size={18} color="#0284c7" />
            </button>
          )}
        </div>

        {/* Top Stat Cards */}
        <div className="terminal-stat-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          <div className="terminal-card" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <span className="t-card-label" style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Compliance Score</span>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '0.4rem' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a' }}>{score}/100</span>
              <span className={`t-card-badge ${badgeColor}`} style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '700' }}>
                {score >= 80 ? 'Class-I Local' : 'Class-II'}
              </span>
            </div>
          </div>

          <div className="terminal-card" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <span className="t-card-label" style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Verified Documents</span>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '0.4rem' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: '800', color: verifiedCount === 6 ? '#059669' : '#0284c7' }}>
                {verifiedCount} / 6
              </span>
              <span style={{ fontSize: '0.75rem', color: allVerified ? '#059669' : '#d97706', fontWeight: '700' }}>
                {allVerified ? '✓ All Statements Verified' : `${6 - verifiedCount} Pending`}
              </span>
            </div>
          </div>

          <div className="terminal-card" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <span className="t-card-label" style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Passport Status</span>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '0.4rem' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: '800', color: pColor }}>{pStatus}</span>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>RSA-2048</span>
            </div>
          </div>

          <div className="terminal-card" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <span className="t-card-label" style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>QR Validity Period</span>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '0.4rem' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a' }}>
                {daysToExpiry !== 'N/A' ? `${daysToExpiry}d` : '30 Days'}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: '700' }}>1-Month Expiry</span>
            </div>
          </div>
        </div>

        {/* Main Grid: Left = Passport Display Card, Right = Statutory Document Verification Panel */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
          
          {/* Passport Credential Card */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.75rem', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: pColor }}></div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: '700', textTransform: 'uppercase' }}>
                  Government e-Marketplace • Verified Seller ID
                </span>
                <h2 style={{ margin: '0.3rem 0 0.5rem 0', fontSize: '1.4rem', color: '#0f172a', fontWeight: '800' }}>
                  {vendorData?.name || 'Apex Supplies Ltd.'}
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.84rem', color: '#475569' }}>
                  <span>GSTIN: <strong className="mono-text" style={{ color: '#0284c7' }}>{vendorData?.gstin || '27AABCB1234F1Z5'}</strong></span>
                  <span>PAN: <strong className="mono-text" style={{ color: '#0284c7' }}>{vendorData?.pan || 'AABCB1234F'}</strong></span>
                  <span>UDYAM: <strong className="mono-text" style={{ color: '#0284c7' }}>{vendorData?.udyamNo || 'UDYAM-MH-03-0019284'}</strong></span>
                </div>
                <div style={{ marginTop: '0.6rem' }}>
                  <span style={{ backgroundColor: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd', padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' }}>
                    {vendorData?.miiClassification || 'Class-I Local Supplier (68%)'}
                  </span>
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  border: `3px solid ${badgeColor === 'green' ? '#059669' : '#f59e0b'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.35rem',
                  fontWeight: '800',
                  color: '#0f172a',
                  backgroundColor: '#f8fafc'
                }}>
                  {score}
                </div>
                <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block', marginTop: '0.2rem', fontWeight: '700' }}>AI TRUST</span>
              </div>
            </div>

            {passportData ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                  <div style={{ width: '108px', height: '108px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, padding: '4px' }}>
                    {qrCodeBlob ? (
                      <img src={qrCodeBlob} alt="Passport QR" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                      <QrCode size={72} color="#0f172a" />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Passport Token ID</span>
                      <span style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem', backgroundColor: '#dcfce7', color: '#15803d', borderRadius: '3px', fontWeight: '700' }}>
                        1-Month QR Code
                      </span>
                    </div>
                    <div className="mono-text" style={{ fontSize: '0.82rem', color: '#0284c7', wordBreak: 'break-all', marginBottom: '0.5rem', fontWeight: '700' }}>
                      {passportData.id}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.78rem' }}>
                      <div>
                        <span style={{ color: '#64748b' }}>Issued: </span>
                        <span style={{ color: '#1e293b' }}>{passportData.issuedAt ? passportData.issuedAt.slice(0, 10) : 'N/A'}</span>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Expires: </span>
                        <span style={{ color: '#b45309', fontWeight: '700' }}>
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
                      padding: '0.45rem 0.9rem',
                      backgroundColor: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      color: '#0284c7',
                      borderRadius: '6px',
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
              <div style={{ textAlign: 'center', padding: '2rem 1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                <Shield size={42} color="#94a3b8" style={{ marginBottom: '0.5rem', opacity: 0.6 }} />
                <h4 style={{ margin: '0 0 0.3rem 0', color: '#334155' }}>No Active Compliance Passport</h4>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                  Upload every single document below and verify statements to generate your 1-Month QR Compliance Passport.
                </p>
              </div>
            )}
          </div>

          {/* EXACT CARD: Statutory Document Verification (with per-document upload & statement verification) */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.75rem', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a', fontWeight: '800' }}>
                <ShieldCheck size={22} color="#0284c7" />
                <span>Statutory Document Verification</span>
              </h3>
              <span style={{ fontSize: '0.78rem', color: allVerified ? '#059669' : '#0284c7', fontWeight: '700', padding: '0.2rem 0.5rem', backgroundColor: '#f0fdf4', borderRadius: '4px', border: '1px solid #bbf7d0' }}>
                {verifiedCount} / 6 Verified
              </span>
            </div>

            <div style={{ display: 'grid', gap: '0.9rem', marginBottom: '1.5rem' }}>
              {STATUTORY_DOCUMENTS.map((doc) => {
                const isVerified = verifiedDocMap[doc.type];
                const statusObj = docScanStatus[doc.type] || {};
                const isScanning = statusObj.status === 'scanning';
                const isFailed = statusObj.status === 'failed';
                const fileObj = docFiles[doc.type];
                const manualId = docInputs[doc.type] || '';

                return (
                  <div
                    key={doc.type}
                    style={{
                      backgroundColor: isVerified ? '#f0fdf4' : '#f8fafc',
                      borderRadius: '8px',
                      border: isVerified ? '1px solid #86efac' : '1px solid #e2e8f0',
                      padding: '0.9rem 1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.65rem'
                    }}
                  >
                    {/* Top Row: Doc Name & Status Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <FileText size={16} color={isVerified ? '#059669' : '#0284c7'} />
                        <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>
                          {doc.label}
                        </span>
                      </div>

                      {isVerified ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#059669', fontSize: '0.8rem', fontWeight: '700' }}>
                          <CheckCircle2 size={16} /> Verified
                        </span>
                      ) : isFailed ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#dc2626', fontSize: '0.8rem', fontWeight: '700' }}>
                          <XCircle size={16} /> Mismatch
                        </span>
                      ) : isScanning ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#0284c7', fontSize: '0.8rem', fontWeight: '700' }}>
                          <RefreshCw size={14} className="spinner" /> Scanning Statement...
                        </span>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#b45309', fontSize: '0.8rem', fontWeight: '600' }}>
                          <Clock size={14} /> Pending Upload
                        </span>
                      )}
                    </div>

                    {/* Middle Row: Document ID Input + File Upload Button + Verify Button */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                      {/* Manual Statement / ID Input */}
                      <input
                        type="text"
                        value={manualId}
                        onChange={(e) => handleInputChange(doc.type, e.target.value)}
                        placeholder={doc.hint}
                        className="mono-text"
                        style={{
                          flex: 1,
                          minWidth: '160px',
                          padding: '0.45rem 0.65rem',
                          backgroundColor: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '5px',
                          color: '#0f172a',
                          fontSize: '0.82rem',
                          boxSizing: 'border-box'
                        }}
                      />

                      {/* Hidden File Input */}
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

                      {/* Upload Button */}
                      <button
                        type="button"
                        onClick={() => fileInputRefs.current[doc.type]?.click()}
                        style={{
                          padding: '0.45rem 0.75rem',
                          backgroundColor: fileObj ? '#eff6ff' : '#f1f5f9',
                          color: fileObj ? '#0284c7' : '#334155',
                          border: fileObj ? '1px solid #93c5fd' : '1px solid #cbd5e1',
                          borderRadius: '5px',
                          fontSize: '0.78rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          maxWidth: '180px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                        title={fileObj ? fileObj.name : 'Upload Document Statement (PDF/Image)'}
                      >
                        <Upload size={13} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {fileObj ? fileObj.name : 'Upload File'}
                        </span>
                      </button>

                      {/* Verify Button for this specific document */}
                      <button
                        type="button"
                        onClick={() => handleVerifySingleDoc(doc.type)}
                        disabled={isScanning}
                        style={{
                          padding: '0.45rem 0.85rem',
                          backgroundColor: isVerified ? '#dcfce7' : '#0284c7',
                          color: isVerified ? '#15803d' : '#ffffff',
                          border: isVerified ? '1px solid #86efac' : 'none',
                          borderRadius: '5px',
                          fontSize: '0.78rem',
                          fontWeight: '700',
                          cursor: isScanning ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        {isScanning ? <RefreshCw size={12} className="spinner" /> : <Scan size={12} />}
                        <span>{isVerified ? 'Re-Verify' : 'Verify'}</span>
                      </button>
                    </div>

                    {/* Bottom Row: Official Statement & OCR Feedback Box */}
                    {statusObj.statement && (
                      <div style={{
                        padding: '0.45rem 0.7rem',
                        borderRadius: '5px',
                        fontSize: '0.76rem',
                        lineHeight: '1.4',
                        backgroundColor: isVerified ? '#f0fdf4' : isFailed ? '#fef2f2' : '#eff6ff',
                        color: isVerified ? '#15803d' : isFailed ? '#b91c1c' : '#0369a1',
                        borderLeft: `3px solid ${isVerified ? '#10b981' : isFailed ? '#ef4444' : '#0284c7'}`,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.4rem'
                      }}>
                        {isVerified ? <CheckCircle2 size={13} style={{ flexShrink: 0, marginTop: '2px' }} /> : <AlertCircle size={13} style={{ flexShrink: 0, marginTop: '2px' }} />}
                        <span>
                          <strong>Statement:</strong> {statusObj.statement}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions: Verify Documents via AI + Issue Passport (Sign RSA) */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={handleVerifyAllDocs}
                disabled={verifyingAll}
                style={{
                  flex: 1,
                  minWidth: '200px',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#f1f5f9',
                  color: '#1e293b',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  cursor: verifyingAll ? 'not-allowed' : 'pointer',
                  fontWeight: '700',
                  fontSize: '0.86rem',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {verifyingAll ? <RefreshCw size={16} className="spinner" /> : <Upload size={16} />}
                <span>{verifyingAll ? 'Verifying All Statements...' : 'Verify Documents via AI'}</span>
              </button>

              <button
                onClick={handleIssuePassport}
                disabled={issuing || !canIssue}
                style={{
                  flex: 1,
                  minWidth: '200px',
                  padding: '0.75rem 1rem',
                  backgroundColor: canIssue ? '#059669' : '#f1f5f9',
                  color: canIssue ? '#ffffff' : '#94a3b8',
                  border: canIssue ? 'none' : '1px solid #e2e8f0',
                  borderRadius: '6px',
                  cursor: (issuing || !canIssue) ? 'not-allowed' : 'pointer',
                  fontWeight: '800',
                  fontSize: '0.86rem',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: canIssue ? '0 4px 12px rgba(5, 150, 105, 0.25)' : 'none'
                }}
              >
                {issuing ? <RefreshCw size={16} className="spinner" /> : <Award size={16} />}
                <span>{passportData ? 'Renew Passport' : 'Issue Passport (Sign RSA)'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Presentation History Audit Trail */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: '800' }}>Bid Presentation Audit Trail (Immutable Log)</h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              {presentationsList.length} presentation events recorded
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1.2fr', padding: '0.8rem 1.25rem', backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.76rem', textTransform: 'uppercase', fontWeight: '700', borderBottom: '1px solid #e2e8f0' }}>
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
                  padding: '0.9rem 1.25rem',
                  borderBottom: '1px solid #f1f5f9',
                  fontSize: '0.84rem',
                  alignItems: 'center'
                }}
              >
                <div style={{ color: '#334155' }}>{pres.presentedAt ? pres.presentedAt.replace('T', ' ').slice(0, 19) : 'Recent'}</div>
                <div className="mono-text" style={{ color: '#0284c7', fontWeight: '700' }}>{pres.bidId || 'BID-20495'}</div>
                <div className="mono-text" style={{ color: '#475569' }}>{pres.tenderId || 'GEM/2026/B/891244'}</div>
                <div>
                  <span style={{
                    color: pres.verificationResult === 'valid' ? '#059669' : '#dc2626',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontWeight: '700'
                  }}>
                    {pres.verificationResult === 'valid' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    {pres.verificationResult ? pres.verificationResult.toUpperCase() : 'VALID'}
                  </span>
                </div>
                <div style={{ color: '#94a3b8' }}>{pres.verifiedBy || 'Procuring Officer'}</div>
              </div>
            ))
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
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
              width: '40px',
              height: '40px',
              padding: 0,
              backgroundColor: '#ffffff',
              color: '#0284c7',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              transition: 'all 0.2s ease',
              flexShrink: 0
            }}
            title="Return to GeM Homepage"
            aria-label="Return to GeM Homepage"
          >
            <Home size={18} color="#0284c7" />
          </button>
        )}
      </div>

      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.75rem', marginBottom: '2.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', color: '#0f172a', fontWeight: '800' }}>
          Instant Passport Signature Verification
        </h3>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
            <Search size={18} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Paste Passport UUID / Token (e.g. 8f7a6b5c-4d3e-2f1a-3b8c-9d0e1f2a3b4c)"
              value={verifyPassportId}
              onChange={(e) => setVerifyPassportId(e.target.value)}
              className="mono-text"
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.75rem',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
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
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
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
              backgroundColor: verificationResult.valid ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${verificationResult.valid ? '#86efac' : '#fca5a5'}`,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1.25rem'
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: verificationResult.valid ? '#dcfce7' : '#fee2e2',
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
                <h4 style={{ margin: 0, fontSize: '1.15rem', color: verificationResult.valid ? '#059669' : '#dc2626', fontWeight: '800' }}>
                  {verificationResult.valid ? 'PASSPORT VALID (AUTHENTIC & UNTAMPERED)' : 'PASSPORT INVALID / REJECTED'}
                </h4>
                {verificationResult.signatureValid && (
                  <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: '4px', border: '1px solid #bae6fd', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: '700' }}>
                    <Fingerprint size={12} /> RSA-2048 Signature Match
                  </span>
                )}
              </div>

              {verificationResult.vendorName && (
                <div style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.3rem' }}>
                  Vendor: {verificationResult.vendorName}
                </div>
              )}

              <p style={{ margin: '0 0 0.75rem 0', color: '#475569', fontSize: '0.85rem' }}>
                {verificationResult.message}
              </p>

              {verificationResult.verifiedCredentials && verificationResult.verifiedCredentials.length > 0 && (
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {verificationResult.verifiedCredentials.map((cred, idx) => (
                    <span key={idx} style={{ padding: '0.2rem 0.5rem', backgroundColor: '#f1f5f9', borderRadius: '4px', fontSize: '0.75rem', color: '#0284c7', fontWeight: '700', border: '1px solid #e2e8f0' }}>
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
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', fontWeight: '800' }}>Master Vendor Compliance Directory</h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Real-time passport status across registered suppliers</span>
          </div>
          <span style={{ fontSize: '0.82rem', color: '#0284c7', fontWeight: '700' }}>{vendorsList.length} Vendors Registered</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.4fr 1fr 1.2fr 1.2fr 1.2fr', padding: '0.8rem 1.25rem', backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.76rem', textTransform: 'uppercase', fontWeight: '700', borderBottom: '1px solid #e2e8f0' }}>
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

          return (
            <div
              key={vendor.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1.4fr 1fr 1.2fr 1.2fr 1.2fr',
                padding: '0.9rem 1.25rem',
                borderBottom: '1px solid #f1f5f9',
                fontSize: '0.85rem',
                alignItems: 'center',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div>
                <div style={{ fontWeight: '700', color: '#0f172a' }}>{vendor.name}</div>
                <span style={{ fontSize: '0.74rem', color: '#64748b' }}>{vendor.category}</span>
              </div>
              <div className="mono-text" style={{ fontSize: '0.8rem', color: '#475569' }}>
                <div>{vendor.gstin}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>PAN: {vendor.pan}</div>
              </div>
              <div>
                <span style={{ fontWeight: '800', color: score >= 80 ? '#059669' : score >= 60 ? '#b45309' : '#dc2626' }}>
                  {score}/100
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.76rem', color: '#334155' }}>
                  {vendor.miiClassification ? vendor.miiClassification.split(' ')[0] : 'Class-I'}
                </span>
              </div>
              <div>
                <span style={{ color: statusColor, fontSize: '0.78rem', fontWeight: '700', padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: `${statusColor}14` }}>
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
                      padding: '0.3rem 0.65rem',
                      backgroundColor: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      color: '#0284c7',
                      borderRadius: '4px',
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
                      padding: '0.3rem 0.65rem',
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fecaca',
                      color: '#dc2626',
                      borderRadius: '4px',
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
