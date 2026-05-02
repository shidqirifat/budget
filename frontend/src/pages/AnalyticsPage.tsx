import { useState } from 'react';
import MonthNav, { MONTH_LABELS, MONTH_LIST } from '@/components/MonthNav';
import { CATEGORIES_DATA, formatRp } from '@/utils/designData';

const ALL_MONTHS_DATA: Record<string, { label: string; short: string; inflow: number; outflow: number; cats: { name: string; icon: string; color: string; amount: number }[] }> = {
  '2025-11': { label:'November 2025', short:'Nov', inflow:4800000, outflow:3200000, cats:[
    { name:'Family', icon:'🏠', color:'#E05C5C', amount:1400000 },
    { name:'Investment', icon:'📈', color:'#2A9D5C', amount:1000000 },
    { name:'Food', icon:'🍽️', color:'#E8A040', amount:310000 },
    { name:'Transport', icon:'🚗', color:'#5C8AE0', amount:80000 },
    { name:'Utilities', icon:'💡', color:'#40C4BE', amount:260000 },
    { name:'Health', icon:'🏥', color:'#A05CE0', amount:150000 },
  ]},
  '2025-12': { label:'December 2025', short:'Dec', inflow:5200000, outflow:4100000, cats:[
    { name:'Family', icon:'🏠', color:'#E05C5C', amount:2100000 },
    { name:'Investment', icon:'📈', color:'#2A9D5C', amount:1000000 },
    { name:'Food', icon:'🍽️', color:'#E8A040', amount:520000 },
    { name:'Transport', icon:'🚗', color:'#5C8AE0', amount:110000 },
    { name:'Utilities', icon:'💡', color:'#40C4BE', amount:260000 },
    { name:'Health', icon:'🏥', color:'#A05CE0', amount:110000 },
  ]},
  '2026-01': { label:'January 2026', short:'Jan', inflow:5200000, outflow:3600000, cats:[
    { name:'Family', icon:'🏠', color:'#E05C5C', amount:1600000 },
    { name:'Investment', icon:'📈', color:'#2A9D5C', amount:1000000 },
    { name:'Food', icon:'🍽️', color:'#E8A040', amount:410000 },
    { name:'Transport', icon:'🚗', color:'#5C8AE0', amount:90000 },
    { name:'Utilities', icon:'💡', color:'#40C4BE', amount:360000 },
    { name:'Health', icon:'🏥', color:'#A05CE0', amount:140000 },
  ]},
  '2026-02': { label:'February 2026', short:'Feb', inflow:5200000, outflow:3100000, cats:[
    { name:'Family', icon:'🏠', color:'#E05C5C', amount:1300000 },
    { name:'Investment', icon:'📈', color:'#2A9D5C', amount:1000000 },
    { name:'Food', icon:'🍽️', color:'#E8A040', amount:290000 },
    { name:'Transport', icon:'🚗', color:'#5C8AE0', amount:60000 },
    { name:'Utilities', icon:'💡', color:'#40C4BE', amount:310000 },
    { name:'Health', icon:'🏥', color:'#A05CE0', amount:140000 },
  ]},
  '2026-03': { label:'March 2026', short:'Mar', inflow:5500000, outflow:3400000, cats:[
    { name:'Family', icon:'🏠', color:'#E05C5C', amount:1700000 },
    { name:'Investment', icon:'📈', color:'#2A9D5C', amount:1000000 },
    { name:'Food', icon:'🍽️', color:'#E8A040', amount:310000 },
    { name:'Transport', icon:'🚗', color:'#5C8AE0', amount:80000 },
    { name:'Utilities', icon:'💡', color:'#40C4BE', amount:600000 },
    { name:'Health', icon:'🏥', color:'#A05CE0', amount:110000 },
  ]},
  '2026-04': { label:'April 2026', short:'Apr', inflow:5200000, outflow:3230000, cats:[
    { name:'Family', icon:'🏠', color:'#E05C5C', amount:2200000 },
    { name:'Investment', icon:'📈', color:'#2A9D5C', amount:1000000 },
    { name:'Food', icon:'🍽️', color:'#E8A040', amount:265000 },
    { name:'Transport', icon:'🚗', color:'#5C8AE0', amount:45000 },
    { name:'Health', icon:'🏥', color:'#A05CE0', amount:120000 },
    { name:'Utilities', icon:'💡', color:'#40C4BE', amount:600000 },
  ]},
};

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'categories'>('overview');
  const [month, setMonth] = useState('2026-04');

  const cur = ALL_MONTHS_DATA[month];
  const idx = MONTH_LIST.indexOf(month);
  const prevKey = idx > 0 ? MONTH_LIST[idx - 1] : null;
  const prev = prevKey ? ALL_MONTHS_DATA[prevKey] : null;

  const net = cur.inflow - cur.outflow;
  const savingsRate = Math.round((net / cur.inflow) * 100);
  const totalOut = cur.cats.reduce((s, c) => s + c.amount, 0);
  const diffInflow  = prev ? cur.inflow  - prev.inflow  : 0;
  const diffOutflow = prev ? cur.outflow - prev.outflow : 0;
  const pctInflow   = prev ? Math.round(Math.abs(diffInflow)  / prev.inflow  * 100) : 0;
  const pctOutflow  = prev ? Math.round(Math.abs(diffOutflow) / prev.outflow * 100) : 0;

  const chartMonths = MONTH_LIST.slice(Math.max(0, idx - 5), idx + 1).map(m => ALL_MONTHS_DATA[m]).filter(Boolean);
  const compTable = cur.cats.map(c => {
    const prevCat = prev?.cats.find(p => p.name === c.name);
    return { ...c, prevAmt: prevCat?.amount || 0, diff: c.amount - (prevCat?.amount || 0) };
  });

  const Stat = ({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) => (
    <div style={{ background: 'white', borderRadius: 12, padding: '18px 22px', border: '1px solid #EEEEE8', flex: 1 }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: '#bbb', letterSpacing: '0.07em', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: color || '#111', letterSpacing: '-0.02em' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#bbb', marginTop: 4 }}>{sub}</div>}
    </div>
  );

  const BarChart = () => {
    const maxVal = Math.max(...chartMonths.map(m => Math.max(m.inflow, m.outflow)));
    const BAR_H = 160, BAR_W = 28, GAP = 14;
    const GROUP = BAR_W * 2 + GAP;
    const TOTAL = chartMonths.length * (GROUP + 20);
    return (
      <svg width={TOTAL + 40} height={BAR_H + 48} style={{ overflow: 'visible', display: 'block' }}>
        {[0, 0.25, 0.5, 0.75, 1].map((v, i) => (
          <g key={i}>
            <line x1={0} y1={BAR_H - v * BAR_H} x2={TOTAL + 20} y2={BAR_H - v * BAR_H} stroke="#F0F0EA" strokeWidth="1" strokeDasharray={v === 0 ? 'none' : '4,4'}/>
            <text x={-8} y={BAR_H - v * BAR_H + 4} textAnchor="end" fontSize={9} fill="#ccc" fontFamily="'Space Grotesk',sans-serif">
              {v === 0 ? '0' : `${(v * maxVal / 1000000).toFixed(1)}jt`}
            </text>
          </g>
        ))}
        {chartMonths.map((m, i) => {
          const isCur = m.short === cur.short;
          const x = i * (GROUP + 20) + 10;
          const inH  = Math.round((m.inflow  / maxVal) * BAR_H);
          const outH = Math.round((m.outflow / maxVal) * BAR_H);
          return (
            <g key={i}>
              {isCur && <rect x={x - 4} y={-8} width={GROUP + 8} height={BAR_H + 8} rx={6} fill="#F5FFF0" stroke="#D1FF19" strokeWidth="1.5" style={{ opacity: 0.4 }}/>}
              <rect x={x}            y={BAR_H - inH}  width={BAR_W} height={inH}  rx={4} fill={isCur ? '#2A9D5C' : '#DCEEE5'}/>
              <rect x={x + BAR_W + GAP} y={BAR_H - outH} width={BAR_W} height={outH} rx={4} fill={isCur ? '#D1FF19' : '#EAEAE4'}/>
              <text x={x + GROUP / 2} y={BAR_H + 18} textAnchor="middle" fontSize={11} fontWeight={isCur ? 700 : 400} fill={isCur ? '#111' : '#bbb'} fontFamily="'Space Grotesk',sans-serif">
                {m.short}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  const DonutChart = () => {
    const SIZE = 140, CX = 70, CY = 70, R = 56, IR = 36;
    let angle = -Math.PI / 2;
    const slices = cur.cats.map(c => {
      const pct = c.amount / totalOut;
      const sa = angle, ea = angle + pct * Math.PI * 2;
      const x1 = CX + R * Math.cos(sa), y1 = CY + R * Math.sin(sa);
      const x2 = CX + R * Math.cos(ea), y2 = CY + R * Math.sin(ea);
      angle = ea;
      return { ...c, pct, x1, y1, x2, y2, lrg: pct > 0.5 ? 1 : 0 };
    });
    return (
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {slices.map((s, i) => (
          <path key={i} d={`M${CX},${CY} L${s.x1},${s.y1} A${R},${R} 0 ${s.lrg},1 ${s.x2},${s.y2} Z`} fill={s.color}/>
        ))}
        <circle cx={CX} cy={CY} r={IR} fill="white"/>
        <text x={CX} y={CY - 4} textAnchor="middle" fontSize={10} fontWeight={700} fill="#111" fontFamily="'Space Grotesk',sans-serif">Total</text>
        <text x={CX} y={CY + 10} textAnchor="middle" fontSize={9} fill="#888" fontFamily="'Space Grotesk',sans-serif">{cur.short}</text>
      </svg>
    );
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#F5F5F2', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ padding: '28px 32px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111', margin: 0, letterSpacing: '-0.02em' }}>Analytics</h1>
          <p style={{ fontSize: 13, color: '#999', margin: '3px 0 0' }}>{cur.label}{prev ? ` · vs ${prev.label}` : ''}</p>
        </div>
        <MonthNav month={month} setMonth={setMonth}/>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', padding: '18px 32px 0', gap: 6, flexShrink: 0 }}>
        {([['overview','Overview'],['categories','By Category']] as const).map(([id, lbl]) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{ padding: '8px 20px', borderRadius: 8, cursor: 'pointer', background: activeTab === id ? '#111' : 'white', color: activeTab === id ? '#D1FF19' : '#888', fontSize: 13, fontWeight: activeTab === id ? 700 : 400, border: activeTab !== id ? '1px solid #EEEEE8' : 'none' }}>
            {lbl}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 32px 40px' }}>

        {activeTab === 'overview' && (
          <>
            <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
              <Stat label="INFLOW"  value={formatRp(cur.inflow)}  sub={prev ? `${diffInflow >= 0 ? '+' : '-'}${pctInflow}% vs ${prev.short}` : 'No prev month'} color="#2A9D5C"/>
              <Stat label="OUTFLOW" value={formatRp(-cur.outflow)} sub={prev ? `${diffOutflow >= 0 ? '+' : '-'}${pctOutflow}% vs ${prev.short}` : 'No prev month'} color="#E05C5C"/>
              <Stat label="NET"     value={formatRp(net)} sub={net >= 0 ? 'Positive cash flow ✓' : 'Negative cash flow ✗'} color={net >= 0 ? '#111' : '#E05C5C'}/>
              <Stat label="SAVINGS RATE" value={`${savingsRate}%`} sub={savingsRate >= 30 ? 'Target: 30% ✓' : 'Below 30% target'} color="#D1FF19" />
            </div>

            <div style={{ background: 'white', borderRadius: 12, padding: '22px 28px', border: '1px solid #EEEEE8', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>Monthly Cash Flow</div>
                  <div style={{ fontSize: 12, color: '#bbb', marginTop: 3 }}>{chartMonths[0]?.label} – {cur.label}</div>
                </div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  {[['#2A9D5C','Inflow'],['#D1FF19','Outflow']].map(([col, lbl]) => (
                    <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: col }}/>
                      <span style={{ fontSize: 12, color: '#888' }}>{lbl}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ overflowX: 'auto' }}><BarChart/></div>
              {prev && (
                <div style={{ marginTop: 18, padding: '12px 16px', background: '#FAFDE8', borderRadius: 8, border: '1px solid #E8F5A0', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: 16 }}>{diffOutflow > 0 ? '📈' : '📉'}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>Outflow {diffOutflow > 0 ? 'increased' : 'decreased'} by {formatRp(Math.abs(diffOutflow))} vs {prev.short}</div>
                    <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{[...compTable].sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))[0]?.name} category is the main driver</div>
                  </div>
                </div>
              )}
            </div>

            {prev && (
              <div style={{ background: 'white', borderRadius: 12, padding: '22px 28px', border: '1px solid #EEEEE8' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 16 }}>{cur.short} vs {prev.short}</div>
                <div style={{ display: 'flex', padding: '0 0 10px', borderBottom: '1px solid #F2F2EE', marginBottom: 8 }}>
                  {['Category', prev.short, cur.short, 'Diff'].map((h, i) => (
                    <div key={h} style={{ flex: i === 0 ? 2 : 1, fontSize: 10, fontWeight: 600, color: '#bbb', letterSpacing: '0.07em', textAlign: i === 0 ? 'left' : 'right' }}>{h}</div>
                  ))}
                </div>
                {compTable.map((row, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: i < compTable.length - 1 ? '1px solid #F8F8F4' : 'none' }}>
                    <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16 }}>{row.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#333' }}>{row.name}</span>
                    </div>
                    <div style={{ flex: 1, textAlign: 'right', fontSize: 13, color: '#888' }}>{row.prevAmt ? formatRp(-row.prevAmt) : '—'}</div>
                    <div style={{ flex: 1, textAlign: 'right', fontSize: 13, fontWeight: 600, color: '#333' }}>{formatRp(-row.amount)}</div>
                    <div style={{ flex: 1, textAlign: 'right', fontSize: 13, fontWeight: 700, color: row.diff > 0 ? '#E05C5C' : '#2A9D5C' }}>{row.diff === 0 ? '—' : `${row.diff > 0 ? '+' : ''}${formatRp(row.diff)}`}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'categories' && (
          <div style={{ display: 'flex', gap: 20 }}>
            <div style={{ background: 'white', borderRadius: 12, padding: '22px 28px', border: '1px solid #EEEEE8', width: 300, flexShrink: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 4 }}>Outflow by Category</div>
              <div style={{ fontSize: 12, color: '#bbb', marginBottom: 20 }}>{cur.label} · Total {formatRp(-totalOut)}</div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}><DonutChart/></div>
              {cur.cats.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.color, flexShrink: 0 }}/>
                  <span style={{ fontSize: 13, color: '#333', flex: 1 }}>{c.icon} {c.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#888' }}>{Math.round(c.amount / totalOut * 100)}%</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#E05C5C', minWidth: 90, textAlign: 'right' }}>{formatRp(-c.amount)}</span>
                </div>
              ))}
            </div>
            <div style={{ flex: 1 }}>
              {cur.cats.map((cat, ci) => {
                const catData = CATEGORIES_DATA.find(c => c.name === cat.name);
                const subAmts = catData?.subs.slice(0, 3).map((s, i) => ({ s, pct: [0.5, 0.3, 0.2][i] })) || [];
                const pct = Math.round(cat.amount / totalOut * 100);
                return (
                  <div key={ci} style={{ background: 'white', borderRadius: 12, padding: '18px 22px', border: '1px solid #EEEEE8', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <span style={{ fontSize: 18 }}>{cat.icon}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#111', flex: 1 }}>{cat.name}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#E05C5C' }}>{formatRp(-cat.amount)}</span>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: '#F5F5F2', color: '#888' }}>{pct}% of total</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: '#F2F2EE', overflow: 'hidden', marginBottom: 10 }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: cat.color, borderRadius: 3, transition: 'width 0.4s ease' }}/>
                    </div>
                    {subAmts.map(({ s, pct: sp }, si) => (
                      <div key={si} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0' }}>
                        <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#ddd', flexShrink: 0 }}/>
                        <span style={{ fontSize: 12, color: '#888', flex: 1 }}>{s}</span>
                        <span style={{ fontSize: 11, color: '#bbb' }}>{Math.round(sp * 100)}%</span>
                        <span style={{ fontSize: 12, fontWeight: 500, color: '#aaa', minWidth: 70, textAlign: 'right' }}>{formatRp(-Math.round(cat.amount * sp))}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
