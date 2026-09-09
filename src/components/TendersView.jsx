import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { gemApi } from '../services/api';
import { Search, Plus, Filter, FileText, CheckCircle, Clock, Award, FolderMinus } from 'lucide-react';

const TendersView = ({ onSelectTender, currentUser }) => {
  const { t } = useLanguage();
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPublishForm, setShowPublishForm] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '', ministry: '', department: '', category: '', estimatedValue: '', emdAmount: '', closingDate: '', miiMinRequirement: ''
  });

  useEffect(() => {
    let isMounted = true;
    const fetchTenders = async () => {
      try {
        setLoading(true);
        const data = await gemApi.getTenders();
        if (isMounted) setTenders(data || []);
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

  const filteredTenders = useMemo(() => {
    let filtered = tenders;
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        (t.title?.toLowerCase().includes(q)) || 
        (t.id?.toLowerCase().includes(q)) || 
        (t.ministry?.toLowerCase().includes(q)) || 
        (t.category?.toLowerCase().includes(q))
      );
    }
    return filtered;
  }, [tenders, statusFilter, searchQuery]);

  const getStatusBadgeClass = (status) => {
    if (status === 'Active') return 't-card-badge green';
    if (status === 'Under Evaluation') return 't-card-badge orange';
    if (status === 'Awarded') return 't-card-badge green';
    return 't-card-badge'; // fallback
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
      // refetch
      const data = await gemApi.getTenders();
      setTenders(data || []);
      setFormData({
        title: '', ministry: '', department: '', category: '', estimatedValue: '', emdAmount: '', closingDate: '', miiMinRequirement: ''
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '1rem', color: '#ffffff' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span className="section-tag">{t('tenderTag') || 'TENDERS (GFR 149-162)'}</span>
          <h2 className="serif-heading" style={{ margin: '0.5rem 0', fontSize: '1.8rem' }}>{t('tenderTitle') || 'Tender Management Portal'}</h2>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>{t('tenderSubtitle') || 'Create, monitor, and evaluate government tenders'}</p>
        </div>
        
        {currentUser?.role === 'officer' && (
          <button 
            onClick={() => setShowPublishForm(!showPublishForm)}
            style={{ backgroundColor: '#38bdf8', color: '#0b1a2d', border: 'none', borderRadius: '6px', padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}
          >
            <Plus size={16} />
            {t('publishTender') || 'Publish New Tender'}
          </button>
        )}
      </div>

      {showPublishForm && currentUser?.role === 'officer' && (
        <div style={{ backgroundColor: '#0f2238', border: '1px solid #1e385b', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' }}>
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
              <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Clock size={13} color="#38bdf8" />
                <span>Closing Date</span>
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={formData.closingDate}
                onChange={e => setFormData({...formData, closingDate: e.target.value})}
                style={{ backgroundColor: '#081729', border: '1px solid #1e385b', color: '#fff', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer' }}
                required
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>MII Min Requirement (%)</label>
              <input type="number" value={formData.miiMinRequirement} onChange={e => setFormData({...formData, miiMinRequirement: e.target.value})} style={{ backgroundColor: '#081729', border: '1px solid #1e385b', color: '#fff', padding: '0.5rem', borderRadius: '4px' }} required />
            </div>

            {/* Terms and Conditions Checkbox */}
            <div style={{
              gridColumn: '1 / -1',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.65rem',
              padding: '0.75rem 1rem',
              backgroundColor: acceptedTerms ? 'rgba(2, 132, 199, 0.12)' : 'rgba(15, 34, 56, 0.6)',
              border: acceptedTerms ? '1px solid #0284c7' : '1px solid #1e385b',
              borderRadius: '6px',
              marginTop: '0.5rem'
            }}>
              <input
                type="checkbox"
                id="officerTermsCheck"
                required
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                style={{ marginTop: '0.2rem', width: '16px', height: '16px', cursor: 'pointer', accentColor: '#10b981' }}
              />
              <label htmlFor="officerTermsCheck" style={{ fontSize: '0.82rem', color: '#cbd5e1', cursor: 'pointer', lineHeight: '1.4' }}>
                <strong style={{ color: '#fff' }}>Terms & Conditions:</strong> I hereby certify that this tender complies with <strong>GFR 2017 Rules</strong> and <strong>DPIIT Make-in-India guidelines</strong>, and technical specifications have been approved by the competent authority.
              </label>
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button type="button" onClick={() => setShowPublishForm(false)} style={{ backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #1e385b', borderRadius: '4px', padding: '0.5rem 1rem', marginRight: '0.5rem', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" disabled={!acceptedTerms} style={{ backgroundColor: !acceptedTerms ? '#475569' : '#10b981', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.5rem 1.5rem', fontWeight: 'bold', cursor: !acceptedTerms ? 'not-allowed' : 'pointer' }}>Submit</button>
            </div>
          </form>
        </div>
      )}

      <div className="terminal-stat-cards" style={{ marginBottom: '2rem' }}>
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['ALL', 'Active', 'Under Evaluation', 'Awarded', 'Closed'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{
                backgroundColor: statusFilter === status ? '#1e385b' : 'transparent',
                color: statusFilter === status ? '#38bdf8' : '#94a3b8',
                border: `1px solid ${statusFilter === status ? '#38bdf8' : '#1e385b'}`,
                padding: '0.3rem 0.8rem',
                borderRadius: '999px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {status}
            </button>
          ))}
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            placeholder="Search tenders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              backgroundColor: '#081729',
              border: '1px solid #1e385b',
              color: '#fff',
              padding: '0.5rem 1rem 0.5rem 2.2rem',
              borderRadius: '6px',
              width: '250px',
              fontSize: '0.85rem'
            }}
          />
        </div>
      </div>

      <div style={{ backgroundColor: '#081729', border: '1px solid #1e385b', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1.2fr 2fr 1.5fr 1fr 1fr 1fr 1fr', 
          padding: '0.85rem 1.25rem', 
          backgroundColor: '#061120', 
          borderBottom: '1px solid #162c47', 
          fontSize: '0.78rem', 
          fontWeight: '700', 
          color: '#94a3b8', 
          letterSpacing: '0.04em', 
          textTransform: 'uppercase' 
        }}>
          <div>{t('tenderIdCol') || 'TENDER ID'}</div>
          <div>{t('titleCol') || 'TITLE'}</div>
          <div>{t('ministryCol') || 'MINISTRY/DEPT'}</div>
          <div>{t('categoryCol') || 'CATEGORY'}</div>
          <div>{t('valueCol') || 'VALUE'}</div>
          <div>{t('closingDateCol') || 'CLOSING DATE'}</div>
          <div>{t('statusCol') || 'STATUS'}</div>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading tenders...</div>
        ) : filteredTenders.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            <FolderMinus size={32} style={{ margin: '0 auto 0.5rem', display: 'block', opacity: 0.5 }} />
            No tenders found matching your criteria.
          </div>
        ) : (
          filteredTenders.map((tender, i) => (
            <div 
              key={tender.id || i}
              onClick={() => onSelectTender(tender)}
              style={{ 
                display: 'grid', 
                gridTemplateColumns: '1.2fr 2fr 1.5fr 1fr 1fr 1fr 1fr', 
                padding: '0.95rem 1.25rem', 
                borderBottom: '1px solid rgba(30, 56, 91, 0.4)', 
                fontSize: '0.85rem', 
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0f2238'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div className="mono-text" style={{ color: '#38bdf8' }}>{tender.id}</div>
              <div style={{ fontWeight: '500' }}>{tender.title}</div>
              <div style={{ color: '#cbd5e1' }}>{tender.ministry}<br/><span style={{fontSize: '0.75rem', color: '#64748b'}}>{tender.department}</span></div>
              <div style={{ color: '#cbd5e1' }}>{tender.category}</div>
              <div style={{ color: '#cbd5e1' }}>₹{tender.estimatedValue?.toLocaleString()}</div>
              <div style={{ color: '#cbd5e1' }}>{tender.closingDate}</div>
              <div><span className={getStatusBadgeClass(tender.status)}>{tender.status}</span></div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TendersView;
