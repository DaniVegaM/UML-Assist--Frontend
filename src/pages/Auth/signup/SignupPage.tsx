import { Navigate, useNavigate } from "react-router";
import { isAuthenticated } from "../../../helpers/auth";
import { REGISTER_VALIDATION_RULES } from "../../../helpers/validation";
import { registerWithCredentials } from "../../../services/authService";
import FormField from "../../../components/auth/shared/FormField";
import { useForm } from "../hooks/useForm";

export default function SignupPage() {
    const navigate = useNavigate();

    const {
        formData,
        loading,
        generalError,
        handleFieldChange,
        handleInputBlur,
        handleSubmit,
    } = useForm({
        initialValues: {
            email: '',
            password: '',
            password_confirm: ''
        },
        validationRules: REGISTER_VALIDATION_RULES,
        customValidations: {
            password_confirm: (value, formData) => {
                if (!value) {
                    return 'Por favor confirma tu contraseña';
                }
                if (formData.password.value !== value) {
                    return 'Las contraseñas no coinciden';
                }
                return '';
            }
        },
        onSubmit: async (values) => {
            await registerWithCredentials(values.email, values.password);
            navigate('/dashboard', { replace: true });
        }
    });

    if (isAuthenticated()) {
        return <Navigate to={'/dashboard'} replace />;
    }



    return (
        <div className="bg-pattern h-screen py-32">
            <section className="flex flex-col gap-3 items-center w-96 md:w-xl mx-auto bg-white p-12 rounded-lg shadow-md">
                <h1 className="text-2xl uppercase font-black">Crear una cuenta</h1>

                <form
                    onSubmit={handleSubmit}
                    className="w-full space-y-4"
                >
                    <FormField
                        label="Correo electrónico"
                        type="email"
                        name="email"
                        placeholder="ejemplo@correo.com"
                        value={formData.email.value}
                        onChange={handleFieldChange}
                        onBlur={handleInputBlur}
                        error={formData.email.error}
                    />

                    <FormField
                        label="Contraseña"
                        type="password"
                        name="password"
                        placeholder="********"
                        value={formData.password.value}
                        onChange={handleFieldChange}
                        onBlur={handleInputBlur}
                        error={formData.password.error}
                    />

                    <FormField
                        label="Confirmar contraseña"
                        type="password"
                        name="password_confirm"
                        placeholder="********"
                        value={formData.password_confirm.value}
                        onChange={handleFieldChange}
                        onBlur={handleInputBlur}
                        error={formData.password_confirm.error}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-sky-600 text-white py-2 px-4 rounded-lg hover:bg-sky-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-bold cursor-pointer"
                    >
                        {loading ? 'Creando...' : 'Crear Cuenta'}
                    </button>

                    <div className="h-2/12 mt-1">
                        {generalError && (
                            <p className="text-red-500 text-sm">{generalError}</p>
                        )}
                    </div>

                    {/* Loader visual solo en el botón, no duplicado aquí */}
                </form>

                <div className="flex justify-between items-center w-full text-sm">
                    <a href="/iniciar-sesion" className="text-sky-600 hover:text-sky-800 hover:underline">
                        ¿Ya tienes cuenta? Inicia sesión
                    </a>
                    <a href="/recuperar-contrasena" className="text-gray-600 hover:text-gray-800 hover:underline">
                        ¿Olvidaste tu contraseña?
                    </a>
                </div>

            </section>
        </div>
    );
}
