import { useState } from "react";
import { useSearchParams, Link, Navigate } from "react-router";
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
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message :
        typeof err === "string" ? err :
        "No se pudo cambiar la contraseña.";
      setGeneralError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex flex-col gap-3 items-center w-96 md:w-xl mx-auto dark:bg-zinc-800 bg-white p-12 rounded-lg shadow-md">
      <h1 className="text-2xl uppercase font-black dark:text-white">
        Crear nueva contraseña
      </h1>

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
            onChange={(e) => setP1(e.target.value)}
            onBlur={() => setP1Err(validateP1(p1))}
            error={p1Err ?? undefined}
          />

          <FormField
            label="Confirmar contraseña"
            type="password"
            name="passwordConfirm"
            placeholder="********"
            value={p2}
            onChange={(e) => setP2(e.target.value)}
            onBlur={() => setP2Err(validateP2(p2))}
            error={p2Err ?? undefined}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-600 text-white py-2 px-4 rounded-lg hover:bg-sky-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer font-bold"
          >
            {loading ? "Guardando…" : "Cambiar contraseña"}
          </button>

          {generalError && (
            <p className="text-red-400 text-sm">{generalError}</p>
          )}
        </form>
      )}
    </section>
  );
}
