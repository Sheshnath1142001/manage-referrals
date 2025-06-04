
import { api } from './client';

export const usersApi = {
  getUsers: () => api.get('/users')
};
