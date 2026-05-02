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

export const transactionService = {
  getAll: (params?: Record<string, string>) => api.get<{ data: Transaction[] }>('/transactions', { params }),
  getSummary: (params?: Record<string, string>) => api.get<{ data: { totalIncome: number; totalExpense: number; balance: number } }>('/transactions/summary', { params }),
  create: (data: TransactionPayload) => api.post<{ data: Transaction }>('/transactions', data),
  update: (id: string, data: Partial<TransactionPayload>) => api.put<{ data: Transaction }>(`/transactions/${id}`, data),
  remove: (id: string) => api.delete(`/transactions/${id}`),
};
