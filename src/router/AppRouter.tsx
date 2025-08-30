import { BrowserRouter, Routes, Route } from 'react-router';

// Placeholder components - estos los crearemos después
const HomePage = () => <div>Home Page</div>;
const LoginPage = () => <div>Login Page</div>;
const RegisterPage = () => <div>Register Page</div>;
const DiagramEditorPage = () => <div>Diagram Editor</div>;

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/editor" element={<DiagramEditorPage />} />
        <Route path="/editor/:diagramId" element={<DiagramEditorPage />} />
      </Routes>
    </BrowserRouter>
  );
};
