import React, { useState } from 'react';
import Navbar from './components/Navbar';
import StatsBar from './components/StatsBar';
import Capabilities from './components/Capabilities';
import ProcessSection from './components/ProcessSection';
import DashboardPreview from './components/DashboardPreview';
import CtaBanner from './components/CtaBanner';
import Footer from './components/Footer';
import BidVerificationModal from './components/BidVerificationModal';
import BidDetailModal from './components/BidDetailModal';
import FullDashboardView from './components/FullDashboardView';
import AuctionAnalysisView from './components/AuctionAnalysisView';
import AboutSIHView from './components/AboutSIHView';
import ContactView from './components/ContactView';
import AuthModal from './components/AuthModal';
import { initialBids } from './data/bidsData';
import { LanguageProvider, useLanguage } from './context/LanguageContext';

function MainApp() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('Forward');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Bids state allowing live additions from verifier
  const [bids, setBids] = useState(initialBids);
  
  // Modals
  const [selectedBid, setSelectedBid] = useState(null);
  const [isVerifierOpen, setIsVerifierOpen] = useState(false);
  const [authModalConfig, setAuthModalConfig] = useState({ isOpen: false, mode: 'signin' });
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const handleOpenAuth = (mode = 'signin') => {
    setAuthModalConfig({ isOpen: true, mode });
  };

  const handleCloseAuth = () => {
    setAuthModalConfig({ isOpen: false, mode: 'signin' });
  };

  const handleAddVerifiedBid = (newBidResult) => {
    const formattedBid = {
      id: newBidResult.bidId,
      vendor: newBidResult.vendor,
      category: newBidResult.category,
      item: "Automated Evaluation Test Item",
      tenderId: newBidResult.tenderId,
      tenderValue: "₹85.0 Lakhs",
      bidAmount: "₹78.4 Lakhs",
      status: newBidResult.status,
      score: newBidResult.score,
      miiContent: newBidResult.miiVerified,
      turnover: "Verified via CA Document OCR",
      experience: "Verified",
      gstStatus: newBidResult.gstVerified,
      panStatus: newBidResult.panVerified,
      msmeStatus: "Verified",
      date: "Just Now",
      riskLevel: newBidResult.risk,
      ocrConfidence: newBidResult.ocrConfidence,
      flags: newBidResult.flags,
      extractedDocs: [
        { name: "Bid_Uploaded_Docs.pdf", status: newBidResult.status === 'Compliant' ? 'Verified' : 'Flagged', score: newBidResult.score }
      ],
      auditTrail: [
        { timestamp: "Just Now", action: "Bid Upload & AI OCR Execution", agent: "EasyOCR / Tesseract" },
        { timestamp: "Just Now", action: `Evaluated ${newBidResult.rulesPassed}/${newBidResult.rulesTested} compliance rules`, agent: "NLP Rule Validator" },
        { timestamp: "Just Now", action: `Compliance Decision: ${newBidResult.status} (${newBidResult.score}/100)`, agent: "GeM ML Model v4.2" }
      ]
    };

    setBids([formattedBid, ...bids]);
  };

  const handleUpdateBidStatus = (bidId, newStatus) => {
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
                  timestamp: "Manual Officer Override",
                  action: `Officer changed status to ${newStatus}`,
                  agent: "Procurement Officer (Admin)"
                }
              ]
            }
          : b
      )
    );
  };

  return (
    <div className="app-container">
      {/* 1. Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={handleOpenAuth}
        onOpenBidVerifier={() => setIsVerifierOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* 2. Main Tab Views */}
      {activeTab === 'Forward' && (
        <main>
          {/* Top Highlight Stats Bar */}
          <StatsBar />

          {/* Platform Capabilities (6 Grid Cards) */}
          <Capabilities
            onCardClick={(id) => {
              if (id === 'bid-analysis') setActiveTab('Auction');
              else if (id === 'compliance-engine') setIsVerifierOpen(true);
              else if (id === 'anti-fraud') setActiveTab('Auction');
              else setActiveTab('Bid');
            }}
          />

          {/* Process Section (01 -> 02 -> 03 -> 04) */}
          <ProcessSection
            onStepClick={(num) => {
              if (num === '01' || num === '02') setIsVerifierOpen(true);
              else if (num === '03' || num === '04') setActiveTab('Bid');
            }}
          />

          {/* Real-Time Compliance Monitoring Dashboard Preview */}
          <DashboardPreview
            onSelectBid={(bid) => setSelectedBid(bid)}
            onViewFullDashboard={() => setActiveTab('Bid')}
          />

          {/* Golden CTA Banner */}
          <CtaBanner
            onGetStarted={() => setIsVerifierOpen(true)}
            onViewDocs={() => setActiveTab('About')}
          />
        </main>
      )}

      {activeTab === 'Auction' && (
        <AuctionAnalysisView onSelectBid={(bid) => setSelectedBid(bid)} />
      )}

      {activeTab === 'Bid' && (
        <FullDashboardView
          bids={bids}
          onSelectBid={(bid) => setSelectedBid(bid)}
          onOpenBidVerifier={() => setIsVerifierOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      )}

      {activeTab === 'About' && <AboutSIHView />}

      {activeTab === 'Contact' && <ContactView />}

      {/* 3. Footer */}
      <Footer
        onNavigate={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* 4. Modals */}
      <BidVerificationModal
        isOpen={isVerifierOpen}
        onClose={() => setIsVerifierOpen(false)}
        onAddVerifiedBid={handleAddVerifiedBid}
      />

      <BidDetailModal
        bid={selectedBid}
        onClose={() => setSelectedBid(null)}
        onUpdateStatus={handleUpdateBidStatus}
      />

      <AuthModal
        isOpen={authModalConfig.isOpen}
        mode={authModalConfig.mode}
        onClose={handleCloseAuth}
        onAuthSuccess={(userData) => {
          alert(`Logged in successfully as ${userData.role === 'officer' ? 'Procurement Officer' : 'Bidder Vendor'} (${userData.email})`);
        }}
      />

      {/* Help Assistant Modal */}
      {isHelpOpen && (
        <div className="modal-overlay" onClick={() => setIsHelpOpen(false)}>
          <div className="modal-content-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ fontSize: '1.2rem' }}>🤖 GeM Assistant</h3>
              <button className="modal-close-btn" onClick={() => setIsHelpOpen(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ fontSize: '0.9rem', color: '#334155' }}>
              <p style={{ marginBottom: '1rem', lineHeight: 1.6 }}>
                Welcome to <strong>GeM</strong> — Smart India Hackathon 2026 solution for autonomous tender compliance verification.
              </p>
              <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                <strong style={{ display: 'block', color: '#0b1a2d', marginBottom: '0.4rem' }}>Quick Actions:</strong>
                <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.85rem' }}>
                  <li>Click <strong>"Get Started Free"</strong> or <strong>"Bid"</strong> tab to test the OCR verification sandbox.</li>
                  <li>Click <strong>"Auction"</strong> to inspect cartel & collusion pattern analysis.</li>
                  <li>Click <strong>"About"</strong> to see Team Codetox members and technical architecture stack.</li>
                </ul>
              </div>
              <button
                onClick={() => {
                  setIsHelpOpen(false);
                  setIsVerifierOpen(true);
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
                Launch Live Verification Sandbox
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
