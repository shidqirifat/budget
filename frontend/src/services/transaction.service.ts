import api from './api';

export interface Transaction {
  id: string;
  amount: number;
  typeId: string;
  categoryId: string;
  subCategoryId?: string;
  eventId?: string;
  date: string;
  note?: string;
  type: { id: string; name: string };
  category: { id: string; name: string };
  subCategory?: { id: string; name: string };
  event?: { id: string; name: string };
}

export interface TransactionPayload {
  amount: number;
  typeId: string;
  categoryId: string;
  subCategoryId?: string;
  eventId?: string;
  date: string;
  note?: string;
}

export interface AnalyticsMonthly {
  month: string;
  inflow: number;
  outflow: number;
}

export interface AnalyticsCategorySub {
  name: string;
  amount: number;
}

export interface AnalyticsCategory {
  categoryId: string;
  name: string;
  amount: number;
  prevAmount: number;
  subs: AnalyticsCategorySub[];
}

export interface AnalyticsCategoryDiff {
  categoryId: string;
  name: string;
  current: number;
  prev: number;
  diff: number;
}

export interface AnalyticsInsights {
  mostExpenseCategory: { name: string; amount: number } | null;
  mostFrequentExpense: { name: string; count: number } | null;
  mostIncomeCategory: { name: string; amount: number } | null;
  expenseDiff: AnalyticsCategoryDiff[];
  incomeDiff: AnalyticsCategoryDiff[];
}

export interface AnalyticsEventSummary {
  runningEventCount: number;
  mostExpensiveEvent: { name: string; total: number } | null;
}

export interface AnalyticsData {
  monthly: AnalyticsMonthly[];
  categoryBreakdown: AnalyticsCategory[];
  incomeBreakdown: AnalyticsCategory[];
  insights: AnalyticsInsights;
  eventSummary: AnalyticsEventSummary;
}

export interface ImportRowPayload {
  date: string;
  amount: string;
  type: string;
  category: string;
  sub_category?: string;
  note?: string;
}

export interface ImportRowResult {
  index: number;
  status: 'ok' | 'error';
  errors: string[];
}

export interface ImportResult {
  imported: number;
  errors: number;
  results: ImportRowResult[];
}

export const transactionService = {
  getAll: (params?: Record<string, string>) => api.get<{ data: Transaction[] }>('/transactions', { params }),
  getSummary: (params?: Record<string, string>) => api.get<{ data: { totalIncome: number; totalExpense: number; balance: number } }>('/transactions/summary', { params }),
  getAnalytics: (month: string) => api.get<{ data: AnalyticsData }>('/transactions/analytics', { params: { month } }),
  create: (data: TransactionPayload) => api.post<{ data: Transaction }>('/transactions', data),
  update: (id: string, data: Partial<TransactionPayload>) => api.put<{ data: Transaction }>(`/transactions/${id}`, data),
  remove: (id: string) => api.delete(`/transactions/${id}`),
  patchEvent: (id: string, eventId: string | null) => api.patch<{ data: Transaction }>(`/transactions/${id}/event`, { eventId }),
  importRows: (rows: ImportRowPayload[]) => api.post<{ data: ImportResult }>('/transactions/import', { rows }),
  exportUrl: (format: 'csv' | 'json' = 'csv', params?: { from?: string; to?: string; eventId?: string }) => {
    const baseUrl = import.meta.env.VITE_API_URL ?? '/api';
    const token = localStorage.getItem('token') ?? '';
    const query = new URLSearchParams({ format });
    if (params?.from) query.set('from', params.from);
    if (params?.to) query.set('to', params.to);
    if (params?.eventId) query.set('eventId', params.eventId);
    return { url: `${baseUrl}/transactions/export?${query}`, token };
  },
};
