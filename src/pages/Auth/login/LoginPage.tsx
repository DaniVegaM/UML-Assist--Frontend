import { useState } from "react";
import SocialBtn from "../../../components/auth/SocialBtn";
import "./Login.scss";
import Loader from "../../../components/ui/Loader";
import { getAuthUrl, loginWithCredentials } from "../../../services/authService";
import { Navigate, useNavigate, useSearchParams } from "react-router";
import { isAuthenticated } from "../../../helpers/auth";
import { LOGIN_VALIDATION_RULES } from "../../../helpers/validation";
import FormField from "../../../components/auth/shared/FormField";
import { useForm } from "../hooks/useForm";

export default function LoginPage() {
    if(isAuthenticated()){
        return <Navigate to={'/'} replace />;
    }

    const [socialLoading, setSocialLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const error = searchParams.get('error');
    const {
        formData,
        loading,
        generalError,
        handleFieldChange,
        handleInputBlur,
        handleSubmit,
        setGeneralError
    } = useForm({
        initialValues: {
            email: '',
            password: ''
        },
        validationRules: LOGIN_VALIDATION_RULES,
        onSubmit: async (values) => {
            await loginWithCredentials(values.email, values.password);
            navigate('/dashboard', { replace: true });
        }
    });

    // Override para manejar errores específicos de login
    const handleFormSubmit = async (e: React.FormEvent) => {
        try {
            await handleSubmit(e);
        } catch (error) {
            setGeneralError('Error al iniciar sesión. Por favor, verifica tus credenciales e intenta de nuevo.');
        }
    };

    const handleLogin = async (authProvider: string) => {
        try {
            setSocialLoading(true)

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
            setSocialLoading(false)
        }
    }

    const isLoading = loading || socialLoading;

    return (
        <div className="bg-pattern h-screen py-32">
            <section className="flex flex-col gap-3 items-center w-96 md:w-xl mx-auto bg-white p-12 rounded-lg shadow-md">
                <h1 className="text-2xl uppercase font-black">Iniciar Sesión</h1>
                <p>Comienza a elaborar diagramas mientras aprendes</p>
                
                <form onSubmit={ handleFormSubmit } className="w-full space-y-4">
                    <FormField 
                        name="email"
                        type="email"
                        label="Correo electrónico"
                        placeholder="ejemplo@correo.com"
                        value={formData.email.value}
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

                    <button 
                        type="submit" 
                        disabled={ isLoading }
                        className="w-full bg-sky-600 text-white py-2 px-4 rounded-lg hover:bg-sky-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer font-bold"
                    >
                        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>

                    <div className="h-2/12 mt-1">
                        {generalError && (
                            <p className="text-red-500 text-sm">{ generalError }</p>
                        )}
                    </div>

                    <div className="flex justify-between items-center w-full text-sm">
                        <a href="/crear-cuenta" className="text-sky-600 hover:text-sky-800 hover:underline">
                            ¿No tienes cuenta? Crea una
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

                    {isLoading ? <Loader /> :
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