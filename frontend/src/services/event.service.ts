import api from './api';

export interface BudgetEvent {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
}

export interface EventPayload {
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
}

export const eventService = {
  getAll: () => api.get<{ data: BudgetEvent[] }>('/events'),
  create: (data: EventPayload) => api.post<{ data: BudgetEvent }>('/events', data),
  update: (id: string, data: Partial<EventPayload>) => api.put<{ data: BudgetEvent }>(`/events/${id}`, data),
  remove: (id: string) => api.delete(`/events/${id}`),
};
