import { Link, Navigate, useNavigate } from "react-router";
import { isAuthenticated } from "../../../helpers/auth";
import { REGISTER_VALIDATION_RULES } from "../../../helpers/validation";
import { registerWithCredentials } from "../../../services/authService";
import FormField from "../../../components/auth/shared/FormField";
import { useForm } from "../hooks/useForm";
import { notifyPromise } from "../../../components/ui/NotificationComponent";
import { Toaster } from "react-hot-toast";

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
            try {
                await notifyPromise(
                    registerWithCredentials(values.email, values.password),
                    {
                        loading: "Creando tu cuenta...",
                        success: "¡Cuenta creada exitosamente!",
                        error: "No se pudo crear la cuenta",
                        errorDescription: "Verifica que el email no esté registrado"
                    }
                );
                navigate('/dashboard', { replace: true });
            } catch (error) {
                console.error('Error en registro:', error);
            }
        }
    });

    if (isAuthenticated()) {
        return <Navigate to={'/dashboard'} replace />;
    }

    return (
        <>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 5000,
                    style: { padding: "0px", margin: "0px" },
                }}
                containerStyle={{ top: 20, right: 20 }}
            />
            
            <section className="flex flex-col gap-3 items-center w-96 md:w-xl mx-auto bg-white dark:bg-zinc-800 p-12 rounded-lg shadow-md my-11">
                <div className="flex items-center w-full justify-start gap-30 mb-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all duration-600 ease-in-out cursor-pointer p-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 20 20" 
                            fill="currentColor" 
                            className="w-6 h-6 text-sky-600 dark:text-sky-400">
                            <g clipPath="url(#a)">
                                <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.25-7.25a.75.75 0 0 0 0-1.5H8.66l2.1-1.95a.75.75 0 1 0-1.02-1.1l-3.5 3.25a.75.75 0 0 0 0 1.1l3.5 3.25a.75.75 0 0 0 1.02-1.1l-2.1-1.95h4.59Z" clipRule="evenodd" />
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
            <h1 className="text-2xl uppercase font-black dark:text-white">Crear cuenta</h1>
            <p className="text-center dark:text-white">Comienza a elaborar diagramas mientras aprendes</p>

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
            </form>

            <div className="flex justify-between items-center w-full text-sm">
                <Link to="/iniciar-sesion" className="text-sky-600 hover:text-sky-800 hover:underline">
                    ¿Ya tienes cuenta? Inicia sesión
                </Link>
                <Link to="/recuperar-contrasena" className="text-gray-600 dark:text-white dark:hover:text-sky-600 hover:text-gray-800 hover:underline">
                    ¿Olvidaste tu contraseña?
                </Link>
            </div>

        </section>
        </>
    );
}
