/**
 * HNTR LEGEND Web - API Client
 * Kommuniziert mit Backend API für Sync zwischen Mobile & Web
 */

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Axios Instance mit Auth
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth Token aus LocalStorage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Authentication
 */
export const auth = {
  register: async (email: string, password: string, name: string) => {
    const response = await apiClient.post('/auth/register', { email, password, name });
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

/**
 * Hunts (Jagd-Einträge)
 */
export const hunts = {
  list: async (revierId?: string) => {
    const response = await apiClient.get('/hunts', { params: { revierId } });
    return response.data;
  },

  get: async (id: string) => {
    const response = await apiClient.get(`/hunts/${id}`);
    return response.data;
  },

  create: async (hunt: any) => {
    const response = await apiClient.post('/hunts', hunt);
    return response.data;
  },

  update: async (id: string, hunt: any) => {
    const response = await apiClient.put(`/hunts/${id}`, hunt);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/hunts/${id}`);
    return response.data;
  },
};

/**
 * Shot Analysis
 */
export const shotAnalysis = {
  analyze: async (data: {
    distance: number;
    direction: string;
    wildReaction: string;
    bloodColor: string;
    bloodAmount: string;
    bloodDistribution: string;
    bloodHeight: string;
    photo?: File;
  }) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value);
      }
    });

    const response = await apiClient.post('/shot-analysis/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getHistory: async () => {
    const response = await apiClient.get('/shot-analysis/history');
    return response.data;
  },
};

/**
 * Map Features
 */
export const mapFeatures = {
  list: async (revierId: string, type?: string) => {
    const response = await apiClient.get('/map-features', { params: { revierId, type } });
    return response.data;
  },

  create: async (feature: any) => {
    const response = await apiClient.post('/map-features', feature);
    return response.data;
  },

  update: async (id: string, feature: any) => {
    const response = await apiClient.put(`/map-features/${id}`, feature);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/map-features/${id}`);
    return response.data;
  },
};

/**
 * Statistics
 */
export const statistics = {
  overview: async (revierId?: string) => {
    const response = await apiClient.get('/statistics/overview', { params: { revierId } });
    return response.data;
  },

  byHitZone: async () => {
    const response = await apiClient.get('/statistics/hit-zones');
    return response.data;
  },

  byWildlife: async () => {
    const response = await apiClient.get('/statistics/wildlife');
    return response.data;
  },

  monthly: async (year: number) => {
    const response = await apiClient.get('/statistics/monthly', { params: { year } });
    return response.data;
  },
};

/**
 * Training Data Uploads
 */
export const trainingData = {
  upload: async (file: File, metadata: {
    dataType: string;
    wildart?: string;
    notes?: string;
  }) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('dataType', metadata.dataType);
    if (metadata.wildart) formData.append('wildart', metadata.wildart);
    if (metadata.notes) formData.append('notes', metadata.notes);

    const response = await apiClient.post('/training-data/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
        console.log(`Upload progress: ${percentCompleted}%`);
      },
    });
    return response.data;
  },

  getUserStats: async () => {
    const response = await apiClient.get('/training-data/user-stats');
    return response.data;
  },

  getLeaderboard: async () => {
    const response = await apiClient.get('/training-data/leaderboard');
    return response.data;
  },

  getProgress: async () => {
    const response = await apiClient.get('/training-data/progress');
    return response.data;
  },
};

/**
 * Sync
 */
export const sync = {
  // Push lokale Änderungen zum Server
  push: async (changes: any[]) => {
    const response = await apiClient.post('/sync/push', { changes });
    return response.data;
  },

  // Pull Server-Änderungen
  pull: async (lastSyncTimestamp?: string) => {
    const response = await apiClient.get('/sync/pull', { 
      params: { since: lastSyncTimestamp } 
    });
    return response.data;
  },

  // Full Sync (Push + Pull)
  full: async (localData: any, lastSyncTimestamp?: string) => {
    const response = await apiClient.post('/sync/full', { 
      localData,
      lastSyncTimestamp 
    });
    return response.data;
  },
};

export default apiClient;
