import React, { useState } from 'react';
import {
  Award, CheckCircle2, Clock, AlertTriangle, ShieldCheck, FileText,
  Truck, CheckSquare, Square, ChevronRight, FileCheck, DollarSign,
  Download, Printer, Info, ExternalLink, ArrowRight, Eye, ShieldAlert,
  Calendar, Building2, UserCheck, Sparkles, Send, Edit3, X
} from 'lucide-react';
import confetti from 'canvas-confetti';

const STAGE_CONFIG = [
  {
    key: 'tender_approved',
    step: 1,
    title: '1. Tender Approved & Contract Awarded',
    shortTitle: 'Tender Approved',
    icon: Award,
    description: 'Letter of Award (LOA) issued; contract signed with DSC by procurement authority.',
    officerActionLabel: 'Approve Tender & Issue LOA'
  },
  {
    key: 'stock_supplied',
    step: 2,
    title: '2. Stock Supplied / Consignment Received',
    shortTitle: 'Consignment Received',
    icon: Truck,
    description: 'Vendor dispatches stock; consignee depot verifies receipt & delivery challan.',
    officerActionLabel: 'Confirm Consignment Receipt at Depot'
  },
  {
    key: 'inspection',
    step: 3,
    title: '3. Quality Inspection & CRAC Issued',
    shortTitle: 'Inspection & CRAC',
    icon: ShieldCheck,
    description: 'Consignee Receipt & Acceptance Certificate (CRAC) inspection & BOQ audit under GFR 149.',
    officerActionLabel: 'Approve CRAC Quality Clearance'
  },
  {
    key: 'invoice',
    step: 4,
    title: '4. Commercial Tax Invoice Verification',
    shortTitle: 'Invoice Verified',
    icon: FileCheck,
    description: 'Vendor commercial GST tax invoice verified against BOQ and passed CRAC inspection.',
    officerActionLabel: 'Verify & Clear Commercial Invoice'
  },
  {
    key: 'payment',
    step: 5,
    title: '5. PFMS / Treasury Payment Settlement',
    shortTitle: 'Payment Settled',
    icon: DollarSign,
    description: '10-Day statutory guaranteed digital payment disbursement released via PFMS / Treasury.',
    officerActionLabel: 'Authorize PFMS Payment Settlement'
  }
];

export default function AwardedTenderKeymap({
  milestoneData,
  tender = null,
  isOfficer = false,
  currentUser = null,
  onUpdateMilestone,
  onClose = null
}) {
  const [modalStage, setModalStage] = useState(null); // 'dispatch', 'invoice', 'officer_approval'
  const [activeApprovalKey, setActiveApprovalKey] = useState(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [approvalCustomDate, setApprovalCustomDate] = useState('');

  // Bidder sub-modal forms
  const [dispatchForm, setDispatchForm] = useState({
    challanNo: '',
    carrier: 'BlueDart Express Logistics',
    dispatchDate: new Date().toISOString().split('T')[0],
    trackingId: '',
    qtyReceived: 250
  });

  const [invoiceForm, setInvoiceForm] = useState({
    invoiceNo: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    invoiceAmount: '',
    gstNumber: currentUser?.gstin || '27AABCB1234F1Z5'
  });

  if (!milestoneData || !milestoneData.steps) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <Clock size={32} color="#64748b" style={{ margin: '0 auto 0.75rem' }} />
        <h4 style={{ color: '#0f172a', margin: 0, fontWeight: '700' }}>Milestone Keymap Initializing...</h4>
        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No execution timeline data available yet for this contract.</p>
      </div>
    );
  }

  const steps = milestoneData.steps;

  // Calculate completed count and progress percentage
  const completedCount = STAGE_CONFIG.filter(cfg => steps[cfg.key]?.approved).length;
  const progressPercent = Math.round((completedCount / STAGE_CONFIG.length) * 100);

  // Determine current active milestone (the first unapproved step whose preceding step is approved)
  const getActiveStepKey = () => {
    for (let i = 0; i < STAGE_CONFIG.length; i++) {
      const cfg = STAGE_CONFIG[i];
      if (!steps[cfg.key]?.approved) {
        return cfg.key;
      }
    }
    return null; // all completed
  };
  const activeStepKey = getActiveStepKey();

  // Check if a stage can be approved (sequential rule: all prior stages must be approved)
  const canStageBeApproved = (stageKey) => {
    const stageIndex = STAGE_CONFIG.findIndex(s => s.key === stageKey);
    if (stageIndex === 0) return true; // Stage 1 can always be approved
    const prevKey = STAGE_CONFIG[stageIndex - 1].key;
    return !!steps[prevKey]?.approved;
  };

  // Trigger confetti if 100% completed
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}
  };

  // Handle officer clicking checkbox
  const handleOfficerToggle = (stageKey) => {
    if (!isOfficer) return;

    const currentStepState = steps[stageKey];
    const isCurrentlyApproved = !!currentStepState?.approved;

    if (!isCurrentlyApproved) {
      // Check sequential rule
      if (!canStageBeApproved(stageKey)) {
        const stageIndex = STAGE_CONFIG.findIndex(s => s.key === stageKey);
        const prevTitle = STAGE_CONFIG[stageIndex - 1].title;
        alert(`Sequential Compliance Required:\nYou cannot approve this stage until the previous milestone "${prevTitle}" has been verified and approved.`);
        return;
      }

      // Open approval dialog with smart defaults
      setActiveApprovalKey(stageKey);
      const stageObj = STAGE_CONFIG.find(s => s.key === stageKey);
      let defaultNote = '';
      if (stageKey === 'stock_supplied') {
        const ch = currentStepState?.dispatchDetails?.challanNo || 'DC-9901-A';
        defaultNote = `Consignment physically inspected and received at central consignee depot. Delivery Challan #${ch} confirmed.`;
      } else if (stageKey === 'inspection') {
        defaultNote = `CRAC Certificate generated under GFR 149. 100% delivered goods conform to tender technical parameters.`;
      } else if (stageKey === 'invoice') {
        const invNo = currentStepState?.invoiceDetails?.invoiceNo || 'INV-2026-081';
        defaultNote = `Commercial tax invoice #${invNo} validated against BOQ & CRAC certificate. TDS/GST calculations verified.`;
      } else if (stageKey === 'payment') {
        defaultNote = `100% payment authorized and cleared via PFMS Digital Treasury Gateway under GFR Rule 225.`;
      } else {
        defaultNote = `Tender award verified and digitally signed.`;
      }
      setApprovalNotes(defaultNote);
      setApprovalCustomDate(new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
      setModalStage('officer_approval');
    } else {
      // Officer is UNCHECKING an approved stage
      // Find downstream approved stages that would be reset
      const stageIndex = STAGE_CONFIG.findIndex(s => s.key === stageKey);
      const downstreamKeys = STAGE_CONFIG.slice(stageIndex + 1).filter(s => steps[s.key]?.approved).map(s => s.title);

      let confirmMsg = `Are you sure you want to revert approval for "${STAGE_CONFIG[stageIndex].title}"?`;
      if (downstreamKeys.length > 0) {
        confirmMsg += `\n\nWARNING: Reverting this milestone will sequentially reset the following subsequent approved milestones:\n• ${downstreamKeys.join('\n• ')}\n\nThis ensures strict compliance with public procurement lifecycle sequences.`;
      }

      if (window.confirm(confirmMsg)) {
        // Reset this stage and all downstream stages
        if (onUpdateMilestone) {
          onUpdateMilestone(milestoneData.tenderId, stageKey, false, {
            notes: 'Approval revoked by Procurement Officer for re-verification.',
            approvedAt: null,
            approvedBy: null
          });

          // Also reset downstream
          for (let i = stageIndex + 1; i < STAGE_CONFIG.length; i++) {
            const downKey = STAGE_CONFIG[i].key;
            if (steps[downKey]?.approved) {
              onUpdateMilestone(milestoneData.tenderId, downKey, false, {
                notes: 'Reset due to prior milestone reversion.',
                approvedAt: null,
                approvedBy: null
              });
            }
          }
        }
      }
    }
  };

  // Submit officer approval confirmation
  const confirmOfficerApproval = () => {
    if (!activeApprovalKey) return;
    const stageKey = activeApprovalKey;
    const officerName = currentUser?.fullName
      ? `${currentUser.fullName} (${currentUser.designation || currentUser.organization || 'Procurement Officer'})`
      : 'Dir. Rajesh Verma (Chief Procurement Officer)';

    const dateStr = approvalCustomDate || (new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));

    const updatedData = {
      approved: true,
      status: 'completed',
      approvedAt: dateStr,
      approvedBy: officerName,
      notes: approvalNotes
    };

    if (stageKey === 'stock_supplied' && !steps.stock_supplied?.dispatchDetails) {
      updatedData.dispatchDetails = {
        challanNo: `DC-${Math.floor(1000 + Math.random() * 9000)}`,
        carrier: 'Express Freight Logistics',
        dispatchDate: dateStr.split(',')[0],
        trackingId: `TRK-${Math.floor(100000 + Math.random() * 900000)}`,
        qtyReceived: 250
      };
    } else if (stageKey === 'inspection') {
      updatedData.cracNumber = `CRAC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    } else if (stageKey === 'payment') {
      updatedData.disbursementRef = `PFMS-TXN-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    }

    if (onUpdateMilestone) {
      onUpdateMilestone(milestoneData.tenderId, stageKey, true, updatedData);
    }

    // Check if this was stage 5 (payment)
    if (stageKey === 'payment' || completedCount === 4) {
      triggerConfetti();
    }

    setModalStage(null);
    setActiveApprovalKey(null);
  };

  // Bidder sub-modal submits
  const handleSaveDispatchDetails = (e) => {
    e.preventDefault();
    if (onUpdateMilestone) {
      onUpdateMilestone(milestoneData.tenderId, 'stock_supplied', steps.stock_supplied?.approved || false, {
        dispatchDetails: { ...dispatchForm },
        notes: `Vendor submitted dispatch particulars: Challan #${dispatchForm.challanNo}, Carrier: ${dispatchForm.carrier}, Tracking: ${dispatchForm.trackingId}.`
      });
    }
    setModalStage(null);
  };

  const handleSaveInvoiceDetails = (e) => {
    e.preventDefault();
    if (onUpdateMilestone) {
      onUpdateMilestone(milestoneData.tenderId, 'invoice', steps.invoice?.approved || false, {
        invoiceDetails: { ...invoiceForm, taxVerified: true },
        notes: `Vendor uploaded Tax Invoice #${invoiceForm.invoiceNo} for ${invoiceForm.invoiceAmount}. Awaiting buyer officer verification.`
      });
    }
    setModalStage(null);
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(15, 23, 42, 0.06)',
      color: '#0f172a'
    }}>
      {/* Top Banner & Contract Context */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(224, 242, 254, 0.8) 0%, rgba(254, 243, 199, 0.5) 50%, rgba(255, 237, 213, 0.8) 100%)',
        padding: '1.5rem',
        borderBottom: '1px solid #fed7aa'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
              <span style={{
                backgroundColor: '#f59e0b',
                color: '#000000',
                fontSize: '0.72rem',
                fontWeight: '900',
                padding: '0.2rem 0.6rem',
                borderRadius: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                <Award size={13} /> AWARDED CONTRACT
              </span>

              <span style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: '#0369a1', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', padding: '0.15rem 0.55rem', borderRadius: '4px', fontWeight: '700' }}>
                PO: {milestoneData.contractId}
              </span>

              <span style={{ fontSize: '0.78rem', color: '#475569' }}>
                Tender Ref: <strong style={{ color: '#0f172a' }}>{milestoneData.tenderId}</strong>
              </span>

              {isOfficer ? (
                <span style={{
                  fontSize: '0.72rem',
                  backgroundColor: 'rgba(2, 132, 199, 0.12)',
                  color: '#0369a1',
                  border: '1px solid #0284c7',
                  padding: '0.15rem 0.55rem',
                  borderRadius: '999px',
                  fontWeight: '700',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}>
                  <UserCheck size={12} /> Officer Approval Keymap
                </span>
              ) : (
                <span style={{
                  fontSize: '0.72rem',
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  color: '#065f46',
                  border: '1px solid #10b981',
                  padding: '0.15rem 0.55rem',
                  borderRadius: '999px',
                  fontWeight: '700',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}>
                  <ShieldCheck size={12} /> Vendor Execution Tracker
                </span>
              )}
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              {tender?.title || `Contract for ${milestoneData.vendorName}`}
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginTop: '0.45rem', fontSize: '0.85rem', color: '#475569', flexWrap: 'wrap' }}>
              <span>Vendor: <strong style={{ color: '#059669' }}>{milestoneData.vendorName}</strong></span>
              <span>•</span>
              <span>Buyer: <strong style={{ color: '#0f172a' }}>{milestoneData.buyerOrg || tender?.ministry || 'Procuring Authority'}</strong></span>
              <span>•</span>
              <span>Contract Value: <strong style={{ color: '#0284c7' }}>{milestoneData.awardedValue}</strong></span>
              <span>•</span>
              <span>Awarded Date: <strong style={{ color: '#0f172a' }}>{milestoneData.poDate}</strong></span>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#475569',
                borderRadius: '8px',
                padding: '0.45rem 0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <X size={16} /> Close
            </button>
          )}
        </div>

        {/* Sequential Milestone Progress Bar */}
        <div style={{ marginTop: '1.5rem', backgroundColor: '#ffffff', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid #fed7aa', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Execution Lifecycle Progress: <strong style={{ color: progressPercent === 100 ? '#059669' : '#0284c7' }}>{progressPercent}% Complete ({completedCount}/5 Milestones)</strong>
            </span>
            <span style={{ fontSize: '0.78rem', color: progressPercent === 100 ? '#059669' : '#d97706', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: '700' }}>
              {progressPercent === 100 ? (
                <>
                  <CheckCircle2 size={14} color="#059669" />
                  <span>100% Settled & Disbursed via PFMS</span>
                </>
              ) : (
                <>
                  <Clock size={14} color="#d97706" />
                  <span>Current Active Stage: {STAGE_CONFIG.find(s => s.key === activeStepKey)?.shortTitle || 'In Progress'}</span>
                </>
              )}
            </span>
          </div>

          <div style={{ width: '100%', height: '10px', backgroundColor: '#e2e8f0', borderRadius: '999px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
            <div style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: progressPercent === 100
                ? 'linear-gradient(90deg, #10b981, #34d399)'
                : 'linear-gradient(90deg, #0284c7, #38bdf8, #10b981)',
              borderRadius: '999px',
              transition: 'width 0.4s ease-in-out',
              boxShadow: progressPercent === 100 ? '0 0 12px rgba(52, 211, 153, 0.5)' : '0 0 8px rgba(56, 189, 248, 0.4)'
            }} />
          </div>

          {/* Stepper Horizontal Node Indicators */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', marginTop: '0.85rem', gap: '0.5rem', textAlign: 'center' }}>
            {STAGE_CONFIG.map((cfg, idx) => {
              const stepState = steps[cfg.key];
              const isApproved = !!stepState?.approved;
              const isActive = activeStepKey === cfg.key;

              return (
                <div key={cfg.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: isApproved ? '#10b981' : (isActive ? '#0284c7' : '#f1f5f9'),
                    border: isApproved ? '2px solid #34d399' : (isActive ? '2px solid #38bdf8' : '1px solid #cbd5e1'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isApproved || isActive ? '#ffffff' : '#64748b',
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    marginBottom: '0.25rem',
                    boxShadow: isActive ? '0 0 10px rgba(56, 189, 248, 0.4)' : 'none'
                  }}>
                    {isApproved ? <CheckCircle2 size={16} /> : cfg.step}
                  </div>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: isApproved || isActive ? '700' : '500',
                    color: isApproved ? '#059669' : (isActive ? '#0284c7' : '#64748b'),
                    lineHeight: '1.2'
                  }}>
                    {cfg.shortTitle}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Keymap Step-by-Step Execution Cards */}
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {STAGE_CONFIG.map((stageCfg, idx) => {
          const stepKey = stageCfg.key;
          const stepData = steps[stepKey] || {};
          const isApproved = !!stepData.approved;
          const isActive = activeStepKey === stepKey;
          const canBeApproved = canStageBeApproved(stepKey);
          const Icon = stageCfg.icon;

          return (
            <div
              key={stepKey}
              style={{
                backgroundColor: isApproved ? '#f0fdf4' : (isActive ? '#f0f9ff' : '#f8fafc'),
                border: isApproved
                  ? '1px solid #86efac'
                  : (isActive ? '2px solid #0284c7' : '1px solid #e2e8f0'),
                borderRadius: '12px',
                padding: '1.25rem',
                position: 'relative',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? '0 4px 16px rgba(2, 132, 199, 0.12)' : '0 2px 6px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                {/* Left Side: Step Number, Icon, Title & Description */}
                <div style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: '280px' }}>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '10px',
                    backgroundColor: isApproved ? '#ecfdf5' : (isActive ? '#e0f2fe' : '#ffffff'),
                    border: isApproved ? '1px solid #86efac' : (isActive ? '1px solid #7dd3fc' : '1px solid #e2e8f0'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Icon size={24} color={isApproved ? '#059669' : (isActive ? '#0284c7' : '#64748b')} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: '800', color: isApproved ? '#059669' : (isActive ? '#0284c7' : '#64748b'), textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        STAGE {stageCfg.step} OF 5
                      </span>

                      {isApproved && (
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: '800',
                          backgroundColor: '#ecfdf5',
                          color: '#065f46',
                          border: '1px solid #a7f3d0',
                          padding: '0.1rem 0.5rem',
                          borderRadius: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          <CheckCircle2 size={12} /> APPROVED & CLEARED
                        </span>
                      )}

                      {isActive && (
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: '800',
                          backgroundColor: '#e0f2fe',
                          color: '#0369a1',
                          border: '1px solid #bae6fd',
                          padding: '0.1rem 0.5rem',
                          borderRadius: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          <Clock size={12} /> CURRENT ACTIVE MILESTONE
                        </span>
                      )}

                      {!isApproved && !isActive && (
                        <span style={{
                          fontSize: '0.7rem',
                          color: '#64748b',
                          backgroundColor: '#f1f5f9',
                          padding: '0.1rem 0.4rem',
                          borderRadius: '4px',
                          border: '1px solid #e2e8f0'
                        }}>
                          PENDING PRIOR STAGES
                        </span>
                      )}
                    </div>

                    <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.35rem 0' }}>
                      {stageCfg.title}
                    </h4>

                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: '1.45' }}>
                      {stepData.subtitle || stageCfg.description}
                    </p>

                    {/* Step Specific Details / Metadata */}
                    {stepKey === 'tender_approved' && (
                      <div style={{ marginTop: '0.6rem', fontSize: '0.8rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <span>Award Document: <strong style={{ color: '#0284c7' }}>{stepData.docRef || 'LOA-GEM-2026-9901.pdf'}</strong></span>
                        <span>•</span>
                        <span>Contract Signed: <strong style={{ color: '#059669' }}>DSC Certified (RSA-2048)</strong></span>
                      </div>
                    )}

                    {stepKey === 'stock_supplied' && (
                      <div style={{ marginTop: '0.75rem', backgroundColor: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.35rem' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#0284c7', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Truck size={13} /> Consignment Dispatch Particulars:
                          </span>
                          {!isOfficer && (
                            <button
                              onClick={() => {
                                setDispatchForm(stepData.dispatchDetails || {
                                  challanNo: 'DC-9901-A',
                                  carrier: 'BlueDart Express Logistics',
                                  dispatchDate: new Date().toISOString().split('T')[0],
                                  trackingId: 'BD-882199042',
                                  qtyReceived: 250
                                });
                                setModalStage('dispatch');
                              }}
                              style={{
                                padding: '0.25rem 0.6rem',
                                fontSize: '0.72rem',
                                backgroundColor: '#e0f2fe',
                                color: '#0369a1',
                                border: '1px solid #bae6fd',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                fontWeight: '600'
                              }}
                            >
                              <Edit3 size={11} /> {stepData.dispatchDetails ? 'Update Dispatch Info' : 'Submit Delivery Challan'}
                            </button>
                          )}
                        </div>

                        {stepData.dispatchDetails ? (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem', fontSize: '0.78rem' }}>
                            <div>
                              <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>Delivery Challan</span>
                              <strong style={{ color: '#0f172a' }}>{stepData.dispatchDetails.challanNo}</strong>
                            </div>
                            <div>
                              <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>Carrier / Logistics</span>
                              <strong style={{ color: '#0f172a' }}>{stepData.dispatchDetails.carrier}</strong>
                            </div>
                            <div>
                              <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>Tracking Waybill</span>
                              <strong style={{ color: '#0284c7' }}>{stepData.dispatchDetails.trackingId}</strong>
                            </div>
                            <div>
                              <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>Dispatch Date</span>
                              <strong style={{ color: '#0f172a' }}>{stepData.dispatchDetails.dispatchDate}</strong>
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic' }}>
                            Awaiting vendor consignment dispatch submission.
                          </span>
                        )}
                      </div>
                    )}

                    {stepKey === 'inspection' && (
                      <div style={{ marginTop: '0.6rem', fontSize: '0.8rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <span>CRAC Certificate No: <strong style={{ color: isApproved ? '#059669' : '#d97706' }}>{stepData.cracNumber || 'Pending Inspection'}</strong></span>
                        <span>•</span>
                        <span>Technical Audit: <strong style={{ color: '#0f172a' }}>GFR 2017 Rule 149 / DPIIT MII</strong></span>
                      </div>
                    )}

                    {stepKey === 'invoice' && (
                      <div style={{ marginTop: '0.75rem', backgroundColor: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.35rem' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#0284c7', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <FileText size={13} /> Commercial Tax Invoice Details:
                          </span>
                          {!isOfficer && (
                            <button
                              onClick={() => {
                                setInvoiceForm(stepData.invoiceDetails || {
                                  invoiceNo: 'INV-2026-081',
                                  invoiceDate: new Date().toISOString().split('T')[0],
                                  invoiceAmount: milestoneData.awardedValue || '₹1,38,00,000',
                                  gstNumber: currentUser?.gstin || '27AABCB1234F1Z5'
                                });
                                setModalStage('invoice');
                              }}
                              style={{
                                padding: '0.25rem 0.6rem',
                                fontSize: '0.72rem',
                                backgroundColor: '#e0f2fe',
                                color: '#0369a1',
                                border: '1px solid #bae6fd',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                fontWeight: '600'
                              }}
                            >
                              <Edit3 size={11} /> {stepData.invoiceDetails ? 'Update Invoice' : 'Generate Commercial Invoice'}
                            </button>
                          )}
                        </div>

                        {stepData.invoiceDetails ? (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem', fontSize: '0.78rem' }}>
                            <div>
                              <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>Invoice Number</span>
                              <strong style={{ color: '#0f172a' }}>{stepData.invoiceDetails.invoiceNo}</strong>
                            </div>
                            <div>
                              <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>Total Claim (incl. GST)</span>
                              <strong style={{ color: '#059669' }}>{stepData.invoiceDetails.invoiceAmount}</strong>
                            </div>
                            <div>
                              <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>GSTIN</span>
                              <strong style={{ color: '#0284c7' }}>{stepData.invoiceDetails.gstNumber}</strong>
                            </div>
                            <div>
                              <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>Tax Status</span>
                              <strong style={{ color: '#059669' }}>✓ Verified 3B Filed</strong>
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic' }}>
                            Awaiting vendor tax invoice submission.
                          </span>
                        )}
                      </div>
                    )}

                    {stepKey === 'payment' && (
                      <div style={{ marginTop: '0.6rem', fontSize: '0.8rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <span>PFMS Reference: <strong style={{ color: isApproved ? '#059669' : '#0284c7' }}>{stepData.disbursementRef || 'Pending Prior Approvals'}</strong></span>
                        <span>•</span>
                        <span>Guarantee: <strong style={{ color: '#0f172a' }}>10-Day Statutory Disbursal SLA</strong></span>
                      </div>
                    )}

                    {/* Official Sign-off & Audit Remarks */}
                    {stepData.notes && (
                      <div style={{ marginTop: '0.65rem', padding: '0.5rem 0.75rem', backgroundColor: '#f1f5f9', borderRadius: '6px', borderLeft: isApproved ? '3px solid #10b981' : '3px solid #0284c7', fontSize: '0.78rem', color: '#334155' }}>
                        <span style={{ color: isApproved ? '#059669' : '#0284c7', fontWeight: '700' }}>Officer Remarks: </span>
                        {stepData.notes}
                      </div>
                    )}

                    {isApproved && stepData.approvedAt && (
                      <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#059669' }}>
                        <UserCheck size={13} />
                        <span>Officially Verified & Approved by <strong>{stepData.approvedBy || 'Procuring Authority'}</strong> on {stepData.approvedAt}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side: Interactive Approval Checkbox (Buyer/Officer) OR Status Badge (Bidder) */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                  {isOfficer ? (
                    // PROCUREMENT OFFICER MODE: Interactive Checkbox to Approve / Revert
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: '0.4rem'
                    }}>
                      <button
                        onClick={() => handleOfficerToggle(stepKey)}
                        disabled={!isApproved && !canBeApproved}
                        style={{
                          padding: '0.6rem 1.1rem',
                          borderRadius: '8px',
                          border: isApproved ? '1px solid #10b981' : (canBeApproved ? '1px solid #0284c7' : '1px solid #cbd5e1'),
                          backgroundColor: isApproved
                            ? '#ecfdf5'
                            : (canBeApproved ? '#0284c7' : '#f1f5f9'),
                          color: isApproved ? '#065f46' : (canBeApproved ? '#ffffff' : '#94a3b8'),
                          fontWeight: '800',
                          fontSize: '0.82rem',
                          cursor: (!isApproved && !canBeApproved) ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          transition: 'all 0.2s ease',
                          boxShadow: (canBeApproved && !isApproved) ? '0 4px 12px rgba(2, 132, 199, 0.25)' : 'none'
                        }}
                        title={(!isApproved && !canBeApproved) ? 'Disabled: Previous milestone must be approved first' : ''}
                      >
                        {isApproved ? (
                          <>
                            <CheckSquare size={17} color="#059669" />
                            <span>Approved (Click to Revoke)</span>
                          </>
                        ) : (
                          <>
                            <Square size={17} />
                            <span>{stageCfg.officerActionLabel}</span>
                          </>
                        )}
                      </button>

                      {!isApproved && !canBeApproved && (
                        <span style={{ fontSize: '0.68rem', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <AlertTriangle size={10} /> Locked: Awaiting Stage {stageCfg.step - 1} approval
                        </span>
                      )}

                      {isApproved && (
                        <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                          ✓ Officer sign-off recorded
                        </span>
                      )}
                    </div>
                  ) : (
                    // VENDOR / BIDDER MODE: Read-Only Verification Indicator
                    <div style={{ textAlign: 'right' }}>
                      {isApproved ? (
                        <div style={{
                          padding: '0.45rem 0.9rem',
                          backgroundColor: '#ecfdf5',
                          border: '1px solid #86efac',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          color: '#065f46',
                          fontWeight: '800',
                          fontSize: '0.8rem'
                        }}>
                          <CheckCircle2 size={15} />
                          <span>Cleared by Buyer</span>
                        </div>
                      ) : isActive ? (
                        <div style={{
                          padding: '0.45rem 0.9rem',
                          backgroundColor: '#e0f2fe',
                          border: '1px solid #7dd3fc',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          color: '#0369a1',
                          fontWeight: '700',
                          fontSize: '0.8rem'
                        }}>
                          <Clock size={15} />
                          <span>Under Buyer Review</span>
                        </div>
                      ) : (
                        <div style={{
                          padding: '0.45rem 0.9rem',
                          backgroundColor: '#f1f5f9',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          color: '#64748b',
                          fontSize: '0.78rem'
                        }}>
                          <Clock size={14} />
                          <span>Next in Sequence</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* OFFICER APPROVAL CONFIRMATION MODAL */}
      {modalStage === 'officer_approval' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #bae6fd',
            borderRadius: '14px',
            width: '100%',
            maxWidth: '560px',
            padding: '1.75rem',
            boxShadow: '0 20px 50px rgba(15, 23, 42, 0.18)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <CheckSquare size={20} color="#0284c7" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  Procurement Officer Sign-off & Approval
                </h3>
              </div>
              <button onClick={() => setModalStage(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Milestone Being Approved:
              </span>
              <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0284c7', marginTop: '0.2rem' }}>
                {STAGE_CONFIG.find(s => s.key === activeApprovalKey)?.title}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.2rem' }}>
                Contract: <strong>{milestoneData.contractId}</strong> • Vendor: <strong>{milestoneData.vendorName}</strong>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                Official Inspection / Verification Remarks (GFR 2017 Audit Trail):
              </label>
              <textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  color: '#0f172a',
                  padding: '0.6rem',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                Authorized Officer:
              </label>
              <input
                type="text"
                disabled
                value={currentUser?.fullName ? `${currentUser.fullName} (${currentUser.organization || 'Procurement Authority'})` : 'Dir. Rajesh Verma (Chief Procurement Officer)'}
                style={{
                  width: '100%',
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  color: '#065f46',
                  padding: '0.5rem 0.6rem',
                  fontSize: '0.85rem',
                  fontWeight: '700'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => setModalStage(null)}
                style={{
                  padding: '0.6rem 1.2rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  color: '#475569',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                onClick={confirmOfficerApproval}
                style={{
                  padding: '0.6rem 1.4rem',
                  backgroundColor: '#10b981',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)'
                }}
              >
                <CheckCircle2 size={16} /> Confirm Approval & Sign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BIDDER MODAL 1: SUBMIT DELIVERY CHALLAN / DISPATCH DETAILS */}
      {modalStage === 'dispatch' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <form onSubmit={handleSaveDispatchDetails} style={{
            backgroundColor: '#ffffff',
            border: '1px solid #86efac',
            borderRadius: '14px',
            width: '100%',
            maxWidth: '520px',
            padding: '1.75rem',
            boxShadow: '0 20px 50px rgba(15, 23, 42, 0.18)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Truck size={20} color="#059669" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  Consignment Dispatch Details
                </h3>
              </div>
              <button type="button" onClick={() => setModalStage(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#334155', marginBottom: '0.3rem', fontWeight: '600' }}>
                  Delivery Challan No. <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DC-9901-A"
                  value={dispatchForm.challanNo}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, challanNo: e.target.value })}
                  style={{ width: '100%', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', padding: '0.5rem', borderRadius: '6px', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#334155', marginBottom: '0.3rem', fontWeight: '600' }}>
                    Carrier / Logistics Partner
                  </label>
                  <input
                    type="text"
                    value={dispatchForm.carrier}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, carrier: e.target.value })}
                    style={{ width: '100%', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', padding: '0.5rem', borderRadius: '6px', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#334155', marginBottom: '0.3rem', fontWeight: '600' }}>
                    Dispatch Date
                  </label>
                  <input
                    type="date"
                    value={dispatchForm.dispatchDate}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, dispatchDate: e.target.value })}
                    style={{ width: '100%', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', padding: '0.5rem', borderRadius: '6px', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#334155', marginBottom: '0.3rem', fontWeight: '600' }}>
                  Tracking / Waybill ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. BD-882199042"
                  value={dispatchForm.trackingId}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, trackingId: e.target.value })}
                  style={{ width: '100%', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', padding: '0.5rem', borderRadius: '6px', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" onClick={() => setModalStage(null)} style={{ padding: '0.6rem 1.2rem', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#64748b', borderRadius: '6px', cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="submit" style={{ padding: '0.6rem 1.4rem', backgroundColor: '#10b981', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 14px rgba(16,185,129,0.25)' }}>
                Save & Notify Buyer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* BIDDER MODAL 2: GENERATE COMMERCIAL INVOICE */}
      {modalStage === 'invoice' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <form onSubmit={handleSaveInvoiceDetails} style={{
            backgroundColor: '#ffffff',
            border: '1px solid #86efac',
            borderRadius: '14px',
            width: '100%',
            maxWidth: '520px',
            padding: '1.75rem',
            boxShadow: '0 20px 50px rgba(15, 23, 42, 0.18)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <FileText size={20} color="#059669" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  Submit Commercial Tax Invoice
                </h3>
              </div>
              <button type="button" onClick={() => setModalStage(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#334155', marginBottom: '0.3rem', fontWeight: '600' }}>
                  Commercial Invoice No. <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. INV-2026-081"
                  value={invoiceForm.invoiceNo}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceNo: e.target.value })}
                  style={{ width: '100%', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', padding: '0.5rem', borderRadius: '6px', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#334155', marginBottom: '0.3rem', fontWeight: '600' }}>
                    Invoice Amount (₹) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ₹1,38,00,000"
                    value={invoiceForm.invoiceAmount}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceAmount: e.target.value })}
                    style={{ width: '100%', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', padding: '0.5rem', borderRadius: '6px', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#334155', marginBottom: '0.3rem', fontWeight: '600' }}>
                    Invoice Date
                  </label>
                  <input
                    type="date"
                    value={invoiceForm.invoiceDate}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceDate: e.target.value })}
                    style={{ width: '100%', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', padding: '0.5rem', borderRadius: '6px', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#334155', marginBottom: '0.3rem', fontWeight: '600' }}>
                  Vendor GSTIN
                </label>
                <input
                  type="text"
                  value={invoiceForm.gstNumber}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, gstNumber: e.target.value })}
                  style={{ width: '100%', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', color: '#0284c7', padding: '0.5rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '700' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" onClick={() => setModalStage(null)} style={{ padding: '0.6rem 1.2rem', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#64748b', borderRadius: '6px', cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="submit" style={{ padding: '0.6rem 1.4rem', backgroundColor: '#10b981', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 14px rgba(16,185,129,0.25)' }}>
                Submit Tax Invoice
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
