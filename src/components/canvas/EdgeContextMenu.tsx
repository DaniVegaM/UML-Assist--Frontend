import { useRef, useEffect, useState } from "react";
import { useCanvas } from "../../hooks/useCanvas";
import { useReactFlow, type XYPosition } from "@xyflow/react";
import DeleteIcon from "./shared/DeleteIcon";

export default function EdgeContextMenu() {
    const { edgeContextMenu, closeEdgeContextMenu } = useCanvas();
    const { setEdges } = useReactFlow();
    const menuRef = useRef<HTMLDivElement>(null);

    const [menuPos, setMenuPos] = useState<XYPosition>({ x: 0, y: 0 });

    useEffect(() => {
        if (!edgeContextMenu) return;
        setMenuPos({ x: edgeContextMenu.x, y: edgeContextMenu.y });
    }, [edgeContextMenu]);

    // Cierra el menú al hacer click o cualquier interacción fuera
    useEffect(() => {
        if (!edgeContextMenu) return;

        const handleClose = (event: Event) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                closeEdgeContextMenu();
            }
        };

        document.addEventListener('mousedown', handleClose, true);
        document.addEventListener('contextmenu', handleClose, true);
        document.addEventListener('wheel', handleClose, true);
        document.addEventListener('touchstart', handleClose, true);
        document.addEventListener('pointerdown', handleClose, true);

        return () => {
            document.removeEventListener('mousedown', handleClose, true);
            document.removeEventListener('contextmenu', handleClose, true);
            document.removeEventListener('wheel', handleClose, true);
            document.removeEventListener('touchstart', handleClose, true);
            document.removeEventListener('pointerdown', handleClose, true);
        };
    }, [edgeContextMenu, closeEdgeContextMenu]);

    if (!edgeContextMenu) return null;

    const deleteEdge = () => {
        setEdges((edges) =>
            edges.filter((edge) => edge.id !== edgeContextMenu.edgeId)
        );
        closeEdgeContextMenu();
    };

    return (
        <div
            ref={menuRef}
            className="fixed z-50 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-sky-600 dark:border-neutral-700 min-w-[160px] overflow-hidden"
            style={{ top: menuPos.y, left: menuPos.x }}
            onContextMenu={(e) => e.preventDefault()}
        >
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-neutral-700">
                Opciones
            </div>
            <div className="flex flex-col">
                <div
                    onClick={deleteEdge}
                    className="px-4 py-2 cursor-pointer text-sm dark:text-white hover:bg-red-100 dark:hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                    <DeleteIcon />
                    Eliminar conexión
                </div>
            </div>
        </div>
    );
}
