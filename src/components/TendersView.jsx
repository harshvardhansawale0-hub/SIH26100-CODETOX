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
    <div style={{ padding: '1.5rem', color: '#ffffff', minHeight: '80vh' }}>
      {/* Top Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="section-tag">{t('tenderTag') || 'TENDERS (GFR 149-162)'}</span>
          <h2 className="serif-heading" style={{ margin: '0.4rem 0', fontSize: '1.9rem', color: '#ffffff' }}>
            {t('tenderTitle') || 'Tender Management Portal'}
          </h2>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>
            {t('tenderSubtitle') || 'Browse public procurement tenders, statutory criteria, and Make-in-India / Womaniya opportunities.'}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {onNavigateHome && (
            <button 
              onClick={onNavigateHome}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                color: '#e2e8f0',
                border: '1px solid #1e385b',
                borderRadius: '6px',
                padding: '0.65rem 1.15rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title="Return to GeM Homepage"
            >
              <Home size={15} color="#38bdf8" />
              <span>🏠 Homepage</span>
            </button>
          )}
          {(currentUser?.role === 'buyer' || currentUser?.role === 'officer') && (
            <button 
              onClick={() => setShowPublishForm(!showPublishForm)}
              style={{ backgroundColor: '#38bdf8', color: '#0b1a2d', border: 'none', borderRadius: '6px', padding: '0.65rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(56, 189, 248, 0.3)' }}
            >
              <Plus size={16} />
              {t('publishTender') || 'Publish New Tender'}
            </button>
          )}
        </div>
      </div>

      {/* Publish Tender Form (for Buyers) */}
      {showPublishForm && (
        <div style={{ backgroundColor: '#0f2238', border: '1px solid #1e385b', borderRadius: '10px', padding: '1.5rem', marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', color: '#38bdf8' }}>{t('publishTender') || 'Publish New Tender'}</h3>
          <form onSubmit={handlePublish} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Title</label>
              <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ backgroundColor: '#081729', border: '1px solid #1e385b', color: '#fff', padding: '0.5rem', borderRadius: '4px' }} required />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Ministry</label>
              <input type="text" value={formData.ministry} onChange={e => setFormData({...formData, ministry: e.target.value})} style={{ backgroundColor: '#081729', border: '1px solid #1e385b', color: '#fff', padding: '0.5rem', borderRadius: '4px' }} required />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Department</label>
              <input type="text" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} style={{ backgroundColor: '#081729', border: '1px solid #1e385b', color: '#fff', padding: '0.5rem', borderRadius: '4px' }} required />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Category</label>
              <input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ backgroundColor: '#081729', border: '1px solid #1e385b', color: '#fff', padding: '0.5rem', borderRadius: '4px' }} required />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Estimated Value (₹)</label>
              <input type="number" value={formData.estimatedValue} onChange={e => setFormData({...formData, estimatedValue: e.target.value})} style={{ backgroundColor: '#081729', border: '1px solid #1e385b', color: '#fff', padding: '0.5rem', borderRadius: '4px' }} required />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>EMD Amount (₹)</label>
              <input type="number" value={formData.emdAmount} onChange={e => setFormData({...formData, emdAmount: e.target.value})} style={{ backgroundColor: '#081729', border: '1px solid #1e385b', color: '#fff', padding: '0.5rem', borderRadius: '4px' }} required />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Closing Date</label>
              <input type="date" value={formData.closingDate} onChange={e => setFormData({...formData, closingDate: e.target.value})} style={{ backgroundColor: '#081729', border: '1px solid #1e385b', color: '#fff', padding: '0.5rem', borderRadius: '4px' }} required />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>MII Min Requirement (%)</label>
              <input type="number" value={formData.miiMinRequirement} onChange={e => setFormData({...formData, miiMinRequirement: e.target.value})} style={{ backgroundColor: '#081729', border: '1px solid #1e385b', color: '#fff', padding: '0.5rem', borderRadius: '4px' }} required />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button type="button" onClick={() => setShowPublishForm(false)} style={{ backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #1e385b', borderRadius: '4px', padding: '0.5rem 1rem', marginRight: '0.5rem', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.5rem 1.5rem', fontWeight: 'bold', cursor: 'pointer' }}>Submit</button>
            </div>
          </form>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="terminal-stat-cards" style={{ marginBottom: '1.75rem' }}>
        <div className="terminal-card">
          <div className="t-card-label"><FileText size={14} style={{marginRight:'0.4rem'}}/> Total Tenders</div>
          <div className="t-card-value-row">
            <span className="t-card-value">{stats.total}</span>
          </div>
        </div>
        <div className="terminal-card">
          <div className="t-card-label"><CheckCircle size={14} style={{marginRight:'0.4rem'}}/> Active</div>
          <div className="t-card-value-row">
            <span className="t-card-value">{stats.active}</span>
            <span className="t-card-badge green">live</span>
          </div>
        </div>
        <div className="terminal-card">
          <div className="t-card-label"><Clock size={14} style={{marginRight:'0.4rem'}}/> Under Eval</div>
          <div className="t-card-value-row">
            <span className="t-card-value">{stats.eval}</span>
            <span className="t-card-badge orange">pending</span>
          </div>
        </div>
        <div className="terminal-card">
          <div className="t-card-label"><Award size={14} style={{marginRight:'0.4rem'}}/> Awarded</div>
          <div className="t-card-value-row">
            <span className="t-card-value">{stats.awarded}</span>
          </div>
        </div>
      </div>

      {/* Special Government Initiatives Filter Bar */}
      <div style={{ backgroundColor: '#071526', border: '1px solid #1e385b', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: '800', color: '#cbd5e1' }}>
            <Sparkles size={16} color="#f59e0b" />
            <span>SPECIAL GOVERNMENT INITIATIVES & MANDATES</span>
          </div>
          {onOpenInitiativeModal && (
            <button 
              type="button" 
              onClick={() => onOpenInitiativeModal(initiativeFilter !== 'all' ? initiativeFilter : 'mii')}
              style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '0.78rem', cursor: 'pointer', textDecoration: 'underline' }}
            >
              View Initiative Policy Guidelines ↗
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: '🌐 All Opportunities', color: '#94a3b8' },
            { key: 'mii', label: '🇮🇳 Make in India (MII)', color: '#f59e0b', count: tenders.filter(t => t.isMii).length },
            { key: 'womaniya', label: '🌸 Womaniya & SHGs', color: '#ec4899', count: tenders.filter(t => t.isWomaniya).length },
            { key: 'startup', label: '🚀 Startup Runway', color: '#3b82f6', count: tenders.filter(t => t.isStartup).length },
            { key: 'mse', label: '🛡️ MSE Sambandh (25% Quota)', color: '#10b981', count: tenders.filter(t => t.isMsme).length }
          ].map(init => {
            const isActive = initiativeFilter === init.key;
            return (
              <button
                key={init.key}
                type="button"
                onClick={() => setInitiativeFilter(init.key)}
                style={{
                  backgroundColor: isActive ? `${init.color}20` : '#0b1a2d',
                  color: isActive ? init.color : '#94a3b8',
                  border: `1px solid ${isActive ? init.color : '#1e385b'}`,
                  padding: '0.45rem 0.95rem',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: isActive ? '800' : '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{init.label}</span>
                {init.count !== undefined && (
                  <span style={{ 
                    fontSize: '0.7rem', 
                    backgroundColor: isActive ? init.color : '#1e385b', 
                    color: isActive ? '#0b1a2d' : '#94a3b8',
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
          backgroundColor: 'rgba(56, 189, 248, 0.1)', 
          border: '1px solid rgba(56, 189, 248, 0.3)', 
          borderRadius: '8px', 
          padding: '0.75rem 1.25rem', 
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.85rem' }}>
            <span style={{ fontWeight: '800', color: '#38bdf8' }}>Active Filters:</span>
            {initiativeFilter !== 'all' && (
              <span style={{ backgroundColor: '#0f2238', border: '1px solid #1e385b', padding: '3px 10px', borderRadius: '6px', color: '#ffffff' }}>
                Initiative: <strong>{initiativeFilter.toUpperCase()}</strong>
              </span>
            )}
            {categoryFilter !== 'ALL' && (
              <span style={{ backgroundColor: '#0f2238', border: '1px solid #1e385b', padding: '3px 10px', borderRadius: '6px', color: '#ffffff' }}>
                Category: <strong>{categoryFilter}</strong>
              </span>
            )}
            {statusFilter !== 'ALL' && (
              <span style={{ backgroundColor: '#0f2238', border: '1px solid #1e385b', padding: '3px 10px', borderRadius: '6px', color: '#ffffff' }}>
                Status: <strong>{statusFilter}</strong>
              </span>
            )}
            {searchQuery && (
              <span style={{ backgroundColor: '#0f2238', border: '1px solid #1e385b', padding: '3px 10px', borderRadius: '6px', color: '#ffffff' }}>
                Search: "{searchQuery}"
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleClearFilters}
            style={{
              backgroundColor: 'transparent',
              color: '#f87171',
              border: '1px solid rgba(248, 113, 113, 0.4)',
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
          {['ALL', 'Active', 'Under Evaluation', 'Awarded', 'Non-Compliant'].map(status => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              style={{
                backgroundColor: statusFilter === status ? '#1e385b' : 'transparent',
                color: statusFilter === status ? '#38bdf8' : '#94a3b8',
                border: `1px solid ${statusFilter === status ? '#38bdf8' : '#1e385b'}`,
                padding: '0.35rem 0.8rem',
                borderRadius: '999px',
                fontSize: '0.78rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Right: Category Dropdown & Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Category Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Tag size={15} color="#94a3b8" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                backgroundColor: '#081729',
                border: '1px solid #1e385b',
                color: '#cbd5e1',
                padding: '0.45rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.82rem',
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
            <Search size={15} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              placeholder="Search ID, Ministry, Keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                backgroundColor: '#081729',
                border: '1px solid #1e385b',
                color: '#fff',
                padding: '0.45rem 1rem 0.45rem 2.2rem',
                borderRadius: '6px',
                width: '240px',
                fontSize: '0.82rem'
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Tenders Table */}
      <div style={{ backgroundColor: '#081729', border: '1px solid #1e385b', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.25)' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1.2fr 2fr 1.5fr 1.1fr 1fr 1fr 1fr', 
          padding: '0.85rem 1.25rem', 
          backgroundColor: '#061120', 
          borderBottom: '1px solid #162c47', 
          fontSize: '0.76rem', 
          fontWeight: '700', 
          color: '#94a3b8', 
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
          <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: '#94a3b8' }}>
            <FolderMinus size={36} style={{ margin: '0 auto 0.75rem', display: 'block', opacity: 0.5, color: '#38bdf8' }} />
            <h4 style={{ color: '#ffffff', marginBottom: '0.5rem' }}>No tenders match the selected filters</h4>
            <p style={{ fontSize: '0.88rem', color: '#64748b', maxWidth: '400px', margin: '0 auto 1.25rem' }}>
              Try switching initiative tabs or clearing active search keywords.
            </p>
            <button
              type="button"
              onClick={handleClearFilters}
              style={{ backgroundColor: '#1e385b', color: '#38bdf8', border: 'none', borderRadius: '6px', padding: '0.5rem 1rem', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer' }}
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
                borderBottom: '1px solid rgba(30, 56, 91, 0.4)', 
                fontSize: '0.85rem', 
                cursor: 'pointer',
                alignItems: 'center',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0f2238'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div className="mono-text" style={{ color: '#38bdf8', fontWeight: '700' }}>{tender.id}</div>
              <div>
                <div style={{ fontWeight: '600', color: '#ffffff', marginBottom: '3px' }}>{tender.title}</div>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {tender.isMii && (
                    <span style={{ fontSize: '0.65rem', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '1px 5px', borderRadius: '4px', fontWeight: '800' }}>
                      🇮🇳 MII ({tender.miiMinRequirement || '50%'})
                    </span>
                  )}
                  {tender.isWomaniya && (
                    <span style={{ fontSize: '0.65rem', backgroundColor: 'rgba(236, 72, 153, 0.15)', color: '#ec4899', border: '1px solid rgba(236, 72, 153, 0.3)', padding: '1px 5px', borderRadius: '4px', fontWeight: '800' }}>
                      🌸 Womaniya / SHG
                    </span>
                  )}
                  {tender.isStartup && (
                    <span style={{ fontSize: '0.65rem', backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '1px 5px', borderRadius: '4px', fontWeight: '800' }}>
                      🚀 Startup Runway
                    </span>
                  )}
                  {tender.isMsme && (
                    <span style={{ fontSize: '0.65rem', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1px 5px', borderRadius: '4px', fontWeight: '800' }}>
                      🛡️ MSE Exempted
                    </span>
                  )}
                </div>
              </div>
              <div style={{ color: '#cbd5e1' }}>
                <div>{tender.ministry}</div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{tender.department}</span>
              </div>
              <div style={{ color: '#cbd5e1' }}>
                <span style={{ backgroundColor: '#061120', padding: '2px 7px', borderRadius: '4px', border: '1px solid #1e385b', fontSize: '0.78rem' }}>
                  {tender.category}
                </span>
              </div>
              <div style={{ color: '#38bdf8', fontWeight: '700' }}>{tender.estimatedValue}</div>
              <div style={{ color: '#94a3b8' }}>{tender.closingDate}</div>
              <div><span className={getStatusBadgeClass(tender.status)}>{tender.status}</span></div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TendersView;
