import { useState, useEffect } from 'react';
import { CATEGORIES_DATA } from '@/utils/designData';

type Cat = typeof CATEGORIES_DATA[number] & { subs: string[] };

const MiniBar = () => {
  const vals = [0.45, 0.62, 0.55, 0.80, 0.50, 0.70, 1.0];
  const lbls = ['Oct','Nov','Dec','Jan','Feb','Mar','Apr'];
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 44 }}>
        {vals.map((v, i) => (
          <div key={i} style={{ flex: 1, height: v * 44, borderRadius: '3px 3px 0 0', background: i === 6 ? '#D1FF19' : '#EBEBEB' }}/>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
        {lbls.map((l, i) => (
          <span key={i} style={{ fontSize: 9, color: i === 6 ? '#D1FF19' : '#ccc', fontWeight: i === 6 ? 700 : 400 }}>{l}</span>
        ))}
      </div>
    </div>
  );
};

export default function CategoriesPage() {
  const [cats, setCats] = useState<Cat[]>(CATEGORIES_DATA.map(c => ({ ...c, subs: [...c.subs] })));
  const [selectedId, setSelectedId] = useState(1);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState('outflow');
  const [newSub, setNewSub] = useState('');
  const [saved, setSaved] = useState(false);

  const selected = cats.find(c => c.id === selectedId);

  useEffect(() => {
    if (selected) { setEditName(selected.name); setEditType(selected.type); setSaved(false); }
  }, [selectedId]);

  const updateSelected = (patch: Partial<Cat>) =>
    setCats(prev => prev.map(c => c.id === selectedId ? { ...c, ...patch } : c));

  const removeSub = (s: string) => updateSelected({ subs: selected!.subs.filter(x => x !== s) });

  const addSub = () => {
    const v = newSub.trim();
    if (!v || selected!.subs.includes(v)) return;
    updateSelected({ subs: [...selected!.subs, v] });
    setNewSub('');
  };

  const handleSave = () => {
    updateSelected({ name: editName, type: editType as 'inflow' | 'outflow' });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const deleteCategory = () => {
    const remaining = cats.filter(c => c.id !== selectedId);
    setCats(remaining);
    if (remaining.length) setSelectedId(remaining[0].id);
  };

  const sectionHead = (label: string, note?: string) => (
    <div style={{ fontSize: 10, fontWeight: 600, color: '#bbb', letterSpacing: '0.08em', marginBottom: 10, display: 'flex', gap: 6, alignItems: 'center' }}>
      {label}
      {note && <span style={{ fontWeight: 400, color: '#ddd', letterSpacing: 0, textTransform: 'none', fontSize: 11 }}>{note}</span>}
    </div>
  );

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#F5F5F2', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ padding: '28px 32px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111', margin: 0, letterSpacing: '-0.02em' }}>Categories</h1>
        <button
          onClick={() => {
            const id = Date.now();
            const fresh: Cat = { id, name: 'New Category', icon: '📁', color: '#888', bg: '#F5F5F5', type: 'outflow', subs: [] };
            setCats(prev => [...prev, fresh]);
            setSelectedId(id);
          }}
          style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#D1FF19', color: '#111', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> New Category
        </button>
      </div>

      {/* Two panels */}
      <div style={{ display: 'flex', flex: 1, padding: '0 32px 32px', gap: 20, overflow: 'hidden' }}>

        {/* Left list */}
        <div style={{ width: 256, flexShrink: 0, background: 'white', borderRadius: 12, border: '1px solid #EEEEE8', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #F2F2EE', flexShrink: 0 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: '#bbb', letterSpacing: '0.08em' }}>ALL CATEGORIES</span>
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {cats.map(cat => {
              const active = selectedId === cat.id;
              return (
                <div key={cat.id} onClick={() => setSelectedId(cat.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', cursor: 'pointer', transition: 'background 0.1s', background: active ? '#FAFDE8' : 'white', borderBottom: '1px solid #F8F8F4', borderLeft: `3px solid ${active ? '#D1FF19' : 'transparent'}` }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = '#FAFAF7'; }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'white'; }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>{cat.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.name}</div>
                    <div style={{ fontSize: 11, color: '#bbb', marginTop: 1 }}>{cat.subs.length} sub-categories</div>
                  </div>
                  <div style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, flexShrink: 0, background: cat.type === 'inflow' ? '#EDFDF5' : '#FDF0F0', color: cat.type === 'inflow' ? '#2A9D5C' : '#E05C5C', fontWeight: 500 }}>{cat.type}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right detail */}
        <div style={{ flex: 1, background: 'white', borderRadius: 12, border: '1px solid #EEEEE8', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          {selected ? (
            <>
              <div style={{ padding: '22px 28px', borderBottom: '1px solid #F2F2EE', display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
                <div style={{ width: 50, height: 50, borderRadius: '50%', background: selected.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{selected.icon}</div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#111', letterSpacing: '-0.02em' }}>{selected.name}</div>
                  <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>{selected.subs.length} sub-categories · {selected.type}</div>
                </div>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
                <div style={{ display: 'flex', gap: 16, marginBottom: 26 }}>
                  <div style={{ flex: 2 }}>
                    {sectionHead('CATEGORY NAME')}
                    <input value={editName} onChange={e => setEditName(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #E5E5E0', fontSize: 14, color: '#111', outline: 'none', boxSizing: 'border-box', fontWeight: 500 }}/>
                  </div>
                  <div style={{ flex: 1 }}>
                    {sectionHead('TYPE')}
                    <select value={editType} onChange={e => setEditType(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #E5E5E0', fontSize: 14, color: '#333', outline: 'none', background: 'white', boxSizing: 'border-box' }}>
                      <option value="outflow">Outflow</option>
                      <option value="inflow">Inflow</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: 26 }}>
                  {sectionHead('SUB-CATEGORIES')}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                    {selected.subs.map(s => (
                      <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 20, background: '#F5F5F2', border: '1px solid #EEEEE8' }}>
                        <span style={{ fontSize: 13, color: '#333' }}>{s}</span>
                        <span onClick={() => removeSub(s)} style={{ fontSize: 11, color: '#ccc', cursor: 'pointer', lineHeight: 1, padding: '0 2px' }}>✕</span>
                      </div>
                    ))}
                    {selected.subs.length === 0 && <span style={{ fontSize: 12, color: '#ccc', fontStyle: 'italic' }}>No sub-categories yet</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input value={newSub} onChange={e => setNewSub(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSub()} placeholder="Add sub-category…"
                      style={{ flex: 1, padding: '9px 14px', borderRadius: 8, border: '1.5px dashed #D1FF19', fontSize: 13, color: '#333', outline: 'none', background: '#FAFDE8' }}/>
                    <button onClick={addSub} style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: '#D1FF19', color: '#111', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Add</button>
                  </div>
                </div>

                <div style={{ background: '#F9F9F7', borderRadius: 10, padding: '18px 20px', marginBottom: 24, border: '1px solid #F0F0EA' }}>
                  {sectionHead('USAGE THIS MONTH')}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: selected.type === 'inflow' ? '#2A9D5C' : '#E05C5C', letterSpacing: '-0.02em' }}>
                        {selected.type === 'inflow' ? 'Rp 5.200.000' : '-Rp 2.200.000'}
                      </div>
                      <div style={{ fontSize: 12, color: '#bbb', marginTop: 2 }}>Total {selected.type} · April</div>
                    </div>
                    <MiniBar />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={handleSave} style={{ flex: 1, padding: '12px', borderRadius: 8, border: 'none', background: saved ? '#e8ff80' : '#D1FF19', color: '#111', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }}>
                    {saved ? 'Saved ✓' : 'Save Changes'}
                  </button>
                  <button onClick={deleteCategory} style={{ padding: '12px 20px', borderRadius: 8, border: '1px solid #FDEAEA', background: '#FDF8F8', color: '#E05C5C', fontSize: 13, cursor: 'pointer' }}>
                    Delete
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: 14 }}>
              Select a category to edit
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
