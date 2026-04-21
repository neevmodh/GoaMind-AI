import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

// Request interceptor: log all requests in development
api.interceptors.request.use((config) => {
  if (import.meta.env.DEV) {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
  }
  return config;
});

// Response interceptor: handle errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[API Error]:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Location Exports
export const getLocations = (params) => api.get('/api/locations', { params }).then(res => res.data);
export const getLocation = (id) => api.get(`/api/locations/${id}`).then(res => res.data);
export const createLocation = (data) => api.post('/api/locations', data).then(res => res.data);
export const updateLocation = (id, data) => api.put(`/api/locations/${id}`, data).then(res => res.data);
export const deleteLocation = (id) => api.delete(`/api/locations/${id}`).then(res => res.data);

// Decision Engine
export const getRecommended = () => api.get('/api/locations/recommended').then(res => res.data);

// Weather
export const getWeather = () => api.get('/api/weather').then(res => res.data);

// Itinerary
export const generateItinerary = (data) => api.post('/api/itinerary/generate', data).then(res => res.data);

// Chat
export const sendChatMessage = (data) => api.post('/api/chat/message', data).then(res => res.data);
export const getChatSuggestions = () => api.get('/api/chat/suggestions').then(res => res.data);

// Fallback to prevent Step 1 hooks from breaking before they are refactored
export default api;
