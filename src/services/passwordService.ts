import api from "./baseApiService";
import type { AxiosError } from "axios";

export interface PasswordResetRequestResponse {
  success: boolean;
  detail: string; 
}

export interface PasswordResetConfirmResponse {
  success: boolean;
  detail: string;
}

type DRFValidationDetails = Record<string, string[] | string>;
interface DRFErrorResponse {
  detail?: string;
  error?: string;
  details?: DRFValidationDetails;
}

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

/* Helper de errores con tipado de Axios + DRF */
const getErrorMessage = (err: unknown): string => {
  const axiosErr = err as AxiosError<DRFErrorResponse> | undefined;
  const data = axiosErr?.response?.data;

  if (data?.detail) return data.detail;
  if (data?.error) return data.error;

  const details = data?.details;
  if (details && typeof details === "object") {
    const firstKey = Object.keys(details)[0];
    const val = (details as DRFValidationDetails)[firstKey];
    if (Array.isArray(val) && val.length > 0 && typeof val[0] === "string") return val[0];
    if (typeof val === "string") return val;
  }

  return (axiosErr?.message as string) || "Ocurrió un error. Intenta de nuevo.";
};

/** Servicios */

export const requestPasswordReset = async (
  email: string
): Promise<PasswordResetRequestResponse> => {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 700));
    if (!email.includes("@")) throw new Error("Correo inválido");
    return { success: true, detail: "Si el email existe, enviaremos un enlace." };
  }

  try {
    const { data } = await api.post<PasswordResetRequestResponse>(
      "/api/user/auth/password/reset/",
      { email }
    );
    return data;
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
};

export const confirmPasswordReset = async (
  uid: string,
  token: string,
  newPassword: string,
  rePassword: string
): Promise<PasswordResetConfirmResponse> => {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 700));
    if (!uid || !token) throw new Error("Enlace inválido");
    if (newPassword !== rePassword) throw new Error("Las contraseñas no coinciden");
    if (newPassword.length < 8) throw new Error("La contraseña debe tener al menos 8 caracteres");
    return { success: true, detail: "Contraseña actualizada correctamente." };
  }

  try {
    const { data } = await api.post<PasswordResetConfirmResponse>(
      "/api/user/auth/password/reset/confirm/",
      {
        uid,
        token,
        new_password: newPassword,
        re_password: rePassword,
      }
    );
    return data;
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
};
