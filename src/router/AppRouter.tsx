import { createBrowserRouter, RouterProvider, redirect } from 'react-router';
import Login from '../pages/Auth/login/Login';
import { handleCallback } from '../services/authService';

import type { LoaderFunctionArgs } from 'react-router';

const HomePage = () => <div>Home Page</div>;
const RegisterPage = () => <div>Register Page</div>;

const createAuthCallbackLoader = (provider: 'google' | 'github') => {
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
    path: '/auth/google/callback',
    loader: createAuthCallbackLoader('google')
  },
  {
    path: '/auth/github/callback',
    loader: createAuthCallbackLoader('github')
  }
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};