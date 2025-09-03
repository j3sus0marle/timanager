// src/utils/axiosInterceptor.ts
import axios from 'axios';

// Configurar URL base
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

// Configurar interceptor para añadir token automáticamente
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar respuestas de error (tokens expirados)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token inválido o expirado
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axios;
