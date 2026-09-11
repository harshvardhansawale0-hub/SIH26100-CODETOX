import React, { useState } from 'react';
import { X, Plus, Trash2, CheckCircle2, ShieldCheck, AlertCircle, FileText } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { gemApi } from '../services/api';

const GEM_MARKET_CATEGORIES = [
  "IT Hardware",
  "Software & Cloud Services",
  "Medical Equipment & Healthcare Devices",
  "Pharmaceuticals & Hospital Consumables",
  "Office Furniture & Modular Fixtures",
  "Industrial Machinery & Heavy Electricals",
  "Defence, Security & Surveillance Systems",
  "Vehicles & Electric Mobility (EV)",
  "Civil Infrastructure & Construction Materials",
  "Solar Energy & Renewable Utilities",
  "Facilities Management, Cleaning & Sanitation",
  "Laboratory, Scientific & Testing Instruments",
  "Textiles, Uniforms & Protective Gear",
  "Telecommunications & Networking Equipment",
  "Agricultural Machinery & Rural Technologies",
  "Office Stationery, Paper & Printing Services",
  "Aviation, Drones & Aerospace Components",
  "Other"
];

export default function CreateBidModal({ isOpen, onClose, onTenderCreated, currentUser = null }) {
  if (!isOpen) return null;

  const { t } = useLanguage();

  // Resolve active authority user from prop or local storage fallback
  const effectiveUser = currentUser || (() => {
    try {
      const saved = localStorage.getItem('gem_auth_user') || localStorage.getItem('gem_user');
      return saved ? JSON.parse(saved) : {
        fullName: "Dir. Rajesh Verma",
        email: "procurement.officer@nic.in",
        organization: "Ministry of Electronics & IT (MeitY)",
        designation: "Chief Procurement Officer"
      };
    } catch {
      return {
        fullName: "Dir. Rajesh Verma",
        email: "procurement.officer@nic.in",
        organization: "Ministry of Electronics & IT (MeitY)",
        designation: "Chief Procurement Officer"
      };
    }
  })();

  const [title, setTitle] = useState('');
  const [ministry, setMinistry] = useState(effectiveUser?.organization || 'Ministry of Electronics & IT (MeitY)');
  const [department, setDepartment] = useState(effectiveUser?.organization ? `${effectiveUser.organization} Procurement Wing` : 'Digital India Corporation');
  const [category, setCategory] = useState('IT Hardware');
  const [customCategory, setCustomCategory] = useState('');
  const [estimatedValue, setEstimatedValue] = useState('₹1.85 Cr');
  const [emdAmount, setEmdAmount] = useState('₹3.70 Lakhs (MSE Exempted)');
  const [closingDate, setClosingDate] = useState('2026-09-25');
  
  // Compliance Criteria Builder
  const [miiMinRequirement, setMiiMinRequirement] = useState('50% (Class-I)');
  const [minTurnoverRequirement, setMinTurnoverRequirement] = useState('₹2.0 Cr');
  const [minExperienceYears, setMinExperienceYears] = useState(3);
  const [mandatoryDocs, setMandatoryDocs] = useState([
    'PAN Card',
    'GSTIN Certificate (FORM GST REG-06)',
    'UDYAM MSME Certificate',
    'CA Audited Turnover Statement',
    'DPIIT Make in India Declaration'
  ]);
  const [newDocName, setNewDocName] = useState('');
  
  // BOQ Items
  const [boqItems, setBoqItems] = useState([
    { item: 'High-Performance Workstations (RTX 6000 Ada, 128GB RAM)', qty: 150, unit: 'Nos' },
    { item: 'Enterprise SAN Storage Array (500TB All-Flash)', qty: 2, unit: 'Units' }
  ]);
  const [newBoqItem, setNewBoqItem] = useState({ item: '', qty: 1, unit: 'Nos' });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleAddDoc = () => {
    if (newDocName.trim() && !mandatoryDocs.includes(newDocName.trim())) {
      setMandatoryDocs([...mandatoryDocs, newDocName.trim()]);
      setNewDocName('');
    }
  };

  const handleRemoveDoc = (index) => {
    setMandatoryDocs(mandatoryDocs.filter((_, idx) => idx !== index));
  };

  const handleAddBoqItem = () => {
    if (newBoqItem.item.trim()) {
      setBoqItems([...boqItems, { ...newBoqItem, qty: Number(newBoqItem.qty) || 1 }]);
      setNewBoqItem({ item: '', qty: 1, unit: 'Nos' });
    }
  };

  const handleRemoveBoqItem = (index) => {
    setBoqItems(boqItems.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const userEmail = effectiveUser?.email || (effectiveUser?.fullName ? `${effectiveUser.fullName.toLowerCase().replace(/\s+/g, '.')}@gem.gov.in` : 'buyer@gov.in');
      const userName = effectiveUser?.fullName || 'Government Buyer';
      const userOrg = effectiveUser?.organization || ministry;

      const finalCategory = (category === 'Other' && customCategory.trim())
        ? customCategory.trim()
        : category;

      const payload = {
        title,
        ministry,
        department,
        category: finalCategory,
        estimatedValue,
        emdAmount,
        closingDate,
        miiMinRequirement,
        minTurnoverRequirement,
        minExperienceYears: Number(minExperienceYears),
        mandatoryDocs,
        boqItems,
        createdBy: userEmail,
        buyerEmail: userEmail,
        buyerName: userName,
        buyerOrg: userOrg,
        buyerId: effectiveUser?.id || null
      };
      const created = await gemApi.createTender(payload);
      const tenderWithMeta = {
        ...created,
        createdBy: payload.createdBy,
        buyerEmail: payload.buyerEmail,
        buyerName: payload.buyerName,
        buyerOrg: payload.buyerOrg,
        buyerId: payload.buyerId
      };
      setIsSuccess(true);
      setTimeout(() => {
        if (onTenderCreated) onTenderCreated(tenderWithMeta);
        setIsSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Failed to create tender:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content-box"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '840px', maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="modal-header">
          <div>
            <span className="section-tag" style={{ marginBottom: '0.2rem', backgroundColor: '#0284c7', color: '#ffffff' }}>
              BUYER FLOW • STEP 1
            </span>
            <h3 className="modal-title" style={{ fontSize: '1.3rem' }}>
              🏛️ Create New Bid & Define Compliance Criteria
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
              Publish an autonomous compliance-ready procurement tender on GeM.
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {isSuccess ? (
          <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
              <CheckCircle2 size={36} />
            </div>
            <h3 style={{ fontSize: '1.4rem', color: '#065f46', marginBottom: '0.5rem' }}>
              Bid Published Successfully!
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Tender has been registered with autonomous AI compliance verification rules. Bidders can now apply and submit documents.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem 0' }}>
            {/* 1. Basic Tender Information */}
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={16} color="#0284c7" /> 1. Tender Basic Details
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                    Tender Title / Procurement Subject *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Procurement of High-Performance AI Workstations & SAN Storage"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                    Ministry / Central Authority *
                  </label>
                  <input
                    type="text"
                    required
                    value={ministry}
                    onChange={(e) => setMinistry(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                    Department / Nodal Office *
                  </label>
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                    Market Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', backgroundColor: '#ffffff' }}
                  >
                    {GEM_MARKET_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat === 'Other' ? '★ Other (Specify Custom Category)' : cat}
                      </option>
                    ))}
                  </select>
                  {category === 'Other' && (
                    <div style={{ marginTop: '0.45rem' }}>
                      <input
                        type="text"
                        required
                        placeholder="Type custom category name..."
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.45rem 0.55rem',
                          borderRadius: '6px',
                          border: '2px solid #0284c7',
                          fontSize: '0.82rem',
                          backgroundColor: '#f0f9ff'
                        }}
                        autoFocus
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                    Estimated Budget *
                  </label>
                  <input
                    type="text"
                    required
                    value={estimatedValue}
                    onChange={(e) => setEstimatedValue(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                    EMD Amount *
                  </label>
                  <input
                    type="text"
                    required
                    value={emdAmount}
                    onChange={(e) => setEmdAmount(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                    Bid Closing Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={closingDate}
                    onChange={(e) => setClosingDate(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>
            </div>

            {/* 2. Define Requirements & Compliance Criteria */}
            <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '1.25rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0369a1', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} color="#0284c7" /> 2. Define AI Compliance & Eligibility Criteria (GFR 2017 & DPIIT)
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.3rem' }}>
                    Min Make in India (MII) % *
                  </label>
                  <select
                    value={miiMinRequirement}
                    onChange={(e) => setMiiMinRequirement(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #93c5fd', fontSize: '0.85rem', backgroundColor: '#ffffff' }}
                  >
                    <option value="50% (Class-I)">50% (Class-I Local Supplier - Priority)</option>
                    <option value="20% (Class-II)">20% (Class-II Local Supplier)</option>
                    <option value="No MII Preference">No Minimum (Open Global)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.3rem' }}>
                    Min 3-Year Audited Turnover *
                  </label>
                  <input
                    type="text"
                    required
                    value={minTurnoverRequirement}
                    onChange={(e) => setMinTurnoverRequirement(e.target.value)}
                    placeholder="e.g. ₹2.0 Cr"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #93c5fd', fontSize: '0.85rem', backgroundColor: '#ffffff' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.3rem' }}>
                    Min Past Experience (Years) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    required
                    value={minExperienceYears}
                    onChange={(e) => setMinExperienceYears(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #93c5fd', fontSize: '0.85rem', backgroundColor: '#ffffff' }}
                  />
                </div>
              </div>

              {/* Mandatory Documents Checklist */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.4rem' }}>
                  Mandatory Statutory Documents Required from Bidders:
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.75rem' }}>
                  {mandatoryDocs.map((doc, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: '#ffffff',
                        padding: '0.4rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #e0f2fe',
                        fontSize: '0.83rem',
                        color: '#334155'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <CheckCircle2 size={14} color="#10b981" /> {doc}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDoc(idx)}
                        style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', padding: '0.2rem' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Add additional required document (e.g. ISO 9001 Certificate)..."
                    value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddDoc(); } }}
                    style={{ flex: 1, padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', backgroundColor: '#ffffff' }}
                  />
                  <button
                    type="button"
                    onClick={handleAddDoc}
                    style={{
                      padding: '0.45rem 0.85rem',
                      borderRadius: '6px',
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.82rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <Plus size={14} /> Add Document
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Technical BOQ Items */}
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.75rem' }}>
                3. Technical BOQ Specifications
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.75rem' }}>
                {boqItems.map((boq, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: '#ffffff',
                      padding: '0.45rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.83rem'
                    }}
                  >
                    <span><strong>{boq.item}</strong> — {boq.qty} {boq.unit}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveBoqItem(idx)}
                      style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="BOQ Item Name..."
                  value={newBoqItem.item}
                  onChange={(e) => setNewBoqItem({ ...newBoqItem, item: e.target.value })}
                  style={{ padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={newBoqItem.qty}
                  onChange={(e) => setNewBoqItem({ ...newBoqItem, qty: e.target.value })}
                  style={{ padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                />
                <input
                  type="text"
                  placeholder="Unit (Nos/Sets)"
                  value={newBoqItem.unit}
                  onChange={(e) => setNewBoqItem({ ...newBoqItem, unit: e.target.value })}
                  style={{ padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                />
                <button
                  type="button"
                  onClick={handleAddBoqItem}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: '6px',
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={14} /> Add BOQ
                </button>
              </div>
            </div>

            {/* Actions */}
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
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: '0.65rem 1.5rem',
                  borderRadius: '6px',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: '800',
                  fontSize: '0.88rem',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)'
                }}
              >
                <ShieldCheck size={18} /> {isSubmitting ? 'Publishing Tender...' : 'Publish Bid & Activate AI Rules'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
