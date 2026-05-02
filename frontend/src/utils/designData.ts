export const CATEGORIES_DATA = [
  { id: 1, name: 'Family',       icon: '🏠', color: '#E05C5C', bg: '#FDF0F0', type: 'outflow', subs: ['Jidah','Aqyla','Tante Yani','Uang bulanan','Kebutuhan rumah'] },
  { id: 2, name: 'Investment',   icon: '📈', color: '#2A9D5C', bg: '#F0FDF5', type: 'outflow', subs: ['Cicilan rumah','Saham','Reksa dana'] },
  { id: 3, name: 'Food & Drink', icon: '🍽️', color: '#E8A040', bg: '#FDF8EC', type: 'outflow', subs: ['Groceries','Restoran','Kafe','Delivery'] },
  { id: 4, name: 'Transport',    icon: '🚗', color: '#5C8AE0', bg: '#F0F4FD', type: 'outflow', subs: ['Grab','Bensin','Parkir','Tol'] },
  { id: 5, name: 'Health',       icon: '🏥', color: '#A05CE0', bg: '#F5F0FD', type: 'outflow', subs: ['Apotek','Dokter','Gym','Vitamin'] },
  { id: 6, name: 'Education',    icon: '📚', color: '#E05CA0', bg: '#FDF0F8', type: 'outflow', subs: ['Kursus','Buku','Workshop'] },
  { id: 7, name: 'Utilities',    icon: '💡', color: '#40C4BE', bg: '#F0FDFC', type: 'outflow', subs: ['Listrik','Air','Internet','Gas'] },
  { id: 8, name: 'Shopping',     icon: '🛍️', color: '#E8A05C', bg: '#FDF6F0', type: 'outflow', subs: ['Pakaian','Elektronik','Rumah tangga'] },
  { id: 9, name: 'Income',       icon: '💰', color: '#2A9D5C', bg: '#F0FDF5', type: 'inflow',  subs: ['Gaji','Bonus','Freelance','Investasi cair'] },
];

export const EVENTS_DATA = [
  { id: 1, name: 'Lebaran 2026', month: '2026-04' },
  { id: 2, name: 'Mudik April',  month: '2026-04' },
];

export const TRANSACTIONS_DATA = [
  { id: 1,  date: '2026-04-24', categoryId: 1, sub: 'Jidah',         desc: 'Jidah + Aqyla + tante Yani', amount: -500000  },
  { id: 2,  date: '2026-04-24', categoryId: 2, sub: 'Cicilan rumah', desc: 'Cicilan rumah Citayam',       amount: -1000000 },
  { id: 3,  date: '2026-04-24', categoryId: 1, sub: 'Uang bulanan',  desc: 'Uang bulanan',                amount: -700000  },
  { id: 4,  date: '2026-04-20', categoryId: 9, sub: 'Gaji',          desc: 'Gaji April 2026',             amount: 5200000  },
  { id: 5,  date: '2026-04-20', categoryId: 3, sub: 'Groceries',     desc: 'Alfamart Citayam',            amount: -180000  },
  { id: 6,  date: '2026-04-18', categoryId: 4, sub: 'Grab',          desc: 'Grab ke kantor',              amount: -45000   },
  { id: 7,  date: '2026-04-15', categoryId: 3, sub: 'Restoran',      desc: 'Makan siang kantin',          amount: -85000   },
  { id: 8,  date: '2026-04-10', categoryId: 5, sub: 'Apotek',        desc: 'Apotek Century',              amount: -120000  },
  { id: 9,  date: '2026-04-05', categoryId: 7, sub: 'Listrik',       desc: 'PLN bulan April',             amount: -350000  },
  { id: 10, date: '2026-04-03', categoryId: 7, sub: 'Internet',      desc: 'IndiHome April',              amount: -250000  },
];

export type Transaction = typeof TRANSACTIONS_DATA[number];
export type Category = typeof CATEGORIES_DATA[number];

export const formatRp = (amount: number): string => {
  const abs = Math.abs(amount);
  const str = abs.toLocaleString('id-ID');
  if (amount < 0) return `-Rp ${str}`;
  if (amount > 0) return `Rp ${str}`;
  return 'Rp 0';
};

export const groupByDate = (txs: Transaction[]) => {
  const groups: Record<string, Transaction[]> = {};
  txs.forEach(tx => {
    if (!groups[tx.date]) groups[tx.date] = [];
    groups[tx.date].push(tx);
  });
  return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
};

export const getCategoryById = (id: number) => CATEGORIES_DATA.find(c => c.id === id);

import dayjs from '@/utils/dayjs';

export const parseDateInfo = (dateStr: string) => {
  const d = dayjs(dateStr);
  return {
    day:     d.date(),
    dayName: d.format('dddd'),
    month:   d.format('MMMM'),
    year:    d.year(),
  };
};
