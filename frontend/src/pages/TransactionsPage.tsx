import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from '@/utils/dayjs';
import MonthNav from '@/components/MonthNav';
import { transactionService, Transaction } from '@/services/transaction.service';
import { categoryService, Category } from '@/services/category.service';
import { formatCurrency } from '@/utils/format';


function parseDateInfo(dateStr: string) {
  const d = dayjs(dateStr);
  return {
    day:     d.date(),
    dayName: d.format('dddd'),
    month:   d.format('MMMM'),
    year:    d.year(),
  };
}

function getMonthRange(month: string): { from: string; to: string } {
  const d = dayjs(month + '-01');
  return {
    from: d.startOf('month').format('YYYY-MM-DD'),
    to:   d.endOf('month').format('YYYY-MM-DD'),
  };
}

function txAmount(tx: Transaction): number {
  return tx.type.name === 'income' ? tx.amount : -tx.amount;
}

function groupByDate(txs: Transaction[]): [string, Transaction[]][] {
  const groups: Record<string, Transaction[]> = {};
  txs.forEach(tx => {
    const date = tx.date.slice(0, 10);
    if (!groups[date]) groups[date] = [];
    groups[date].push(tx);
  });
  return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
}

function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export default function TransactionsPage() {
  const navigate = useNavigate();
  const [month,       setMonth]       = useState(currentMonthKey);
  const [search,      setSearch]      = useState('');
  const [filterCatId, setFilterCatId] = useState('');
  const [filterSubId, setFilterSubId] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories,   setCategories]   = useState<Category[]>([]);
  const [loading,      setLoading]      = useState(false);

  useEffect(() => {
    categoryService.getAll().then(r => setCategories(r.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const { from, to } = getMonthRange(month);
    transactionService.getAll({ from, to })
      .then(r => setTransactions(r.data.data))
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false));
  }, [month]);

  const filtered = useMemo(() => transactions.filter(tx => {
    const q = search.toLowerCase();
    const matchSearch = !q
      || tx.category.name.toLowerCase().includes(q)
      || (tx.subCategory?.name || '').toLowerCase().includes(q)
      || (tx.note || '').toLowerCase().includes(q);
    const matchCat = !filterCatId || tx.categoryId === filterCatId;
    const matchSub = !filterSubId || tx.subCategoryId === filterSubId;
    return matchSearch && matchCat && matchSub;
  }), [transactions, search, filterCatId, filterSubId]);

  const inflow  = filtered.reduce((s, t) => t.type.name === 'income' ? s + t.amount : s, 0);
  const outflow = filtered.reduce((s, t) => t.type.name === 'expense' ? s + t.amount : s, 0);
  const net     = inflow - outflow;
  const groups  = groupByDate(filtered);

  const catOptions = useMemo(() => {
    const ids = new Set(transactions.map(t => t.categoryId));
    return categories.filter(c => ids.has(c.id));
  }, [transactions, categories]);

  const subOptions = useMemo(() => {
    if (!filterCatId) return [];
    const ids = new Set(
      transactions
        .filter(t => t.categoryId === filterCatId && t.subCategoryId)
        .map(t => t.subCategoryId!)
    );
    const seen = new Set<string>();
    const result: { id: string; name: string }[] = [];
    transactions.forEach(t => {
      if (t.categoryId === filterCatId && t.subCategory && ids.has(t.subCategoryId!) && !seen.has(t.subCategoryId!)) {
        seen.add(t.subCategoryId!);
        result.push({ id: t.subCategoryId!, name: t.subCategory.name });
      }
    });
    return result;
  }, [transactions, filterCatId]);

  const hasFilter        = !!filterCatId || !!filterSubId;
  const activeFilterCount = (filterCatId ? 1 : 0) + (filterSubId ? 1 : 0);
  const clearFilters     = () => { setFilterCatId(''); setFilterSubId(''); };

  const filterCatName = categories.find(c => c.id === filterCatId)?.name ?? '';
  const filterSubName = subOptions.find(s => s.id === filterSubId)?.name ?? '';

  const monthLabel = dayjs(month + '-01').format('MMMM YYYY');

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#F5F5F2', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ padding: '28px 32px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111', margin: 0, letterSpacing: '-0.02em' }}>Transactions</h1>
          <p style={{ fontSize: 13, color: '#999', margin: '3px 0 0' }}>{monthLabel}</p>
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
              <select value={filterCatId} onChange={e => { setFilterCatId(e.target.value); setFilterSubId(''); }}
                style={{ padding: '8px 12px', borderRadius: 8, border: `1.5px solid ${filterCatId ? '#D1FF19' : '#E5E5E0'}`, fontSize: 13, color: filterCatId ? '#111' : '#aaa', outline: 'none', background: 'white', cursor: 'pointer' }}>
                <option value="">All categories</option>
                {catOptions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: '#bbb', letterSpacing: '0.06em' }}>SUB-CATEGORY</span>
              <select value={filterSubId} onChange={e => setFilterSubId(e.target.value)} disabled={!filterCatId}
                style={{ padding: '8px 12px', borderRadius: 8, border: `1.5px solid ${filterSubId ? '#D1FF19' : '#E5E5E0'}`, fontSize: 13, color: filterSubId ? '#111' : '#aaa', outline: 'none', background: filterCatId ? 'white' : '#F8F8F8', cursor: filterCatId ? 'pointer' : 'not-allowed', opacity: filterCatId ? 1 : 0.5 }}>
                <option value="">All sub-categories</option>
                {subOptions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flex: 2 }}>
              {filterCatId && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 20, background: '#111', color: '#D1FF19', fontSize: 12, fontWeight: 600 }}>
                  {filterCatName}
                  <span onClick={() => { setFilterCatId(''); setFilterSubId(''); }} style={{ cursor: 'pointer', opacity: 0.7 }}>✕</span>
                </div>
              )}
              {filterSubId && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 20, background: '#F0F0E8', color: '#555', fontSize: 12 }}>
                  {filterSubName}
                  <span onClick={() => setFilterSubId('')} style={{ cursor: 'pointer', opacity: 0.7 }}>✕</span>
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
                <div style={{ fontSize: 20, fontWeight: 700, color: item.color, letterSpacing: '-0.02em' }}>
                  {i === 1 ? '-' : ''}{formatCurrency(item.value)}
                </div>
              </div>
              {i < 2 && <div style={{ width: 1, height: 40, background: '#F0F0EA', margin: '0 32px' }}/>}
            </div>
          ))}
        </div>
      </div>

      {/* Transaction groups */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 32px 80px' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#bbb', fontSize: 14 }}>Loading…</div>
        )}
        {!loading && groups.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#bbb', fontSize: 14 }}>No transactions found.</div>
        )}
        {!loading && groups.map(([date, txs]) => {
          const { day, dayName, month: mName, year } = parseDateInfo(date);
          const dayTotal = txs.reduce((s, t) => s + txAmount(t), 0);
          return (
            <div key={date} style={{ marginBottom: 12, borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', background: '#EEEEE8' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  <span style={{ fontSize: 26, fontWeight: 700, color: '#111', letterSpacing: '-0.03em' }}>{String(day).padStart(2, '0')}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>{dayName}</div>
                    <div style={{ fontSize: 11, color: '#aaa' }}>{mName} {year}</div>
                  </div>
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: dayTotal < 0 ? '#E05C5C' : '#2A9D5C' }}>
                  {dayTotal < 0 ? '-' : '+'}{formatCurrency(Math.abs(dayTotal))}
                </span>
              </div>
              {txs.map((tx, i) => {
                const isLast  = i === txs.length - 1;
                const signed  = txAmount(tx);
                return (
                  <div key={tx.id}
                    onClick={() => navigate('/add-transaction', { state: { editingTx: tx } })}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 20px', background: i % 2 === 0 ? 'white' : '#FAFAF7', borderBottom: isLast ? 'none' : '1px solid #F2F2EE', cursor: 'pointer', transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F5FFF0'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = i % 2 === 0 ? 'white' : '#FAFAF7'}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#F0F0EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#888', flexShrink: 0 }}>
                      {tx.category.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{tx.category.name}</div>
                      <div style={{ fontSize: 12, color: '#999', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.note || '—'}</div>
                    </div>
                    {tx.subCategory && (
                      <div style={{ padding: '3px 10px', borderRadius: 20, background: '#F2F2EE', fontSize: 11, color: '#888', flexShrink: 0 }}>{tx.subCategory.name}</div>
                    )}
                    <div style={{ fontSize: 14, fontWeight: 700, color: signed < 0 ? '#E05C5C' : '#2A9D5C', flexShrink: 0, minWidth: 140, textAlign: 'right', letterSpacing: '-0.01em' }}>
                      {signed < 0 ? '-' : '+'}{formatCurrency(Math.abs(signed))}
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
