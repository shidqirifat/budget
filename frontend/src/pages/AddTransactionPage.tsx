import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CATEGORIES_DATA, EVENTS_DATA, Transaction, formatRp } from '@/utils/designData';

export default function AddTransactionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const editingTx = location.state?.editingTx as Transaction | undefined;

  const initType = editingTx ? (editingTx.amount > 0 ? 'inflow' : 'outflow') : 'outflow';
  const [type,     setType]     = useState(initType);
  const [amount,   setAmount]   = useState(editingTx ? String(Math.abs(editingTx.amount)) : '');
  const [date,     setDate]     = useState(editingTx?.date || new Date().toISOString().slice(0, 10));
  const [catId,    setCatId]    = useState<number | null>(editingTx?.categoryId || null);
  const [sub,      setSub]      = useState(editingTx?.sub || '');
  const [desc,     setDesc]     = useState(editingTx?.desc || '');
  const [event,    setEvent]    = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [parsed,   setParsed]   = useState<{ amount: string; date: string; merchant: string } | null>(null);

  const selectedCat = CATEGORIES_DATA.find(c => c.id === catId);
  const visibleCats = CATEGORIES_DATA.filter(c => type === 'inflow' ? c.type === 'inflow' : c.type === 'outflow');
  const amtColor = type === 'inflow' ? '#2A9D5C' : '#E05C5C';

  const fakeParseReceipt = () => setParsed({ amount: '250.000', date: '26 Apr 2026', merchant: 'Alfamart Citayam' });

  const sectionHead = (label: string, note?: string) => (
    <div style={{ fontSize: 11, fontWeight: 600, color: '#aaa', letterSpacing: '0.07em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
      {label}
      {note && <span style={{ fontWeight: 400, color: '#ccc', letterSpacing: 0, textTransform: 'none', fontSize: 11 }}>{note}</span>}
    </div>
  );

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#F5F5F2', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ padding: '18px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', borderBottom: '1px solid #EEEEE8', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#999', fontSize: 13, padding: '6px 0' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>
          <div style={{ width: 1, height: 20, background: '#eee' }}/>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111', margin: 0, letterSpacing: '-0.02em' }}>
            {editingTx ? 'Edit Transaction' : 'New Transaction'}
          </h1>
        </div>
        <button onClick={() => navigate('/')} style={{ padding: '10px 28px', borderRadius: 8, border: 'none', background: '#D1FF19', color: '#111', fontSize: 13, fontWeight: 700, cursor: 'pointer', letterSpacing: '-0.01em' }}>
          Save Transaction
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', gap: 20, padding: '24px 32px', overflow: 'hidden' }}>

        {/* Left: form */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Type + Amount */}
          <div style={{ background: 'white', borderRadius: 12, padding: 24, border: '1px solid #EEEEE8' }}>
            <div style={{ display: 'flex', background: '#F5F5F2', borderRadius: 8, padding: 4, width: 'fit-content', marginBottom: 22 }}>
              {(['outflow', 'inflow', 'transfer'] as const).map(t => {
                const sel = type === t;
                const bg  = sel ? (t === 'inflow' ? '#EDFDF5' : t === 'outflow' ? '#FDF0F0' : 'white') : 'transparent';
                const col = sel ? (t === 'inflow' ? '#2A9D5C' : t === 'outflow' ? '#E05C5C' : '#111') : '#999';
                return (
                  <button key={t} onClick={() => { setType(t); setCatId(null); setSub(''); }}
                    style={{ padding: '8px 22px', borderRadius: 6, border: 'none', cursor: 'pointer', background: bg, color: col, fontSize: 13, fontWeight: sel ? 700 : 400, textTransform: 'capitalize', transition: 'all 0.12s' }}>
                    {t}
                  </button>
                );
              })}
            </div>
            {sectionHead('AMOUNT')}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 26, fontWeight: 700, color: '#ccc' }}>{type === 'outflow' ? '-' : '+'} Rp</span>
              <input
                value={amount ? parseInt(amount).toLocaleString('id-ID') : ''}
                onChange={e => setAmount(e.target.value.replace(/\D/g, ''))}
                placeholder="0"
                style={{ fontSize: 34, fontWeight: 700, border: 'none', outline: 'none', color: amtColor, background: 'transparent', width: '100%', letterSpacing: '-0.02em' }}
              />
            </div>
          </div>

          {/* Date */}
          <div style={{ background: 'white', borderRadius: 12, padding: 24, border: '1px solid #EEEEE8' }}>
            {sectionHead('DATE')}
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              style={{ fontSize: 14, fontWeight: 500, border: '1px solid #E5E5E0', borderRadius: 8, padding: '10px 14px', color: '#333', background: '#FAFAF8', outline: 'none', cursor: 'pointer' }}
            />
          </div>

          {/* Category */}
          <div style={{ background: 'white', borderRadius: 12, padding: 24, border: '1px solid #EEEEE8' }}>
            {sectionHead('CATEGORY')}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {visibleCats.map(cat => {
                const sel = catId === cat.id;
                return (
                  <div key={cat.id} onClick={() => { setCatId(cat.id); setSub(''); }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 14px', borderRadius: 10, cursor: 'pointer', minWidth: 76, border: `2px solid ${sel ? '#D1FF19' : '#EEEEE8'}`, background: sel ? '#FAFDE8' : 'white', transition: 'all 0.12s' }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{cat.icon}</div>
                    <span style={{ fontSize: 11, fontWeight: sel ? 700 : 400, color: sel ? '#111' : '#777', textAlign: 'center', lineHeight: 1.2 }}>{cat.name}</span>
                  </div>
                );
              })}
            </div>
            {selectedCat && (
              <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid #F2F2EE' }}>
                {sectionHead('SUB-CATEGORY')}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {selectedCat.subs.map(s => {
                    const sel = sub === s;
                    return (
                      <button key={s} onClick={() => setSub(s)}
                        style={{ padding: '7px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', background: sel ? '#111' : '#F2F2EE', color: sel ? '#D1FF19' : '#666', fontSize: 12, fontWeight: sel ? 600 : 400, transition: 'all 0.12s' }}>
                        {s}
                      </button>
                    );
                  })}
                  <button style={{ padding: '7px 16px', borderRadius: 20, border: '1.5px dashed #D1FF19', background: 'transparent', color: '#aaa', fontSize: 12, cursor: 'pointer' }}>+ New</button>
                </div>
              </div>
            )}
          </div>

          {/* Description + Event */}
          <div style={{ background: 'white', borderRadius: 12, padding: 24, border: '1px solid #EEEEE8', display: 'flex', gap: 20 }}>
            <div style={{ flex: 2 }}>
              {sectionHead('DESCRIPTION')}
              <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Add description…"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #E5E5E0', fontSize: 13, color: '#333', outline: 'none', boxSizing: 'border-box' }}/>
            </div>
            <div style={{ flex: 1 }}>
              {sectionHead('LINK EVENT', '(optional)')}
              <select value={event} onChange={e => setEvent(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #E5E5E0', fontSize: 13, color: event ? '#333' : '#aaa', outline: 'none', background: 'white', boxSizing: 'border-box' }}>
                <option value="">No event</option>
                {EVENTS_DATA.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Right: receipt panel */}
        <div style={{ width: 288, flexShrink: 0 }}>
          <div style={{ background: '#141414', borderRadius: 12, padding: 22, position: 'sticky', top: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#D1FF19', marginBottom: 4 }}>Receipt Scanner</div>
            <div style={{ fontSize: 12, color: '#444', marginBottom: 18, lineHeight: 1.5 }}>Upload a receipt image to auto-fill fields above.</div>
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); fakeParseReceipt(); }}
              onClick={fakeParseReceipt}
              style={{ border: `2px dashed ${dragOver ? '#D1FF19' : '#272727'}`, borderRadius: 10, padding: '32px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, cursor: 'pointer', transition: 'all 0.15s', background: dragOver ? '#182300' : '#1a1a1a' }}>
              <div style={{ fontSize: 30 }}>📷</div>
              <div style={{ fontSize: 12, color: '#555', textAlign: 'center', lineHeight: 1.5 }}>Drag & drop receipt<br/>or click to browse</div>
            </div>
            <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid #1e1e1e' }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#333', letterSpacing: '0.07em', marginBottom: 12 }}>PARSED FROM RECEIPT</div>
              {([['Amount', parsed?.amount || '—'], ['Date', parsed?.date || '—'], ['Merchant', parsed?.merchant || '—']] as [string, string][]).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid #1e1e1e' }}>
                  <span style={{ fontSize: 12, color: '#555' }}>{k}</span>
                  <span style={{ fontSize: 12, color: parsed ? '#D1FF19' : '#333', fontWeight: parsed ? 600 : 400 }}>{v}</span>
                </div>
              ))}
              <button
                onClick={() => { if (parsed) { setAmount('250000'); setDate('2026-04-26'); setDesc('Alfamart Citayam'); } }}
                style={{ width: '100%', padding: '10px', borderRadius: 8, border: 'none', background: parsed ? '#1e2d00' : '#1a1a1a', color: parsed ? '#D1FF19' : '#333', fontSize: 12, fontWeight: 700, cursor: parsed ? 'pointer' : 'default', transition: 'all 0.15s' }}>
                Apply to Form →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
