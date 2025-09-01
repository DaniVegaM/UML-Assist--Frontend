import { BrowserRouter, Routes, Route } from 'react-router';
import Login from '../pages/Auth/Login';

// Placeholder components - estos los crearemos después
const HomePage = () => <div>Home Page</div>;
const RegisterPage = () => <div>Register Page</div>;

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/iniciar-sesion" element={<Login/>} />
        <Route path="/registro" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
};
