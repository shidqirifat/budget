import api from './api';

export interface Category {
  id: string;
  name: string;
  typeId: string;
  userId: string | null;
  type: { id: string; name: string };
}

export interface SubCategory {
  id: string;
  name: string;
  categoryId: string;
  userId: string | null;
}

export const categoryService = {
  getAll: (params?: { typeId?: string }) => api.get<{ data: Category[] }>('/categories', { params }),
  create: (data: { name: string; typeId: string }) => api.post<{ data: Category }>('/categories', data),
  update: (id: string, data: { name: string; typeId: string }) => api.put<{ data: Category }>(`/categories/${id}`, data),
  remove: (id: string) => api.delete(`/categories/${id}`),
  getSubCategories: (categoryId: string) => api.get<{ data: SubCategory[] }>(`/categories/${categoryId}/sub-categories`),
  createSubCategory: (categoryId: string, data: { name: string }) => api.post<{ data: SubCategory }>(`/categories/${categoryId}/sub-categories`, data),
};
