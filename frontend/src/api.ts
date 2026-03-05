import axios from 'axios';
import { Character } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const characterApi = {
  getAll: () => api.get<Character[]>('/characters'),
  getById: (id: number) => api.get<Character>(`/characters/${id}`),
  create: (character: Omit<Character, 'id' | 'created_at' | 'updated_at'>) => 
    api.post<Character>('/characters', character),
  update: (id: number, character: Partial<Character>) => 
    api.put<Character>(`/characters/${id}`, character),
  delete: (id: number) => api.delete(`/characters/${id}`),
};

export default api;

