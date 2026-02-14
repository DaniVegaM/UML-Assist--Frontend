import {
  clearStorage,
  setTokens,
  setUserData,
  getAccessToken,
} from "../helpers/auth";
import type { AuthResponse, AuthUrlResponse } from "../types/auth";
import api from "./baseApiService";

export const isAuthenticated = (): boolean => {
  const token = getAccessToken();
  if (!token) return false;
  return true;
};

/* Despues de otorgar permisos, Google/Github redirige a la URL de callback con un "code" en los query params 
para poder obtener los tokens y datos del usuario */
export const getAuthUrl = async (
  authProvider: string
): Promise<AuthUrlResponse> => {
  try {
    if (!["google", "github"].includes(authProvider)) {
      throw new Error(
        `Proveedor de autenticación no soportado: ${authProvider}`
      );
    }

    const response = await api.get(`api/user/auth/${authProvider}/url/`);
    return response.data;
  } catch (error) {
    console.error("Error getting auth URL:", error);
    throw error;
  }
};

export const handleCallback = async (provider: string, code: string) => {
  try {
    console.log(
      "Handling callback for provider:",
      provider,
      "with code:",
      code
    );
    const response = await api.post<AuthResponse>(
      `api/user/auth/${provider}/callback/`,
      {
        code: code,
      }
    );

    const { access_token, user, success } = response.data;

    // Guardamos tokens y datos del usuario
    setTokens(access_token);
    setUserData({
      email: user.email,
      username: user.username,
      provider: user.provider,
    });

    return { user, success };
  } catch (error) {
    console.error("Error en callback:", error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get("api/user/users/me/");
    return response.data.user;
  } catch (error) {
    console.error("Error getting current user:", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await api.post("api/user/auth/logout/");
  } catch (error) {
    console.error("Error during logout:", error);
  } finally {
    clearStorage();
  }
};

export const loginWithCredentials = async (email: string, password: string) => {
  try {
    const response = await api.post<AuthResponse>("api/user/auth/login/", {
      email,
      password,
    });

    const { access_token, user } = response.data;
    console.log("Login successful for user:", user);

    // Guardamos tokens y datos del usuario
    setTokens(access_token);
    setUserData({ email: user.email, username: user.username, provider: user.provider, });

    return { user, success: true };
  } catch (error) {
    console.error("Error en login: ", error);
    throw error;
  }
};

export const registerWithCredentials = async (
  email: string,
  password: string
) => {
  try {
    const response = await api.post<AuthResponse>("api/user/auth/signup/", {
      email,
      password,
    });

    const { access_token, user } = response.data;
    console.log("Registration successful for user:", user);

    // Guardamos tokens y datos del usuario
    setTokens(access_token);
    setUserData({ email: user.email, username: user.username, provider: user.provider, });

    return { user, success: true };
  } catch (error) {
    console.error("Error en registro:", error);
    throw error;
  }
};

type ChangePasswordValues = {
  current_password: string;
  new_password: string;
  confirm_password: string;
};

export async function changePassword(values: ChangePasswordValues) {
  try {
    const response = await api.post("api/user/users/change_password/", values);

    return response.data;
  } catch (error: unknown) {
    // axios devuelve el error del servidor en error.response.data
    const err = error as { response?: { data?: unknown } };
    throw err.response?.data || { message: "Error al cambiar la contraseña" };
  }
}
