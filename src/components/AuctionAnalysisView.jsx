import React, { useState, useEffect } from 'react';
import { Network, AlertOctagon, TrendingDown, ShieldAlert, Cpu, Eye, CheckCircle2, RefreshCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { gemApi } from '../services/api';

export default function AuctionAnalysisView({ onSelectBid }) {
  const { t } = useLanguage();
  const [selectedTender, setSelectedTender] = useState('GEM/2026/B/891244');
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchAuction() {
      setIsLoading(true);
      try {
        const data = await gemApi.getAuctionAnalysis(selectedTender);
        if (isMounted && data) {
          setAnalysisData(data);
        }
      } catch (err) {
        console.warn('Failed to fetch auction analysis:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchAuction();
    return () => { isMounted = false; };
  }, [selectedTender]);

  const defaultBids = [
    { rank: "L1", vendor: "Apex Supplies Ltd.", amount: "₹1,38,00,000", diffL1: "0.0% (Lowest)", flag: "Clean", risk: "Low" },
    { rank: "L2", vendor: "Kaveri Infotech", amount: "₹1,42,00,000", diffL1: "+2.8%", flag: "IP Overlap Suspect", risk: "Medium" },
    { rank: "L3", vendor: "Shree Ganesh Networks", amount: "₹1,44,00,000", diffL1: "+4.3%", flag: "Cartel Ring Flagged", risk: "High" },
    { rank: "L4", vendor: "Zenith Tech Systems", amount: "₹1,48,50,000", diffL1: "+7.6%", flag: "Clean", risk: "Low" }
  ];

  const bids = analysisData?.bids || defaultBids;
  const cartelAlert = analysisData?.cartelAlerts?.[0];

  return (
    <div style={{ backgroundColor: '#0b1a2d', minHeight: '80vh', padding: '2.5rem 1.5rem', color: '#ffffff' }}>
      <div className="container-custom">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <span className="section-tag" style={{ marginBottom: '0.25rem' }}>{t('auctionTag')}</span>
            <h1 className="serif-heading" style={{ fontSize: '2.2rem', color: '#ffffff', margin: 0 }}>
              {t('auctionTitle')}
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '0.25rem' }}>
              {t('auctionSubtitle')}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Select Tender:</span>
            <select
              value={selectedTender}
              onChange={(e) => setSelectedTender(e.target.value)}
              style={{
                backgroundColor: '#0f2238',
                color: '#ffffff',
                border: '1px solid #1e385b',
                borderRadius: '6px',
                padding: '0.5rem 0.85rem',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              <option value="GEM/2026/B/891244">GEM/2026/B/891244 (DRDO IT Hardware)</option>
              <option value="GEM/2026/B/890412">GEM/2026/B/890412 (Northern Railway Furniture)</option>
              <option value="GEM/2026/B/889105">GEM/2026/B/889105 (Smart City GIS Software)</option>
              <option value="GEM/2026/B/882100">GEM/2026/B/882100 (AIIMS Medical Oxygen)</option>
            </select>
          </div>
        </div>

        {/* Anomaly Banner */}
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '10px', padding: '1.25rem', marginBottom: '2rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <AlertOctagon size={24} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ color: '#f87171', fontSize: '1rem', fontWeight: '800', margin: '0 0 0.3rem 0' }}>
              {cartelAlert?.title || t('cartelBannerTitle')}
            </h4>
            <p style={{ color: '#cbd5e1', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>
              {cartelAlert?.description || 'Bidders Kaveri Infotech and Shree Ganesh Networks submitted bids within 4 minutes from identical IP subnet 192.168.4.x with identical BOQ calculation formula structures.'}
            </p>
          </div>
        </div>

        {/* 2 Column Analysis Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.75rem', marginBottom: '2rem' }}>
          {/* Left: L1-L4 Price Benchmarking Table */}
          <div style={{ backgroundColor: '#081729', border: '1px solid #1e385b', borderRadius: '10px', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#ffffff', marginBottom: '1.25rem' }}>
              {t('priceBenchmarking')} (Tender: {selectedTender})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {bids.map((b) => (
                <div
                  key={b.rank}
                  style={{
                    backgroundColor: '#0f2238',
                    border: '1px solid #1e385b',
                    borderRadius: '8px',
                    padding: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span
                      style={{
                        padding: '0.25rem 0.55rem',
                        borderRadius: '4px',
                        fontWeight: '900',
                        fontSize: '0.8rem',
                        backgroundColor: b.rank === 'L1' ? '#10b981' : '#1e385b',
                        color: '#ffffff'
                      }}
                    >
                      {b.rank}
                    </span>
                    <div>
                      <span style={{ color: '#ffffff', fontWeight: '700', display: 'block', fontSize: '0.9rem' }}>{b.vendor}</span>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Variance: {b.diffL1}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1rem', fontWeight: '800', color: '#f5a623', display: 'block', fontFamily: 'monospace' }}>
                      {b.amount}
                    </span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        color: b.risk === 'Low' ? '#34d399' : b.risk === 'Medium' ? '#fbbf24' : '#f87171'
                      }}
                    >
                      {b.flag}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Graph Relationship Inspection */}
          <div style={{ backgroundColor: '#081729', border: '1px solid #1e385b', borderRadius: '10px', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#ffffff', marginBottom: '1.25rem' }}>
              {t('collusionAnalysis')}
            </h3>

            <div style={{ backgroundColor: '#061120', border: '1px dashed #1e385b', borderRadius: '8px', padding: '1.5rem', textAlign: 'center' }}>
              <Network size={44} color="#f59e0b" style={{ margin: '0 auto 0.75rem auto' }} />
              <h4 style={{ color: '#ffffff', fontSize: '0.95rem', margin: '0 0 0.5rem 0' }}>
                3 Shared Entities Found Across 2 Bidders
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.8rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.4rem', textAlign: 'left' }}>
                <li>🔗 <strong>Common Director / DSC:</strong> Signatory linked to Capricorn CA</li>
                <li>🌐 <strong>Common IP / Gateway:</strong> 192.168.4.x / 24 Subnet</li>
                <li>📑 <strong>Identical PDF Metadata:</strong> Created with synchronized markup formulas</li>
              </ul>
            </div>

            <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => alert("Cartel Evidence Dossier generated and sent to GeM Vigilance & Competition Commission of India (CCI) integration queue.")}
                style={{
                  padding: '0.6rem 1.25rem',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '0.82rem',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Forward to CCI & Blacklist Watchlist
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
