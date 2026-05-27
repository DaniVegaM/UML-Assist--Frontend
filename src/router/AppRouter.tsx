import { Suspense, lazy } from "react";
import { createBrowserRouter, RouterProvider, redirect } from "react-router";
import { handleCallback } from "../services/authService";

import type { LoaderFunctionArgs } from "react-router";
const LoginPage = lazy(() => import("../pages/Auth/login/LoginPage"));
const SignupPage = lazy(() => import("../pages/Auth/signup/SignupPage"));
const MainLayout = lazy(() => import("../components/layout/MainLayout/MainLayout"));
const ResetPasswordPage = lazy(() => import("../pages/Auth/forgottenpassword/ResetPasswordPage"));
const ForgotPasswordPage = lazy(() => import("../pages/Auth/forgottenpassword/ForgotPasswordPage"));
const ChangePasswordPage = lazy(() => import("../pages/Auth/changepassword/ChangePasswordPage"));
const CreateActivitiesDiagram = lazy(() => import("../pages/Canvas/CreateActivitiesDiagram"));
const CreateSequenceDiagram = lazy(() => import("../pages/Canvas/CreateSequenceDiagram"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const HomePage = lazy(() => import("../pages/HomePage"));
const ErrorPage = lazy(() => import("../pages/Error/ErrorPage"));
import { getLoggedUser } from "../helpers/auth";
import { requireAuth } from "./ProtectedRoute";

const createAuthCallbackLoader = (provider: "google" | "github") => {
  return async ({ request }: LoaderFunctionArgs) => {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");

    if (!code) {
      return redirect("/iniciar-sesion?error=no_code");
    }

    try {
      await handleCallback(provider, code);
      return redirect("/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error en autenticación";
      return redirect(`/iniciar-sesion?error=${encodeURIComponent(message)}`);
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
    errorElement: <ErrorPage />,
    children: [
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
        loader: requireAuth,
      },
      {
        path: "/crear-diagrama-de-secuencia/:id?",
        element: <CreateSequenceDiagram />,
        loader: requireAuth,
      },
      {
        path: "/dashboard",
        element: <Dashboard />,
        loader: requireAuth,
      },
    ],
  },
]);

export const AppRouter = () => {
  return (
    <Suspense fallback={<div className="min-h-screen w-full" aria-busy="true" aria-live="polite" />}>
      <RouterProvider router={router} />
    </Suspense>
  );
};
