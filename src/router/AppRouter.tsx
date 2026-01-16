import { createBrowserRouter, RouterProvider, redirect } from "react-router";
import LoginPage from "../pages/Auth/login/LoginPage";
import { handleCallback } from "../services/authService";

import type { LoaderFunctionArgs } from "react-router";
import SignupPage from "../pages/Auth/signup/SignupPage";
import MainLayout from "../components/layout/MainLayout/MainLayout";
import ResetPasswordPage from "../pages/Auth/forgottenpassword/ResetPasswordPage";
import ForgotPasswordPage from "../pages/Auth/forgottenpassword/ForgotPasswordPage";
import ChangePasswordPage from "../pages/Auth/changepassword/ChangePasswordPage";
import CreateActivitiesDiagram from "../pages/Canvas/CreateActivitiesDiagram";
import CreateSequenceDiagram from "../pages/Canvas/CreateSequenceDiagram";
import Dashboard from "../pages/Dashboard";
import HomePage from "../pages/HomePage";
import { getLoggedUser } from "../helpers/auth";

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

export const requireEmailProvider = () => {
  const user = getLoggedUser();
  if (!user || user.provider !== "email") {
    return redirect("/");
  }
  return null;
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
    element: <ChangePasswordPage />,
    loader: requireEmailProvider
  },
  {
    path: "/crear-diagrama-de-actividades/:id?",
    element: <CreateActivitiesDiagram />,
  },
  {
    path: "/crear-diagrama-de-secuencia/:id?",
    element: <CreateSequenceDiagram />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
