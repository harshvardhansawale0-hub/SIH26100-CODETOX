import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ShieldCheck, FileText, QrCode, Download, Search, CheckCircle2,
  XCircle, Clock, AlertTriangle, Award, Eye, RefreshCw, Shield,
  Upload, Fingerprint, BadgeCheck, ChevronDown, ChevronUp, Copy, ExternalLink
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { gemApi } from '../services/api';

export default function CompliancePassportView({ currentUser, currentRole }) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Bidder states
  const [vendorData, setVendorData] = useState(null);
  const [passportData, setPassportData] = useState(null);
  const [verificationsList, setVerificationsList] = useState([]);
  const [presentationsList, setPresentationsList] = useState([]);
  const [qrCodeBlob, setQrCodeBlob] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [issuing, setIssuing] = useState(false);

  // Buyer states
  const [vendorsList, setVendorsList] = useState([]);
  const [verifyPassportId, setVerifyPassportId] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [verifyingPassport, setVerifyingPassport] = useState(false);

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
  }, [currentUser]);

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
    let isMounted = true;
    if (currentRole === 'bidder') {
      fetchBidderData();
    } else {
      fetchBuyerData();
    }
    return () => { isMounted = false; };
  }, [currentRole, fetchBidderData, fetchBuyerData]);

  // Bidder: Trigger Mock Verification
  const handleVerifyDocuments = async () => {
    if (!vendorData) return;
    try {
      setVerifying(true);
      const docs = [
        { docType: 'PAN', docRef: vendorData.pan || 'AABCB1234F' },
        { docType: 'GST', docRef: vendorData.gstin || '27AABCB1234F1Z5' },
        { docType: 'UDYAM', docRef: vendorData.udyamNo || 'UDYAM-MH-03-0019284' },
        { docType: 'MSME', docRef: 'MSME-REG-2026-9901' },
        { docType: 'ISO', docRef: 'ISO-9001-2015-CERT' },
        { docType: 'CA_TURNOVER', docRef: 'UDIN-2026-89124401' }
      ];
      await gemApi.verifyVendorDocuments(vendorData.id, docs);
      await fetchBidderData();
    } catch (err) {
      console.error(err);
      alert('Verification error: ' + (err.message || 'Check network connection'));
    } finally {
      setVerifying(false);
    }
  };

  // Bidder: Issue or Renew Passport
  const handleIssuePassport = async () => {
    if (!vendorData) return;
    try {
      setIssuing(true);
      await gemApi.issuePassport(vendorData.id);
      await fetchBidderData();
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
      <div style={{ backgroundColor: '#0b1a2d', minHeight: '80vh', padding: '2.5rem 1.5rem', color: '#ffffff' }}>
        {renderLoading()}
      </div>
    );
  }

  // --- BIDDER VIEW ---
  if (currentRole === 'bidder') {
    const score = vendorData?.complianceScore || vendorData?.compliance_score || 96;
    const badgeColor = score >= 80 ? 'green' : score >= 60 ? 'orange' : 'red';
    const verifiedCount = verificationsList.filter(v => v.status === 'verified').length;

    const pStatus = passportData?.status ? (passportData.status.charAt(0).toUpperCase() + passportData.status.slice(1)) : 'None';
    const pColor = pStatus === 'Active' ? '#10b981' : (pStatus === 'Expired' || pStatus === 'Revoked') ? '#ef4444' : '#94a3b8';

    let daysToExpiry = 'N/A';
    if (passportData?.expiresAt) {
      const diff = new Date(passportData.expiresAt) - new Date();
      daysToExpiry = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    const hasPan = verificationsList.some(v => v.docType === 'PAN' && v.status === 'verified');
    const hasGst = verificationsList.some(v => v.docType === 'GST' && v.status === 'verified');
    const canIssue = hasPan && hasGst;

    return (
      <div style={{ backgroundColor: '#0b1a2d', minHeight: '80vh', padding: '2.5rem 1.5rem', color: '#ffffff' }}>
        <div style={{ marginBottom: '2rem' }}>
          <span className="section-tag" style={{ display: 'inline-block', backgroundColor: '#1e385b', color: '#38bdf8', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.05em', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
            {t('passportTag') || 'COMPLIANCE PASSPORT (GFR RULE 144/153)'}
          </span>
          <h1 className="serif-heading" style={{ fontSize: '2.2rem', color: '#ffffff', margin: '0 0 0.4rem 0' }}>
            {t('passportTitle') || 'Digital Compliance Passport'}
          </h1>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>
            {t('passportSubtitle') || 'Reusable, cryptographically signed digital credential for instant GeM bid qualification.'}
          </p>
        </div>

        <div className="terminal-stat-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          <div className="terminal-card" style={{ backgroundColor: '#0f2238', border: '1px solid #1e385b', borderRadius: '10px', padding: '1.25rem' }}>
            <span className="t-card-label" style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>Compliance Score</span>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '0.4rem' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: '800', color: '#ffffff' }}>{score}/100</span>
              <span className={`t-card-badge ${badgeColor}`} style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '700' }}>
                {score >= 80 ? 'Class-I Local' : 'Class-II'}
              </span>
            </div>
          </div>

          <div className="terminal-card" style={{ backgroundColor: '#0f2238', border: '1px solid #1e385b', borderRadius: '10px', padding: '1.25rem' }}>
            <span className="t-card-label" style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>Verified Documents</span>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '0.4rem' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: '800', color: '#ffffff' }}>{verifiedCount} / 6</span>
              <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>AI Stamped</span>
            </div>
          </div>

          <div className="terminal-card" style={{ backgroundColor: '#0f2238', border: '1px solid #1e385b', borderRadius: '10px', padding: '1.25rem' }}>
            <span className="t-card-label" style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>Passport Status</span>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '0.4rem' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: '800', color: pColor }}>{pStatus}</span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>RSA-2048</span>
            </div>
          </div>

          <div className="terminal-card" style={{ backgroundColor: '#0f2238', border: '1px solid #1e385b', borderRadius: '10px', padding: '1.25rem' }}>
            <span className="t-card-label" style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>Days Until Expiry</span>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '0.4rem' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: '800', color: '#ffffff' }}>
                {daysToExpiry !== 'N/A' ? `${daysToExpiry}d` : 'N/A'}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>12-Mo TTL</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
          
          {/* Passport Credential Card */}
          <div style={{ backgroundColor: '#0f2238', border: '1px solid #1e385b', borderRadius: '12px', padding: '1.75rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: pColor }}></div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: '700', textTransform: 'uppercase' }}>
                  Government e-Marketplace • Verified Seller ID
                </span>
                <h2 style={{ margin: '0.3rem 0 0.5rem 0', fontSize: '1.4rem', color: '#ffffff' }}>
                  {vendorData?.name || 'Apex Supplies Ltd.'}
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.84rem', color: '#cbd5e1' }}>
                  <span>GSTIN: <strong className="mono-text" style={{ color: '#38bdf8' }}>{vendorData?.gstin || '27AABCB1234F1Z5'}</strong></span>
                  <span>PAN: <strong className="mono-text" style={{ color: '#38bdf8' }}>{vendorData?.pan || 'AABCB1234F'}</strong></span>
                  <span>UDYAM: <strong className="mono-text" style={{ color: '#38bdf8' }}>{vendorData?.udyamNo || 'UDYAM-MH-03-0019284'}</strong></span>
                </div>
                <div style={{ marginTop: '0.6rem' }}>
                  <span style={{ backgroundColor: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' }}>
                    {vendorData?.miiClassification || 'Class-I Local Supplier (68%)'}
                  </span>
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  border: `3px solid ${badgeColor === 'green' ? '#10b981' : '#f59e0b'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.35rem',
                  fontWeight: '800',
                  color: '#ffffff',
                  backgroundColor: 'rgba(15, 34, 56, 0.8)'
                }}>
                  {score}
                </div>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block', marginTop: '0.2rem' }}>AI TRUST</span>
              </div>
            </div>

            {passportData ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem', backgroundColor: '#081729', borderRadius: '8px', border: '1px solid #1e385b', marginBottom: '1rem' }}>
                  <div style={{ width: '96px', height: '96px', backgroundColor: '#ffffff', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                    {qrCodeBlob ? (
                      <img src={qrCodeBlob} alt="Passport QR" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                      <QrCode size={64} color="#0b1a2d" />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Passport Token ID</div>
                    <div className="mono-text" style={{ fontSize: '0.85rem', color: '#38bdf8', wordBreak: 'break-all', marginBottom: '0.5rem' }}>
                      {passportData.id}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.78rem' }}>
                      <div>
                        <span style={{ color: '#94a3b8' }}>Issued: </span>
                        <span>{passportData.issuedAt ? passportData.issuedAt.slice(0, 10) : 'N/A'}</span>
                      </div>
                      <div>
                        <span style={{ color: '#94a3b8' }}>Expires: </span>
                        <span>{passportData.expiresAt ? passportData.expiresAt.slice(0, 10) : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div className="mono-text" style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Fingerprint size={14} color="#34d399" />
                    <span>Sig: {passportData.signature ? `${passportData.signature.slice(0, 18)}...` : 'RSA-PSS-SHA256'}</span>
                  </div>
                  <button
                    onClick={handleDownloadQr}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.45rem 0.9rem',
                      backgroundColor: 'transparent',
                      border: '1px solid #38bdf8',
                      color: '#38bdf8',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: '700'
                    }}
                  >
                    <Download size={14} /> Download QR
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', backgroundColor: '#081729', borderRadius: '8px', border: '1px dashed #1e385b' }}>
                <Shield size={42} color="#64748b" style={{ marginBottom: '0.5rem', opacity: 0.6 }} />
                <h4 style={{ margin: '0 0 0.3rem 0', color: '#94a3b8' }}>No Active Compliance Passport</h4>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                  Verify your PAN & GST credentials below to generate your reusable credential.
                </p>
              </div>
            )}
          </div>

          {/* Document Verification Checklist */}
          <div style={{ backgroundColor: '#0f2238', border: '1px solid #1e385b', borderRadius: '12px', padding: '1.75rem' }}>
            <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BadgeCheck size={20} color="#38bdf8" />
              <span>Statutory Document Verification</span>
            </h3>

            <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {[
                { type: 'PAN', name: 'Permanent Account Number (NSDL)' },
                { type: 'GST', name: 'GSTIN Registration (GSTN Portal)' },
                { type: 'UDYAM', name: 'Udyam MSME Certificate' },
                { type: 'MSME', name: 'MSME Classification' },
                { type: 'ISO', name: 'ISO 9001:2015 Quality Cert' },
                { type: 'CA_TURNOVER', name: 'CA Audited Turnover with UDIN' }
              ].map(doc => {
                const isVerified = verificationsList.some(v => v.docType === doc.type && v.status === 'verified');
                return (
                  <div
                    key={doc.type}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.7rem 1rem',
                      backgroundColor: '#081729',
                      borderRadius: '6px',
                      border: isVerified ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid #1e385b'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <FileText size={16} color={isVerified ? '#34d399' : '#94a3b8'} />
                      <div>
                        <span style={{ fontSize: '0.86rem', fontWeight: '700', color: '#ffffff' }}>{doc.type}</span>
                        <span style={{ fontSize: '0.76rem', color: '#94a3b8', marginLeft: '0.5rem' }}>({doc.name})</span>
                      </div>
                    </div>
                    {isVerified ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#34d399', fontSize: '0.8rem', fontWeight: '700' }}>
                        <CheckCircle2 size={15} /> Verified
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#f59e0b', fontSize: '0.8rem' }}>
                        <Clock size={15} /> Pending
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={handleVerifyDocuments}
                disabled={verifying}
                style={{
                  flex: 1,
                  padding: '0.65rem 1rem',
                  backgroundColor: '#1e385b',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: verifying ? 'not-allowed' : 'pointer',
                  fontWeight: '700',
                  fontSize: '0.84rem',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {verifying ? <RefreshCw size={16} className="spinner" /> : <Upload size={16} />}
                <span>{verifying ? 'Verifying with Portals...' : 'Verify Documents via AI'}</span>
              </button>

              {canIssue && (
                <button
                  onClick={handleIssuePassport}
                  disabled={issuing}
                  style={{
                    flex: 1,
                    padding: '0.65rem 1rem',
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: issuing ? 'not-allowed' : 'pointer',
                    fontWeight: '800',
                    fontSize: '0.84rem',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  {issuing ? <RefreshCw size={16} className="spinner" /> : <Award size={16} />}
                  <span>{passportData ? 'Renew Passport' : 'Issue Passport (Sign RSA)'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Presentation History Audit Trail */}
        <div style={{ backgroundColor: '#0f2238', border: '1px solid #1e385b', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #1e385b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Bid Presentation Audit Trail (Immutable Log)</h3>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              {presentationsList.length} presentation events recorded
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1.2fr', padding: '0.8rem 1.25rem', backgroundColor: '#061120', color: '#94a3b8', fontSize: '0.76rem', textTransform: 'uppercase', fontWeight: '700' }}>
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
                  borderBottom: '1px solid rgba(30, 56, 91, 0.4)',
                  fontSize: '0.84rem',
                  alignItems: 'center'
                }}
              >
                <div style={{ color: '#cbd5e1' }}>{pres.presentedAt ? pres.presentedAt.replace('T', ' ').slice(0, 19) : 'Recent'}</div>
                <div className="mono-text" style={{ color: '#38bdf8' }}>{pres.bidId || 'BID-20495'}</div>
                <div className="mono-text" style={{ color: '#cbd5e1' }}>{pres.tenderId || 'GEM/2026/B/891244'}</div>
                <div>
                  <span style={{
                    color: pres.verificationResult === 'valid' ? '#34d399' : '#ef4444',
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
    <div style={{ backgroundColor: '#0b1a2d', minHeight: '80vh', padding: '2.5rem 1.5rem', color: '#ffffff' }}>
      <div style={{ marginBottom: '2rem' }}>
        <span className="section-tag" style={{ display: 'inline-block', backgroundColor: '#0284c7', color: '#ffffff', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.05em', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
          PROCURING AUTHORITY • GFR 2017 VALIDATOR
        </span>
        <h1 className="serif-heading" style={{ fontSize: '2.2rem', color: '#ffffff', margin: '0 0 0.4rem 0' }}>
          Verify Seller Compliance Passport
        </h1>
        <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>
          Instantly verify RSA-2048 signed seller credentials without re-running document OCR pipelines.
        </p>
      </div>

      <div style={{ backgroundColor: '#0f2238', border: '1px solid #1e385b', borderRadius: '12px', padding: '1.75rem', marginBottom: '2.5rem' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', color: '#ffffff' }}>
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
                backgroundColor: '#081729',
                border: '1px solid #1e385b',
                borderRadius: '6px',
                color: '#ffffff',
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
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
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
              backgroundColor: verificationResult.valid ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
              border: `1px solid ${verificationResult.valid ? '#10b981' : '#ef4444'}`,
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
                backgroundColor: verificationResult.valid ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {verificationResult.valid ? <CheckCircle2 size={28} color="#10b981" /> : <XCircle size={28} color="#ef4444" />}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                <h4 style={{ margin: 0, fontSize: '1.15rem', color: verificationResult.valid ? '#10b981' : '#ef4444' }}>
                  {verificationResult.valid ? 'PASSPORT VALID (AUTHENTIC & UNTAMPERED)' : 'PASSPORT INVALID / REJECTED'}
                </h4>
                {verificationResult.signatureValid && (
                  <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', borderRadius: '4px', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Fingerprint size={12} /> RSA-2048 Signature Match
                  </span>
                )}
              </div>

              {verificationResult.vendorName && (
                <div style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.3rem' }}>
                  Vendor: {verificationResult.vendorName}
                </div>
              )}

              <p style={{ margin: '0 0 0.75rem 0', color: '#cbd5e1', fontSize: '0.85rem' }}>
                {verificationResult.message}
              </p>

              {verificationResult.verifiedCredentials && verificationResult.verifiedCredentials.length > 0 && (
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {verificationResult.verifiedCredentials.map((cred, idx) => (
                    <span key={idx} style={{ padding: '0.2rem 0.5rem', backgroundColor: '#1e385b', borderRadius: '4px', fontSize: '0.75rem', color: '#38bdf8' }}>
                      ✓ {cred.type || cred}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {verificationResult.complianceScore !== undefined && (
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#38bdf8' }}>
                  {verificationResult.complianceScore}
                </div>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>SCORE</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Seller Registry Table */}
      <div style={{ backgroundColor: '#0f2238', border: '1px solid #1e385b', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #1e385b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#ffffff' }}>Master Vendor Compliance Directory</h3>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Real-time passport status across registered suppliers</span>
          </div>
          <span style={{ fontSize: '0.82rem', color: '#38bdf8' }}>{vendorsList.length} Vendors Registered</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.4fr 1fr 1.2fr 1.2fr 1.2fr', padding: '0.8rem 1.25rem', backgroundColor: '#061120', color: '#94a3b8', fontSize: '0.76rem', textTransform: 'uppercase', fontWeight: '700' }}>
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
          const statusColor = isActive ? '#10b981' : (status === 'Revoked' || status === 'Expired') ? '#ef4444' : '#94a3b8';

          return (
            <div
              key={vendor.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1.4fr 1fr 1.2fr 1.2fr 1.2fr',
                padding: '0.9rem 1.25rem',
                borderBottom: '1px solid rgba(30, 56, 91, 0.4)',
                fontSize: '0.85rem',
                alignItems: 'center',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#13263f'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div>
                <div style={{ fontWeight: '700', color: '#ffffff' }}>{vendor.name}</div>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{vendor.category}</span>
              </div>
              <div className="mono-text" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                <div>{vendor.gstin}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>PAN: {vendor.pan}</div>
              </div>
              <div>
                <span style={{ fontWeight: '800', color: score >= 80 ? '#34d399' : score >= 60 ? '#f59e0b' : '#ef4444' }}>
                  {score}/100
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.76rem', color: '#cbd5e1' }}>
                  {vendor.miiClassification ? vendor.miiClassification.split(' ')[0] : 'Class-I'}
                </span>
              </div>
              <div>
                <span style={{ color: statusColor, fontSize: '0.78rem', fontWeight: '700', padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: `${statusColor}18` }}>
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
                      backgroundColor: 'rgba(2, 132, 199, 0.2)',
                      border: '1px solid #0284c7',
                      color: '#38bdf8',
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
                      backgroundColor: 'transparent',
                      border: '1px solid #ef4444',
                      color: '#ef4444',
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
