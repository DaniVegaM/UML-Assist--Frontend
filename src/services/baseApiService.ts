import type { AxiosInstance } from "axios";
import axios from "axios";
import { getAccessToken, clearStorage } from "../helpers/auth";


// Instancia base de axios
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const isAuthRoute = config.url?.includes('/auth/'); //No incluimos las rutas de auth
    
    if (!isAuthRoute) {
      const token = getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación sin refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const isAuthRoute = originalRequest.url?.includes('/auth/'); // No incluimos las rutas de auth
    if (isAuthRoute) return Promise.reject(error);

    clearStorage();
    window.location.href = '/iniciar-sesion';
    return Promise.reject(error);
  }
);

export default api;