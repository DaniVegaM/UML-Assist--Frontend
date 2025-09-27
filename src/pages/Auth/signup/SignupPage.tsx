import { Navigate } from "react-router";
import { isAuthenticated } from "../../../helpers/auth";
import SignupForm from "../../../components/auth/SignupForm";

export default function SignupPage() {
    if (isAuthenticated()) {
        return <Navigate to={'/'} replace />;
    }

    return (
        <div className="bg-pattern h-screen py-32">
            <section className="flex flex-col gap-3 items-center w-96 md:w-2/5 mx-auto bg-white p-12 rounded-lg shadow-md">
                <SignupForm />
                <div className="flex justify-between items-center w-full text-sm">
                    <a href="/iniciar-sesion" className="text-blue-600 hover:text-blue-800 hover:underline">
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