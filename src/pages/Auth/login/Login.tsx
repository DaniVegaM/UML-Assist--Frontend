import { useState, useEffect, useRef } from "react";
import SocialBtn from "../../../components/auth/SocialBtn";
import "./Login.scss";
import Loader from "../../../components/ui/Loader";
import { getAuthUrl } from "../../../services/authService";
import { Navigate } from "react-router";
import { isAuthenticated } from "../../../helpers/auth";
import Notification from "../../../components/ui/Notifications";

/* Tipo de notificación */
type Notif = {
  id: number;
  title: string;
  description: string;
  type: "success" | "error";
};

export default function Login() {
  const [loading, setLoading] = useState(false);

  /* Estado de notificaciones */
  const [showNotif, setShowNotif] = useState<Notif[]>([]);
  const [notifId, setNotifId] = useState(0); // IDs únicos para cada notificación
  const [redirect, setRedirect] = useState(false);

  const didNotify = useRef(false);

  /* Efecto: comprobar autenticación y mostrar notificación */
  useEffect(() => {
    const provider = localStorage.getItem("authProvider");

    if (isAuthenticated() && !didNotify.current) {
      didNotify.current = true;
      addNotification({
        title: `Inicio de sesión exitoso con ${provider || "correo"}`,
        description: "Redirigiendo al inicio...",
        type: "success",
      });
    }

    if (isAuthenticated()) {
      const timer = setTimeout(() => {
        setRedirect(true);
        localStorage.removeItem("authProvider"); // Limpiar proveedor guardado
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, []);

  /* Redirección automática al home */
  if (redirect) return <Navigate to="/" replace />;

  /* Agregar nueva notificación */
  const addNotification = (notif: Omit<Notif, "id">) => {
    setShowNotif((prev) => {
      const newId = notifId + 1;
      setNotifId(newId);
      return [...prev, { ...notif, id: newId }];
    });
  };

  /* Eliminar notificación existente */
  const removeNotification = (id: number) => {
    setShowNotif((prev) => prev.filter((n) => n.id !== id));
  };

  /* Manejar login con proveedor externo */
  const handleLogin = async (authProvider: string) => {
    try {
      setLoading(true);

      let authUrl = "";
      let success = false;

      ({ auth_url: authUrl, success } = await getAuthUrl(authProvider));

      //Simular error
      //success = false;

      if (success) {
        localStorage.setItem("authProvider", authProvider);
        window.location.href = authUrl;
      } else {
        addNotification({
          title: `Error de ${authProvider}`,
          description: `No se pudo iniciar con ${authProvider}. Intenta de nuevo.`,
          type: "error",
        });
      }
    } catch (error: any) {
      addNotification({
        title: "Error",
        description: error.message || "Ocurrió un error inesperado",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-pattern h-screen py-32 relative">
      {/* Contenedor fijo de notificaciones */}
      <div className="fixed top-5 right-5 flex flex-col gap-3 z-50">
        {showNotif.map((notif) => (
          <Notification
            key={notif.id}
            title={notif.title}
            description={notif.description}
            type={notif.type}
            duration={8000}
            onClose={() => removeNotification(notif.id)}
          />
        ))}
      </div>

      {/* Sección principal del login */}
      <section className="flex flex-col gap-3 items-center w-96 md:w-2/5 mx-auto bg-white p-12 rounded-lg shadow-md">
        <h1 className="text-2xl uppercase font-black">Iniciar Sesión</h1>
        <p>Comienza a elaborar diagramas mientras aprendes</p>

        {/* Formulario de login por correo */}
        <form>
          <p>Aquí va el inicio de sesión con correo y contraseña</p>
        </form>

        {/* Separador visual */}
        <div className="w-full text-center relative my-6">
          <hr />
          <p className="bg-white px-2 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            O
          </p>
        </div>

        {/* Botones de login con proveedores externos */}
        <div className="flex flex-col space-y-4 items-center">
          {loading ? (
            <Loader />
          ) : (
            <>
              <SocialBtn provider="google" authHandler={handleLogin} />
              <SocialBtn provider="github" authHandler={handleLogin} />
            </>
          )}
        </div>
      </section>
    </div>
  );
}
