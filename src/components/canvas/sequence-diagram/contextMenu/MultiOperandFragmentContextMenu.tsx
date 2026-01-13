import { useRef, useEffect, useState } from "react";
import { useCanvas } from "../../../../hooks/useCanvas";
import { useReactFlow, useNodes, type Node as RFNode, type XYPosition } from "@xyflow/react";

interface MultiOperandFragmentContextMenuProps {
    fragmentType: 'seqFragment' | 'strictFragment' | 'parFragment';
    fragmentLabel: string;
    minSeparators?: number; // Mínimo de separadores (para par es 1)
}

export default function MultiOperandFragmentContextMenu({ 
    fragmentType, 
    fragmentLabel,
    minSeparators = 0 
}: MultiOperandFragmentContextMenuProps) {
    const { contextMenu, closeContextMenu } = useCanvas();
    const { setNodes } = useReactFlow();
    const nodes = useNodes();
    const menuRef = useRef<HTMLDivElement>(null);

    const [menuPos, setMenuPos] = useState<XYPosition>({ x: 0, y: 0 });

    // Al abrir el menú, calculamos la posición
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
    }, [contextMenu, closeContextMenu]);

    if (!contextMenu) return null;

    // Verificar que es el tipo de nodo correcto
    const node = nodes.find((n: RFNode) => n.id === contextMenu.nodeId);
    if (!node || node.type !== fragmentType) return null;

    const addSeparator = () => {
        setNodes((nodes: RFNode[]) =>
            nodes.map((n: RFNode) => {
                if (n.id === contextMenu.nodeId) {
                    const currentSeparators = (n.data?.separatorCount as number) || 0;
                    return {
                        ...n,
                        data: {
                            ...n.data,
                            separatorCount: currentSeparators + 1,
                            action: 'addSeparator'
                        }
                    };
                }
                return n;
            })
        );
        closeContextMenu();
    };

    const removeSeparator = () => {
        setNodes((nodes: RFNode[]) =>
            nodes.map((n: RFNode) => {
                if (n.id === contextMenu.nodeId) {
                    const currentSeparators = (n.data?.separatorCount as number) || 0;
                    if (currentSeparators > minSeparators) {
                        return {
                            ...n,
                            data: {
                                ...n.data,
                                separatorCount: currentSeparators - 1,
                                action: 'removeSeparator'
                            }
                        };
                    }
                }
                return n;
            })
        );
        closeContextMenu();
    };

    const currentSeparators = (node.data?.separatorCount as number) || 0;
    const canRemove = currentSeparators > minSeparators;

    return (
        <div
            ref={menuRef}
            className="fixed z-50 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-sky-600 dark:border-neutral-700 min-w-[180px] overflow-hidden"
            style={{ top: menuPos.y, left: menuPos.x }}
            onContextMenu={(e) => e.preventDefault()}
        >
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-neutral-700">
                Fragmento {fragmentLabel}
            </div>
            <div className="flex flex-col">
                <div
                    onClick={addSeparator}
                    className="px-4 py-2 cursor-pointer text-sm dark:text-white hover:bg-sky-100 dark:hover:bg-sky-700 transition-colors flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Agregar operando
                </div>
                <div className="border-t border-gray-200 dark:border-neutral-700"></div>
                <div
                    onClick={canRemove ? removeSeparator : undefined}
                    className={`px-4 py-2 text-sm flex items-center gap-2 transition-colors ${
                        canRemove
                            ? 'cursor-pointer dark:text-white hover:bg-sky-100 dark:hover:bg-sky-700'
                            : 'cursor-not-allowed text-gray-400 dark:text-gray-600'
                    }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                    Eliminar operando
                    {currentSeparators > 0 && (
                        <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                            ({currentSeparators})
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
