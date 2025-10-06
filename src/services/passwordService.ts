import api from "./baseApiService";

// Lee el modo desde .env del FRONT
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

// Pequeño helper para sacar mensajes de error legibles
const getErrorMessage = (err: any): string => {
  // Axios error con respuesta del backend
  const data = err?.response?.data;
  if (typeof data?.detail === "string") return data.detail;
  if (typeof data?.error === "string") return data.error;

  // Detalles de validación DRF: { details: {campo: [mensajes]} }
  const details = data?.details;
  if (details && typeof details === "object") {
    const firstKey = Object.keys(details)[0];
    const val = details[firstKey];
    if (Array.isArray(val) && val.length > 0 && typeof val[0] === "string") return val[0];
    if (typeof val === "string") return val;
  }
  // Fallback
  return err?.message || "Ocurrió un error. Intenta de nuevo.";
};

export const requestPasswordReset = async (email: string) => {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 700));
    if (!email.includes("@")) throw new Error("Correo inválido");
    return { success: true };
  }

  try {
    // Backend real (rutas bajo AuthViewSet)
    const { data } = await api.post("/api/user/auth/password/reset/", { email });
    return data; // { detail: '...', success: true }
  } catch (err: any) {
    throw new Error(getErrorMessage(err));
  }
};

export const confirmPasswordReset = async (
  uid: string,
  token: string,
  newPassword: string,
  rePassword: string
) => {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 700));
    if (!uid || !token) throw new Error("Enlace inválido");
    if (newPassword !== rePassword) throw new Error("Las contraseñas no coinciden");
    if (newPassword.length < 8) throw new Error("La contraseña debe tener al menos 8 caracteres");
    return { success: true };
  }

  try {
    const { data } = await api.post("/api/user/auth/password/reset/confirm/", {
      uid,
      token,
      new_password: newPassword,
      re_password: rePassword,
    });
    return data; // { detail: 'Contraseña actualizada...', success: true }
  } catch (err: any) {
    throw new Error(getErrorMessage(err));
  }
};
