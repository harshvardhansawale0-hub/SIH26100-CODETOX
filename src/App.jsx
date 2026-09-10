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
import AuthGate from './components/AuthGate';
import TendersView from './components/TendersView';
import TenderDetailModal from './components/TenderDetailModal';
import ContractsView from './components/ContractsView';
import InitiativeModal from './components/InitiativeModal';
import SchemePortalView from './components/SchemePortalView';
import AuctionsView from './components/AuctionsView';
import BusinessOpportunitiesView from './components/BusinessOpportunitiesView';
import CategoryCatalogView from './components/CategoryCatalogView';
import AskGemmyModal from './components/AskGemmyModal';
import CompliancePassportView from './components/CompliancePassportView';
import { initialBids, initialTenders } from './data/bidsData';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { gemApi } from './services/api';
import { clearAuth, setAuthToken } from './services/api';

function MainApp() {
  const { t } = useLanguage();
  
  // Session State: Persisted authenticated user (null if logged out)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('gem_auth_user') || localStorage.getItem('gem_user');
      if (saved) {
        const token = localStorage.getItem('gem_auth_token');
        if (token) setAuthToken(token);
        return JSON.parse(saved);
      }
    } catch {}
    return null;
  });

  // Role Context: 'buyer' or 'bidder'
  const [currentRole, setCurrentRole] = useState(() => {
    if (currentUser && currentUser.role) return currentUser.role;
    return localStorage.getItem('gem_user_role') || 'buyer';
  });

  const [activeTab, setActiveTab] = useState('Forward'); // 'Forward', 'Buyer', 'Bidder', 'Tenders', 'Contracts', 'Auctions', 'BusinessOpportunities', 'CategoryCatalog', 'SchemePortal', 'About', 'Contact'
  const [searchQuery, setSearchQuery] = useState('');

  // Cross-Navigation & Initiative Redirection Filters
  const [activeTenderInitiative, setActiveTenderInitiative] = useState('all');
  const [activeTenderCategory, setActiveTenderCategory] = useState('ALL');
  const [activeContractFilter, setActiveContractFilter] = useState('ALL');
  const [activeContractSearch, setActiveContractSearch] = useState('');
  const [initiativeModalKey, setInitiativeModalKey] = useState(null);
  const [activeSchemeKey, setActiveSchemeKey] = useState('mii');
  const [activeCatalogCategory, setActiveCatalogCategory] = useState('Oxygen Gas & Accessories');

  // Tenders state (Buyer creates, Bidder applies)
  const [tenders, setTenders] = useState(() => {
    try {
      const stored = localStorage.getItem('gem_stored_tenders');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialTenders || [];
  });
  const [isLoadingTenders, setIsLoadingTenders] = useState(false);

  // Bids state (Bidder submits, Buyer reviews & awards)
  const [bids, setBids] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('gem_stored_bids') || '[]');
      if (stored && stored.length > 0) {
        const map = new Map();
        for (const b of (initialBids || [])) map.set(b.id, b);
        for (const b of stored) {
          if (b && b.id) map.set(b.id, b);
        }
        return Array.from(map.values()).reverse();
      }
    } catch {}
    return initialBids || [];
  });
  const [isLoadingBids, setIsLoadingBids] = useState(false);

  // Modals & Active Selections
  const [selectedBid, setSelectedBid] = useState(null);
  const [selectedTender, setSelectedTender] = useState(null);
  const [selectedTenderForVerifier, setSelectedTenderForVerifier] = useState(null);
  const [isVerifierOpen, setIsVerifierOpen] = useState(false);
  const [isCreateBidOpen, setIsCreateBidOpen] = useState(false);
  const [authModalConfig, setAuthModalConfig] = useState({
    isOpen: false,
    mode: 'signin',
    role: 'buyer',
    reasonMessage: null
  });
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isGemmyOpen, setIsGemmyOpen] = useState(false);

  // Fetch live tenders & bids from FastAPI backend on mount
  const loadData = async () => {
    setIsLoadingTenders(true);
    setIsLoadingBids(true);
    try {
      const [fetchedTenders, fetchedBids] = await Promise.all([
        gemApi.getTenders().catch(() => initialTenders),
        gemApi.getBids().catch(() => initialBids)
      ]);
      if (fetchedTenders && fetchedTenders.length > 0) {
        // Merge with any locally created tenders in localStorage that might not yet be fetched
        let storedTenders = [];
        try {
          storedTenders = JSON.parse(localStorage.getItem('gem_stored_tenders') || '[]');
        } catch {}
        const mergedTenders = [...fetchedTenders];
        for (const st of storedTenders) {
          if (st && st.id && !mergedTenders.some(t => t.id === st.id)) {
            mergedTenders.unshift(st);
          }
        }
        setTenders(mergedTenders);
        try {
          localStorage.setItem('gem_stored_tenders', JSON.stringify(mergedTenders));
        } catch {}
      }
      if (fetchedBids && fetchedBids.length > 0) {
        let storedBids = [];
        try {
          storedBids = JSON.parse(localStorage.getItem('gem_stored_bids') || '[]');
        } catch {}
        const map = new Map();
        for (const b of (initialBids || [])) map.set(b.id, b);
        for (const b of storedBids) {
          if (b && b.id) map.set(b.id, b);
        }
        for (const b of fetchedBids) {
          if (b && b.id) map.set(b.id, b);
        }
        const mergedBids = Array.from(map.values());
        setBids(mergedBids);
        try {
          localStorage.setItem('gem_stored_bids', JSON.stringify(mergedBids));
        } catch {}
      }
    } catch (err) {
      console.warn('Backend load fallback:', err);
    } finally {
      setIsLoadingTenders(false);
      setIsLoadingBids(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRoleChange = (newRole) => {
    setCurrentRole(newRole);
    localStorage.setItem('gem_user_role', newRole);
  };

  const handleAuthSuccess = (userData) => {
    setCurrentUser(userData);
    try {
      localStorage.setItem('gem_user', JSON.stringify(userData));
      localStorage.setItem('gem_auth_user', JSON.stringify(userData));
    } catch (e) {
      console.warn('Storage error:', e);
    }
    handleRoleChange(userData.role);
    setActiveTab(userData.role === 'buyer' ? 'Buyer' : 'Bidder');
    loadData();
  };

  const handleLogout = async () => {
    await gemApi.logout();
    clearAuth();
    setCurrentUser(null);
    localStorage.removeItem('gem_auth_user');
    setActiveTab('Forward');
  };

  const handleQuickDemoLogin = (demoRole) => {
    const isGovBuyer = demoRole === 'buyer';
    const demoUser = isGovBuyer
      ? {
          id: 101,
          fullName: "Dir. Rajesh Verma",
          email: "procurement.officer@nic.in",
          organization: "Ministry of Electronics & IT (MeitY)",
          gstin: "07AAAGM0289C1ZU",
          role: "buyer",
          designation: "Chief Procurement Officer",
          isDemo: true
        }
      : {
          id: 202,
          fullName: "Harshvardhan Sawale",
          email: "vendor.contact@apextech.com",
          organization: "Apex Technologies & Supplies Ltd.",
          gstin: "27AABCB1234F1Z5",
          role: "bidder",
          udyam: "UDYAM-MH-03-0012345",
          isDemo: true
        };

    const token = `gem_demo_jwt_${Date.now()}`;
    setAuthToken(token);
    handleAuthSuccess(demoUser);
  };

  const handleOpenAuth = (mode = 'signin', role = currentRole, reasonMessage = null) => {
    setAuthModalConfig({ isOpen: true, mode, role, reasonMessage });
  };

  const handleCloseAuth = () => {
    setAuthModalConfig({ isOpen: false, mode: 'signin', role: currentRole, reasonMessage: null });
  };

  // Cross-Initiative & Scheme Redirection Handler (routes to dedicated SchemePortalView)
  const handleNavigateInitiative = (initiativeKey) => {
    setActiveSchemeKey(initiativeKey || 'mii');
    setActiveTenderInitiative(initiativeKey || 'all');
    setActiveTab('SchemePortal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenInitiativeModal = (initiativeKey) => {
    setInitiativeModalKey(initiativeKey);
  };

  // Product Category Redirection Handler (routes to dedicated CategoryCatalogView)
  const handleCategorySelect = (categoryName) => {
    setActiveCatalogCategory(categoryName);
    setActiveTenderCategory(categoryName);
    setActiveTab('CategoryCatalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateContracts = (statusFilter = 'ALL', focusSearch = false) => {
    setActiveContractFilter(statusFilter);
    if (typeof focusSearch === 'string') {
      setActiveContractSearch(focusSearch);
    }
    setActiveTab('Contracts');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Protected Action: Open Verifier (Requires Bidder Auth)
  const handleOpenVerifierForTender = (tender) => {
    if (!currentUser) {
      handleOpenAuth('signin', 'bidder', 'Authentication Required: Please sign in as a Vendor Bidder to upload & verify documents.');
      return;
    }
    if (currentUser.role !== 'bidder') {
      handleOpenAuth('signin', 'bidder', 'Role Switch Required: Document upload & OCR verification is reserved for Vendor Bidders.');
      return;
    }
    setSelectedTenderForVerifier(tender || tenders[0] || null);
    setIsVerifierOpen(true);
  };

  // Protected Action: Open Create Bid/Tender (Requires Buyer Auth)
  const handleOpenCreateBid = () => {
    if (!currentUser) {
      handleOpenAuth('signin', 'buyer', 'Authentication Required: Please sign in as a Government Buyer to publish new procurement bids.');
      return;
    }
    if (currentUser.role !== 'buyer') {
      handleOpenAuth('signin', 'buyer', 'Role Switch Required: Publishing bids & specifying compliance criteria is reserved for Government Buyers.');
      return;
    }
    setIsCreateBidOpen(true);
  };

  // Buyer Flow: Buyer creates new tender with compliance criteria
  const handleTenderCreated = (newTender) => {
    const userEmail = currentUser?.email || (currentUser?.fullName ? `${currentUser.fullName.toLowerCase().replace(/\s+/g, '.')}@gem.gov.in` : 'buyer@gem.gov.in');
    const tenderWithCreator = {
      ...newTender,
      createdBy: newTender.createdBy || userEmail,
      buyerEmail: newTender.buyerEmail || userEmail,
      buyerName: newTender.buyerName || (currentUser ? currentUser.fullName : 'Government Buyer'),
      buyerOrg: newTender.buyerOrg || (currentUser ? currentUser.organization : 'Government Procuring Authority'),
      buyerId: newTender.buyerId || currentUser?.id || null
    };
    setTenders((prev) => {
      const updated = [tenderWithCreator, ...prev];
      try {
        localStorage.setItem('gem_stored_tenders', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setActiveTab('Buyer');
  };

  // Buyer Flow: Buyer deletes a published tender
  const handleDeleteTender = async (tenderId) => {
    setTenders((prev) => {
      const updated = prev.filter((t) => t.id !== tenderId);
      try {
        localStorage.setItem('gem_stored_tenders', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setBids((prev) => {
      const updated = prev.filter((b) => b.tenderId !== tenderId);
      try {
        localStorage.setItem('gem_stored_bids', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    try {
      await gemApi.deleteTender(tenderId);
    } catch (err) {
      console.warn('Failed to delete tender on server:', err);
    }
  };

  // Bidder Flow: Bidder applies and verifies documents via 8-stage pipeline
  const handleAddVerifiedBid = async (newBidResult) => {
    const formattedBid = {
      id: newBidResult.bidId || `BID-${Math.floor(10000 + Math.random() * 90000)}`,
      vendor: newBidResult.vendor || (currentUser ? (currentUser.organization || currentUser.fullName) : "Apex Supplies Ltd."),
      vendorEmail: newBidResult.vendorEmail || (currentUser ? currentUser.email : null),
      submittedBy: newBidResult.submittedBy || (currentUser ? currentUser.email : null),
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

    setBids((prev) => {
      const filtered = prev.filter(b => b.id !== formattedBid.id);
      const updated = [formattedBid, ...filtered];
      try {
        localStorage.setItem('gem_stored_bids', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    try {
      await gemApi.createBid(formattedBid);
    } catch (err) {
      console.warn('Backend bid sync error:', err);
    }
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
                  action: `Selected by ${currentUser ? currentUser.fullName : 'Buyer'} as Qualified L1 Winning Bidder`,
                  agent: currentUser ? `${currentUser.fullName} (${currentUser.organization})` : "Government Procuring Authority (Buyer)"
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
                  agent: currentUser ? currentUser.fullName : "Government Procuring Authority (Buyer)"
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
      {/* 1. Top Navbar with Two-Role Switcher & Auth State */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentRole={currentRole}
        setCurrentRole={handleRoleChange}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAuth={(mode, role, reason) => handleOpenAuth(mode, role, reason)}
        onOpenBidVerifier={() => handleOpenVerifierForTender(null)}
        onOpenCreateBid={handleOpenCreateBid}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* 1.1 Latest Notifications Marquee Ticker */}
      <NotificationMarquee
        onNotificationClick={(idx) => {
          if (idx === 0) {
            handleOpenInitiativeModal('gfr');
          } else if (idx === 1) {
            handleOpenVerifierForTender(null);
          } else if (idx === 2) {
            handleNavigateInitiative('mse');
          } else if (idx === 3) {
            handleNavigateInitiative('mii');
          } else if (idx === 4) {
            setActiveTab('Auctions');
          } else {
            setActiveTab('About');
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
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
        onCategorySelect={handleCategorySelect}
        onNavigateInitiative={handleNavigateInitiative}
        onOpenInitiativeModal={handleOpenInitiativeModal}
        onNavigateContracts={handleNavigateContracts}
      />

      {/* 2. Main Tab Views */}
      {/* 2.1 Forward Auction / Home Overview (Public) */}
      {activeTab === 'Forward' && (
        <main>
          {/* Official GeM Visual Showcase & Image Banner Carousel */}
          <GeMBannerShowcase
            onExploreTenders={(initKey) => {
              if (initKey) {
                handleNavigateInitiative(initKey);
              } else {
                setActiveTab('Tenders');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            onOpenVerifier={() => handleOpenVerifierForTender(null)}
            onNavigateInitiative={handleNavigateInitiative}
            onOpenInitiativeModal={handleOpenInitiativeModal}
          />

          {/* Process Section: End-to-End Procurement Lifecycle (01 Tender Upload -> 06 Payment) */}
          <ProcessSection
            onStepClick={(num) => {
              if (num === '01') {
                if (currentRole === 'buyer' && currentUser?.role === 'buyer') {
                  handleOpenCreateBid();
                } else {
                  setActiveTab('Buyer');
                }
              } else if (num === '02') {
                setActiveTab('Tenders');
              } else if (num === '03') {
                handleOpenVerifierForTender(null);
              } else if (num === '04') {
                setActiveTab('Auctions');
              } else if (num === '05') {
                setActiveTab('Contracts');
              } else if (num === '06') {
                handleNavigateContracts('Pending Inspection');
              } else {
                setActiveTab('Forward');
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />

          {/* Popular Product Categories Section matching GeM Portal */}
          <PopularProductCategories
            onCategoryClick={(catId, itemName) => {
              const categoryMapping = {
                oxygen: 'Oxygen Gas & Accessories',
                medical: 'Medical & Healthcare',
                saras: 'SARAS Handicrafts & Women Artisans',
                furniture: 'Furniture & Fixtures',
                fire: 'Fire Safety & Security',
                computers: 'Computers & IT Hardware'
              };
              const mappedCategory = categoryMapping[catId] || itemName || 'Oxygen Gas & Accessories';
              handleCategorySelect(mappedCategory);
            }}
            onOpenGemmy={() => setIsGemmyOpen(true)}
          />

          {/* Golden CTA Banner */}
          <CtaBanner
            onGetStarted={() => {
              if (currentRole === 'buyer') {
                handleOpenCreateBid();
              } else {
                handleOpenVerifierForTender(null);
              }
            }}
            onViewDocs={() => setActiveTab('About')}
          />
        </main>
      )}

      {/* 2.2 BUYER PORTAL: Government / Procuring Authority Flow (PROTECTED) */}
      {activeTab === 'Buyer' && (
        currentUser && currentUser.role === 'buyer' ? (
          <BuyerDashboard
            tenders={tenders}
            bids={bids}
            currentUser={currentUser}
            onSelectBid={(bid) => setSelectedBid(bid)}
            onTenderCreated={handleTenderCreated}
            onBidSelected={handleBidSelected}
            onDeleteTender={handleDeleteTender}
          />
        ) : (
          <AuthGate
            requiredRole="buyer"
            currentUser={currentUser}
            onOpenAuth={(mode, role) => handleOpenAuth(mode, role, 'Sign in as Government Buyer to access Buyer Portal')}
            onQuickDemoLogin={(role) => handleQuickDemoLogin(role)}
            onNavigateHome={() => setActiveTab('Forward')}
          />
        )
      )}

      {/* 2.3 BIDDER PORTAL: Vendor / Company Flow (PROTECTED) */}
      {(activeTab === 'Bidder' || activeTab === 'Bid') && (
        currentUser && currentUser.role === 'bidder' ? (
          <BidderDashboard
            tenders={tenders}
            bids={bids}
            currentUser={currentUser}
            onOpenVerifierWithTender={(tender) => handleOpenVerifierForTender(tender)}
            onSelectBid={(bid) => setSelectedBid(bid)}
            onNavigateToPassport={() => setActiveTab('Passport')}
          />
        ) : (
          <AuthGate
            requiredRole="bidder"
            currentUser={currentUser}
            onOpenAuth={(mode, role) => handleOpenAuth(mode, role, 'Sign in as Vendor Bidder to access Bidder Portal')}
            onQuickDemoLogin={(role) => handleQuickDemoLogin(role)}
            onNavigateHome={() => setActiveTab('Forward')}
          />
        )
      )}

      {/* 2.4 Tenders Tab */}
      {activeTab === 'Tenders' && (
        <TendersView
          tenders={tenders}
          onSelectTender={(tender) => setSelectedTender(tender)}
          currentUser={currentUser}
          initialInitiative={activeTenderInitiative}
          initialCategory={activeTenderCategory}
          initialSearch={searchQuery}
          onOpenInitiativeModal={handleOpenInitiativeModal}
        />
      )}

      {/* 2.5 Contracts Tab */}
      {activeTab === 'Contracts' && (
        <ContractsView 
          currentUser={currentUser} 
          initialFilter={activeContractFilter}
          initialSearch={activeContractSearch}
        />
      )}

      {/* Compliance Passport */}
      {activeTab === 'Passport' && (
        <CompliancePassportView currentUser={currentUser} currentRole={currentRole} />
      )}

      {/* 2.6 Dedicated Live E-Auctions Portal (Reverse & Forward) */}
      {(activeTab === 'Auctions' || activeTab === 'Auction') && (
        <AuctionsView 
          currentUser={currentUser} 
          onSelectBid={(bid) => setSelectedBid(bid)} 
        />
      )}

      {/* 2.7 Dedicated Business Opportunities & Procurement Forecast Portal */}
      {activeTab === 'BusinessOpportunities' && (
        <BusinessOpportunitiesView
          onNavigateToTenders={() => {
            setActiveTab('Tenders');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          currentUser={currentUser}
        />
      )}

      {/* 2.8 Dedicated Product & Service Category Catalog */}
      {activeTab === 'CategoryCatalog' && (
        <CategoryCatalogView
          initialCategory={activeCatalogCategory}
          currentUser={currentUser}
          onNavigateToTenders={() => {
            setActiveTab('Tenders');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenCreateBid={handleOpenCreateBid}
        />
      )}

      {/* 2.9 Dedicated Government Schemes & Registration Portal (MII, Womaniya, Startup, MSE) */}
      {activeTab === 'SchemePortal' && (
        <SchemePortalView
          initialScheme={activeSchemeKey}
          currentUser={currentUser}
          onNavigateToTenders={(initKey) => {
            setActiveTenderInitiative(initKey || 'all');
            setActiveTab('Tenders');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenVerifier={(tender) => handleOpenVerifierForTender(tender)}
        />
      )}

      {/* 2.10 About SIH & GeM Working Principles */}
      {activeTab === 'About' && <AboutSIHView />}

      {/* 2.11 Grievance & Helpdesk Contact */}
      {activeTab === 'Contact' && <ContactView />}

      {/* 3. Footer */}
      <Footer
        onNavigate={(tab) => {
          if (tab === 'Bid') {
            setActiveTab(currentRole === 'buyer' ? 'Buyer' : 'Bidder');
          } else if (tab === 'Auction') {
            setActiveTab('Auctions');
          } else {
            setActiveTab(tab);
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenHelp={() => setIsHelpOpen(true)}
        onNavigateInitiative={handleNavigateInitiative}
        onOpenInitiativeModal={handleOpenInitiativeModal}
        onOpenVerifier={() => handleOpenVerifierForTender(null)}
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


      {/* 4.3 Bid AI Compliance Dossier & Buyer Award Actions */}
      <BidDetailModal
        bid={selectedBid}
        onClose={() => setSelectedBid(null)}
        onUpdateStatus={handleUpdateBidStatus}
      />

      {/* 4.4 Tender Detail Modal */}
      <TenderDetailModal
        tender={selectedTender}
        onClose={() => setSelectedTender(null)}
        onNavigateToBids={(tenderId) => {
          setSelectedTender(null);
          setSearchQuery(tenderId);
          setActiveTab('Bid');
        }}
        onOpenVerifier={(tender) => handleOpenVerifierForTender(tender)}
      />

      {/* 4.4b Create Bid/Tender Modal (Buyer) */}
      <CreateBidModal
        isOpen={isCreateBidOpen}
        onClose={() => setIsCreateBidOpen(false)}
        currentUser={currentUser}
        onTenderCreated={handleTenderCreated}
      />

      {/* 4.5 Role-Aware Authentication (Strictly Buyer or Bidder) */}
      <AuthModal
        isOpen={authModalConfig.isOpen}
        mode={authModalConfig.mode}
        initialRole={authModalConfig.role || currentRole}
        reasonMessage={authModalConfig.reasonMessage}
        onClose={handleCloseAuth}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* 4.6 GeM Assistant Help Modal */}
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

      {/* 4.7 Dedicated Government Initiatives Modal */}
      <InitiativeModal
        isOpen={!!initiativeModalKey}
        initiativeKey={initiativeModalKey}
        onClose={() => setInitiativeModalKey(null)}
        onExploreTenders={(initKey) => {
          setInitiativeModalKey(null);
          handleNavigateInitiative(initKey);
        }}
        onOpenVerifier={() => {
          setInitiativeModalKey(null);
          handleOpenVerifierForTender(null);
        }}
        onOpenAuth={(mode, role) => {
          setInitiativeModalKey(null);
          handleOpenAuth(mode, role);
        }}
        onNavigateTab={(tab) => {
          setInitiativeModalKey(null);
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* 4.8 Persistent Global Floating "Ask GeMMy (Powered by AI)" Launcher (Available Across All Pages) */}
      {!isGemmyOpen && (
        <button
          className="ask-gemmy-floating-widget"
          onClick={() => setIsGemmyOpen(true)}
          title="Chat with GeMMy AI Assistant (GFR 2017, DPIIT & Procurement Intelligence)"
          aria-label="Open Ask GeMMy AI Assistant"
        >
          <div className="gemmy-avatar-circle">
            <span className="gemmy-emoji">🤖</span>
            <span className="gemmy-pulse-ring"></span>
          </div>
          <div className="gemmy-text-group">
            <span className="gemmy-primary-text">{t('askGemmy')}</span>
            <span className="gemmy-sub-text">({t('poweredByAi')})</span>
          </div>
          <span className="gemmy-online-glow"></span>
        </button>
      )}

      {/* 4.9 Ask GeMMy AI Assistant Modal / Window */}
      <AskGemmyModal
        isOpen={isGemmyOpen}
        onClose={() => setIsGemmyOpen(false)}
        onOpenVerifier={(tender) => handleOpenVerifierForTender(tender)}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenCreateBid={() => handleOpenCreateBid()}
        onOpenCategory={(cat) => handleCategorySelect(cat)}
      />
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
