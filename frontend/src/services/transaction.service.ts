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

export interface AnalyticsData {
  monthly: AnalyticsMonthly[];
  categoryBreakdown: AnalyticsCategory[];
  incomeBreakdown: AnalyticsCategory[];
  insights: AnalyticsInsights;
}

export const transactionService = {
  getAll: (params?: Record<string, string>) => api.get<{ data: Transaction[] }>('/transactions', { params }),
  getSummary: (params?: Record<string, string>) => api.get<{ data: { totalIncome: number; totalExpense: number; balance: number } }>('/transactions/summary', { params }),
  getAnalytics: (month: string) => api.get<{ data: AnalyticsData }>('/transactions/analytics', { params: { month } }),
  create: (data: TransactionPayload) => api.post<{ data: Transaction }>('/transactions', data),
  update: (id: string, data: Partial<TransactionPayload>) => api.put<{ data: Transaction }>(`/transactions/${id}`, data),
  remove: (id: string) => api.delete(`/transactions/${id}`),
};
