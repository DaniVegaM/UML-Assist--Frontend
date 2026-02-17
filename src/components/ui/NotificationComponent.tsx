import { toast } from "react-hot-toast";
import { pushToNotificationCenter } from "../layout/Canvas/notificationCenterBridge";


export type NotificationType = "success" | "error" | "info" | "warning";

//Iconos
const SuccessIcon = (
  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ErrorIcon = (
  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const InfoIcon = (
  <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const WarningIcon = (
  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
    />
  </svg>
);

const LoadingIcon = (
  <svg className="animate-spin h-6 w-6 text-sky-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const CloseIcon = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

//Configuración de estilos según el tipo de notificación
const getNotificationStyles = (type: NotificationType | "loading") => {
  const styles = {
    success: {
      bg: "bg-white dark:bg-zinc-800",
      border: "border-l-4 border-green-500",
      icon: SuccessIcon,
      titleColor: "text-green-700 dark:text-green-400",
    },
    error: {
      bg: "bg-white dark:bg-zinc-800",
      border: "border-l-4 border-red-500",
      icon: ErrorIcon,
      titleColor: "text-red-700 dark:text-red-400",
    },
    info: {
      bg: "bg-white dark:bg-zinc-800",
      border: "border-l-4 border-sky-500",
      icon: InfoIcon,
      titleColor: "text-sky-700 dark:text-sky-400",
    },
    loading: {
      bg: "bg-white dark:bg-zinc-800",
      border: "border-l-4 border-sky-500",
      icon: LoadingIcon,
      titleColor: "text-sky-700 dark:text-sky-400",
    },
    warning: {
      bg: "bg-white dark:bg-zinc-800",
      border: "border-l-4 border-yellow-500",
      icon: WarningIcon,
      titleColor: "text-yellow-700 dark:text-yellow-400",
    },

  } as const;

  return styles[type];
};

//Notificación simple
export const notify = (
  type: NotificationType,
  title: string,
  description?: string,
  duration = 5000
) => {
  const styles = getNotificationStyles(type);

  pushToNotificationCenter({ type, title, description });

  toast.custom(
    (t) => (
      <div
        className={`${styles.bg} ${styles.border} rounded-lg shadow-lg p-4 min-w-[320px] max-w-md transition-all duration-300 ${t.visible ? "animate-enter" : "animate-leave"
          }`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">{styles.icon}</div>

          <div className="flex-1 pt-0.5">
            <p className={`font-bold text-sm ${styles.titleColor}`}>{title}</p>
            {description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {description}
              </p>
            )}
          </div>

          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            {CloseIcon}
          </button>
        </div>
      </div>
    ),
    { duration }
  );
};

//Wrapper para promesas con notificaciones
export const notifyPromise = async <T,>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error: string;
    errorDescription?: string;
  }
): Promise<T> => {
  const styles = getNotificationStyles("loading");

  //Mostrando loading
  const toastId = toast.custom(
    () => (
      <div className={`${styles.bg} ${styles.border} rounded-lg shadow-lg p-4 min-w-[320px] max-w-md`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">{styles.icon}</div>
          <div className="flex-1 pt-0.5">
            <p className={`font-bold text-sm ${styles.titleColor}`}>{messages.loading}</p>
          </div>
        </div>
      </div>
    ),
    { duration: Infinity }
  );

  try {
    const result = await promise;
    toast.dismiss(toastId);
    notify("success", messages.success);
    return result;
  } catch (error: unknown) {
    toast.dismiss(toastId);
    notify("error", messages.error, messages.errorDescription);
    throw error;
  }
};
