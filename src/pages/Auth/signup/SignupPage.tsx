import { Navigate, useNavigate } from "react-router";
import { isAuthenticated } from "../../../helpers/auth";
import { useState } from "react";
import { REGISTER_VALIDATION_RULES, validateField } from "../../../helpers/validation";
import { registerWithCredentials } from "../../../services/authService";
import FormField from "../../../components/auth/shared/FormField";
import Loader from "../../../components/ui/Loader";

export default function SignupPage() {
    if (isAuthenticated()) {
        return <Navigate to={'/'} replace />;
    }

    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [ formData, setFormData ] = useState({
        email: {
            value: '',
            error: ''
        },
        password: {
            value: '',
            error: ''
        },
        password_confirm: {
            value: '',
            error: ''
        },
    });
    const [ generalError, setGeneralError ] = useState('');

    const handleFieldChange = (name: string, value: string) => {
        setFormData(prev => {
            const fieldKey = name as keyof typeof prev;
            return {
                ...prev,
                [fieldKey]: {
                    ...prev[fieldKey],
                    value: value
                }
            };
        });
        setGeneralError('');
    };

    const handleInputBlur = (name: string, value: string, type: string) => {
        if (REGISTER_VALIDATION_RULES[type]) {
            const fieldError = validateField(value, REGISTER_VALIDATION_RULES[type]);
            setFormData(prev => {
                const fieldKey = name as keyof typeof prev;
                return {
                    ...prev,
                    [fieldKey]: {
                        ...prev[fieldKey],
                        error: fieldError
                    }
                };
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const emailError = validateField(formData.email.value, REGISTER_VALIDATION_RULES.email || {});
        const passwordError = validateField(formData.password.value, REGISTER_VALIDATION_RULES.password || {});
        
        let passwordConfirmError = '';
        if (!formData.password_confirm.value) {
            passwordConfirmError = 'Por favor confirma tu contraseña';
        } else if (formData.password.value !== formData.password_confirm.value) {
            passwordConfirmError = 'Las contraseñas no coinciden';
        }
        
        setFormData(prev => ({
            email: {
                ...prev.email,
                error: emailError
            },
            password: {
                ...prev.password,
                error: passwordError
            },
            password_confirm: {
                ...prev.password_confirm,
                error: passwordConfirmError
            }
        }));
        
        const hasErrors = emailError || passwordError || passwordConfirmError;
        
        if (hasErrors) {
            return;
        }
        
        try {
            setLoading(true);
            setGeneralError(''); 
            await registerWithCredentials(formData.email.value, formData.password.value, formData.password_confirm.value);

            navigate('/dashboard', { replace: true });
        } catch (error) {
            setGeneralError('Error al crear la cuenta. Por favor, intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-pattern h-screen py-32">
            <section className="flex flex-col gap-3 items-center w-96 md:w-xl mx-auto bg-white p-12 rounded-lg shadow-md">
                <h1 className="text-2xl uppercase font-black">Crear una cuenta</h1>

                <form
                    onSubmit={ handleSubmit } 
                    className="w-full space-y-4"
                >
                    <FormField
                        label="Correo electrónico"
                        type="email"
                        name="email"
                        placeholder="ejemplo@correo.com"
                        value={ formData.email.value }
                        onChange={ handleFieldChange }
                        onBlur={ handleInputBlur }
                        error={ formData.email.error }
                    />

                    <FormField
                        label="Contraseña"
                        type="password"
                        name="password"
                        placeholder="********"
                        value={ formData.password.value }
                        onChange={ handleFieldChange }
                        onBlur={ handleInputBlur }
                        error={ formData.password.error }
                    />

                    <FormField
                        label="Confirmar contraseña"
                        type="password"
                        name="password_confirm"
                        placeholder="********"
                        value={ formData.password_confirm.value }
                        onChange={ handleFieldChange }
                        onBlur={ handleInputBlur }
                        error={ formData.password_confirm.error }
                    />

                    <button 
                        type="submit" 
                        disabled={ loading }
                        className="w-full bg-sky-600 text-white py-2 px-4 rounded-lg hover:bg-sky-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-bold cursor-pointer"
                    >
                        {loading ? 'Creando...' : 'Crear Cuenta'}
                    </button>

                    <div className="h-4 mt-1">
                        {generalError && (
                            <p className="text-red-500 text-sm">{ generalError }</p>
                        )}
                    </div>
                    
                    <div className="flex flex-col space-y-4 items-center mb-3">
                        {loading && <Loader />}
                    </div>
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
