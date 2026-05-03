import api from './api';

export interface Category {
  id: string;
  name: string;
  icon: string | null;
  typeId: string;
  userId: string | null;
  type: { id: string; name: string };
}

export interface SubCategory {
  id: string;
  name: string;
  icon: string | null;
  categoryId: string;
  userId: string | null;
}

export interface CategoryStats {
  months: { label: string; total: number }[];
  currentMonthTotal: number;
}

export const categoryService = {
  getAll: (params?: { typeId?: string }) => api.get<{ data: Category[] }>('/categories', { params }),
  create: (data: { name: string; typeId: string; icon?: string | null }) => api.post<{ data: Category }>('/categories', data),
  update: (id: string, data: { name: string; typeId: string; icon?: string | null }) => api.put<{ data: Category }>(`/categories/${id}`, data),
  remove: (id: string) => api.delete(`/categories/${id}`),
  getSubCategories: (categoryId: string) => api.get<{ data: SubCategory[] }>(`/categories/${categoryId}/sub-categories`),
  createSubCategory: (categoryId: string, data: { name: string; icon?: string | null }) => api.post<{ data: SubCategory }>(`/categories/${categoryId}/sub-categories`, data),
  updateSubCategory: (id: string, data: { name: string; icon?: string | null }) => api.put<{ data: SubCategory }>(`/sub-categories/${id}`, data),
  removeSubCategory: (id: string) => api.delete(`/sub-categories/${id}`),
  getStats: (categoryId: string) => api.get<{ data: CategoryStats }>(`/categories/${categoryId}/stats`),
};
