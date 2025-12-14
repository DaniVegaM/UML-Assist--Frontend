import { useRef, useEffect, useState } from "react";
import { useCanvas } from "../../../../hooks/useCanvas";
import { useReactFlow, useNodes, type Node as RFNode, type XYPosition } from "@xyflow/react";

export default function DataNodeContextMenu() {
    const { contextMenu, closeContextMenu } = useCanvas();
    const { setNodes } = useReactFlow();
    const nodes = useNodes();
    const menuRef = useRef<HTMLDivElement>(null);

    const [menuPos, setMenuPos] = useState<XYPosition>({ x: 0, y: 0 });

    // Al abrir el menú, calculamos el offset inicial
    useEffect(() => {
        if (!contextMenu) return;

        const node = nodes.find((n: RFNode) => n.id === contextMenu.nodeId);
        if (!node) return;

        const dx = contextMenu.x - (node.position?.x ?? 0);
        const dy = contextMenu.y - (node.position?.y ?? 0);

        setMenuPos({ x: (node.position?.x ?? 0) + dx, y: (node.position?.y ?? 0) + dy });
    }, [contextMenu, nodes]);

    // Cierra el menú al hacer click o cualquier interacción fuera
    useEffect(() => {
        if (!contextMenu) return;

        const handleClose = (event: Event) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                closeContextMenu();
            }
        };

        // Escuchar varios eventos
        document.addEventListener('mousedown', handleClose, true); // click izquierdo o arrastre
        document.addEventListener('contextmenu', handleClose, true); // click derecho
        document.addEventListener('wheel', handleClose, true); // scroll
        document.addEventListener('touchstart', handleClose, true); // mobile
        document.addEventListener('pointerdown', handleClose, true); // pointer events generales

        return () => {
            document.removeEventListener('mousedown', handleClose, true);
            document.removeEventListener('contextmenu', handleClose, true);
            document.removeEventListener('wheel', handleClose, true);
            document.removeEventListener('touchstart', handleClose, true);
            document.removeEventListener('pointerdown', handleClose, true);
        };
    }, [contextMenu, closeContextMenu]);


    if (!contextMenu) return null;

    const changeType = (variant: "centralBuffer" | "datastore") => {
        setNodes((nodes: RFNode[]) =>
            nodes.map((n: RFNode) =>
                n.id === contextMenu.nodeId
                    ? { ...n, data: { ...n.data, objectVariant: variant } }
                    : n
            )
        );
        closeContextMenu();
    };

    return (
        <div
            ref={menuRef}
            className="fixed z-50 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-sky-600 dark:border-neutral-700 min-w-[160px] overflow-hidden"
            style={{ top: menuPos.y, left: menuPos.x }}
            onContextMenu={(e) => e.preventDefault()} // evita que se abra el menú del navegador sobre el menú
        >

            <div className="flex flex-col">
                <div
                    onClick={() => changeType("datastore")}
                    className="px-4 py-2 cursor-pointer text-sm dark:text-white hover:bg-sky-100 dark:hover:bg-sky-700 transition-colors"
                >
                    Data Store
                </div>
                <div className="border-t border-sky-600 dark:border-neutral-700"></div>
                <div
                    onClick={() => changeType("centralBuffer")}
                    className="px-4 py-2 cursor-pointer text-sm dark:text-white hover:bg-sky-100 dark:hover:bg-sky-700 transition-colors"
                >
                    Central Buffer
                </div>
            </div>
        </div>
    );
}
