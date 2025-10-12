import FormField from "../../../components/auth/shared/FormField";
import Loader from "../../../components/ui/Loader";
import { useForm } from "../hooks/useForm";
import { CHANGE_PASSWORD_VALIDATION } from "../../../helpers/validation"; // usar validaciones existentes
import { Link } from "react-router";

export default function ChangePasswordPage() {
  const {
    formData,
    loading,
    handleFieldChange,
    handleInputBlur,
    handleSubmit,
  } = useForm({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationRules: CHANGE_PASSWORD_VALIDATION,
    onSubmit: async (values) => {
      if (values.newPassword !== values.confirmPassword) {
        alert("Las contraseñas no coinciden");
        return;
      }

      // Aquí iría la lógica para enviar los datos al backend
      console.log("Cambiar contraseña con datos:", values);
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-dots dark:bg-dots-dark">
      <section className="flex flex-col gap-6 items-center w-96 md:w-xl mx-auto dark:bg-zinc-800 bg-white p-8 rounded-lg shadow-md my-8">
        <div className=""></div>

        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 mb-4">
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

        <h1 className="text-2xl uppercase font-black dark:text-white mb-4">
          Cambiar Contraseña
        </h1>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <FormField
            label="Contraseña actual"
            type="password"
            name="currentPassword"
            placeholder="********"
            value={formData.currentPassword.value}
            onChange={handleFieldChange}
            onBlur={handleInputBlur}
            error={formData.currentPassword.error}
          />

          <FormField
            label="Nueva contraseña"
            type="password"
            name="newPassword"
            placeholder="********"
            value={formData.newPassword.value}
            onChange={handleFieldChange}
            onBlur={handleInputBlur}
            error={formData.newPassword.error}
          />

          <FormField
            label="Confirmar nueva contraseña"
            type="password"
            name="confirmPassword"
            placeholder="********"
            value={formData.confirmPassword.value}
            onChange={handleFieldChange}
            onBlur={handleInputBlur}
            error={formData.confirmPassword.error}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-600 text-white py-2 px-4 rounded-lg hover:bg-sky-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer font-bold"
          >
            {loading ? "Procesando..." : "Cambiar Contraseña"}
          </button>
        </form>

        {loading && <Loader />}
      </section>
    </div>
  );
}
