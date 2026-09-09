import React from 'react';
import { 
  X, 
  Award, 
  HeartHandshake, 
  Rocket, 
  ShieldCheck, 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  Sparkles, 
  ExternalLink,
  Coins,
  RefreshCw,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function InitiativeModal({
  isOpen,
  initiativeKey,
  onClose,
  onExploreTenders,
  onOpenVerifier,
  onOpenAuth,
  onNavigateTab
}) {
  const { t } = useLanguage();

  if (!isOpen || !initiativeKey) return null;

  const contentMap = {
    mii: {
      badge: "MAKE IN INDIA (MII)",
      badgeColor: "#f59e0b",
      icon: <Award size={28} color="#f59e0b" />,
      title: "Public Procurement (Preference to Make in India) Order 2017",
      authority: "Department for Promotion of Industry and Internal Trade (DPIIT)",
      summary: "Government statutory order mandating purchase preference for domestically manufactured goods and services to foster 'Atmanirbhar Bharat' (Self-Reliant India).",
      metrics: [
        { label: "Class-I Local Supplier", value: "≥ 50% Local Content", note: "Absolute purchase preference in all government tenders" },
        { label: "Class-II Local Supplier", value: "20% – 50% Content", note: "Eligible if Class-I unavailable or tender > ₹200 Cr" },
        { label: "Non-Local Supplier", value: "< 20% Local Content", note: "Disqualified from tenders < ₹200 Cr (Global Tender Enquiry)" }
      ],
      points: [
        "Automated CA Certificate & UDIN cross-verification for turnover and local content percentage.",
        "Mandatory self-declaration with bill-of-materials breakdown evaluated by GeM AI OCR.",
        "Margin of Purchase Preference: Class-I suppliers within L1 + 20% price band offered opportunity to match L1."
      ],
      primaryAction: {
        text: "Explore MII Tenders",
        handler: () => {
          onClose();
          if (onExploreTenders) onExploreTenders('mii');
        }
      },
      secondaryAction: {
        text: "Verify MII Declaration (AI OCR)",
        handler: () => {
          onClose();
          if (onOpenVerifier) onOpenVerifier();
        }
      }
    },

    womaniya: {
      badge: "WOMANIYA ON GeM",
      badgeColor: "#ec4899",
      icon: <HeartHandshake size={28} color="#ec4899" />,
      title: "Womaniya on GeM — Women Entrepreneurs & Self-Help Groups (SHGs)",
      authority: "Ministry of Commerce & Industry & Ministry of Rural Development (DAY-NRLM)",
      summary: "A dedicated national procurement avenue enabling Women Entrepreneurs, Self-Help Groups (SHGs), and Master Craftswomen to sell directly to Government buyers without middlemen.",
      metrics: [
        { label: "Mandatory Public Quota", value: "3% Annual Procurement", note: "Dedicated carve-out from the 25% MSME mandate" },
        { label: "Caution Money Deposit", value: "100% Waived (₹0)", note: "Zero caution deposit for registered Women SHGs" },
        { label: "SARAS Artisan Collection", value: "15,000+ Products", note: "Handloom, tribal crafts, eco-friendly stationery & pottery" }
      ],
      points: [
        "Direct national market access for rural craftswomen, Self-Help Groups, and women-led MSMEs.",
        "Simplified onboarding with UDYAM or SHG state registration — no prior turnover requirement.",
        "Dedicated category showcase for SARAS Collection, conference kits, gifts, and handwoven textiles."
      ],
      primaryAction: {
        text: "Explore Womaniya & SHG Tenders",
        handler: () => {
          onClose();
          if (onExploreTenders) onExploreTenders('womaniya');
        }
      },
      secondaryAction: {
        text: "Register as Women Seller / SHG",
        handler: () => {
          onClose();
          if (onOpenAuth) onOpenAuth('signup', 'bidder');
        }
      }
    },

    startup: {
      badge: "STARTUP RUNWAY",
      badgeColor: "#3b82f6",
      icon: <Rocket size={28} color="#3b82f6" />,
      title: "GeM Startup Runway — Innovation in Public Procurement",
      authority: "DPIIT & Ministry of Commerce and Industry",
      summary: "Fast-track onboarding portal enabling DPIIT-recognized tech startups to offer cutting-edge AI, IoT, cybersecurity, and clean-tech innovations directly to Government departments.",
      metrics: [
        { label: "Turnover Exemption", value: "100% Relaxed", note: "Exempted under GFR 2017 Rule 173(i)" },
        { label: "Prior Experience", value: "Zero Prior Years", note: "Evaluated solely on technical prototype & quality" },
        { label: "EMD & Tender Fee", value: "Fully Waived", note: "Exempted from Earnest Money Deposit" }
      ],
      points: [
        "Direct access to 100,000+ government procuring officers for trial orders and commercial scale-up.",
        "Autonomous AI evaluation of DPIIT certificate, patent filings, and quality benchmarks.",
        "Direct procurement mode available for breakthrough innovations without competing against legacy giants."
      ],
      primaryAction: {
        text: "Explore Startup Runway Tenders",
        handler: () => {
          onClose();
          if (onExploreTenders) onExploreTenders('startup');
        }
      },
      secondaryAction: {
        text: "Launch AI Verification Pipeline",
        handler: () => {
          onClose();
          if (onOpenVerifier) onOpenVerifier();
        }
      }
    },

    mse: {
      badge: "MSE SAMBANDH",
      badgeColor: "#10b981",
      icon: <ShieldCheck size={28} color="#10b981" />,
      title: "Public Procurement Policy for Micro & Small Enterprises (MSEs)",
      authority: "Ministry of Micro, Small & Medium Enterprises (MoMSME)",
      summary: "Statutory procurement mandate guaranteeing a minimum annual 25% purchase volume from Micro and Small Enterprises across all Central Ministries, Departments, and PSUs.",
      metrics: [
        { label: "Mandatory Quota", value: "25% of Annual Procurement", note: "By every Central Ministry & CPSU" },
        { label: "SC/ST & Women Sub-Quota", value: "4% SC/ST + 3% Women", note: "Sub-targets within the 25% overall quota" },
        { label: "Price Preference (L1 + 15%)", value: "L1 Price Matching", note: "Eligible MSEs within 15% band can match L1 for 25% order" }
      ],
      points: [
        "100% exemption from Earnest Money Deposit (EMD) and tender document cost for registered UDYAM units.",
        "Mandatory 10-day payment rule via Consignee Receipt and Acceptance Certificate (CRAC).",
        "Over 358 items exclusively reserved for procurement from Micro & Small Enterprises."
      ],
      primaryAction: {
        text: "Browse MSE Exempted Tenders",
        handler: () => {
          onClose();
          if (onExploreTenders) onExploreTenders('mse');
        }
      },
      secondaryAction: {
        text: "Verify UDYAM Registration",
        handler: () => {
          onClose();
          if (onOpenVerifier) onOpenVerifier();
        }
      }
    },

    caution: {
      badge: "CAUTION MONEY DEPOSIT",
      badgeColor: "#f59e0b",
      icon: <Coins size={28} color="#f59e0b" />,
      title: "GeM Caution Money Slabs & Policy Guidelines",
      authority: "Government e-Marketplace General Terms & Conditions (GTC)",
      summary: "Statutory one-time security deposit maintained by registered sellers on GeM to ensure transaction discipline, timely delivery, and contract compliance.",
      metrics: [
        { label: "Turnover < ₹1 Crore", value: "₹5,000", note: "One-time deposit into interest-bearing GeM pool" },
        { label: "Turnover ₹1 Cr – ₹10 Cr", value: "₹10,000", note: "For medium-scale supplier accounts" },
        { label: "Turnover > ₹10 Crore", value: "₹25,000", note: "Maximum slab for large enterprise vendors" }
      ],
      points: [
        "Exemption: 100% exempt for Women Self-Help Groups (SHGs) and Artisans registered under Womaniya.",
        "Account Protection: Caution money remains in the vendor's dedicated escrow account earning scheduled interest.",
        "Automatic Forfeiture: Only invoked in cases of documented vendor default, spurious goods, or cartel collusion."
      ],
      primaryAction: {
        text: "Register as Vendor (Bidder)",
        handler: () => {
          onClose();
          if (onOpenAuth) onOpenAuth('signup', 'bidder');
        }
      },
      secondaryAction: {
        text: "Explore Active Tenders",
        handler: () => {
          onClose();
          if (onExploreTenders) onExploreTenders('all');
        }
      }
    },

    cppp: {
      badge: "CPPP INTEGRATION",
      badgeColor: "#8b5cf6",
      icon: <RefreshCw size={28} color="#8b5cf6" />,
      title: "Central Public Procurement Portal (CPPP) Synchronization",
      authority: "National Informatics Centre (NIC) & Ministry of Finance",
      summary: "Bi-directional automated gateway synchronizing published tenders between GeM and the Central Public Procurement Portal (eprocure.gov.in) via XML feeds and secure REST APIs.",
      metrics: [
        { label: "Bid Synchronization", value: "Real-Time Webhook", note: "Instant tender replication across national databases" },
        { label: "Coverage", value: "100% Ministries & PSUs", note: "Central, State, and Autonomous bodies" },
        { label: "Data Integrity", value: "SHA-256 Checksum", note: "Tamper-proof synchronization of BOQ and amendments" }
      ],
      points: [
        "Cross-portal single sign-on (SSO) and DSC cryptographic authentication for vendor bids.",
        "Unified compliance scrutiny: GFR 2017, MII 2017, and MSE 2012 rules applied across all synced tenders.",
        "Automated anti-collusion screen across CPPP and GeM bidder pools."
      ],
      primaryAction: {
        text: "View Synced Tenders on GeM",
        handler: () => {
          onClose();
          if (onExploreTenders) onExploreTenders('all');
        }
      },
      secondaryAction: {
        text: "Review Compliance Intelligence",
        handler: () => {
          onClose();
          if (onNavigateTab) onNavigateTab('Auction');
        }
      }
    },

    newOnGem: {
      badge: "NEW ON GeM 2026",
      badgeColor: "#ef4444",
      icon: <Sparkles size={28} color="#ef4444" />,
      title: "Recent AI-Powered Launches & Autonomous Upgrades",
      authority: "GeM Digital India & AI Center of Excellence",
      summary: "State-of-the-art AI compliance, computer vision OCR, and machine learning modules deployed to make public procurement 100% autonomous, transparent, and fraud-resistant.",
      metrics: [
        { label: "8-Stage OCR Pipeline", value: "< 4 Seconds", note: "End-to-end verification of PAN, GST, CA statements & UDYAM" },
        { label: "Cartel Ring Radar", value: "98.7% Accuracy", note: "Identifies IP clustering, synchronized pricing & DSC overlap" },
        { label: "Land Border Gate", value: "GFR 144(xi)", note: "Automated Competent Authority registration validation" }
      ],
      points: [
        "Instant document forensics using OpenCV typography analysis to detect altered turnover certificates.",
        "Automated L1 price discovery and reverse auction intelligence with dynamic cartel alerts.",
        "CRAC-integrated automated 10-day payment disbursal through PFMS."
      ],
      primaryAction: {
        text: "Launch AI Document Verifier",
        handler: () => {
          onClose();
          if (onOpenVerifier) onOpenVerifier();
        }
      },
      secondaryAction: {
        text: "Explore Anti-Cartel Radar",
        handler: () => {
          onClose();
          if (onNavigateTab) onNavigateTab('Auction');
        }
      }
    },

    gfr: {
      badge: "GFR COMPLIANCE ADVISORY",
      badgeColor: "#ef4444",
      icon: <AlertTriangle size={28} color="#ef4444" />,
      title: "Advisory on GFR Rule 144(xi) — Land Border Restrictions",
      authority: "Department of Expenditure, Ministry of Finance (Order F.No.6/18/2019-PPD)",
      summary: "Statutory national security requirement barring bidders from countries sharing a land border with India from participating in government procurement unless formally registered with the Competent Authority (DPIIT).",
      metrics: [
        { label: "Mandatory Undertaking", value: "Rule 144(xi) Clause", note: "Compulsory declaration required in all submitted bids" },
        { label: "Competent Authority", value: "DPIIT Registration", note: "Political & security clearance from MEA & MHA required" },
        { label: "Verification Stage", value: "Stage 2 AI Screener", note: "Automated verification during document ingestion" }
      ],
      points: [
        "Non-compliant bids lacking the certified border declaration are disqualified automatically.",
        "Sub-contracting or OEM equipment sourcing from border nations strictly governed by security clearance.",
        "Self-declarations verified via GeM automated NLP entity extractor."
      ],
      primaryAction: {
        text: "Upload & Verify Declaration (AI OCR)",
        handler: () => {
          onClose();
          if (onOpenVerifier) onOpenVerifier();
        }
      },
      secondaryAction: {
        text: "Explore Compliant Tenders",
        handler: () => {
          onClose();
          if (onExploreTenders) onExploreTenders('all');
        }
      }
    },

    buyerGuide: {
      badge: "BUYER ONBOARDING",
      badgeColor: "#0284c7",
      icon: <Building2 size={28} color="#0284c7" />,
      title: "Government Procuring Authority (Buyer) Onboarding Guide",
      authority: "General Financial Rules (GFR 2017) Rule 149 Mandate",
      summary: "Comprehensive procurement guide for Central & State Government officers, Public Sector Undertakings (PSUs), and Autonomous Bodies procuring via GeM.",
      metrics: [
        { label: "Direct Purchase", value: "Up to ₹25,000", note: "Any available seller meeting specifications" },
        { label: "L1 Comparison", value: "₹25,000 – ₹5 Lakhs", note: "Mandatory comparison of at least 3 distinct OEMs" },
        { label: "Bidding & RA", value: "> ₹5 Lakhs", note: "Mandatory open competitive electronic bidding or RA" }
      ],
      points: [
        "Create custom tenders with automated Make in India, MSME, and turnover criteria filters.",
        "Review AI-evaluated compliance dossiers (8-stage verification) before opening financial bids.",
        "1-click electronic award to lowest qualified L1 bidder with digital contract generation."
      ],
      primaryAction: {
        text: "Enter Buyer Portal",
        handler: () => {
          onClose();
          if (onNavigateTab) onNavigateTab('Buyer');
        }
      },
      secondaryAction: {
        text: "Publish New Procurement Tender",
        handler: () => {
          onClose();
          if (onNavigateTab) onNavigateTab('Buyer');
        }
      }
    },

    sellerGuide: {
      badge: "SELLER ONBOARDING",
      badgeColor: "#10b981",
      icon: <UserCheck size={28} color="#10b981" />,
      title: "Vendor / Bidder Registration & Document Verification Guide",
      authority: "Government e-Marketplace Seller Onboarding Cell",
      summary: "Step-by-step guidance for domestic manufacturers, service providers, startups, and MSMEs to register, verify statutory credentials, and bid on government tenders.",
      metrics: [
        { label: "Registration Steps", value: "4 Simple Steps", note: "Aadhaar / PAN verification + GSTIN + Bank linkage" },
        { label: "Document Verification", value: "AI Real-Time", note: "Instant OCR extraction of PAN, GST, CA statements" },
        { label: "Marketplace Reach", value: "₹4.5 Lakh Crore GMV", note: "Direct access to 100,000+ government buyers" }
      ],
      points: [
        "Automatic integration with GSTN, Income Tax, and UDYAM portals for instant identity validation.",
        "Run your documents through the GeM 8-Stage AI Verification Pipeline before final submission.",
        "Track payments, Consignee Receipt and Acceptance Certificates (CRAC), and PFMS status in real-time."
      ],
      primaryAction: {
        text: "Register as Vendor (Bidder)",
        handler: () => {
          onClose();
          if (onOpenAuth) onOpenAuth('signup', 'bidder');
        }
      },
      secondaryAction: {
        text: "Test AI Document Verification Sandbox",
        handler: () => {
          onClose();
          if (onOpenVerifier) onOpenVerifier();
        }
      }
    }
  };

  const item = contentMap[initiativeKey] || contentMap.mii;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content-box" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: '780px', 
          backgroundColor: '#0b1a2d', 
          border: '1px solid #1e385b', 
          color: '#ffffff',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.65)'
        }}
      >
        {/* Header */}
        <div className="modal-header" style={{ borderBottom: '1px solid #1e385b', padding: '1.25rem 1.75rem', backgroundColor: '#071526' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ 
              width: '46px', 
              height: '46px', 
              borderRadius: '10px', 
              backgroundColor: '#0b1a2d', 
              border: `1px solid ${item.badgeColor}40`,
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              {item.icon}
            </div>
            <div>
              <span style={{ 
                fontSize: '0.72rem', 
                fontWeight: '900', 
                letterSpacing: '0.08em', 
                color: item.badgeColor,
                textTransform: 'uppercase',
                backgroundColor: `${item.badgeColor}15`,
                padding: '2px 8px',
                borderRadius: '4px',
                display: 'inline-block',
                marginBottom: '4px'
              }}>
                {item.badge}
              </span>
              <h3 className="modal-title" style={{ color: '#ffffff', fontSize: '1.2rem', margin: 0, lineHeight: 1.25 }}>
                {item.title}
              </h3>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ padding: '1.75rem', color: '#cbd5e1' }}>
          {/* Statutory Authority Tag */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem', fontSize: '0.82rem', color: '#94a3b8' }}>
            <span style={{ fontWeight: '700', color: '#38bdf8' }}>Governing Authority:</span>
            <span>{item.authority}</span>
          </div>

          {/* Summary Text */}
          <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: '#e2e8f0', marginBottom: '1.5rem', backgroundColor: '#0f2238', padding: '1rem 1.25rem', borderRadius: '8px', border: '1px solid #1e385b' }}>
            {item.summary}
          </p>

          {/* 3 KPI metric tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
            {item.metrics.map((m, idx) => (
              <div 
                key={idx} 
                style={{ 
                  backgroundColor: '#081729', 
                  border: '1px solid #1e385b', 
                  borderRadius: '8px', 
                  padding: '1rem', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between' 
                }}
              >
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>
                  {m.label}
                </span>
                <span style={{ fontSize: '1.15rem', fontWeight: '900', color: '#38bdf8', margin: '0.35rem 0' }}>
                  {m.value}
                </span>
                <span style={{ fontSize: '0.74rem', color: '#64748b', lineHeight: 1.3 }}>
                  {m.note}
                </span>
              </div>
            ))}
          </div>

          {/* Key Compliance Points */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: '800', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
              Key Provisions & GeM System Enforcement
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {item.points.map((pt, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.88rem', color: '#cbd5e1' }}>
                  <CheckCircle2 size={16} color={item.badgeColor} style={{ flexShrink: 0, marginTop: '3px' }} />
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem', paddingTop: '1.25rem', borderTop: '1px solid #1e385b', flexWrap: 'wrap' }}>
            {item.primaryAction && (
              <button
                type="button"
                onClick={item.primaryAction.handler}
                style={{
                  flex: '1',
                  minWidth: '220px',
                  padding: '0.85rem 1.25rem',
                  backgroundColor: item.badgeColor,
                  color: '#071526',
                  fontWeight: '800',
                  fontSize: '0.9rem',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: `0 4px 14px ${item.badgeColor}40`,
                  transition: 'transform 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <span>{item.primaryAction.text}</span>
                <ArrowRight size={16} />
              </button>
            )}

            {item.secondaryAction && (
              <button
                type="button"
                onClick={item.secondaryAction.handler}
                style={{
                  flex: '1',
                  minWidth: '220px',
                  padding: '0.85rem 1.25rem',
                  backgroundColor: 'transparent',
                  color: '#38bdf8',
                  border: '1px solid #1e385b',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'background-color 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0f2238'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <span>{item.secondaryAction.text}</span>
                <ExternalLink size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
