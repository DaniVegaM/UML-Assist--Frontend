import { useEffect, useState, useRef } from "react";

/* Props para el componente de notificación */
type NotificationProps = {
  title: string;
  description?: string;
  type?: "success" | "error";
  duration?: number; // Duración en milisegundos
  onClose: () => void;
};

export default function Notification({
  title,
  description,
  type = "success",
  duration = 5000,
  onClose,
}: NotificationProps) {
  /* Estado del progreso de la barra */
  const [progress, setProgress] = useState(100);

  /* Estado de animación de salida */
  const [closing, setClosing] = useState(false);

  /* Estado de pausa (hover del mouse) */
  const [paused, setPaused] = useState(false);

  /* Tiempo restante en ms */
  const remainingTime = useRef(duration);

  /* Referencia al intervalo */
  const intervalRef = useRef<number | null>(null);

  /* Efecto para manejar el temporizador */
  useEffect(() => {
    const interval = 50; // Intervalo en ms

    const tick = () => {
      if (!paused) {
        setProgress((prev) => {
          const decrement = (interval / remainingTime.current) * prev;
          const next = prev - decrement;
          remainingTime.current -= interval;

          if (next <= 0) {
            if (intervalRef.current) window.clearInterval(intervalRef.current);
            handleClose();
            return 0;
          }
          return next;
        });
      }
    };

    intervalRef.current = window.setInterval(tick, interval);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [paused]);

  /* Estilos dinámicos según tipo de notificación */
  const borderColor =
    type === "success" ? "border-green-500" : "border-red-500";
  const textColor = type === "success" ? "text-green-500" : "text-red-500";

  /* Manejar cierre de la notificación */
  const handleClose = () => {
    setClosing(true); // Activa animación de salida
    setTimeout(onClose, 500); // Espera a la animación antes de remover
  };

  return (
    <div
      className={`
        w-80 max-w-sm p-4 rounded-lg
        bg-white border-l-4 ${borderColor}
        shadow-lg shadow-gray-300
        flex flex-col gap-2
        transform transition-all duration-500 ease-out
        ${closing ? "animate-fade-out" : "animate-slide-in"}
      `}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Encabezado con título y botón de cierre */}
      <div className="flex justify-between items-start">
        <h3 className={`font-bold text-lg ${textColor}`}>{title}</h3>
        <button
          className="font-bold text-xl leading-none text-red-500 hover:opacity-70"
          onClick={handleClose}
        >
          ×
        </button>
      </div>

      {/* Descripción opcional */}
      {description && (
        <p className="text-gray-700 text-sm opacity-90">{description}</p>
      )}

      {/* Barra de progreso */}
      <div className="h-1 w-full bg-gray-200 rounded overflow-hidden mt-2">
        <div
          className={`${
            type === "success" ? "bg-green-500" : "bg-red-500"
          } h-full`}
          style={{ width: `${progress}%`, transition: "width 50ms linear" }}
        ></div>
      </div>
    </div>
  );
}
