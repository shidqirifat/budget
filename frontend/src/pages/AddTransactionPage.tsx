import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { transactionService, Transaction } from '@/services/transaction.service';
import { transactionTypeService, TransactionType } from '@/services/transaction-type.service';
import { categoryService, Category, SubCategory } from '@/services/category.service';
import { eventService, BudgetEvent } from '@/services/event.service';

export default function AddTransactionPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const editingTx = location.state?.editingTx as Transaction | undefined;

  const [types,       setTypes]       = useState<TransactionType[]>([]);
  const [categories,  setCategories]  = useState<Category[]>([]);
  const [subCats,     setSubCats]     = useState<SubCategory[]>([]);
  const [events,      setEvents]      = useState<BudgetEvent[]>([]);

  const initTypeName = editingTx ? editingTx.type.name : 'expense';
  const [typeName,  setTypeName]  = useState<'income' | 'expense'>(initTypeName as 'income' | 'expense');
  const [amount,    setAmount]    = useState(editingTx ? String(editingTx.amount) : '');
  const [date,      setDate]      = useState(editingTx ? editingTx.date.slice(0, 10) : new Date().toISOString().slice(0, 10));
  const [catId,     setCatId]     = useState<string>(editingTx?.categoryId || '');
  const [subCatId,  setSubCatId]  = useState<string>(editingTx?.subCategoryId || '');
  const [note,      setNote]      = useState(editingTx?.note || '');
  const [eventId,   setEventId]   = useState(editingTx?.eventId || '');
  const [saving,    setSaving]    = useState(false);
  const [deleting,  setDeleting]  = useState(false);
  const [error,     setError]     = useState('');
  const [dragOver,  setDragOver]  = useState(false);
  const [parsed,    setParsed]    = useState<{ amount: string; date: string; merchant: string } | null>(null);

  useEffect(() => {
    transactionTypeService.getAll().then(r => setTypes(r.data.data)).catch(() => {});
    eventService.getAll().then(r => setEvents(r.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const typeObj = types.find(t => t.name === typeName);
    if (!typeObj) return;
    categoryService.getAll({ typeId: typeObj.id })
      .then(r => {
        setCategories(r.data.data);
        if (catId && !r.data.data.find(c => c.id === catId)) {
          setCatId('');
          setSubCatId('');
        }
      })
      .catch(() => {});
  }, [typeName, types]);

  useEffect(() => {
    if (!catId) { setSubCats([]); setSubCatId(''); return; }
    categoryService.getSubCategories(catId)
      .then(r => {
        setSubCats(r.data.data);
        if (subCatId && !r.data.data.find(s => s.id === subCatId)) setSubCatId('');
      })
      .catch(() => {});
  }, [catId]);

  const typeObj = types.find(t => t.name === typeName);
  const amtColor = typeName === 'income' ? '#2A9D5C' : '#E05C5C';

  const fakeParseReceipt = () => setParsed({ amount: '250.000', date: new Date().toISOString().slice(0, 10), merchant: 'Alfamart' });

  async function handleSave() {
    if (!typeObj) return;
    if (!amount || Number(amount) <= 0) { setError('Enter a valid amount.'); return; }
    if (!catId)  { setError('Select a category.'); return; }
    setError('');
    setSaving(true);
    try {
      const payload = {
        amount: Number(amount),
        typeId: typeObj.id,
        categoryId: catId,
        subCategoryId: subCatId || undefined,
        eventId: eventId || undefined,
        date: new Date(date).toISOString(),
        note: note || undefined,
      };
      if (editingTx) {
        await transactionService.update(editingTx.id, payload);
      } else {
        await transactionService.create(payload);
      }
      navigate(-1);
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!editingTx) return;
    if (!window.confirm('Delete this transaction? This cannot be undone.')) return;
    setDeleting(true);
    setError('');
    try {
      await transactionService.remove(editingTx.id);
      navigate(-1);
    } catch {
      setError('Failed to delete. Please try again.');
    } finally {
      setDeleting(false);
    }
  }

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {error && <span style={{ fontSize: 12, color: '#E05C5C' }}>{error}</span>}
          {editingTx && (
            <button
              onClick={handleDelete}
              disabled={deleting || saving}
              style={{ padding: '10px 20px', borderRadius: 8, border: '1.5px solid #F5C0C0', background: deleting ? '#FDF5F5' : 'white', color: '#E05C5C', fontSize: 13, fontWeight: 600, cursor: deleting || saving ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 7, transition: 'all 0.15s' }}
              onMouseEnter={e => { if (!deleting && !saving) (e.currentTarget as HTMLElement).style.background = '#FDF0F0'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = deleting ? '#FDF5F5' : 'white'; }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 3.5h10M5.5 3.5V2.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v1M6 6.5v3M8 6.5v3M3 3.5l.7 7.3a.5.5 0 0 0 .5.45h5.6a.5.5 0 0 0 .5-.45L11 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving || deleting}
            style={{ padding: '10px 28px', borderRadius: 8, border: 'none', background: saving ? '#e8f5a8' : '#D1FF19', color: '#111', fontSize: 13, fontWeight: 700, cursor: saving || deleting ? 'default' : 'pointer', letterSpacing: '-0.01em' }}
          >
            {saving ? 'Saving…' : 'Save Transaction'}
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', gap: 20, padding: '24px 32px', overflow: 'hidden' }}>

        {/* Left: form */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Type + Amount */}
          <div style={{ background: 'white', borderRadius: 12, padding: 24, border: '1px solid #EEEEE8' }}>
            <div style={{ display: 'flex', background: '#F5F5F2', borderRadius: 8, padding: 4, width: 'fit-content', marginBottom: 22 }}>
              {(['expense', 'income'] as const).map(t => {
                const sel = typeName === t;
                const bg  = sel ? (t === 'income' ? '#EDFDF5' : '#FDF0F0') : 'transparent';
                const col = sel ? (t === 'income' ? '#2A9D5C' : '#E05C5C') : '#999';
                const label = t === 'income' ? 'Inflow' : 'Outflow';
                return (
                  <button key={t} onClick={() => { setTypeName(t); setCatId(''); setSubCatId(''); }}
                    style={{ padding: '8px 22px', borderRadius: 6, border: 'none', cursor: 'pointer', background: bg, color: col, fontSize: 13, fontWeight: sel ? 700 : 400, transition: 'all 0.12s' }}>
                    {label}
                  </button>
                );
              })}
            </div>
            {sectionHead('AMOUNT')}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 26, fontWeight: 700, color: '#ccc' }}>{typeName === 'expense' ? '-' : '+'} Rp</span>
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
            {categories.length === 0 ? (
              <div style={{ fontSize: 13, color: '#bbb' }}>Loading categories…</div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {categories.map(cat => {
                  const sel = catId === cat.id;
                  return (
                    <div key={cat.id} onClick={() => { setCatId(cat.id); setSubCatId(''); }}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 14px', borderRadius: 10, cursor: 'pointer', minWidth: 76, border: `2px solid ${sel ? '#D1FF19' : '#EEEEE8'}`, background: sel ? '#FAFDE8' : 'white', transition: 'all 0.12s' }}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: sel ? '#EEFFC0' : '#F0F0EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#888' }}>
                        {cat.name.slice(0, 1).toUpperCase()}
                      </div>
                      <span style={{ fontSize: 11, fontWeight: sel ? 700 : 400, color: sel ? '#111' : '#777', textAlign: 'center', lineHeight: 1.2 }}>{cat.name}</span>
                    </div>
                  );
                })}
              </div>
            )}
            {catId && (
              <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid #F2F2EE' }}>
                {sectionHead('SUB-CATEGORY', '(optional)')}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {subCats.map(s => {
                    const sel = subCatId === s.id;
                    return (
                      <button key={s.id} onClick={() => setSubCatId(sel ? '' : s.id)}
                        style={{ padding: '7px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', background: sel ? '#111' : '#F2F2EE', color: sel ? '#D1FF19' : '#666', fontSize: 12, fontWeight: sel ? 600 : 400, transition: 'all 0.12s' }}>
                        {s.name}
                      </button>
                    );
                  })}
                  {subCats.length === 0 && <span style={{ fontSize: 12, color: '#bbb' }}>No sub-categories.</span>}
                </div>
              </div>
            )}
          </div>

          {/* Description + Event */}
          <div style={{ background: 'white', borderRadius: 12, padding: 24, border: '1px solid #EEEEE8', display: 'flex', gap: 20 }}>
            <div style={{ flex: 2 }}>
              {sectionHead('NOTE')}
              <input value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note…"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #E5E5E0', fontSize: 13, color: '#333', outline: 'none', boxSizing: 'border-box' }}/>
            </div>
            <div style={{ flex: 1 }}>
              {sectionHead('LINK EVENT', '(optional)')}
              <select value={eventId} onChange={e => setEventId(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #E5E5E0', fontSize: 13, color: eventId ? '#333' : '#aaa', outline: 'none', background: 'white', boxSizing: 'border-box' }}>
                <option value="">No event</option>
                {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
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
                onClick={() => { if (parsed) { setAmount('250000'); setDate(new Date().toISOString().slice(0, 10)); setNote('Alfamart'); } }}
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
