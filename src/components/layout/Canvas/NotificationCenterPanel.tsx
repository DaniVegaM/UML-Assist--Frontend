import { useNotificationCenter } from "../../../contexts/NotificationCenterContext";

function timeAgo(ts: number) {
    const diff = Date.now() - ts;
    const min = Math.floor(diff / 60000);
    if (min < 1) return "Ahora";
    if (min < 60) return `Hace ${min} min`;
    const h = Math.floor(min / 60);
    return `Hace ${h} h`;
}

export default function NotificationCenterPanel() {
    const { isOpen, history, clear, remove, toggle } = useNotificationCenter();
    if (!isOpen) return null;

    return (
    <div className="absolute right-4 top-4 z-[9999] w-[360px] overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-xl backdrop-blur">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <p className="text-sm font-semibold text-white">Notificaciones</p>
            <div className="flex items-center gap-2">
            <button onClick={clear} className="rounded-lg px-2 py-1 text-xs text-white/80 hover:bg-white/10">Limpiar</button>
            <button onClick={toggle} className="rounded-lg px-2 py-1 text-xs text-white/80 hover:bg-white/10">Cerrar</button>
            </div>
        </div>

        <div className="max-h-[360px] overflow-auto">
            {history.length === 0 ? (
            <p className="px-4 py-6 text-sm text-white/60">No hay notificaciones todavía.</p>
            ) : (
            history.map((n) => {
                const dot =
                n.type === "error" ? "bg-red-500" :
                n.type === "warning" ? "bg-yellow-500" :
                n.type === "success" ? "bg-green-500" : "bg-sky-500";

                return (
                <div key={n.id} className="flex gap-3 border-b border-white/10 px-4 py-3">
                    <div className={`mt-1 h-3 w-3 rounded-full ${dot}`} />
                    <div className="flex-1">
                    <p className="text-sm text-white font-semibold">{n.title}</p>
                    {n.description && <p className="mt-1 text-xs text-white/60">{n.description}</p>}
                    <p className="mt-1 text-[11px] text-white/40">{timeAgo(n.createdAt)}</p>
                    </div>
                    <button onClick={() => remove(n.id)} className="h-8 rounded-lg px-2 text-xs text-white/70 hover:bg-white/10" title="Quitar">
                    ✕
                    </button>
                </div>
                );
            })
            )}
        </div>
    </div>
);
}
