import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MonthNav, { MONTH_LABELS } from '@/components/MonthNav';
import {
  CATEGORIES_DATA, TRANSACTIONS_DATA, Transaction,
  formatRp, groupByDate, getCategoryById, parseDateInfo,
} from '@/utils/designData';

export default function TransactionsPage() {
  const navigate = useNavigate();
  const [search,      setSearch]      = useState('');
  const [month,       setMonth]       = useState('2026-04');
  const [filterCat,   setFilterCat]   = useState('');
  const [filterSub,   setFilterSub]   = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const currentMonth = TRANSACTIONS_DATA.filter(tx => tx.date.startsWith(month));

  const filtered = currentMonth.filter(tx => {
    const cat = getCategoryById(tx.categoryId);
    const q = search.toLowerCase();
    const matchSearch = !q
      || tx.desc.toLowerCase().includes(q)
      || (cat?.name || '').toLowerCase().includes(q)
      || tx.sub.toLowerCase().includes(q);
    const matchCat = !filterCat || cat?.name === filterCat;
    const matchSub = !filterSub || tx.sub === filterSub;
    return matchSearch && matchCat && matchSub;
  });

  const inflow  = filtered.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const outflow = filtered.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0);
  const net     = inflow + outflow;
  const groups  = groupByDate(filtered);

  const catOptions = [...new Set(
    currentMonth.map(tx => getCategoryById(tx.categoryId)?.name).filter(Boolean)
  )] as string[];

  const subOptions = filterCat
    ? [...new Set(
        currentMonth
          .filter(tx => getCategoryById(tx.categoryId)?.name === filterCat)
          .map(tx => tx.sub).filter(Boolean)
      )]
    : [];

  const hasFilter = !!filterCat || !!filterSub;
  const activeFilterCount = (filterCat ? 1 : 0) + (filterSub ? 1 : 0);
  const clearFilters = () => { setFilterCat(''); setFilterSub(''); };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#F5F5F2', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ padding: '28px 32px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111', margin: 0, letterSpacing: '-0.02em' }}>Transactions</h1>
          <p style={{ fontSize: 13, color: '#999', margin: '3px 0 0' }}>{MONTH_LABELS[month]}</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <MonthNav month={month} setMonth={setMonth} />

          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', border: '1px solid #E5E5E0', borderRadius: 8, padding: '9px 14px', width: 210 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="#bbb" strokeWidth="1.4"/>
              <path d="M9.5 9.5l2.5 2.5" stroke="#bbb" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
              style={{ border: 'none', outline: 'none', fontSize: 13, color: '#333', background: 'transparent', width: '100%' }}/>
            {search && <span onClick={() => setSearch('')} style={{ cursor: 'pointer', color: '#bbb', fontSize: 14 }}>✕</span>}
          </div>

          {/* Filter */}
          <button
            onClick={() => setShowFilters(f => !f)}
            style={{
              padding: '9px 14px', borderRadius: 8, cursor: 'pointer',
              border: hasFilter ? 'none' : '1px solid #E5E5E0',
              background: hasFilter ? '#111' : 'white',
              color: hasFilter ? '#D1FF19' : '#555',
              fontSize: 13, fontWeight: hasFilter ? 700 : 400,
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 3h12M3 7h8M5 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Filter
            {activeFilterCount > 0 && (
              <span style={{ background: '#D1FF19', color: '#111', borderRadius: '50%', width: 16, height: 16, fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Export */}
          <button style={{ padding: '9px 14px', borderRadius: 8, border: '1px solid #E5E5E0', background: 'white', color: '#555', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 1v8M3 6l3.5 3.5L10 6" stroke="#888" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1 11h11" stroke="#888" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* Filter bar */}
      {showFilters && (
        <div style={{ padding: '12px 32px 0', flexShrink: 0 }}>
          <div style={{ background: 'white', border: '1px solid #EEEEE8', borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#aaa', letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>FILTER BY</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: '#bbb', letterSpacing: '0.06em' }}>CATEGORY</span>
              <select value={filterCat} onChange={e => { setFilterCat(e.target.value); setFilterSub(''); }}
                style={{ padding: '8px 12px', borderRadius: 8, border: `1.5px solid ${filterCat ? '#D1FF19' : '#E5E5E0'}`, fontSize: 13, color: filterCat ? '#111' : '#aaa', outline: 'none', background: 'white', cursor: 'pointer' }}>
                <option value="">All categories</option>
                {catOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: '#bbb', letterSpacing: '0.06em' }}>SUB-CATEGORY</span>
              <select value={filterSub} onChange={e => setFilterSub(e.target.value)} disabled={!filterCat}
                style={{ padding: '8px 12px', borderRadius: 8, border: `1.5px solid ${filterSub ? '#D1FF19' : '#E5E5E0'}`, fontSize: 13, color: filterSub ? '#111' : '#aaa', outline: 'none', background: filterCat ? 'white' : '#F8F8F8', cursor: filterCat ? 'pointer' : 'not-allowed', opacity: filterCat ? 1 : 0.5 }}>
                <option value="">All sub-categories</option>
                {subOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flex: 2 }}>
              {filterCat && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 20, background: '#111', color: '#D1FF19', fontSize: 12, fontWeight: 600 }}>
                  {filterCat}
                  <span onClick={() => { setFilterCat(''); setFilterSub(''); }} style={{ cursor: 'pointer', opacity: 0.7 }}>✕</span>
                </div>
              )}
              {filterSub && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 20, background: '#F0F0E8', color: '#555', fontSize: 12 }}>
                  {filterSub}
                  <span onClick={() => setFilterSub('')} style={{ cursor: 'pointer', opacity: 0.7 }}>✕</span>
                </div>
              )}
              {hasFilter && (
                <button onClick={clearFilters} style={{ padding: '5px 12px', borderRadius: 20, border: '1px solid #E5E5E0', background: 'white', color: '#888', fontSize: 12, cursor: 'pointer' }}>
                  Clear all
                </button>
              )}
            </div>
            <span style={{ fontSize: 12, color: '#bbb', whiteSpace: 'nowrap', flexShrink: 0 }}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      )}

      {/* Summary bar */}
      <div style={{ padding: '14px 32px 0', flexShrink: 0 }}>
        <div style={{ background: 'white', borderRadius: 12, padding: '18px 32px', display: 'flex', alignItems: 'center', border: '1px solid #EEEEE8', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          {[
            { label: 'INFLOW',  value: inflow,  color: '#2A9D5C' },
            { label: 'OUTFLOW', value: outflow, color: '#E05C5C' },
            { label: 'NET',     value: net,     color: net >= 0 ? '#111' : '#E05C5C' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{ flex: 1, textAlign: i === 0 ? 'left' : i === 2 ? 'right' : 'center' }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#bbb', letterSpacing: '0.08em', marginBottom: 5 }}>{item.label}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: item.color, letterSpacing: '-0.02em' }}>{formatRp(item.value)}</div>
              </div>
              {i < 2 && <div style={{ width: 1, height: 40, background: '#F0F0EA', margin: '0 32px' }}/>}
            </div>
          ))}
        </div>
      </div>

      {/* Transaction groups */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 32px 80px' }}>
        {groups.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#bbb', fontSize: 14 }}>No transactions found.</div>
        )}
        {groups.map(([date, txs]) => {
          const { day, dayName, month: mName } = parseDateInfo(date);
          const dayTotal = (txs as Transaction[]).reduce((s, t) => s + t.amount, 0);
          return (
            <div key={date} style={{ marginBottom: 12, borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', background: '#EEEEE8' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  <span style={{ fontSize: 26, fontWeight: 700, color: '#111', letterSpacing: '-0.03em' }}>{String(day).padStart(2, '0')}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>{dayName}</div>
                    <div style={{ fontSize: 11, color: '#aaa' }}>{mName} {new Date(date + 'T00:00:00').getFullYear()}</div>
                  </div>
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: dayTotal < 0 ? '#E05C5C' : '#2A9D5C' }}>{formatRp(dayTotal)}</span>
              </div>
              {(txs as Transaction[]).map((tx, i) => {
                const cat = getCategoryById(tx.categoryId);
                const isLast = i === txs.length - 1;
                return (
                  <div key={tx.id}
                    onClick={() => navigate('/add-transaction', { state: { editingTx: tx } })}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 20px', background: i % 2 === 0 ? 'white' : '#FAFAF7', borderBottom: isLast ? 'none' : '1px solid #F2F2EE', cursor: 'pointer', transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F5FFF0'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = i % 2 === 0 ? 'white' : '#FAFAF7'}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: cat?.bg || '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                      {cat?.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{cat?.name}</div>
                      <div style={{ fontSize: 12, color: '#999', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.desc}</div>
                    </div>
                    <div style={{ padding: '3px 10px', borderRadius: 20, background: '#F2F2EE', fontSize: 11, color: '#888', flexShrink: 0 }}>{tx.sub}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: tx.amount < 0 ? '#E05C5C' : '#2A9D5C', flexShrink: 0, minWidth: 140, textAlign: 'right', letterSpacing: '-0.01em' }}>
                      {formatRp(tx.amount)}
                    </div>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, opacity: 0.3 }}>
                      <path d="M5 3l4 4-4 4" stroke="#111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('/add-transaction')}
        style={{
          position: 'fixed', bottom: 36, right: 40,
          width: 56, height: 56, borderRadius: '50%',
          background: '#D1FF19', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
          transition: 'transform 0.15s, box-shadow 0.15s', zIndex: 200,
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 28px rgba(0,0,0,0.22)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.18)'; }}
        title="Add transaction"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="#111" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
}
