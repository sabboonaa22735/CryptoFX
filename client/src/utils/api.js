const API_BASE = import.meta.env.VITE_API_URL || '';

export const API_URL = (path) => `${API_BASE}/api${path}`;

export const fetchAPI = (path, options = {}) => {
  const token = localStorage.getItem('token');
  return fetch(API_URL(path), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  }).then(res => res.json());
};
