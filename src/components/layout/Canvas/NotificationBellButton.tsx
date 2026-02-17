import { useNotificationCenter } from "../../../contexts/NotificationCenterContext";

export default function NotificationBellButton() {
    const { toggle, history } = useNotificationCenter();

    return (
        <button
        type="button"
        onClick={toggle}
        className="relative bg-white dark:bg-neutral-800 py-1 px-3 text-sky-600 dark:text-white font-bold uppercase rounded-full hover:bg-zinc-800 hover:text-white transition-all duration-200 cursor-pointer"
        title="Notificaciones"
        >
        🔔
        {history.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5">
            {history.length > 99 ? "99+" : history.length}
            </span>
        )}
        </button>
    );
}
