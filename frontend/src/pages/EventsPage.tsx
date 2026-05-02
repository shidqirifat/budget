import { useState, useMemo } from 'react';
import dayjs from '@/utils/dayjs';
import { TRANSACTIONS_DATA, Transaction, formatRp, getCategoryById, parseDateInfo } from '@/utils/designData';

type BudgetEvent = {
  id: number; name: string; icon: string; color: string; bg: string;
  note: string; startDate: string; endDate: string; txIds: number[];
};

const TODAY = '2026-04-26';

const initialEvents: BudgetEvent[] = [
  { id: 1, name: 'Lebaran 2026', icon: '🌙', color: '#E8A040', bg: '#FDF8EC', note: 'Pengeluaran lebaran: THR keluarga, mudik, dan hampers', startDate: '2026-04-01', endDate: '2026-04-10', txIds: [1, 3] },
  { id: 2, name: 'Mudik April',  icon: '🚗', color: '#5C8AE0', bg: '#F0F4FD', note: 'Perjalanan mudik ke Jawa Barat - bensin + tol + makan', startDate: '2026-04-18', endDate: '2026-04-30', txIds: [6] },
  { id: 3, name: 'Gajian Bonus', icon: '💰', color: '#2A9D5C', bg: '#F0FDF5', note: 'Bonus Q1 masuk bulan Maret lalu', startDate: '2026-03-01', endDate: '2026-03-31', txIds: [] },
];

export default function EventsPage() {
  const [events, setEvents]     = useState<BudgetEvent[]>(initialEvents);
  const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active');
  const [selectedId, setSelectedId] = useState(2);
  const [showAdd, setShowAdd]   = useState(false);
  const [newName, setNewName]   = useState('');
  const [newNote, setNewNote]   = useState('');
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd]     = useState('');

  const isActive = (ev: BudgetEvent) => ev.startDate <= TODAY && TODAY <= ev.endDate;
  const visibleEvents = events.filter(ev => activeTab === 'active' ? isActive(ev) : !isActive(ev));
  const selected = events.find(e => e.id === selectedId);
  const selectedIsActive = selected ? isActive(selected) : false;

  const linkedTxs = useMemo(() =>
    selected ? TRANSACTIONS_DATA.filter(tx => selected.txIds.includes(tx.id)) : [],
    [selected]
  );

  const recommendedTxs = useMemo(() => {
    if (!selected) return [];
    return TRANSACTIONS_DATA.filter(tx =>
      !selected.txIds.includes(tx.id) &&
      tx.date >= selected.startDate &&
      tx.date <= selected.endDate
    );
  }, [selected]);

  const eventTotal = linkedTxs.reduce((s, t) => s + t.amount, 0);
  const monthKey = selected?.startDate?.slice(0, 7) || '2026-04';
  const monthOutflow = TRANSACTIONS_DATA.filter(tx => tx.date.startsWith(monthKey) && tx.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const eventOutflow = linkedTxs.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const contributionPct = monthOutflow > 0 ? Math.round(eventOutflow / monthOutflow * 100) : 0;

  const linkTx   = (txId: number) => setEvents(prev => prev.map(e => e.id === selectedId ? { ...e, txIds: [...e.txIds, txId] } : e));
  const unlinkTx = (txId: number) => setEvents(prev => prev.map(e => e.id === selectedId ? { ...e, txIds: e.txIds.filter(id => id !== txId) } : e));

  const addEvent = () => {
    if (!newName.trim() || !newStart || !newEnd) return;
    const ev: BudgetEvent = { id: Date.now(), name: newName.trim(), icon: '📌', color: '#888', bg: '#F5F5F5', note: newNote.trim(), startDate: newStart, endDate: newEnd, txIds: [] };
    setEvents(prev => [...prev, ev]);
    setSelectedId(ev.id);
    setActiveTab(isActive(ev) ? 'active' : 'inactive');
    setShowAdd(false);
    setNewName(''); setNewNote(''); setNewStart(''); setNewEnd('');
  };

  const deleteEvent = () => {
    const remaining = events.filter(e => e.id !== selectedId);
    setEvents(remaining);
    if (remaining.length) setSelectedId(remaining[0].id);
  };

  const formatDate = (d: string) => {
    if (!d) return '—';
    return dayjs(d).format('D MMMM YYYY');
  };

  const sectionHead = (label: string) => (
    <div style={{ fontSize: 10, fontWeight: 600, color: '#bbb', letterSpacing: '0.08em', marginBottom: 10 }}>{label}</div>
  );

  const TxRow = ({ tx, i, action, actionLabel, actionStyle }: { tx: Transaction; i: number; action: (id: number) => void; actionLabel: string; actionStyle: React.CSSProperties }) => {
    const cat = getCategoryById(tx.categoryId);
    const { dayName, day, month } = parseDateInfo(tx.date);
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px', background: i % 2 === 0 ? 'white' : '#FAFAF8', borderBottom: '1px solid #F2F2EE' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: cat?.bg || '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{cat?.icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.desc}</div>
          <div style={{ fontSize: 11, color: '#bbb', marginTop: 1 }}>{dayName}, {day} {month} · {tx.sub}</div>
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: tx.amount < 0 ? '#E05C5C' : '#2A9D5C', flexShrink: 0 }}>{formatRp(tx.amount)}</div>
        <button onClick={() => action(tx.id)} style={{ padding: '5px 12px', borderRadius: 6, border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer', flexShrink: 0, ...actionStyle }}>{actionLabel}</button>
      </div>
    );
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#F5F5F2', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ padding: '28px 32px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111', margin: 0, letterSpacing: '-0.02em' }}>Events</h1>
          <p style={{ fontSize: 13, color: '#999', margin: '3px 0 0' }}>Track why a month spikes</p>
        </div>
        <button onClick={() => setShowAdd(true)} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#D1FF19', color: '#111', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> New Event
        </button>
      </div>

      {/* Two panels */}
      <div style={{ display: 'flex', flex: 1, padding: '0 32px 32px', gap: 20, overflow: 'hidden' }}>

        {/* Left list */}
        <div style={{ width: 264, flexShrink: 0, background: 'white', borderRadius: 12, border: '1px solid #EEEEE8', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #F2F2EE', flexShrink: 0 }}>
            {([['active','Active'],['inactive','Inactive']] as const).map(([id, lbl]) => {
              const count = events.filter(e => id === 'active' ? isActive(e) : !isActive(e)).length;
              return (
                <div key={id} onClick={() => setActiveTab(id)}
                  style={{ flex: 1, padding: '12px 0', textAlign: 'center', cursor: 'pointer', borderBottom: `2.5px solid ${activeTab === id ? '#D1FF19' : 'transparent'}`, background: activeTab === id ? '#FAFDE8' : 'white', transition: 'all 0.12s' }}>
                  <span style={{ fontSize: 13, fontWeight: activeTab === id ? 700 : 400, color: activeTab === id ? '#111' : '#aaa' }}>{lbl}</span>
                  <span style={{ marginLeft: 6, fontSize: 11, padding: '1px 7px', borderRadius: 10, background: activeTab === id ? '#D1FF19' : '#F0F0EA', color: activeTab === id ? '#111' : '#aaa', fontWeight: 600 }}>{count}</span>
                </div>
              );
            })}
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }}>
            {visibleEvents.length === 0 && !showAdd && (
              <div style={{ padding: '28px 16px', textAlign: 'center', color: '#ccc', fontSize: 12, fontStyle: 'italic' }}>No {activeTab} events</div>
            )}
            {visibleEvents.map(ev => {
              const active = selectedId === ev.id;
              const evTxs = TRANSACTIONS_DATA.filter(t => ev.txIds.includes(t.id));
              const evAmt = evTxs.reduce((s, t) => s + t.amount, 0);
              return (
                <div key={ev.id} onClick={() => setSelectedId(ev.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer', borderBottom: '1px solid #F8F8F4', background: active ? '#FAFDE8' : 'white', borderLeft: `3px solid ${active ? '#D1FF19' : 'transparent'}`, transition: 'background 0.1s' }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = '#FAFAF7'; }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'white'; }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: ev.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{ev.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.name}</div>
                    <div style={{ fontSize: 10, color: '#bbb', marginTop: 2 }}>{formatDate(ev.startDate)} – {formatDate(ev.endDate)}</div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: evAmt < 0 ? '#E05C5C' : '#2A9D5C', flexShrink: 0 }}>{formatRp(evAmt)}</div>
                </div>
              );
            })}

            {showAdd && (
              <div style={{ padding: '14px 16px', borderTop: '1px solid #F0F0EA' }}>
                <input autoFocus value={newName} onChange={e => setNewName(e.target.value)} placeholder="Event name…"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #E5E5E0', fontSize: 13, color: '#333', outline: 'none', marginBottom: 8, boxSizing: 'border-box' }}/>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input type="date" value={newStart} onChange={e => setNewStart(e.target.value)} style={{ flex: 1, padding: '7px 10px', borderRadius: 8, border: '1px solid #E5E5E0', fontSize: 12, outline: 'none' }}/>
                  <input type="date" value={newEnd} onChange={e => setNewEnd(e.target.value)} style={{ flex: 1, padding: '7px 10px', borderRadius: 8, border: '1px solid #E5E5E0', fontSize: 12, outline: 'none' }}/>
                </div>
                <textarea value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Description…" rows={2}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #E5E5E0', fontSize: 12, color: '#333', outline: 'none', resize: 'none', marginBottom: 8, boxSizing: 'border-box' }}/>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={addEvent} style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', background: '#D1FF19', color: '#111', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Add</button>
                  <button onClick={() => setShowAdd(false)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #E5E5E0', background: 'white', color: '#888', fontSize: 12, cursor: 'pointer' }}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right detail */}
        <div style={{ flex: 1, background: 'white', borderRadius: 12, border: '1px solid #EEEEE8', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          {selected ? (
            <>
              <div style={{ padding: '22px 28px', borderBottom: '1px solid #F2F2EE', display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
                <div style={{ width: 50, height: 50, borderRadius: '50%', background: selected.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>{selected.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#111', letterSpacing: '-0.02em' }}>{selected.name}</div>
                    <div style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: selectedIsActive ? '#EDFDF5' : '#F5F5F2', color: selectedIsActive ? '#2A9D5C' : '#aaa' }}>
                      {selectedIsActive ? '● Active' : '○ Inactive'}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: '#aaa', marginTop: 3 }}>{formatDate(selected.startDate)} – {formatDate(selected.endDate)} · {linkedTxs.length} linked</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#bbb', letterSpacing: '0.07em', marginBottom: 4 }}>TOTAL IMPACT</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: eventTotal < 0 ? '#E05C5C' : '#2A9D5C', letterSpacing: '-0.02em' }}>{formatRp(eventTotal)}</div>
                </div>
                <button onClick={deleteEvent} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #FDEAEA', background: '#FDF8F8', color: '#E05C5C', fontSize: 12, cursor: 'pointer', flexShrink: 0 }}>Delete</button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
                {selected.note && (
                  <div style={{ marginBottom: 22 }}>
                    {sectionHead('NOTE')}
                    <div style={{ padding: '12px 16px', background: '#FAFDF0', borderRadius: 8, border: '1px solid #E8F5A0', fontSize: 13, color: '#555', lineHeight: 1.6 }}>{selected.note}</div>
                  </div>
                )}

                <div style={{ marginBottom: 22 }}>
                  {sectionHead('IMPACT ANALYSIS')}
                  <div style={{ display: 'flex', gap: 12 }}>
                    {[
                      { label: 'MONTH OUTFLOW', value: formatRp(-monthOutflow), color: '#888' },
                      { label: 'EVENT SPEND',   value: formatRp(-eventOutflow), color: '#E05C5C' },
                      { label: 'CONTRIBUTION',  value: `${contributionPct}%`,  color: '#E8A040', sub: `of ${dayjs(selected.startDate).format('MMMM')} outflow` },
                    ].map((item, i) => (
                      <div key={i} style={{ flex: 1, background: '#F9F9F7', borderRadius: 10, padding: '14px 16px', border: '1px solid #F0F0EA' }}>
                        <div style={{ fontSize: 9, fontWeight: 600, color: '#bbb', letterSpacing: '0.08em', marginBottom: 6 }}>{item.label}</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: item.color, letterSpacing: '-0.01em' }}>{item.value}</div>
                        {item.sub && <div style={{ fontSize: 10, color: '#bbb', marginTop: 3 }}>{item.sub}</div>}
                      </div>
                    ))}
                  </div>
                  {monthOutflow > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ height: 6, borderRadius: 3, background: '#F2F2EE', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${contributionPct}%`, background: '#E8A040', borderRadius: 3, transition: 'width 0.4s ease' }}/>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                        <span style={{ fontSize: 10, color: '#bbb' }}>Event spend</span>
                        <span style={{ fontSize: 10, color: '#bbb' }}>Monthly total</span>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: 22 }}>
                  {sectionHead(`LINKED TRANSACTIONS (${linkedTxs.length})`)}
                  <div style={{ border: '1px solid #EEEEE8', borderRadius: 10, overflow: 'hidden' }}>
                    {linkedTxs.length === 0
                      ? <div style={{ padding: '20px', textAlign: 'center', color: '#ccc', fontSize: 12, fontStyle: 'italic' }}>No transactions linked yet</div>
                      : linkedTxs.map((tx, i) => <TxRow key={tx.id} tx={tx} i={i} action={unlinkTx} actionLabel="Unlink" actionStyle={{ background: '#FDF8F8', color: '#E05C5C', border: '1px solid #F0E0E0' }}/>)
                    }
                  </div>
                </div>

                {recommendedTxs.length > 0 && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      {sectionHead('RECOMMENDED TO LINK')}
                      <div style={{ padding: '2px 8px', borderRadius: 10, background: '#FAFDE8', border: '1px solid #E8F5A0', fontSize: 10, color: '#7a9a00', fontWeight: 600, marginBottom: 10 }}>{recommendedTxs.length} match date range</div>
                    </div>
                    <div style={{ border: '1.5px dashed #D1FF19', borderRadius: 10, overflow: 'hidden', background: '#FAFDF5' }}>
                      {recommendedTxs.map((tx, i) => <TxRow key={tx.id} tx={tx} i={i} action={linkTx} actionLabel="Link" actionStyle={{ background: '#D1FF19', color: '#111' }}/>)}
                    </div>
                  </div>
                )}

                {recommendedTxs.length === 0 && linkedTxs.length > 0 && (
                  <div style={{ padding: '14px', background: '#F8F8F5', borderRadius: 8, fontSize: 12, color: '#bbb', textAlign: 'center', fontStyle: 'italic' }}>
                    No more transactions in this date range to link
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: 14 }}>Select an event to view details</div>
          )}
        </div>
      </div>
    </div>
  );
}
