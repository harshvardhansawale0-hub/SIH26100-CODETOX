import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { gemApi } from '../services/api';
import { initialTenders } from '../data/bidsData';
import { 
  Search, 
  Plus, 
  Filter, 
  FileText, 
  CheckCircle, 
  Clock, 
  Award, 
  FolderMinus, 
  X, 
  HeartHandshake, 
  Rocket, 
  ShieldCheck, 
  Sparkles,
  Tag,
  Home
} from 'lucide-react';

const TendersView = ({ 
  tenders: propTenders, 
  onSelectTender, 
  currentUser,
  initialInitiative = 'all',
  initialCategory = 'ALL',
  initialSearch = '',
  onOpenInitiativeModal,
  onNavigateHome
}) => {
  const { t } = useLanguage();
  const [tenders, setTenders] = useState(propTenders && propTenders.length > 0 ? propTenders : initialTenders);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [initiativeFilter, setInitiativeFilter] = useState(initialInitiative || 'all');
  const [categoryFilter, setCategoryFilter] = useState(initialCategory || 'ALL');
  const [searchQuery, setSearchQuery] = useState(initialSearch || '');
  const [showPublishForm, setShowPublishForm] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '', ministry: '', department: '', category: '', estimatedValue: '', emdAmount: '', closingDate: '', miiMinRequirement: ''
  });

  // Sync external filters from props when navigation happens
  useEffect(() => {
    if (initialInitiative) setInitiativeFilter(initialInitiative);
  }, [initialInitiative]);

  useEffect(() => {
    if (initialCategory) setCategoryFilter(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    if (initialSearch !== undefined) setSearchQuery(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    if (propTenders && propTenders.length > 0) {
      setTenders(propTenders);
    }
  }, [propTenders]);

  // Fetch live tenders from backend if available, fallback to initialTenders
  useEffect(() => {
    let isMounted = true;
    const fetchTenders = async () => {
      try {
        setLoading(true);
        const data = await gemApi.getTenders();
        if (isMounted && data && data.length > 0) {
          setTenders(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchTenders();
    return () => { isMounted = false; };
  }, []);

  // Compute KPI cards
  const stats = useMemo(() => {
    return {
      total: tenders.length,
      active: tenders.filter(t => t.status === 'Active').length,
      eval: tenders.filter(t => t.status === 'Under Evaluation').length,
      awarded: tenders.filter(t => t.status === 'Awarded').length,
    };
  }, [tenders]);

  const categories = useMemo(() => {
    const set = new Set();
    tenders.forEach(t => {
      if (t.category) set.add(t.category);
    });
    return ['ALL', ...Array.from(set)];
  }, [tenders]);

  const filteredTenders = useMemo(() => {
    let filtered = tenders;

    // 1. Status Filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    // 2. Initiative Filter
    if (initiativeFilter && initiativeFilter !== 'all') {
      if (initiativeFilter === 'mii') {
        filtered = filtered.filter(t => 
          t.isMii || 
          (t.miiMinRequirement && t.miiMinRequirement.includes('Class')) || 
          t.initiativeTag?.toLowerCase().includes('make in india') ||
          t.title?.toLowerCase().includes('make in india')
        );
      } else if (initiativeFilter === 'womaniya') {
        filtered = filtered.filter(t => 
          t.isWomaniya || 
          t.category === 'SARAS Handicrafts' || 
          t.title?.toLowerCase().includes('women') || 
          t.title?.toLowerCase().includes('saras') || 
          t.department?.toLowerCase().includes('women') ||
          t.initiativeTag?.toLowerCase().includes('womaniya')
        );
      } else if (initiativeFilter === 'startup') {
        filtered = filtered.filter(t => 
          t.isStartup || 
          t.initiativeTag?.toLowerCase().includes('startup') || 
          t.category === 'Software' || 
          t.title?.toLowerCase().includes('ai') || 
          t.title?.toLowerCase().includes('iot')
        );
      } else if (initiativeFilter === 'mse') {
        filtered = filtered.filter(t => 
          t.isMsme || 
          t.initiativeTag?.toLowerCase().includes('mse') || 
          t.emdAmount?.toLowerCase().includes('mse') || 
          t.emdAmount?.toLowerCase().includes('exempted')
        );
      }
    }

    // 3. Category Filter
    if (categoryFilter && categoryFilter !== 'ALL') {
      const catLow = categoryFilter.toLowerCase();
      filtered = filtered.filter(t => 
        (t.category && t.category.toLowerCase().includes(catLow)) ||
        (catLow.includes(t.category?.toLowerCase()))
      );
    }

    // 4. Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        (t.title?.toLowerCase().includes(q)) || 
        (t.id?.toLowerCase().includes(q)) || 
        (t.ministry?.toLowerCase().includes(q)) || 
        (t.department?.toLowerCase().includes(q)) ||
        (t.category?.toLowerCase().includes(q)) ||
        (t.initiativeTag?.toLowerCase().includes(q))
      );
    }

    return filtered;
  }, [tenders, statusFilter, initiativeFilter, categoryFilter, searchQuery]);

  const getStatusBadgeClass = (status) => {
    if (status === 'Active') return 't-card-badge green';
    if (status === 'Under Evaluation') return 't-card-badge orange';
    if (status === 'Awarded') return 't-card-badge green';
    return 't-card-badge';
  };

  const handleClearFilters = () => {
    setInitiativeFilter('all');
    setCategoryFilter('ALL');
    setStatusFilter('ALL');
    setSearchQuery('');
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    try {
      await gemApi.publishTender({
        ...formData,
        estimatedValue: Number(formData.estimatedValue),
        emdAmount: Number(formData.emdAmount),
        miiMinRequirement: Number(formData.miiMinRequirement)
      });
      setShowPublishForm(false);
      const data = await gemApi.getTenders();
      setTenders(data || initialTenders);
      setFormData({
        title: '', ministry: '', department: '', category: '', estimatedValue: '', emdAmount: '', closingDate: '', miiMinRequirement: ''
      });
    } catch (err) {
      console.error(err);
    }
  };

  const isFilteringActive = initiativeFilter !== 'all' || categoryFilter !== 'ALL' || statusFilter !== 'ALL' || searchQuery !== '';

  return (
    <div style={{ padding: '1.75rem', minHeight: '88vh', background: 'linear-gradient(135deg, #f8fafc 0%, #f0f9ff 35%, #fff7ed 70%, #ffffff 100%)', fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}>
      {/* Top Header */}
      <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="section-tag" style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #fed7aa 100%)', color: '#0369a1', border: '1px solid #bae6fd', fontWeight: '800' }}>
            {t('tenderTag') || 'TENDERS (GFR 149-162)'}
          </span>
          <h2 style={{ margin: '0.4rem 0', fontSize: '2rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>
            {t('tenderTitle') || 'Tender Management Portal'}
          </h2>
          <p style={{ color: '#475569', margin: 0, fontSize: '0.92rem', lineHeight: '1.5' }}>
            {t('tenderSubtitle') || 'Browse public procurement tenders, statutory criteria, and Make-in-India / Womaniya opportunities.'}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {onNavigateHome && (
            <button 
              onClick={onNavigateHome}
              style={{
                backgroundColor: '#ffffff',
                color: '#0f172a',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '0.65rem 1.15rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                transition: 'all 0.2s ease'
              }}
              title="Return to GeM Homepage"
            >
              <Home size={16} color="#0284c7" />
              <span>🏠 Homepage</span>
            </button>
          )}
          {(currentUser?.role === 'buyer' || currentUser?.role === 'officer') && (
            <button 
              onClick={() => setShowPublishForm(!showPublishForm)}
              style={{ 
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', 
                color: '#ffffff', 
                border: 'none', 
                borderRadius: '8px', 
                padding: '0.65rem 1.25rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                fontWeight: '700', 
                cursor: 'pointer', 
                boxShadow: '0 3px 10px rgba(2, 132, 199, 0.25)',
                transition: 'all 0.2s ease'
              }}
            >
              <Plus size={16} />
              {t('publishTender') || 'Publish New Tender'}
            </button>
          )}
        </div>
      </div>

      {/* Publish Tender Form (for Buyers) */}
      {showPublishForm && (
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #fed7aa', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 4px 16px rgba(249, 115, 22, 0.08)' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.15rem', fontWeight: '800', color: '#ea580c' }}>
            {t('publishTender') || 'Publish New Tender'}
          </h3>
          <form onSubmit={handlePublish} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155' }}>Title</label>
              <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', padding: '0.55rem', borderRadius: '6px', fontSize: '0.88rem' }} required />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155' }}>Ministry</label>
              <input type="text" value={formData.ministry} onChange={e => setFormData({...formData, ministry: e.target.value})} style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', padding: '0.55rem', borderRadius: '6px', fontSize: '0.88rem' }} required />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155' }}>Department</label>
              <input type="text" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', padding: '0.55rem', borderRadius: '6px', fontSize: '0.88rem' }} required />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155' }}>Category</label>
              <input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', padding: '0.55rem', borderRadius: '6px', fontSize: '0.88rem' }} required />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155' }}>Estimated Value (₹)</label>
              <input type="number" value={formData.estimatedValue} onChange={e => setFormData({...formData, estimatedValue: e.target.value})} style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', padding: '0.55rem', borderRadius: '6px', fontSize: '0.88rem' }} required />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155' }}>EMD Amount (₹)</label>
              <input type="number" value={formData.emdAmount} onChange={e => setFormData({...formData, emdAmount: e.target.value})} style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', padding: '0.55rem', borderRadius: '6px', fontSize: '0.88rem' }} required />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155' }}>Closing Date</label>
              <input type="date" value={formData.closingDate} onChange={e => setFormData({...formData, closingDate: e.target.value})} style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', padding: '0.55rem', borderRadius: '6px', fontSize: '0.88rem' }} required />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155' }}>MII Min Requirement (%)</label>
              <input type="number" value={formData.miiMinRequirement} onChange={e => setFormData({...formData, miiMinRequirement: e.target.value})} style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', padding: '0.55rem', borderRadius: '6px', fontSize: '0.88rem' }} required />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button type="button" onClick={() => setShowPublishForm(false)} style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.5rem 1.25rem', marginRight: '0.5rem', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.5rem 1.5rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)' }}>Submit</button>
            </div>
          </form>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="terminal-stat-cards" style={{ marginBottom: '1.75rem' }}>
        <div className="terminal-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div className="t-card-label" style={{ color: '#475569' }}><FileText size={14} style={{marginRight:'0.4rem', color: '#0284c7'}}/> Total Tenders</div>
          <div className="t-card-value-row">
            <span className="t-card-value" style={{ color: '#0f172a' }}>{stats.total}</span>
          </div>
        </div>
        <div className="terminal-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div className="t-card-label" style={{ color: '#475569' }}><CheckCircle size={14} style={{marginRight:'0.4rem', color: '#10b981'}}/> Active</div>
          <div className="t-card-value-row">
            <span className="t-card-value" style={{ color: '#0f172a' }}>{stats.active}</span>
            <span className="t-card-badge green">live</span>
          </div>
        </div>
        <div className="terminal-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div className="t-card-label" style={{ color: '#475569' }}><Clock size={14} style={{marginRight:'0.4rem', color: '#f59e0b'}}/> Under Eval</div>
          <div className="t-card-value-row">
            <span className="t-card-value" style={{ color: '#0f172a' }}>{stats.eval}</span>
            <span className="t-card-badge orange">pending</span>
          </div>
        </div>
        <div className="terminal-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div className="t-card-label" style={{ color: '#475569' }}><Award size={14} style={{marginRight:'0.4rem', color: '#059669'}}/> Awarded</div>
          <div className="t-card-value-row">
            <span className="t-card-value" style={{ color: '#0f172a' }}>{stats.awarded}</span>
          </div>
        </div>
      </div>

      {/* Special Government Initiatives Filter Bar */}
      <div style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 50%, #fff7ed 100%)', border: '1px solid #fed7aa', borderRadius: '12px', padding: '1.15rem 1.35rem', marginBottom: '1.5rem', boxShadow: '0 2px 10px rgba(249, 115, 22, 0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: '800', color: '#0f172a' }}>
            <Sparkles size={16} color="#ea580c" />
            <span>SPECIAL GOVERNMENT INITIATIVES & MANDATES</span>
          </div>
          {onOpenInitiativeModal && (
            <button 
              type="button" 
              onClick={() => onOpenInitiativeModal(initiativeFilter !== 'all' ? initiativeFilter : 'mii')}
              style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
            >
              View Initiative Policy Guidelines ↗
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: '🌐 All Opportunities', color: '#0284c7' },
            { key: 'mii', label: '🇮🇳 Make in India (MII)', color: '#ea580c', count: tenders.filter(t => t.isMii).length },
            { key: 'womaniya', label: '🌸 Womaniya & SHGs', color: '#db2777', count: tenders.filter(t => t.isWomaniya).length },
            { key: 'startup', label: '🚀 Startup Runway', color: '#2563eb', count: tenders.filter(t => t.isStartup).length },
            { key: 'mse', label: '🛡️ MSE Sambandh (25% Quota)', color: '#059669', count: tenders.filter(t => t.isMsme).length }
          ].map(init => {
            const isActive = initiativeFilter === init.key;
            return (
              <button
                key={init.key}
                type="button"
                onClick={() => setInitiativeFilter(init.key)}
                style={{
                  backgroundColor: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
                  color: isActive ? init.color : '#475569',
                  border: isActive ? `2px solid ${init.color}` : '1px solid #cbd5e1',
                  padding: '0.45rem 0.95rem',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: isActive ? '800' : '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{init.label}</span>
                {init.count !== undefined && (
                  <span style={{ 
                    fontSize: '0.7rem', 
                    backgroundColor: isActive ? init.color : '#e2e8f0', 
                    color: isActive ? '#ffffff' : '#475569',
                    fontWeight: '900',
                    padding: '1px 6px',
                    borderRadius: '10px'
                  }}>
                    {init.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Filter Banner (if filtered by Initiative or Category) */}
      {isFilteringActive && (
        <div style={{ 
          backgroundColor: '#f0f9ff', 
          border: '1px solid #bae6fd', 
          borderRadius: '10px', 
          padding: '0.75rem 1.25rem', 
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.82rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: '800', color: '#0284c7' }}>Active Filters:</span>
            {initiativeFilter !== 'all' && (
              <span style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', padding: '3px 10px', borderRadius: '6px', color: '#0f172a', fontWeight: '600' }}>
                Initiative: <strong>{initiativeFilter.toUpperCase()}</strong>
              </span>
            )}
            {categoryFilter !== 'ALL' && (
              <span style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', padding: '3px 10px', borderRadius: '6px', color: '#0f172a', fontWeight: '600' }}>
                Category: <strong>{categoryFilter}</strong>
              </span>
            )}
            {statusFilter !== 'ALL' && (
              <span style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', padding: '3px 10px', borderRadius: '6px', color: '#0f172a', fontWeight: '600' }}>
                Status: <strong>{statusFilter}</strong>
              </span>
            )}
            {searchQuery && (
              <span style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', padding: '3px 10px', borderRadius: '6px', color: '#0f172a', fontWeight: '600' }}>
                Search: "{searchQuery}"
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleClearFilters}
            style={{
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              border: '1px solid #fca5a5',
              borderRadius: '6px',
              padding: '0.35rem 0.75rem',
              fontSize: '0.78rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <X size={14} />
            <span>Clear All Filters</span>
          </button>
        </div>
      )}

      {/* Secondary Controls: Status, Category Dropdown & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        {/* Status Pills */}
        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
          {['ALL', 'Active', 'Under Evaluation', 'Awarded', 'Non-Compliant'].map(status => {
            const isSel = statusFilter === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                style={{
                  background: isSel ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : '#ffffff',
                  color: isSel ? '#ffffff' : '#475569',
                  border: `1px solid ${isSel ? '#0284c7' : '#cbd5e1'}`,
                  padding: '0.35rem 0.85rem',
                  borderRadius: '999px',
                  fontSize: '0.78rem',
                  fontWeight: isSel ? '700' : '600',
                  cursor: 'pointer',
                  boxShadow: isSel ? '0 2px 6px rgba(2, 132, 199, 0.2)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                {status}
              </button>
            );
          })}
        </div>

        {/* Right: Category Dropdown & Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Category Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Tag size={15} color="#64748b" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                padding: '0.45rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <option value="ALL">All Product Categories</option>
              {categories.filter(c => c !== 'ALL').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search ID, Ministry, Keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                padding: '0.45rem 1rem 0.45rem 2.2rem',
                borderRadius: '6px',
                width: '240px',
                fontSize: '0.82rem',
                outline: 'none'
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Tenders Table */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1.2fr 2fr 1.5fr 1.1fr 1fr 1fr 1fr', 
          padding: '0.85rem 1.25rem', 
          backgroundColor: '#f8fafc', 
          borderBottom: '1px solid #e2e8f0', 
          fontSize: '0.76rem', 
          fontWeight: '700', 
          color: '#475569', 
          letterSpacing: '0.04em', 
          textTransform: 'uppercase' 
        }}>
          <div>{t('tenderIdCol') || 'TENDER ID'}</div>
          <div>{t('titleCol') || 'TITLE & INITIATIVE'}</div>
          <div>{t('ministryCol') || 'MINISTRY/DEPT'}</div>
          <div>{t('categoryCol') || 'CATEGORY'}</div>
          <div>{t('valueCol') || 'VALUE'}</div>
          <div>{t('closingDateCol') || 'CLOSING DATE'}</div>
          <div>{t('statusCol') || 'STATUS'}</div>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading tenders...</div>
        ) : filteredTenders.length === 0 ? (
          <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: '#64748b' }}>
            <FolderMinus size={36} style={{ margin: '0 auto 0.75rem', display: 'block', opacity: 0.5, color: '#0284c7' }} />
            <h4 style={{ color: '#0f172a', marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: '700' }}>No tenders match the selected filters</h4>
            <p style={{ fontSize: '0.88rem', color: '#64748b', maxWidth: '400px', margin: '0 auto 1.25rem' }}>
              Try switching initiative tabs or clearing active search keywords.
            </p>
            <button
              type="button"
              onClick={handleClearFilters}
              style={{ backgroundColor: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '0.5rem 1.15rem', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 2px 6px rgba(2, 132, 199, 0.2)' }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredTenders.map((tender, i) => (
            <div 
              key={tender.id || i}
              onClick={() => onSelectTender && onSelectTender(tender)}
              style={{ 
                display: 'grid', 
                gridTemplateColumns: '1.2fr 2fr 1.5fr 1.1fr 1fr 1fr 1fr', 
                padding: '0.95rem 1.25rem', 
                borderBottom: '1px solid #f1f5f9', 
                fontSize: '0.85rem', 
                cursor: 'pointer',
                alignItems: 'center',
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
            >
              <div className="mono-text" style={{ color: '#0284c7', fontWeight: '700' }}>{tender.id}</div>
              <div>
                <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '3px' }}>{tender.title}</div>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {tender.isMii && (
                    <span style={{ fontSize: '0.65rem', backgroundColor: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa', padding: '1px 5px', borderRadius: '4px', fontWeight: '800' }}>
                      🇮🇳 MII ({tender.miiMinRequirement || '50%'})
                    </span>
                  )}
                  {tender.isWomaniya && (
                    <span style={{ fontSize: '0.65rem', backgroundColor: '#fdf2f8', color: '#db2777', border: '1px solid #fbcfe8', padding: '1px 5px', borderRadius: '4px', fontWeight: '800' }}>
                      🌸 Womaniya / SHG
                    </span>
                  )}
                  {tender.isStartup && (
                    <span style={{ fontSize: '0.65rem', backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '1px 5px', borderRadius: '4px', fontWeight: '800' }}>
                      🚀 Startup Runway
                    </span>
                  )}
                  {tender.isMsme && (
                    <span style={{ fontSize: '0.65rem', backgroundColor: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '1px 5px', borderRadius: '4px', fontWeight: '800' }}>
                      🛡️ MSE Exempted
                    </span>
                  )}
                </div>
              </div>
              <div>
                <div style={{ color: '#334155', fontWeight: '600' }}>{tender.ministry}</div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{tender.department}</span>
              </div>
              <div>
                <span style={{ backgroundColor: '#f1f5f9', color: '#334155', padding: '3px 8px', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '0.78rem', fontWeight: '600' }}>
                  {tender.category}
                </span>
              </div>
              <div style={{ color: '#ea580c', fontWeight: '800' }}>{tender.estimatedValue}</div>
              <div style={{ color: '#475569', fontSize: '0.82rem' }}>{tender.closingDate}</div>
              <div><span className={getStatusBadgeClass(tender.status)}>{tender.status}</span></div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TendersView;
