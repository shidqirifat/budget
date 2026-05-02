import api from './api';

export interface TransactionType {
  id: string;
  name: string; // 'income' | 'expense'
}

export const transactionTypeService = {
  getAll: () => api.get<{ data: TransactionType[] }>('/transaction-types'),
};
