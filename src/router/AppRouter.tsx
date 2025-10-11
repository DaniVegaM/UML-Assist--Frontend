import {
  createBrowserRouter,
  RouterProvider,
  redirect,
  useSearchParams,
} from "react-router";
import LoginPage from "../pages/Auth/login/LoginPage";
import { handleCallback } from "../services/authService";

import type { LoaderFunctionArgs } from "react-router";
import SignupPage from "../pages/Auth/signup/SignupPage";
import MainLayout from "../layout/MainLayout/MainLayout";
import { useEffect, useRef } from "react";
import { notify } from "../components/ui/NotificationComponent";

const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const loginSuccess = searchParams.get("login_success");
  const shownRef = useRef(false);

  useEffect(() => {
    if (loginSuccess && !shownRef.current) {
      shownRef.current = true; // marca como mostrado
      notify("success", "¡Inicio de sesión exitoso!", "Bienvenido de nuevo");
      setSearchParams({});
    }
  }, [loginSuccess, setSearchParams]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold text-sky-600 mb-4">
        Bienvenido a UML Assist
      </h1>
      <p className="text-gray-600">Has iniciado sesión correctamente.</p>
    </div>
  );
};

const createAuthCallbackLoader = (provider: "google" | "github") => {
  return async ({ request }: LoaderFunctionArgs) => {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");

    if (!code) {
      return redirect("/iniciar-sesion?error=no_code");
    }

    try {
      await handleCallback(provider, code);
      return redirect("/?login_success=true");
    } catch (error) {
      console.error(`Error en callback de ${provider}:`, error);
      return redirect("/iniciar-sesion?error=callback_failed");
    }
  };
};

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/iniciar-sesion", element: <LoginPage /> },
      { path: "/crear-cuenta", element: <SignupPage /> },
    ],
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

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
