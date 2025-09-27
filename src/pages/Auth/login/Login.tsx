import { useState } from "react";
import SocialBtn from "../../../components/auth/SocialBtn";
import "./Login.scss";
import Loader from "../../../components/ui/Loader";
import { getAuthUrl, loginWithCredentials } from "../../../services/authService";
import { Navigate, useSearchParams } from "react-router";
import { isAuthenticated } from "../../../helpers/auth";
import { validateField, validateForm, LOGIN_VALIDATION_RULES } from "../../../helpers/validation";

interface FormErrors {
    email: string;
    password: string;
    server: string;
}

export default function Login() {
    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams()
    const error = searchParams.get('error');
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState<FormErrors>({
        email: '',
        password: '',
        server: ''
    });

    if(isAuthenticated()){
        return <Navigate to={'/'} replace />;
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Limpiar error del servidor cuando el usuario empiece a escribir
        if (errors.server) {
            setErrors(prev => ({ ...prev, server: '' }));
        }
    };

    const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        if (LOGIN_VALIDATION_RULES[name]) {
            const fieldError = validateField(value, LOGIN_VALIDATION_RULES[name]);
            setErrors(prev => ({
                ...prev,
                [name]: fieldError
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validar todos los campos usando la función reutilizable
        const validationErrors = validateForm(formData, LOGIN_VALIDATION_RULES);

        // Actualizar los errores en el estado
        setErrors({
            email: validationErrors.email || '',
            password: validationErrors.password || '',
            server: ''
        });

        // Si hay errores de validación, no continuar
        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        try {
            setLoading(true);
            await loginWithCredentials(formData.email, formData.password);
        } catch (error) {
            setErrors(prev => ({
                ...prev,
                server: 'Error con el servidor'
            }));
        } finally {
            setLoading(false);
        }
    }

    const handleLogin = async (authProvider: string) => {
        try {
            setLoading(true)

            let auth_url = ''
            let success = false

            if (authProvider === 'google') {
                ({ auth_url, success } = await getAuthUrl(authProvider))
            } else if (authProvider === 'github') {
                ({ auth_url, success } = await getAuthUrl(authProvider))
            }
            
            if ( success ) {
                window.location.href = auth_url
            } else {
                console.error(`No se pudo obtener la URL de autenticación de ${authProvider}`)
            }
        } catch (error) {
            console.error('Login error:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-pattern h-screen py-32">
            <section className="flex flex-col gap-3 items-center w-96 md:w-2/5 mx-auto bg-white p-12 rounded-lg shadow-md">
                <h1 className="text-2xl uppercase font-black">Iniciar Sesión</h1>
                <p>Comienza a elaborar diagramas mientras aprendes</p>
                
                <form onSubmit={handleSubmit} className="w-full space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Correo electrónico
                        </label>
                        <input 
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            onBlur={handleInputBlur}
                            placeholder="ejemplo@correo.com"
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.email ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                        )}
                    </div>
                    
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Contraseña
                        </label>
                        <input 
                            name="password" 
                            type="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            onBlur={handleInputBlur}
                            placeholder="********"
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.password ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                        )}
                    </div>

                    {errors.server && (
                        <p className="text-red-500 text-sm text-center">{errors.server}</p>
                    )}

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>

                    <div className="flex justify-between items-center w-full text-sm">
                        <a href="/registro" className="text-blue-600 hover:text-blue-800 hover:underline">
                            ¿No tienes cuenta? Regístrate
                        </a>
                        <a href="/recuperar-contrasena" className="text-gray-600 hover:text-gray-800 hover:underline">
                            ¿Olvidaste tu contraseña?
                        </a>
                    </div>

                </form>

                <div className="w-full text-center relative my-6">
                    <hr />
                    <p className="bg-white px-2 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">O</p>
                </div>
                
                <div className="flex flex-col space-y-4 items-center">

                    {loading ? <Loader /> :
                        <>
                        <SocialBtn provider="google" authHandler={handleLogin}/>
                        <SocialBtn provider="github" authHandler={handleLogin}/>
                        </>
                    }

                    {error && <p className="text-red-500">Error de autenticación. Por favor, intenta de nuevo.</p>}
                </div>
            </section>
        </div>
    )
}