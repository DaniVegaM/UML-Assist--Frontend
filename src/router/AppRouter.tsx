import { BrowserRouter, Routes, Route } from 'react-router';
import Login from '../pages/Auth/login/Login';
import GoogleCallback from '../pages/Auth/googleCallback/GoogleCallback';
import ProtectedRoute from '../components/auth/ProtectedRoute';

// Placeholder components - estos los crearemos después
const HomePage = () => <div>Home Page</div>;
const RegisterPage = () => <div>Register Page</div>;

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } />

        <Route path="/iniciar-sesion" element={<Login />} />

        <Route path="/registro" element={<RegisterPage />} />

        <Route path='/auth/callback' element={<GoogleCallback />} />

      </Routes>
    </BrowserRouter>
  );
};
