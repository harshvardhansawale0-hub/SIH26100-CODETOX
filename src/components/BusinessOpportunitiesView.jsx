import React, { useState } from 'react';
import { 
  Briefcase, 
  TrendingUp, 
  Calendar, 
  Building2, 
  FileText, 
  CheckCircle2, 
  Download, 
  ArrowRight, 
  Sparkles, 
  Search, 
  Filter, 
  Globe, 
  BellRing,
  PieChart,
  Home
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function BusinessOpportunitiesView({ onNavigateToTenders, currentUser, onNavigateHome }) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('app'); // 'app', 'advance', 'eoi', 'gte'
  const [searchQuery, setSearchQuery] = useState('');
  const [expressedInterests, setExpressedInterests] = useState({});

  const annualPlans = [
    {
      ministry: 'Ministry of Defence (MoD)',
      dept: 'Department of Military Affairs & Ordnance',
      budget: '₹64,200 Crores',
      categories: ['Tactical Drones & Anti-Drone Radars', 'Night Vision Optics', 'High-Altitude Cold Clothing', 'Rugged Tactical Servers'],
      mseQuota: '₹16,050 Cr (25% Reserved)',
      womaniyaQuota: '₹1,926 Cr (3% Reserved)',
      miiFocus: 'Class-I Local Supplier (>=65% Domestic Content)',
      releaseQuarter: 'Q3 - Q4 FY 2026-27'
    },
    {
      ministry: 'Ministry of Electronics & IT (MeitY)',
      dept: 'Digital India Corporation & NIC',
      budget: '₹18,500 Crores',
      categories: ['National Sovereign Cloud Tier-IV Infrastructure', 'AI-Compute GPU Clusters', 'Cyber Security SOC Modernization', 'Smart City Edge Gateways'],
      mseQuota: '₹4,625 Cr (25% Reserved)',
      womaniyaQuota: '₹555 Cr (3% Reserved)',
      miiFocus: 'DPIIT Startup Runway & MII Preference',
      releaseQuarter: 'Q3 FY 2026-27'
    },
    {
      ministry: 'Ministry of Health & Family Welfare (MoHFW)',
      dept: 'AIIMS & Pradhan Mantri Ayushman Bharat',
      budget: '₹15,800 Crores',
      categories: ['Modular Diagnostic Equipment', 'Cryogenic Medical Gas Cylinders', 'Hospital Automation & HMIS', 'Universal Surgical Consumables'],
      mseQuota: '₹3,950 Cr (25% Reserved)',
      womaniyaQuota: '₹474 Cr (3% Reserved)',
      miiFocus: 'Class-I Medical Devices PPO Order',
      releaseQuarter: 'Ongoing Continuous Indents'
    },
    {
      ministry: 'Ministry of Railways',
      dept: 'Railway Board & Dedicated Freight Corridor',
      budget: '₹42,100 Crores',
      categories: ['Kavach Automatic Train Protection (ATP)', 'High-Speed Bogie Castings', 'Solar Rooftop & Traction Storage', 'Passenger Amenities'],
      mseQuota: '₹10,525 Cr (25% Reserved)',
      womaniyaQuota: '₹1,263 Cr (3% Reserved)',
      miiFocus: '100% Indian Foundry & Fabrication',
      releaseQuarter: 'Q4 FY 2026-27'
    }
  ];

  const advanceNotices = [
    {
      id: 'ADV-2026-104',
      title: 'Advance Notice: Turnkey Deployment of 200 MW Ground-Mounted Solar Parks',
      ministry: 'Ministry of New & Renewable Energy (MNRE)',
      dept: 'Solar Energy Corporation of India (SECI)',
      estimatedValue: '₹850 Crores',
      expectedPublishDate: '15 Oct 2026',
      scope: 'Design, engineering, procurement, testing, and commissioning with 10-year O&M warranty.',
      isEoiOpen: true
    },
    {
      id: 'ADV-2026-118',
      title: 'Advance Notice: AI-Driven Fraud Detection & GSTIN Cross-Verification Gateway',
      ministry: 'Ministry of Finance (Department of Revenue)',
      dept: 'Central Board of Indirect Taxes & Customs (CBIC)',
      estimatedValue: '₹140 Crores',
      expectedPublishDate: '28 Oct 2026',
      scope: 'Real-time NLP and graph network analysis platform for high-throughput tax record validation.',
      isEoiOpen: true
    },
    {
      id: 'ADV-2026-129',
      title: 'Advance Notice: National Drone Fleet for Remote Medical Deliveries in Northeast',
      ministry: 'Ministry of Development of North Eastern Region (DoNER)',
      dept: 'North Eastern Council Secretariat',
      estimatedValue: '₹68 Crores',
      expectedPublishDate: '05 Nov 2026',
      scope: 'BVLOS drone payload transit services for essential vaccines and pathology samples.',
      isEoiOpen: true
    }
  ];

  const handleExpressInterest = (id, title) => {
    setExpressedInterests(prev => ({
      ...prev,
      [id]: true
    }));
    alert(`Expression of Interest (EOI) registered successfully for "${title}". Tender notification dossier will be dispatched to your registered enterprise email upon formal RFP publication.`);
  };

  return (
    <div style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f0f9ff 35%, #fff7ed 70%, #ffffff 100%)', minHeight: '88vh', padding: '2rem 1.5rem', color: '#0f172a', fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}>
      <div className="container-custom">
        {/* Header */}
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
              <span className="section-tag" style={{ margin: 0, background: 'linear-gradient(135deg, #e0f2fe 0%, #fed7aa 100%)', color: '#0369a1', border: '1px solid #bae6fd', fontWeight: '800' }}>
                PROCUREMENT FORECAST & PIPELINE (GFR 144)
              </span>
              <span style={{ fontSize: '0.75rem', backgroundColor: '#eff6ff', color: '#0284c7', padding: '3px 8px', borderRadius: '6px', border: '1px solid #bfdbfe', fontWeight: '700' }}>
                Advance Planning Visibility
              </span>
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: '800', margin: '0.2rem 0', color: '#0f172a', letterSpacing: '-0.02em' }}>
              Business Opportunities & Procurement Forecast
            </h1>
            <p style={{ color: '#475569', fontSize: '0.95rem', maxWidth: '850px', margin: 0, lineHeight: '1.5' }}>
              Access published Annual Procurement Plans (APP) of Central Ministries & CPSEs, advance tender alerts, and submit Expressions of Interest (EOI) before formal RFP publication.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
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
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  transition: 'all 0.2s ease',
                  flexShrink: 0
                }}
                title="Return to GeM Homepage"
                aria-label="Return to GeM Homepage"
              >
                <Home size={18} color="#0284c7" />
              </button>
            )}
            <button
              type="button"
              onClick={() => alert('Downloading Unified Annual Procurement Plan (APP) FY 2026-27 summary...')}
              style={{
                backgroundColor: '#ffffff',
                color: '#0284c7',
                border: '1px solid #bae6fd',
                borderRadius: '8px',
                padding: '0.65rem 1.15rem',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 1px 3px rgba(2, 132, 199, 0.1)'
              }}
            >
              <Download size={15} />
              <span>Download Full APP (PDF)</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
          {[
            { id: 'app', label: '📊 Annual Procurement Plans (APP 2026-27)', count: annualPlans.length },
            { id: 'advance', label: '🔔 Advance Tender Notices & Pre-Bid Alerts', count: advanceNotices.length },
            { id: 'gte', label: '🌐 Global Tender Enquiries (GTE Exemption)', count: '12' }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: isActive ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : '#ffffff',
                  color: isActive ? '#ffffff' : '#475569',
                  border: `1px solid ${isActive ? '#0284c7' : '#cbd5e1'}`,
                  borderRadius: '8px',
                  padding: '0.65rem 1.25rem',
                  fontSize: '0.88rem',
                  fontWeight: isActive ? '800' : '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: isActive ? '0 2px 8px rgba(2, 132, 199, 0.25)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span style={{ fontSize: '0.75rem', backgroundColor: isActive ? '#ffffff' : '#f1f5f9', color: isActive ? '#0284c7' : '#475569', fontWeight: '900', padding: '1px 7px', borderRadius: '10px' }}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: ANNUAL PROCUREMENT PLANS (APP) */}
        {activeTab === 'app' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 50%, #fff7ed 100%)', border: '1px solid #fed7aa', borderRadius: '12px', padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', boxShadow: '0 2px 10px rgba(249, 115, 22, 0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <PieChart size={24} color="#0284c7" />
                <div>
                  <h3 style={{ fontSize: '1.1rem', color: '#0f172a', margin: '0 0 2px 0', fontWeight: '800' }}>
                    Mandatory Public Procurement Quota Breakdown
                  </h3>
                  <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    Mandatory under GFR 2017: Every Ministry publishes advance demand to ensure MSME & MII participation.
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.78rem', backgroundColor: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '4px 10px', borderRadius: '6px', fontWeight: '800' }}>
                  25% MSE Reserved
                </span>
                <span style={{ fontSize: '0.78rem', backgroundColor: '#fdf2f8', color: '#db2777', border: '1px solid #fbcfe8', padding: '4px 10px', borderRadius: '6px', fontWeight: '800' }}>
                  3% Women-Owned
                </span>
                <span style={{ fontSize: '0.78rem', backgroundColor: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa', padding: '4px 10px', borderRadius: '6px', fontWeight: '800' }}>
                  50% MII Class-I
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem' }}>
              {annualPlans.map((plan, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: '800', textTransform: 'uppercase' }}>
                          {plan.dept}
                        </span>
                        <h3 style={{ fontSize: '1.25rem', color: '#0f172a', margin: '0.2rem 0', fontWeight: '800' }}>
                          {plan.ministry}
                        </h3>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', fontWeight: '700' }}>Total Budget</span>
                        <span style={{ fontSize: '1.15rem', fontWeight: '900', color: '#059669' }}>{plan.budget}</span>
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.85rem', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '6px', fontWeight: '700', textTransform: 'uppercase' }}>
                        Key Procurement Packages Planned:
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {plan.categories.map((cat, cIdx) => (
                          <span key={cIdx} style={{ fontSize: '0.75rem', backgroundColor: '#ffffff', color: '#334155', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
                            • {cat}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Statutory Quota Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem', fontSize: '0.78rem' }}>
                      <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '6px' }}>
                        <span style={{ color: '#64748b', fontWeight: '700' }}>MSE 25% Quota:</span>
                        <div style={{ color: '#059669', fontWeight: '800' }}>{plan.mseQuota}</div>
                      </div>
                      <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '6px' }}>
                        <span style={{ color: '#64748b', fontWeight: '700' }}>Women SHG 3%:</span>
                        <div style={{ color: '#db2777', fontWeight: '800' }}>{plan.womaniyaQuota}</div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onNavigateToTenders && onNavigateToTenders()}
                    style={{
                      background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.65rem',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)'
                    }}
                  >
                    <span>View Published Tenders for this Ministry</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: ADVANCE TENDER NOTICES & PRE-BID ALERTS */}
        {activeTab === 'advance' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
            <h3 style={{ fontSize: '1.15rem', color: '#0f172a', margin: 0, fontWeight: '800' }}>
              Advance Notices & Expression of Interest (EOI) Open for Registration
            </h3>

            {advanceNotices.map((notice) => {
              const isRegistered = expressedInterests[notice.id];
              return (
                <div
                  key={notice.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1.5rem',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
                  }}
                >
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
                      <span className="mono-text" style={{ color: '#0284c7', fontSize: '0.85rem', fontWeight: '800' }}>
                        {notice.id}
                      </span>
                      <span style={{ fontSize: '0.7rem', backgroundColor: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa', padding: '2px 8px', borderRadius: '4px', fontWeight: '800' }}>
                        EXPECTED RFP: {notice.expectedPublishDate}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1.15rem', color: '#0f172a', margin: '0 0 0.35rem 0', fontWeight: '800' }}>
                      {notice.title}
                    </h4>
                    <span style={{ fontSize: '0.82rem', color: '#64748b', display: 'block', marginBottom: '0.65rem' }}>
                      {notice.ministry} • {notice.dept}
                    </span>
                    <p style={{ fontSize: '0.85rem', color: '#334155', margin: 0, lineHeight: 1.5 }}>
                      {notice.scope}
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', fontWeight: '700' }}>Estimated Outlay</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: '900', color: '#ea580c' }}>{notice.estimatedValue}</span>
                    </div>

                    <button
                      type="button"
                      disabled={isRegistered}
                      onClick={() => handleExpressInterest(notice.id, notice.title)}
                      style={{
                        background: isRegistered ? '#ecfdf5' : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                        color: isRegistered ? '#059669' : '#ffffff',
                        border: isRegistered ? '1px solid #a7f3d0' : 'none',
                        borderRadius: '6px',
                        padding: '0.65rem 1.25rem',
                        fontSize: '0.85rem',
                        fontWeight: '800',
                        cursor: isRegistered ? 'default' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        boxShadow: isRegistered ? 'none' : '0 2px 6px rgba(2, 132, 199, 0.25)'
                      }}
                    >
                      {isRegistered ? (
                        <>
                          <CheckCircle2 size={16} />
                          <span>Interest Registered</span>
                        </>
                      ) : (
                        <>
                          <BellRing size={16} />
                          <span>Express Interest (Submit EOI)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: GLOBAL TENDER ENQUIRIES (GTE) */}
        {activeTab === 'gte' && (
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.75rem', marginBottom: '3rem', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <Globe size={26} color="#0284c7" />
              <div>
                <h3 style={{ fontSize: '1.25rem', color: '#0f172a', margin: 0, fontWeight: '800' }}>
                  Global Tender Enquiry (GTE) Exemption Registry
                </h3>
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  Exceptional procurements above ₹200 Crores approved by Cabinet Secretariat under GFR Rule 161(iv)
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Under GFR Rule 161(iv), no Global Tender Enquiries are permitted for procurements below ₹200 Crores to preserve Indian domestic manufacturing capacity. Listed below are approved national infrastructure exemptions requiring specialized global OEMs with mandatory Make in India domestic offset requirements.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { ref: 'GTE/CAB/2026/09', title: 'Deep Sea Research Submersible Pressure Vessel (Matsya 6000)', ministry: 'Ministry of Earth Sciences', val: '₹420 Cr' },
                { ref: 'GTE/CAB/2026/14', title: 'High-Power Cryogenic Liquid Hydrogen Turbopumps', ministry: 'Department of Space (ISRO)', val: '₹680 Cr' }
              ].map((gte, gIdx) => (
                <div key={gIdx} style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span className="mono-text" style={{ color: '#0284c7', fontSize: '0.8rem', fontWeight: '800' }}>{gte.ref}</span>
                    <h4 style={{ margin: '2px 0', fontSize: '1rem', color: '#0f172a', fontWeight: '700' }}>{gte.title}</h4>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{gte.ministry}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#059669' }}>{gte.val}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
