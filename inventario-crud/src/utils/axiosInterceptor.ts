// src/utils/axiosInterceptor.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Configurar headers por defecto
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Lista de rutas que no requieren autenticación
const publicRoutes = [
  'auth/login',
  'auth/register',
  'inventory-requests'  // Solo la creación de solicitudes no requiere autenticación
];

// Configurar interceptor para añadir token automáticamente
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  // Verificar si la ruta es pública
  const url = config.url || '';
  
  // Extraer la ruta relativa después de la URL base
  let relativePath = url;
  if (url.startsWith(API_URL)) {
    relativePath = url.substring(API_URL.length);
  }
  
  const isPublicRoute = publicRoutes.some(route => {
    if (route === 'inventory-requests') {
      return relativePath.startsWith(route) && config.method?.toLowerCase() === 'post';
    }
    return relativePath.startsWith(route);
  });

  // Si no es una ruta pública y hay headers, añadir el token
  if (!isPublicRoute && config.headers) {
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('No se encontró token para ruta protegida:', url);
    }
  }

  console.log('Request:', {
    url,
    relativePath,
    isPublicRoute,
    hasToken: !!token,
    method: config.method,
    headers: config.headers
  });

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Variable para evitar múltiples redirecciones
let isRedirecting = false;

// Interceptor para manejar respuestas de error (tokens expirados)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.log('Error Response:', {
        status: error.response.status,
        message: error.response.data?.message,
        url: error.config?.url
      });

      if ((error.response.status === 401 || error.response.status === 403) && !isRedirecting) {
        console.log('Token inválido o expirado, redirigiendo al login...');
        // Token inválido o expirado
        isRedirecting = true;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Usar un timeout para evitar problemas de estado
        setTimeout(() => {
          window.location.href = '/login';
          isRedirecting = false;
        }, 100);
      }
    }
    return Promise.reject(error);
  }
);

export default axios;
