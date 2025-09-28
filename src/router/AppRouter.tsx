import { createBrowserRouter, RouterProvider, redirect } from "react-router";
import Login from "../pages/Auth/login/Login";
import { handleCallback } from "../services/authService";

import type { LoaderFunctionArgs } from "react-router";

/* Componente de página principal */
const HomePage = () => <div>Home Page</div>;

/* Componente de página de registro */
const RegisterPage = () => <div>Register Page</div>;

/* Función para crear el loader de autenticación según el proveedor */
const createAuthCallbackLoader = (provider: "google" | "github") => {
  return async ({ request }: LoaderFunctionArgs) => {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");

    // Validar si viene el código en la URL
    if (!code) {
      return redirect("/iniciar-sesion?error=no_code");
    }

    try {
      // Ejecutar callback de autenticación con el proveedor
      await handleCallback(provider, code);
      return redirect("/iniciar-sesion?notif=login_success");
    } catch (error) {
      console.error(`Error en callback de ${provider}:`, error);
      return redirect("/iniciar-sesion?error=callback_failed");
    }
  };
};

/* Configuración de rutas principales de la aplicación */
const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/iniciar-sesion",
    element: <Login />,
  },
  {
    path: "/registro",
    element: <RegisterPage />,
  },
  {
    path: "/auth/google/callback",
    loader: createAuthCallbackLoader("google"),
  },
  {
    path: "/auth/github/callback",
    loader: createAuthCallbackLoader("github"),
  },
]);

/* Proveedor de enrutamiento principal */
export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
