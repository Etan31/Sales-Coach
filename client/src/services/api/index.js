import { http } from '../httpClient.js';

// Thin wrappers over http hitting the contract paths in docs/contracts.md.
// VITE_API_BASE_URL already includes the /api prefix.

export const configApi = {
  get: () => http.get('/config')
};

export const profileApi = {
  get: () => http.get('/profile')
};

export const sessionApi = {
  create: (payload) => http.post('/session', payload),
  get: (id) => http.get(`/session/${id}`),
  history: ({ page, pageSize } = {}) => http.get('/history', { params: { page, pageSize } }),
  end: ({ sessionId }) => http.post('/end-session', { sessionId })
};

export const chatApi = {
  send: ({ sessionId, message }) => http.post('/chat', { sessionId, message })
};

export const statsApi = {
  get: () => http.get('/statistics')
};
