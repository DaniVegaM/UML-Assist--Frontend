import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { isAuthenticated } from '../../helpers/auth';

type ProtectedRouteProps = {
  children: ReactNode,
  redirectTo?: string,
};

export default function ProtectedRoute({ 
  children, 
  redirectTo = '/iniciar-sesion' 
}: ProtectedRouteProps) {
  if (!isAuthenticated()) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
