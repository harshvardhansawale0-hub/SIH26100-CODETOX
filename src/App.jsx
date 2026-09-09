import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import GeMSubNavBar from './components/GeMSubNavBar';
import NotificationMarquee from './components/NotificationMarquee';
import GeMBannerShowcase from './components/GeMBannerShowcase';
import ProcessSection from './components/ProcessSection';
import PopularProductCategories from './components/PopularProductCategories';
import CtaBanner from './components/CtaBanner';
import Footer from './components/Footer';
import BidVerificationModal from './components/BidVerificationModal';
import BidDetailModal from './components/BidDetailModal';
import BuyerDashboard from './components/BuyerDashboard';
import BidderDashboard from './components/BidderDashboard';
import CreateBidModal from './components/CreateBidModal';
import AuctionAnalysisView from './components/AuctionAnalysisView';
import AboutSIHView from './components/AboutSIHView';
import ContactView from './components/ContactView';
import AuthModal from './components/AuthModal';
import { initialBids, initialTenders } from './data/bidsData';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { gemApi } from './services/api';

function MainApp() {
  const { t } = useLanguage();
  
  // Two-Role Architecture: ONLY 'buyer' or 'bidder'
  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem('gem_user_role') || 'buyer';
  });

  const [activeTab, setActiveTab] = useState('Forward'); // 'Forward', 'Buyer', 'Bidder', 'Auction', 'About', 'Contact'
  const [searchQuery, setSearchQuery] = useState('');

  // Tenders state (Buyer creates, Bidder applies)
  const [tenders, setTenders] = useState(initialTenders);
  const [isLoadingTenders, setIsLoadingTenders] = useState(false);

  // Bids state (Bidder submits, Buyer reviews & awards)
  const [bids, setBids] = useState(initialBids);
  const [isLoadingBids, setIsLoadingBids] = useState(false);

  // Modals & Active Selections
  const [selectedBid, setSelectedBid] = useState(null);
  const [selectedTenderForVerifier, setSelectedTenderForVerifier] = useState(null);
  const [isVerifierOpen, setIsVerifierOpen] = useState(false);
  const [isCreateBidOpen, setIsCreateBidOpen] = useState(false);
  const [authModalConfig, setAuthModalConfig] = useState({ isOpen: false, mode: 'signin', role: 'buyer' });
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Fetch live tenders & bids from FastAPI backend on mount
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoadingTenders(true);
      setIsLoadingBids(true);
      try {
        const [fetchedTenders, fetchedBids] = await Promise.all([
          gemApi.getTenders().catch(() => initialTenders),
          gemApi.getBids().catch(() => initialBids)
        ]);
        if (isMounted) {
          if (fetchedTenders && fetchedTenders.length > 0) setTenders(fetchedTenders);
          if (fetchedBids && fetchedBids.length > 0) setBids(fetchedBids);
        }
      } catch (err) {
        console.warn('Backend load fallback:', err);
      } finally {
        if (isMounted) {
          setIsLoadingTenders(false);
          setIsLoadingBids(false);
        }
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  const handleRoleChange = (newRole) => {
    setCurrentRole(newRole);
    localStorage.setItem('gem_user_role', newRole);
  };

  const handleOpenAuth = (mode = 'signin', role = currentRole) => {
    setAuthModalConfig({ isOpen: true, mode, role });
  };

  const handleCloseAuth = () => {
    setAuthModalConfig({ isOpen: false, mode: 'signin', role: currentRole });
  };

  const handleOpenVerifierForTender = (tender) => {
    setSelectedTenderForVerifier(tender || tenders[0] || null);
    setIsVerifierOpen(true);
  };

  // Buyer Flow: Buyer creates new tender with compliance criteria
  const handleTenderCreated = (newTender) => {
    setTenders((prev) => [newTender, ...prev]);
    setActiveTab('Buyer');
  };

  // Bidder Flow: Bidder applies and verifies documents via 8-stage pipeline
  const handleAddVerifiedBid = (newBidResult) => {
    const formattedBid = {
      id: newBidResult.bidId || `BID-${Math.floor(10000 + Math.random() * 90000)}`,
      vendor: newBidResult.vendor || "Apex Supplies Ltd.",
      category: newBidResult.category || "IT Hardware",
      item: `${newBidResult.category || "IT"} Solution`,
      tenderId: newBidResult.tenderId || "GEM/2026/B/891244",
      tenderValue: newBidResult.tenderValue || "₹1.45 Cr",
      bidAmount: newBidResult.bidAmount || "₹1.38 Cr",
      status: newBidResult.status,
      score: newBidResult.score,
      miiContent: newBidResult.miiVerified || "68% (Class-I)",
      turnover: newBidResult.turnover || "Verified via CA Statement OCR",
      experience: newBidResult.experience || "Verified",
      gstStatus: newBidResult.gstVerified || "ACTIVE",
      panStatus: newBidResult.panVerified || "MATCHED",
      msmeStatus: newBidResult.msmeStatus || "Verified (UDYAM)",
      date: "Just Now",
      riskLevel: newBidResult.risk || "Low Risk",
      ocrConfidence: newBidResult.ocrConfidence || "99.1%",
      flags: newBidResult.flags || [],
      extractedEntities: newBidResult.extractedEntities || [],
      crossDocMatches: newBidResult.crossDocMatches || [],
      requirementMatches: newBidResult.requirementMatches || [],
      complianceReport: newBidResult.complianceReport || null,
      extractedDocs: newBidResult.extractedDocs && newBidResult.extractedDocs.length > 0
        ? newBidResult.extractedDocs
        : [
          { name: "Bid_Uploaded_Docs.pdf", status: newBidResult.status === 'Compliant' ? 'Verified' : 'Flagged', score: newBidResult.score }
        ],
      auditTrail: newBidResult.auditTrail && newBidResult.auditTrail.length > 0
        ? newBidResult.auditTrail
        : [
          { timestamp: "Just Now", action: "Bid Documents OCR & Entity Extraction", agent: "EasyOCR / Tesseract" },
          { timestamp: "Just Now", action: `Evaluated ${newBidResult.rulesPassed || 214} statutory compliance rules`, agent: "NLP Rule Engine" },
          { timestamp: "Just Now", action: `Compliance Decision: ${newBidResult.status} (${newBidResult.score}/100)`, agent: "GeM ML Scorer" },
          { timestamp: "Just Now", action: "Compliance Report Sent to Government Buyer", agent: "Bidder Portal Gateway" }
        ]
    };

    setBids((prev) => [formattedBid, ...prev]);
  };

  // Buyer Flow: Final Bidder Selection & Award
  const handleBidSelected = (bidId) => {
    // 1. Update winning bid status to 'Selected'
    setBids((prev) =>
      prev.map((b) =>
        b.id === bidId
          ? {
              ...b,
              status: 'Selected',
              auditTrail: [
                ...b.auditTrail,
                {
                  timestamp: "Just Now",
                  action: "Selected by Buyer as Qualified L1 Winning Bidder",
                  agent: "Government Procuring Authority (Buyer)"
                }
              ]
            }
          : b
      )
    );

    // 2. Mark corresponding tender as 'Awarded'
    const targetBid = bids.find(b => b.id === bidId);
    if (targetBid && targetBid.tenderId) {
      setTenders((prev) =>
        prev.map((t) =>
          t.id === targetBid.tenderId
            ? { ...t, status: 'Awarded', selectedBidderId: bidId }
            : t
        )
      );
    }
  };

  const handleUpdateBidStatus = async (bidId, newStatus) => {
    setBids((prev) =>
      prev.map((b) =>
        b.id === bidId
          ? {
              ...b,
              status: newStatus,
              score: newStatus === 'Compliant' ? 95 : 25,
              auditTrail: [
                ...b.auditTrail,
                {
                  timestamp: "Manual Buyer Override",
                  action: `Buyer changed status to ${newStatus}`,
                  agent: "Government Procuring Authority (Buyer)"
                }
              ]
            }
          : b
      )
    );

    try {
      await gemApi.updateBidStatus(bidId, newStatus);
    } catch (e) {
      console.warn('Failed to persist status change to server:', e);
    }
  };

  return (
    <div className="app-container">
      {/* 1. Top Navbar with Two-Role Switcher */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentRole={currentRole}
        setCurrentRole={handleRoleChange}
        onOpenAuth={(mode, role) => handleOpenAuth(mode, role)}
        onOpenBidVerifier={() => handleOpenVerifierForTender(null)}
        onOpenCreateBid={() => setIsCreateBidOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* 1.1 Latest Notifications Marquee Ticker */}
      <NotificationMarquee
        onNotificationClick={(idx) => {
          if (idx === 1 || idx === 2) {
            handleOpenVerifierForTender(null);
          } else if (idx === 4) {
            setActiveTab('Auction');
          } else {
            setActiveTab('About');
          }
        }}
      />

      {/* 1b. GeM Official Secondary Navigation Bar */}
      <GeMSubNavBar
        onNavigateTab={(tab) => {
          if (tab === 'Bid') {
            setActiveTab(currentRole === 'buyer' ? 'Buyer' : 'Bidder');
          } else {
            setActiveTab(tab);
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenVerifier={() => handleOpenVerifierForTender(null)}
        onNotificationClick={() => {}}
        onCategorySelect={() => {
          setActiveTab(currentRole === 'buyer' ? 'Buyer' : 'Bidder');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* 2. Main Tab Views */}
      {/* 2.1 Forward Auction / Home Overview */}
      {activeTab === 'Forward' && (
        <main>
          {/* Official GeM Visual Showcase & Image Banner Carousel */}
          <GeMBannerShowcase
            onExploreTenders={() => {
              setActiveTab(currentRole === 'buyer' ? 'Buyer' : 'Bidder');
            }}
            onOpenVerifier={() => handleOpenVerifierForTender(null)}
          />

          {/* Process Section: End-to-End Procurement Lifecycle (01 Tender Upload -> 06 Payment) */}
          <ProcessSection
            onStepClick={(num) => {
              if (num === '01') {
                if (currentRole === 'buyer') {
                  setIsCreateBidOpen(true);
                } else {
                  setActiveTab('Buyer');
                }
              } else if (num === '02' || num === '03') {
                handleOpenVerifierForTender(null);
              } else if (num === '04') {
                setActiveTab('Auction');
              } else {
                setActiveTab(currentRole === 'buyer' ? 'Buyer' : 'Bidder');
              }
            }}
          />

          {/* Popular Product Categories Section matching GeM Portal */}
          <PopularProductCategories
            onCategoryClick={() => {
              setActiveTab(currentRole === 'buyer' ? 'Buyer' : 'Bidder');
            }}
            onOpenGemmy={() => handleOpenVerifierForTender(null)}
          />

          {/* Golden CTA Banner */}
          <CtaBanner
            onGetStarted={() => {
              if (currentRole === 'buyer') {
                setIsCreateBidOpen(true);
              } else {
                handleOpenVerifierForTender(null);
              }
            }}
            onViewDocs={() => setActiveTab('About')}
          />
        </main>
      )}

      {/* 2.2 BUYER PORTAL: Government / Procuring Authority Flow */}
      {activeTab === 'Buyer' && (
        <BuyerDashboard
          tenders={tenders}
          bids={bids}
          onSelectBid={(bid) => setSelectedBid(bid)}
          onTenderCreated={handleTenderCreated}
          onBidSelected={handleBidSelected}
        />
      )}

      {/* 2.3 BIDDER PORTAL: Vendor / Company Flow */}
      {(activeTab === 'Bidder' || activeTab === 'Bid') && (
        <BidderDashboard
          tenders={tenders}
          bids={bids}
          onOpenVerifierWithTender={(tender) => handleOpenVerifierForTender(tender)}
          onSelectBid={(bid) => setSelectedBid(bid)}
        />
      )}

      {/* 2.4 Auction Intelligence & Cartel Analysis */}
      {activeTab === 'Auction' && (
        <AuctionAnalysisView onSelectBid={(bid) => setSelectedBid(bid)} />
      )}

      {/* 2.5 About SIH & GeM Working Principles */}
      {activeTab === 'About' && <AboutSIHView />}

      {/* 2.6 Grievance & Helpdesk Contact */}
      {activeTab === 'Contact' && <ContactView />}

      {/* 3. Footer */}
      <Footer
        onNavigate={(tab) => {
          if (tab === 'Bid') {
            setActiveTab(currentRole === 'buyer' ? 'Buyer' : 'Bidder');
          } else {
            setActiveTab(tab);
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* 4. Modals */}
      {/* 4.1 Bidder Document OCR & 8-Stage AI Verification Pipeline */}
      <BidVerificationModal
        isOpen={isVerifierOpen}
        selectedTender={selectedTenderForVerifier}
        onClose={() => {
          setIsVerifierOpen(false);
          setSelectedTenderForVerifier(null);
        }}
        onAddVerifiedBid={handleAddVerifiedBid}
      />

      {/* 4.2 Buyer Create Bid & Compliance Criteria Builder */}
      <CreateBidModal
        isOpen={isCreateBidOpen}
        onClose={() => setIsCreateBidOpen(false)}
        onTenderCreated={handleTenderCreated}
      />

      {/* 4.3 Bid AI Compliance Dossier & Buyer Award Actions */}
      <BidDetailModal
        bid={selectedBid}
        onClose={() => setSelectedBid(null)}
        onUpdateStatus={handleUpdateBidStatus}
      />

      {/* 4.4 Role-Aware Authentication (Strictly Buyer or Bidder) */}
      <AuthModal
        isOpen={authModalConfig.isOpen}
        mode={authModalConfig.mode}
        initialRole={authModalConfig.role || currentRole}
        onClose={handleCloseAuth}
        onAuthSuccess={(userData) => {
          handleRoleChange(userData.role);
          setActiveTab(userData.role === 'buyer' ? 'Buyer' : 'Bidder');
        }}
      />

      {/* 4.5 GeM Assistant Help Modal */}
      {isHelpOpen && (
        <div className="modal-overlay" onClick={() => setIsHelpOpen(false)}>
          <div className="modal-content-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ fontSize: '1.2rem' }}>🤖 GeM Procurement Guide</h3>
              <button className="modal-close-btn" onClick={() => setIsHelpOpen(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ fontSize: '0.9rem', color: '#334155' }}>
              <p style={{ marginBottom: '1rem', lineHeight: 1.6 }}>
                Welcome to <strong>GeM</strong> — Autonomous Tender Compliance & Document Verification Platform.
              </p>
              <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                <strong style={{ display: 'block', color: '#0b1a2d', marginBottom: '0.4rem' }}>Two User Roles:</strong>
                <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <li>
                    🏛️ <strong>Buyer (Government Authority):</strong> Create tenders, define compliance requirements, review AI verification dossiers, and make final bidder awards.
                  </li>
                  <li>
                    🏢 <strong>Bidder (Vendor Enterprise):</strong> Browse available tenders, apply and upload documents (PAN, GST, UDYAM, CA Statement), run OCR verification, and send reports to Buyers.
                  </li>
                </ul>
              </div>
              <button
                onClick={() => {
                  setIsHelpOpen(false);
                  handleOpenVerifierForTender(null);
                }}
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  backgroundColor: '#0b1a2d',
                  color: '#ffffff',
                  fontWeight: '700',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Launch Verification Pipeline Sandbox
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}

