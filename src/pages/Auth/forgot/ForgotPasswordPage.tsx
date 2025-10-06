import { useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../../../services/passwordService";
import FormField from "../../../components/auth/shared/FormField";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (v: string) => {
    if (!v.trim()) return "El correo es obligatorio";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Correo inválido";
    return null;
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const eErr = validateEmail(email);
    setEmailError(eErr);
    if (eErr) { setLoading(false); return; }

    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : typeof err === "string" ? err : "No se pudo enviar el correo.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex flex-col gap-3 items-center w-96 md:w-xl mx-auto dark:bg-zinc-800 bg-white p-12 rounded-lg shadow-md">
      <h1 className="text-2xl uppercase font-black dark:text-white">Restablecer contraseña</h1>

      {sent ? (
        <div className="w-full mt-2">
          <p className="text-sm dark:text-white">
            Si el correo existe, se envió un enlace de restablecimiento. Revisa tu bandeja.
          </p>
          <Link
            to="/iniciar-sesion"
            className="inline-block mt-4 text-sky-600 hover:text-sky-800 hover:underline dark:text-sky-400"
          >
            Volver al inicio de sesión
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="w-full space-y-4">
          <FormField
            name="email"
            type="email"
            label="Correo electrónico"
            placeholder="ejemplo@correo.com"
            value={email}
            onChange={(_, v) => setEmail(v)}
            onBlur={(_, v) => setEmailError(validateEmail(v))}
            error={emailError ?? undefined}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-600 text-white py-2 px-4 rounded-lg hover:bg-sky-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer font-bold"
          >
            {loading ? "Enviando…" : "Enviar enlace"}
          </button>

          {error && <p className="text-red-400 text-sm">{error}</p>}
        </form>
      )}
    </section>
  );
}
