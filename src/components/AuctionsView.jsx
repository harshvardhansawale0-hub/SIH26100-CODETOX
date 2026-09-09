import React, { useState, useEffect } from 'react';
import { 
  Gavel, 
  Clock, 
  TrendingDown, 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowDownRight, 
  ArrowUpRight, 
  Sparkles, 
  AlertTriangle, 
  Users, 
  RefreshCw,
  Building2,
  DollarSign,
  Send
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import AuctionAnalysisView from './AuctionAnalysisView';

export default function AuctionsView({ currentUser, onSelectBid }) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('reverse'); // 'reverse', 'forward', 'upcoming', 'cartel'
  const [selectedAuctionId, setSelectedAuctionId] = useState('RA-2026-9081');
  const [bidInputs, setBidInputs] = useState({});
  const [liveAuctions, setLiveAuctions] = useState([
    {
      id: 'RA-2026-9081',
      type: 'reverse',
      title: 'Procurement of 500 High-Capacity Medical Oxygen Concentrators',
      ministry: 'Ministry of Health & Family Welfare (MoHFW)',
      dept: 'AIIMS Central Procurement Division',
      basePrice: 24500000,
      currentL1: 21850000,
      currentL1Vendor: 'Apex Technologies & Supplies Ltd.',
      minDecrement: 50000,
      totalBids: 14,
      secondsLeft: 1845,
      bids: [
        { rank: 'L1', vendor: 'Apex Technologies & Supplies Ltd.', amount: 21850000, time: '2 mins ago', isMe: true },
        { rank: 'L2', vendor: 'Kaveri MedTech Solutions', amount: 21900000, time: '4 mins ago' },
        { rank: 'L3', vendor: 'Shree Ganesh Systems', amount: 22100000, time: '7 mins ago' },
        { rank: 'L4', vendor: 'National Surgicals India', amount: 22400000, time: '12 mins ago' }
      ]
    },
    {
      id: 'RA-2026-9042',
      type: 'reverse',
      title: 'Turnkey Enterprise Cloud Hosting & Disaster Recovery Tier-IV',
      ministry: 'Ministry of Electronics & IT (MeitY)',
      dept: 'National Informatics Centre (NIC)',
      basePrice: 85000000,
      currentL1: 76200000,
      currentL1Vendor: 'Vanguard Cyber Systems',
      minDecrement: 100000,
      totalBids: 22,
      secondsLeft: 940,
      bids: [
        { rank: 'L1', vendor: 'Vanguard Cyber Systems', amount: 76200000, time: '1 min ago' },
        { rank: 'L2', vendor: 'NetGrid Technologies', amount: 76350000, time: '5 mins ago' },
        { rank: 'L3', vendor: 'Param Infotech Pvt Ltd', amount: 77100000, time: '8 mins ago' }
      ]
    },
    {
      id: 'FA-2026-4401',
      type: 'forward',
      title: 'Disposal of Obsolete Telecom Tower Equipment & Non-Ferrous Alloys',
      ministry: 'Ministry of Communications',
      dept: 'Bharat Sanchar Nigam Limited (BSNL Asset Monetization)',
      basePrice: 12000000,
      currentH1: 16850000,
      currentH1Vendor: 'Shree Balaji Recycling & Metal Works',
      minIncrement: 50000,
      totalBids: 31,
      secondsLeft: 2310,
      bids: [
        { rank: 'H1', vendor: 'Shree Balaji Recycling & Metal Works', amount: 16850000, time: '1 min ago' },
        { rank: 'H2', vendor: 'Western Metal Corporates', amount: 16800000, time: '3 mins ago' },
        { rank: 'H3', vendor: 'Deccan Alloys Pvt Ltd', amount: 16700000, time: '6 mins ago' }
      ]
    },
    {
      id: 'FA-2026-4489',
      type: 'forward',
      title: 'Auction of Surplus Government Sedans & Heavy Transport Fleets',
      ministry: 'Ministry of Road Transport & Highways',
      dept: 'Central Motor Transport Agency',
      basePrice: 8000000,
      currentH1: 11400000,
      currentH1Vendor: 'Mahalaxmi Motors & Fleet Traders',
      minIncrement: 25000,
      totalBids: 19,
      secondsLeft: 3420,
      bids: [
        { rank: 'H1', vendor: 'Mahalaxmi Motors & Fleet Traders', amount: 11400000, time: '2 mins ago' },
        { rank: 'H2', vendor: 'Prime Auto Traders', amount: 11375000, time: '8 mins ago' }
      ]
    }
  ]);

  // Live timer tick
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveAuctions(prev =>
        prev.map(auc => ({
          ...auc,
          secondsLeft: Math.max(0, auc.secondsLeft - 1)
        }))
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSeconds) => {
    if (totalSeconds <= 0) return 'CONCLUDED';
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentAuction = liveAuctions.find(a => a.id === selectedAuctionId) || liveAuctions[0];

  const handlePlaceBid = (e) => {
    e.preventDefault();
    const bidVal = Number(bidInputs[currentAuction.id]);
    if (!bidVal || isNaN(bidVal)) return;

    if (currentAuction.type === 'reverse') {
      if (bidVal >= currentAuction.currentL1) {
        alert(`For Reverse Auction, your quote must be lower than the current L1 (₹${currentAuction.currentL1.toLocaleString()}) by at least ₹${currentAuction.minDecrement.toLocaleString()}`);
        return;
      }
      // Update auction state with new L1
      const newBid = {
        rank: 'L1',
        vendor: currentUser ? (currentUser.organization || currentUser.fullName) : 'Apex Technologies & Supplies Ltd.',
        amount: bidVal,
        time: 'Just Now',
        isMe: true
      };
      setLiveAuctions(prev =>
        prev.map(a =>
          a.id === currentAuction.id
            ? {
                ...a,
                currentL1: bidVal,
                currentL1Vendor: newBid.vendor,
                totalBids: a.totalBids + 1,
                bids: [newBid, ...a.bids.map((b, idx) => ({ ...b, rank: `L${idx + 2}` }))]
              }
            : a
        )
      );
    } else {
      if (bidVal <= currentAuction.currentH1) {
        alert(`For Forward Auction, your bid must exceed the current highest bid (₹${currentAuction.currentH1.toLocaleString()}) by at least ₹${currentAuction.minIncrement.toLocaleString()}`);
        return;
      }
      const newBid = {
        rank: 'H1',
        vendor: currentUser ? (currentUser.organization || currentUser.fullName) : 'Apex Technologies & Supplies Ltd.',
        amount: bidVal,
        time: 'Just Now',
        isMe: true
      };
      setLiveAuctions(prev =>
        prev.map(a =>
          a.id === currentAuction.id
            ? {
                ...a,
                currentH1: bidVal,
                currentH1Vendor: newBid.vendor,
                totalBids: a.totalBids + 1,
                bids: [newBid, ...a.bids.map((b, idx) => ({ ...b, rank: `H${idx + 2}` }))]
              }
            : a
        )
      );
    }

    setBidInputs({ ...bidInputs, [currentAuction.id]: '' });
    alert(`Success! Your live bid of ₹${bidVal.toLocaleString()} has been placed and confirmed by the GeM E-Auction Engine.`);
  };

  const filteredAuctions = liveAuctions.filter(a => {
    if (activeTab === 'reverse') return a.type === 'reverse';
    if (activeTab === 'forward') return a.type === 'forward';
    return true;
  });

  return (
    <div style={{ backgroundColor: '#071526', minHeight: '85vh', padding: '2rem 1.5rem', color: '#ffffff' }}>
      <div className="container-custom">
        {/* Top Header */}
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className="section-tag" style={{ margin: 0 }}>CENTRAL E-AUCTION PLATFORM (GEP / GFR 149)</span>
              <span style={{ fontSize: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', backgroundColor: '#10b981', borderRadius: '50%', display: 'inline-block' }}></span>
                REAL-TIME LIVE AUCTIONS ACTIVE
              </span>
            </div>
            <h1 className="serif-heading" style={{ fontSize: '2.4rem', margin: '0.2rem 0', color: '#ffffff' }}>
              Electronic Auction & Bidding Floor
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '850px', margin: 0 }}>
              Live Forward & Reverse E-Auctions for Central Government Ministries, CPSEs & Defence Bodies. Real-time dynamic decrements, auto-extension timer, and AI cartel vigilance.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div style={{ display: 'flex', gap: '0.75rem', backgroundColor: '#0b1a2d', border: '1px solid #1e385b', padding: '0.75rem 1.25rem', borderRadius: '10px' }}>
            <div style={{ textAlign: 'center', paddingRight: '1rem', borderRight: '1px solid #1e385b' }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Active Rooms</span>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#38bdf8' }}>4 Rooms</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Total Floor Vol.</span>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#10b981' }}>₹19.2 Cr</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap', borderBottom: '1px solid #1e385b', paddingBottom: '0.75rem' }}>
          {[
            { id: 'reverse', label: '📉 Reverse Auctions (Procurement)', count: liveAuctions.filter(a => a.type === 'reverse').length },
            { id: 'forward', label: '📈 Forward Auctions (Asset Disposal)', count: liveAuctions.filter(a => a.type === 'forward').length },
            { id: 'cartel', label: '🛡️ AI Anti-Cartel & Price Intelligence', isSpecial: true }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  backgroundColor: isActive ? '#0f2238' : 'transparent',
                  color: isActive ? '#38bdf8' : '#94a3b8',
                  border: `1px solid ${isActive ? '#38bdf8' : '#1e385b'}`,
                  borderRadius: '8px',
                  padding: '0.65rem 1.25rem',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? '800' : '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span style={{ fontSize: '0.75rem', backgroundColor: isActive ? '#38bdf8' : '#1e385b', color: isActive ? '#071526' : '#94a3b8', fontWeight: '900', padding: '1px 7px', borderRadius: '10px' }}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1 & 2: LIVE AUCTION ROOMS */}
        {activeTab !== 'cartel' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
            {/* Left: Active Auction Rooms List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.15rem', color: '#cbd5e1', margin: 0, fontWeight: '700' }}>
                Active E-Auction Rooms ({filteredAuctions.length})
              </h3>

              {filteredAuctions.map(auc => {
                const isSelected = auc.id === selectedAuctionId;
                const isReverse = auc.type === 'reverse';
                return (
                  <div
                    key={auc.id}
                    onClick={() => setSelectedAuctionId(auc.id)}
                    role="button"
                    tabIndex={0}
                    style={{
                      backgroundColor: isSelected ? '#0f2238' : '#0b1a2d',
                      border: `2px solid ${isSelected ? (isReverse ? '#38bdf8' : '#f59e0b') : '#1e385b'}`,
                      borderRadius: '12px',
                      padding: '1.25rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? '0 8px 24px rgba(0,0,0,0.3)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="mono-text" style={{ color: isReverse ? '#38bdf8' : '#f59e0b', fontWeight: '800', fontSize: '0.85rem' }}>
                          {auc.id}
                        </span>
                        <span style={{ 
                          fontSize: '0.68rem', 
                          backgroundColor: isReverse ? 'rgba(56, 189, 248, 0.15)' : 'rgba(245, 158, 11, 0.15)', 
                          color: isReverse ? '#38bdf8' : '#f59e0b', 
                          padding: '2px 6px', 
                          borderRadius: '4px', 
                          fontWeight: '800' 
                        }}>
                          {isReverse ? 'REVERSE (L1 WINS)' : 'FORWARD (H1 WINS)'}
                        </span>
                      </div>

                      {/* Live Timer Pill */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '3px 8px', borderRadius: '20px' }}>
                        <Clock size={13} color="#f87171" />
                        <span className="mono-text" style={{ fontSize: '0.78rem', color: '#f87171', fontWeight: '800' }}>
                          {formatTimer(auc.secondsLeft)}
                        </span>
                      </div>
                    </div>

                    <h4 style={{ fontSize: '1.02rem', color: '#ffffff', margin: '0 0 0.35rem 0', fontWeight: '700' }}>
                      {auc.title}
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '1rem' }}>
                      {auc.ministry} • {auc.dept}
                    </span>

                    {/* Price Snapshot */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', backgroundColor: '#071526', padding: '0.75rem', borderRadius: '8px', border: '1px solid #1e385b' }}>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Base / Ceiling</span>
                        <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#cbd5e1' }}>
                          ₹{(auc.basePrice / 100000).toFixed(2)}L
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: isReverse ? '#38bdf8' : '#f59e0b' }}>
                          {isReverse ? 'Current L1 Price' : 'Current H1 Price'}
                        </span>
                        <div style={{ fontSize: '1rem', fontWeight: '800', color: isReverse ? '#38bdf8' : '#f59e0b' }}>
                          ₹{((isReverse ? auc.currentL1 : auc.currentH1) / 100000).toFixed(2)}L
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Total Bids</span>
                        <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#10b981' }}>
                          {auc.totalBids} placed
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Live Interactive Bidding Floor for Selected Room */}
            <div style={{ backgroundColor: '#0b1a2d', border: '1px solid #1e385b', borderRadius: '14px', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ borderBottom: '1px solid #1e385b', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span className="mono-text" style={{ color: '#38bdf8', fontWeight: '800', fontSize: '0.9rem' }}>
                    {currentAuction.id} • BIDDING FLOOR
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#ef444420', border: '1px solid #ef4444', padding: '3px 10px', borderRadius: '20px' }}>
                    <span style={{ width: '6px', height: '6px', backgroundColor: '#ef4444', borderRadius: '50%', display: 'inline-block' }}></span>
                    <span className="mono-text" style={{ fontSize: '0.82rem', color: '#ef4444', fontWeight: '800' }}>
                      {formatTimer(currentAuction.secondsLeft)}
                    </span>
                  </div>
                </div>
                <h3 style={{ fontSize: '1.25rem', color: '#ffffff', margin: 0, fontWeight: '700' }}>
                  {currentAuction.title}
                </h3>
              </div>

              {/* Current Best Quote Box */}
              <div style={{ backgroundColor: '#061120', border: '1px solid #1e385b', borderRadius: '10px', padding: '1.25rem', textAlign: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {currentAuction.type === 'reverse' ? 'Lowest Qualified Bidder (Current L1)' : 'Highest Winning Bidder (Current H1)'}
                </span>
                <div style={{ fontSize: '2.2rem', fontWeight: '900', color: currentAuction.type === 'reverse' ? '#38bdf8' : '#f59e0b', margin: '0.25rem 0' }}>
                  ₹{(currentAuction.type === 'reverse' ? currentAuction.currentL1 : currentAuction.currentH1).toLocaleString()}
                </div>
                <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                  Leading Vendor: <strong>{currentAuction.type === 'reverse' ? currentAuction.currentL1Vendor : currentAuction.currentH1Vendor}</strong>
                </span>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
                  Minimum Step: ₹{(currentAuction.type === 'reverse' ? currentAuction.minDecrement : currentAuction.minIncrement).toLocaleString()}
                </div>
              </div>

              {/* Interactive Bid Input Form */}
              <form onSubmit={handlePlaceBid} style={{ backgroundColor: '#0f2238', border: '1px solid #1e385b', borderRadius: '10px', padding: '1.25rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: '700', display: 'block', marginBottom: '0.5rem' }}>
                  {currentAuction.type === 'reverse' ? 'Submit Lower Counter-Quote (₹)' : 'Submit Higher Counter-Bid (₹)'}
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="number"
                    placeholder={currentAuction.type === 'reverse' ? `Max allowed: ₹${(currentAuction.currentL1 - currentAuction.minDecrement).toLocaleString()}` : `Min allowed: ₹${(currentAuction.currentH1 + currentAuction.minIncrement).toLocaleString()}`}
                    value={bidInputs[currentAuction.id] || ''}
                    onChange={e => setBidInputs({ ...bidInputs, [currentAuction.id]: e.target.value })}
                    required
                    style={{ flex: 1, backgroundColor: '#071526', border: '1px solid #1e385b', borderRadius: '6px', padding: '0.65rem 0.85rem', color: '#fff', fontSize: '0.9rem', fontWeight: '700' }}
                  />
                  <button
                    type="submit"
                    style={{
                      backgroundColor: currentAuction.type === 'reverse' ? '#38bdf8' : '#f59e0b',
                      color: '#071526',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.65rem 1.25rem',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <Send size={15} />
                    <span>Place Bid</span>
                  </button>
                </div>
              </form>

              {/* Real-time Bid Log */}
              <div>
                <h4 style={{ fontSize: '0.92rem', color: '#94a3b8', margin: '0 0 0.75rem 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Recent Bid Log (Rankings)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {currentAuction.bids.map((b, idx) => (
                    <div
                      key={idx}
                      style={{
                        backgroundColor: b.isMe ? 'rgba(56, 189, 248, 0.1)' : '#071526',
                        border: `1px solid ${b.isMe ? '#38bdf8' : '#1e385b'}`,
                        borderRadius: '6px',
                        padding: '0.65rem 0.85rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: '800', 
                          backgroundColor: idx === 0 ? '#10b98125' : '#1e385b', 
                          color: idx === 0 ? '#10b981' : '#94a3b8', 
                          padding: '2px 7px', 
                          borderRadius: '4px' 
                        }}>
                          {b.rank}
                        </span>
                        <span style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: b.isMe ? '800' : '500' }}>
                          {b.vendor} {b.isMe && '(You)'}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: '800', color: idx === 0 ? '#38bdf8' : '#cbd5e1' }}>
                          ₹{b.amount.toLocaleString()}
                        </div>
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{b.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: INTEGRATED ANTI-CARTEL & PRICE INTELLIGENCE */}
        {activeTab === 'cartel' && (
          <div style={{ marginTop: '1rem' }}>
            <AuctionAnalysisView onSelectBid={onSelectBid} />
          </div>
        )}
      </div>
    </div>
  );
}
