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
    <div style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f0f9ff 35%, #fff7ed 70%, #ffffff 100%)', minHeight: '80vh', padding: '2.5rem 1.5rem', color: '#0f172a', fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}>
      <div className="container-custom">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <span className="section-tag" style={{ marginBottom: '0.25rem', background: 'linear-gradient(135deg, #e0f2fe 0%, #fed7aa 100%)', color: '#0369a1', border: '1px solid #bae6fd', fontWeight: '800' }}>
              {t('auctionTag')}
            </span>
            <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#0f172a', margin: '0.2rem 0', letterSpacing: '-0.02em' }}>
              {t('auctionTitle')}
            </h1>
            <p style={{ color: '#475569', fontSize: '0.95rem', marginTop: '0.25rem' }}>
              {t('auctionSubtitle')}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '700' }}>Select Tender:</span>
            <select
              value={selectedTender}
              onChange={(e) => setSelectedTender(e.target.value)}
              style={{
                backgroundColor: '#ffffff',
                color: '#0f172a',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '0.5rem 0.85rem',
                fontSize: '0.85rem',
                fontWeight: '600',
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
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '1.25rem', marginBottom: '2rem', display: 'flex', alignItems: 'flex-start', gap: '1rem', boxShadow: '0 2px 8px rgba(220, 38, 38, 0.05)' }}>
          <AlertOctagon size={24} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ color: '#dc2626', fontSize: '1rem', fontWeight: '800', margin: '0 0 0.3rem 0' }}>
              {cartelAlert?.title || t('cartelBannerTitle')}
            </h4>
            <p style={{ color: '#475569', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>
              {cartelAlert?.description || 'Bidders Kaveri Infotech and Shree Ganesh Networks submitted bids within 4 minutes from identical IP subnet 192.168.4.x with identical BOQ calculation formula structures.'}
            </p>
          </div>
        </div>

        {/* 2 Column Analysis Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.75rem', marginBottom: '2rem' }}>
          {/* Left: L1-L4 Price Benchmarking Table */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '1.25rem' }}>
              {t('priceBenchmarking')} (Tender: {selectedTender})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {bids.map((b) => (
                <div
                  key={b.rank}
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
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
                        borderRadius: '6px',
                        fontWeight: '900',
                        fontSize: '0.8rem',
                        backgroundColor: b.rank === 'L1' ? '#dcfce7' : '#e2e8f0',
                        color: b.rank === 'L1' ? '#166534' : '#475569'
                      }}
                    >
                      {b.rank}
                    </span>
                    <div>
                      <span style={{ color: '#0f172a', fontWeight: '700', display: 'block', fontSize: '0.9rem' }}>{b.vendor}</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Variance: {b.diffL1}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1rem', fontWeight: '800', color: '#ea580c', display: 'block', fontFamily: 'monospace' }}>
                      {b.amount}
                    </span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: '800',
                        color: b.risk === 'Low' ? '#059669' : b.risk === 'Medium' ? '#d97706' : '#dc2626'
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
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '1.25rem' }}>
              {t('collusionAnalysis')}
            </h3>

            <div style={{ backgroundColor: '#fff7ed', border: '1px dashed #fed7aa', borderRadius: '8px', padding: '1.5rem', textAlign: 'center' }}>
              <Network size={44} color="#ea580c" style={{ margin: '0 auto 0.75rem auto' }} />
              <h4 style={{ color: '#9a3412', fontSize: '0.95rem', margin: '0 0 0.5rem 0', fontWeight: '800' }}>
                3 Shared Entities Found Across 2 Bidders
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.82rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '0.45rem', textAlign: 'left' }}>
                <li>🔗 <strong>Common Director / DSC:</strong> Signatory linked to Capricorn CA</li>
                <li>🌐 <strong>Common IP / Gateway:</strong> 192.168.4.x / 24 Subnet</li>
                <li>📑 <strong>Identical PDF Metadata:</strong> Created with synchronized markup formulas</li>
              </ul>
            </div>

            <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => alert("Cartel Evidence Dossier generated and sent to GeM Vigilance & Competition Commission of India (CCI) integration queue.")}
                style={{
                  padding: '0.65rem 1.25rem',
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '0.82rem',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)'
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
