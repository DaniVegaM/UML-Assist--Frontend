import { clearStorage, setTokens, setUserData, getAccessToken } from "../helpers/auth";
import type { AuthResponse, AuthUrlResponse } from "../types/auth";
import api from "./baseApiService";


export const isAuthenticated = (): boolean => {
  const token = getAccessToken();
  if (!token) return false;

  try { // Verificamos si el token ha expirado
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp > Date.now() / 1000;
  } catch {
    return false;
  }
};

/* Despues de otorgar permisos, Google/Github redirige a la URL de callback con un "code" en los query params 
para poder obtener los tokens y datos del usuario */
export const getAuthUrl = async (authProvider: string): Promise<AuthUrlResponse> => {
  try {
    if (!['google', 'github'].includes(authProvider)) {
      throw new Error(`Proveedor de autenticación no soportado: ${authProvider}`);
    }

    const response = await api.get(`api/user/auth/${authProvider}/url/`);
    return response.data;
  } catch (error) {
    console.error('Error getting auth URL:', error);
    throw error;
  }
}

export const handleCallback = async (provider: string, code: string) => {
  try {
    console.log('Handling callback for provider:', provider, 'with code:', code);
    const response = await api.post<AuthResponse>(`api/user/auth/${provider}/callback/`, {
      code: code
    });

    const { access_token, refresh_token, user, created } = response.data;

    // Guardamos tokens y datos del usuario
    setTokens(access_token, refresh_token);
    setUserData({
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name
    });

    return { user, created, success: true };

  } catch (error) {
    console.error('Error en callback:', error);
    throw error;
  }
}

export const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refresh_token');

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await api.post('api/user/auth/refresh/', {
      refresh_token: refreshToken
    });

    const { access_token } = response.data;
    localStorage.setItem('access_token', access_token);

    return access_token;

  } catch (error) {
    console.error('Error refreshing token:', error);
    logout();
    throw error;
  }
}

export const getCurrentUser = async () => {
  try {
    const response = await api.get('api/user/users/me/');
    return response.data.user;
  } catch (error) {
    console.error('Error getting current user:', error);
    throw error;
  }
}

export const logout = async () => {
  try {
    const refreshToken = localStorage.getItem('refresh_token');

    if (refreshToken) {
      await api.post('api/user/auth/logout/', {
        refresh_token: refreshToken
      });
    }
  } catch (error) {
    console.error('Error during logout:', error);
  } finally {
    clearStorage();
  }
}