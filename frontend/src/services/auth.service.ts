import api from './api';

export const authService = {
  register: (data: { email: string; name?: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<{ data: { token: string; user: { id: string; email: string; name?: string } } }>(
      '/auth/login',
      data
    ),
};
