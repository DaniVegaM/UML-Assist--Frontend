import { useState } from "react";
import { useSearchParams, Link, Navigate, useNavigate } from "react-router";
import FormField from "../../../components/auth/shared/FormField";
import { confirmPasswordReset } from "../../../services/passwordService";

export default function ResetPasswordPage() {
  const [sp] = useSearchParams();
  const uid = sp.get("uid") || "";
  const token = sp.get("token") || "";

  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");

  const [p1Err, setP1Err] = useState<string | null>(null);
  const [p2Err, setP2Err] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  if (!uid || !token) return <Navigate to="/iniciar-sesion" replace />;

  const validateP1 = (v: string) => {
    if (!v.trim()) return "La contraseña es obligatoria";
    if (v.length < 8) return "Mínimo 8 caracteres";
    return null;
  };

  const validateP2 = (v: string) => {
    if (!v.trim()) return "Confirma tu contraseña";
    if (v !== p1) return "Las contraseñas no coinciden";
    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const e1 = validateP1(p1);
    const e2 = validateP2(p2);
    setP1Err(e1);
    setP2Err(e2);
    if (e1 || e2) return;

    try {
      setLoading(true);
      setGeneralError(null);
      await confirmPasswordReset(uid, token, p1, p2);
      setOk(true);
    } catch (error: any) {
      setGeneralError(error?.message || "No se pudo cambiar la contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex flex-col gap-3 items-center w-96 md:w-xl mx-auto dark:bg-zinc-800 bg-white p-12 rounded-lg shadow-md my-8">
      <div className="relative w-full flex justify-center items-center mb-4">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-0 flex rounded-full transition-all duration-600 ease-in-out cursor-pointer hover:bg-gray-200 dark:hover:bg-zinc-700 p-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-6 h-6 text-sky-600 dark:text-sky-400"
          >
            <g clipPath="url(#a)">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.25-7.25a.75.75 0 0 0 0-1.5H8.66l2.1-1.95a.75.75 0 1 0-1.02-1.1l-3.5 3.25a.75.75 0 0 0 0 1.1l3.5 3.25a.75.75 0 0 0 1.02-1.1l-2.1-1.95h4.59Z"
                clipRule="evenodd"
              />
            </g>
            <defs>
              <clipPath id="a">
                <path d="M0 0h20v20H0z" />
              </clipPath>
            </defs>
          </svg>
        </button>

        {/* Logo centrado */}
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

      <h1 className="text-2xl uppercase font-black dark:text-white">Crear nueva contraseña</h1>

      {ok ? (
        <div className="w-full mt-2">
          <p className="text-sm dark:text-white">
            ¡Listo! Tu contraseña se cambió correctamente.
          </p>
          <Link
            to="/iniciar-sesion"
            className="inline-block mt-4 text-sky-600 hover:text-sky-800 hover:underline dark:text-sky-400"
          >
            Ir a iniciar sesión
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="w-full space-y-4">
          <FormField
            label="Nueva contraseña"
            type="password"
            name="password"
            placeholder="********"
            value={p1}
            onChange={(_, v) => setP1(v)}
            onBlur={(_, v) => setP1Err(validateP1(v))}
            error={p1Err ?? undefined}
          />

          <FormField
            label="Confirmar contraseña"
            type="password"
            name="passwordConfirm"
            placeholder="********"
            value={p2}
            onChange={(_, v) => setP2(v)}
            onBlur={(_, v) => setP2Err(validateP2(v))}
            error={p2Err ?? undefined}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-600 text-white py-2 px-4 rounded-lg hover:bg-sky-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer font-bold"
          >
            {loading ? "Guardando…" : "Cambiar contraseña"}
          </button>

          {generalError && <p className="text-red-400 text-sm">{generalError}</p>}
        </form>
      )}
    </section>
  );
}
