import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { requestPasswordReset } from "../../../services/passwordService";
import FormField from "../../../components/auth/shared/FormField";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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
    <section className="flex flex-col gap-3 items-center w-96 md:w-xl mx-auto dark:bg-zinc-800 bg-white p-12 rounded-lg shadow-md my-8">
      <div className="w-full mb-4">
        <div className="flex items-center justify-start gap-30">
          <button
            onClick={() => navigate(-1)}
            className="flex rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all duration-600 ease-in-out cursor-pointer p-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-6 h-6 text-sky-600 dark:text-sky-400">
              <g clipPath="url(#a)">
                <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.25-7.25a.75.75 0 0 0 0-1.5H8.66l2.1-1.95a.75.75 0 1 0-1.02-1.1l-3.5 3.25a.75.75 0 0 0 0 1.1l3.5 3.25a.75.75 0 0 0 1.02-1.1l-2.1-1.95h4.59Z"
                  clipRule="evenodd" />
              </g>
              <defs>
                <clipPath id="a">
                  <path d="M0 0h20v20H0z" />
                </clipPath>
              </defs>
            </svg>
          </button>

          <Link to="/" className="flex items-center space-x-2">
            <svg
              className="h-8 w-8 text-sky-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <line x1="10" y1="6.5" x2="14" y2="6.5" />
              <line x1="10" y1="17.5" x2="14" y2="17.5" />
              <line x1="6.5" y1="10" x2="6.5" y2="14" />
              <line x1="17.5" y1="10" x2="17.5" y2="14" />
            </svg>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              UML Assist
            </span>
          </Link>
        </div>

        <h1 className="mt-4 text-2xl text-center uppercase font-black dark:text-white">
          Restablecer contraseña
        </h1>
      </div>

      {sent ? (
        <div className="w-full mt-2">
          <p className="text-sm dark:text-white">
            Si el correo existe, se envió un correo para recuperar la contraseña.
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
            {loading ? "Procesando…" : "Recuperar contraseña"}
          </button>

          {error && <p className="text-red-400 text-sm">{error}</p>}
        </form>
      )}
    </section>
  );
}
