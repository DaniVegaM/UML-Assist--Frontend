import SocialBtn from "../../../components/auth/SocialBtn";
import Loader from "../../../components/ui/Loader";
import { getAuthUrl, loginWithCredentials } from "../../../services/authService";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router";
import { isAuthenticated } from "../../../helpers/auth";
import { LOGIN_VALIDATION_RULES } from "../../../helpers/validation";
import FormField from "../../../components/auth/shared/FormField";
import { useForm } from "../hooks/useForm";

export default function LoginPage() {
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
        setLoading
    } = useForm({
        initialValues: {
            email: '',
            password: ''
        },
        validationRules: LOGIN_VALIDATION_RULES,
        onSubmit: async (values) => {
            const result = await loginWithCredentials(values.email, values.password);
            if (result.success) {
                navigate('/dashboard', { replace: true });
            }
        }
    });

    // Si el usuario ya está autenticado, redirigir
    if(isAuthenticated()){
        return <Navigate to={'/dashboard'} replace />;
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
        <>
            <section className="flex flex-col gap-3 items-center w-96 md:w-xl mx-auto dark:bg-zinc-800 bg-white p-12 rounded-lg shadow-md">
                <h1 className="text-2xl uppercase font-black dark:text-white">Iniciar Sesión</h1>
                
                <form onSubmit={ handleSubmit } className="w-full space-y-4">
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
                        disabled={ loading }
                        className="w-full bg-sky-600 text-white py-2 px-4 rounded-lg hover:bg-sky-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer font-bold"
                    >
                        {loading ? 'Autenticando...' : 'Iniciar Sesión'}
                    </button>

                    <div className="h-2/12 mt-1">
                        {generalError && (
                            <p className="text-red-400 text-sm">{ generalError }</p>
                        )}
                    </div>

                    <div className="flex justify-between items-center w-full text-sm">
                        <Link to="/crear-cuenta" className="text-sky-600 hover:text-sky-800 hover:underline">
                            ¿No tienes cuenta? Crea una
                        </Link>
                        <Link to="/recuperar-contrasena" className="text-gray-600 dark:text-white hover:text-gray-800 dark:hover:text-sky-600 hover:underline">
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>

                </form>

                <div className="w-full text-center relative my-6">
                    <hr className="dark:text-white"/>
                    <p className="bg-white dark:bg-zinc-800 dark:text-white px-2 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">O</p>
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
        </>
    )
}