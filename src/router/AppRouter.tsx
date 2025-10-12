import { createBrowserRouter, RouterProvider, redirect } from "react-router";
import LoginPage from "../pages/Auth/login/LoginPage";
import { handleCallback } from "../services/authService";
import ChangePage from "../pages/Auth/changepassword/changePage";

import type { LoaderFunctionArgs } from "react-router";
import SignupPage from "../pages/Auth/signup/SignupPage";
import MainLayout from "../layout/MainLayout/MainLayout";
import ResetPasswordPage from "../pages/Auth/forgot/ResetPasswordPage";
import ForgotPasswordPage from "../pages/Auth/forgot/ForgotPasswordPage";

const HomePage = () => <div>Home Page</div>;

const createAuthCallbackLoader = (provider: "google" | "github") => {
  return async ({ request }: LoaderFunctionArgs) => {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");

    if (!code) {
      return redirect("/iniciar-sesion?error=no_code");
    }

    try {
      await handleCallback(provider, code);
      return redirect("/");
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
      {
        path: "/",
        element: <HomePage />,
      },
    ],
  },
  {
    path: "/iniciar-sesion",
    element: <LoginPage />,
  },
  {
    path: "/crear-cuenta",
    element: <SignupPage />,
  },
  {
    path: "/auth/google/callback",
    loader: createAuthCallbackLoader("google"),
  },
  {
    path: "/auth/github/callback",
    loader: createAuthCallbackLoader("github"),
  },
  {
    path: "/recuperar-contrasena",
    element: <ForgotPasswordPage />,
  },
  {
    path: "/restablecer-contrasena",
    element: <ResetPasswordPage />,
  },
  {
    path: "/cambiar-contrasena",
    element: <ChangePage />,
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
