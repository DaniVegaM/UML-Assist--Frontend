import type { AxiosInstance } from "axios";
import axios from "axios";
import { getAccessToken, getRefreshToken, clearStorage } from "../helpers/auth";


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

// Interceptor para manejar refresh automático cuando se realiza un request y el token ya expiró
api.interceptors.response.use(
  (response) => response, 
  async (error) => {
    const originalRequest = error.config;

    const isAuthRoute = originalRequest.url?.includes('/auth/'); //No incluimos las rutas de auth

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/user/auth/refresh/`, {
            refresh_token: refreshToken
          });

          const { access_token } = response.data;
          localStorage.setItem('access_token', access_token);

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh falló, logout
        clearStorage();
        window.location.href = '/iniciar-sesion';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;