import { useState } from "react";
import SocialBtn from "../../../components/auth/SocialBtn";
import "./Login.scss";
import Loader from "../../../components/ui/Loader";
import { getAuthUrl } from "../../../services/authService";
import { Navigate, useSearchParams } from "react-router";
import { isAuthenticated } from "../../../helpers/auth";

export default function Login() {
    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams()

    const error = searchParams.get('error');

    if(isAuthenticated()){
        return <Navigate to={'/'} replace />;
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
                <form action="">
                    <p>Aquí va el inicio de sesion con correo y contraseña</p>
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