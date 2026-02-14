import { useRef, useEffect, useState } from "react";
import { useCanvas } from "../../hooks/useCanvas";
import { useReactFlow, useNodes, type Node as RFNode, type XYPosition } from "@xyflow/react";
import DeleteIcon from "./shared/DeleteIcon";

export default function NodeContextMenu() {
    const { contextMenu, closeContextMenu } = useCanvas();
    const { setNodes, setEdges } = useReactFlow();
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

    // Obtener el nodo actual
    const currentNode = nodes.find((n: RFNode) => n.id === contextMenu.nodeId);
    if (!currentNode) return null;

    // Verificar si es un dataNode
    const isDataNode = currentNode.type === 'dataNode';

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

    const deleteNode = () => {
        // Eliminar el nodo
        setNodes((nodes: RFNode[]) =>
            nodes.filter((n: RFNode) => n.id !== contextMenu.nodeId)
        );
        
        // Eliminar todas las conexiones (edges) asociadas al nodo
        setEdges((edges) =>
            edges.filter((edge) => 
                edge.source !== contextMenu.nodeId && edge.target !== contextMenu.nodeId
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
            {isDataNode && (
                <>
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-neutral-700">
                        Tipo de nodo
                    </div>
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
                    <div className="border-t border-sky-600 dark:border-neutral-700"></div>
                </>
            )}
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-neutral-700">
                Opciones
            </div>
            <div className="flex flex-col">
                <div
                    onClick={deleteNode}
                    className="px-4 py-2 cursor-pointer text-sm dark:text-white hover:bg-red-100 dark:hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                    <DeleteIcon />
                    Eliminar
                </div>
            </div>
        </div>
    );
}

