// Modo mock para trabajar sin backend todavía.
const USE_MOCK = true;

export const requestPasswordReset = async (email: string) => {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 700));
    if (!email.includes('@')) throw new Error('Correo inválido');
    return { success: true };
  }
 
};

export const confirmPasswordReset = async (
  uid: string,
  token: string,
  newPassword: string,
  rePassword: string
) => {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 700));
    if (!uid || !token) throw new Error('Enlace inválido');
    if (newPassword !== rePassword) throw new Error('Las contraseñas no coinciden');
    if (newPassword.length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres');
    return { success: true };
  }

}; 
