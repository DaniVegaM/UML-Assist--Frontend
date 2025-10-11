import { Toaster, toast } from "react-hot-toast";
import Icon from "./Icons";

export type NotificationType = "success" | "error" | "info" | "warning";

/**
 * Notificación normal
 */
export const notify = (
  type: NotificationType,
  title: string,
  description?: string,
  duration = 5000
) => {
  const colorClasses =
    type === "success"
      ? "border-sky-500 text-sky-700"
      : type === "error"
      ? "border-zinc-500 text-zinc-700"
      : type === "info"
      ? "border-zinc-500 text-zinc-700"
      : "border-yellow-400 text-yellow-800";

  toast(
    (t) => (
      <div
        className={`flex flex-col gap-1 p-3 border-l-8 rounded shadow-md ${colorClasses} `}
      >
        <div className="flex justify-between items-center">
          <strong>{title}</strong>
          <button
            className="text-red-500 hover:text-red-800 p-1 hover:bg-red-100 hover:shadow-lg transition rounded-xl"
            onClick={() => toast.dismiss(t.id)}
          >
            <Icon name="trash" className="w-4 h-4 text-red-800" />
          </button>
        </div>
        {description && (
          <span className="text-black text-sm">{description}</span>
        )}
      </div>
    ),
    { duration }
  );
};

/**
 * Notificación basada en promesa usando el mismo estilo que notify
 */
export async function notifyPromise<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error: string;
  },
  type: NotificationType = "info"
): Promise<T> {
  // Loading siempre amarillo
  const loadingColorClasses = "border-yellow-400 text-yellow-800";

  // Mostrar toast de loading
  const toastId = toast(
    (t) => (
      <div
        className={`flex flex-col gap-1 p-3 border-l-8 rounded shadow-md ${loadingColorClasses}`}
      >
        <div className="flex justify-between items-center">
          <strong>{messages.loading}</strong>
          <button
            className="text-red-500 hover:text-red-800 p-1 hover:bg-red-100 hover:shadow-lg transition rounded-xl"
            onClick={() => toast.dismiss(t.id)}
          >
            <Icon name="trash" className="w-4 h-4 text-red-800" />
          </button>
        </div>
        <span className="text-black text-sm">&nbsp;</span>
      </div>
    ),
    { duration: Infinity }
  );

  try {
    const result = await promise;

    toast.dismiss(toastId);
    // Success azul como en notify
    notify("success", messages.success);

    return result;
  } catch (error: any) {
    toast.dismiss(toastId);
    // Error gris como en notify
    notify("error", messages.error, error?.message);
    throw error;
  }
}

/**
 * Contenedor global de notificaciones
 */
export default function NotificationsContainer() {
  return <Toaster position="top-right" containerStyle={{ padding: 0 }} />;
}
