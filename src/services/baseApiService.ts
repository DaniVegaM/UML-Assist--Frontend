import type { AxiosInstance } from "axios";
import axios from "axios";
import { getAccessToken, getRefreshToken, clearStorage, setTokens } from "../helpers/auth";


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

    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const isAuthRoute = originalRequest.url?.includes('/auth/'); // No incluimos las rutas de auth

    if (isAuthRoute) return Promise.reject(error);

    //cola para evitar múltiples refresh simultáneos
    let _any = api as any;
    _any.__isRefreshing = _any.__isRefreshing || false;
    _any.__failedQueue = _any.__failedQueue || [];

    const processQueue = (err: any, token: string | null = null) => {
      _any.__failedQueue.forEach((prom: any) => {
        if (err) {
          prom.reject(err);
        } else {
          if (!prom.config.headers) prom.config.headers = {};
          prom.config.headers['Authorization'] = `Bearer ${token}`;
          prom.resolve(api(prom.config));
        }
      });
      _any.__failedQueue = [];
    };

    //si ya estamos refrescando, encolamos la request original y retornamos una promesa
    if (_any.__isRefreshing) {
      return new Promise((resolve, reject) => {
        _any.__failedQueue.push({ resolve, reject, config: originalRequest });
      });
    }

    //marcamos retry para no entrar en loop
    (originalRequest as any)._retry = true;
    _any.__isRefreshing = true;

    try {
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post('api/user/auth/refresh/', {
        refresh_token: refreshToken,
      });

      const { access_token, refresh_token } = response.data;

      if (access_token && refresh_token) {
        setTokens(access_token, refresh_token);
      } else if (access_token) {
        localStorage.setItem('access_token', access_token);
      }

      processQueue(null, access_token);

      if (!originalRequest.headers) originalRequest.headers = {};
      originalRequest.headers['Authorization'] = `Bearer ${access_token}`;

      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearStorage();
      window.location.href = '/iniciar-sesion';
      return Promise.reject(refreshError);
    } finally {
      _any.__isRefreshing = false;
    }
  }
);

export default api;