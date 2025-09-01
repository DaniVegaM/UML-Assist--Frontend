import SocialBtn from "../../components/auth/SocialBtn";
import "./Login.scss";

export default function Login() {
    return (
        <div className="bg-pattern h-screen py-32">
            <section className="flex flex-col gap-3 items-center w-96 md:w-2/5 mx-auto bg-white p-6 rounded-lg shadow-md">
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
                    <SocialBtn provider="google" />
                    <SocialBtn provider="github" />
                </div>
            </section>
        </div>
    )
}