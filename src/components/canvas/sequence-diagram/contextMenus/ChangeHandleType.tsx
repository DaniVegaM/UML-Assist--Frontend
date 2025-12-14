import "react-contexify/dist/ReactContexify.css";
import { useSequenceDiagram } from "../../../../hooks/useSequenceDiagram";
import { useReactFlow, MarkerType } from "@xyflow/react";
import { useTheme } from "../../../../hooks/useTheme";
import { useCanvas } from "../../../../hooks/useCanvas";

interface ChangeHandleTypeProps {
    id: string;
    onClose: () => void;
    lifeLineId: string;
    handleId: string | null;
    handleIndex: number | null;
    onDestroyEvent?: (action: 'destroy' | 'default') => void;
}

export default function ChangeHandleType({ onClose, handleId, lifeLineId, handleIndex, onDestroyEvent }: ChangeHandleTypeProps) {

    const { setNodes, setEdges } = useSequenceDiagram();
    const { getNode } = useReactFlow();
    const { isDarkMode } = useTheme();
    const { generateUniqueId } = useCanvas();

    const handleItemClick = (action: string) => {
        if (action === 'default' || action === 'destroy') {
            setNodes(prev => {
                return prev.map(node => {
                    if (node.id === lifeLineId) {
                        const updatedHandles = node.data.orderedHandles?.map(handle => {
                            if (handle.id === handleId) {
                                return {
                                    ...handle,
                                    id: action === 'default' ? `defaultHandle_${handle.id.split('_').slice(1).join('_')}`
                                        :
                                        `destroyHandle_${handle.id.split('_').slice(1).join('_')}`
                                };
                            } else{
                                return handle;
                            }
                        });

                        return {
                            ...node,
                            data: {
                                ...node.data,
                                orderedHandles: updatedHandles
                            }
                        }
                    }
                    else {
                        return node;
                    }
                });
            });
            
            // Llamar callback para notificar el evento de destrucción
            if (onDestroyEvent) {
                onDestroyEvent(action as 'destroy' | 'default');
            }
        }
        
        onClose();
    };

    const handleLostMessage = () => {
        const sourceNode = getNode(lifeLineId);
        if (!sourceNode || handleIndex === null) {
            onClose();
            return;
        }

        const edgeId = `lost-${lifeLineId}-${handleId}-${generateUniqueId()}`;
        const sourceHandleId = `${lifeLineId}_Handle-${handleIndex}`;

        const newEdge = {
            id: edgeId,
            type: 'lostMessageEdge',
            source: lifeLineId,
            target: lifeLineId, // Self-reference para que funcione
            sourceHandle: sourceHandleId,
            targetHandle: null,
            data: { edgeType: 'lost' },
            style: {
                strokeWidth: 2,
                stroke: isDarkMode ? '#FFFFFF' : '#171717',
            },
            markerEnd: {
                type: MarkerType.Arrow,
                width: 20,
                height: 20,
                color: isDarkMode ? '#FFFFFF' : '#171717'
            }
        };

        setEdges(prev => [...prev, newEdge]);
        onClose();
    };

    const handleFoundMessage = () => {
        const targetNode = getNode(lifeLineId);
        if (!targetNode || handleIndex === null) {
            onClose();
            return;
        }

        const edgeId = `found-${lifeLineId}-${handleId}-${generateUniqueId()}`;
        const targetHandleId = `${lifeLineId}_Handle-${handleIndex}`;

        const newEdge = {
            id: edgeId,
            type: 'foundMessageEdge',
            source: lifeLineId, // Self-reference para que funcione
            target: lifeLineId,
            sourceHandle: null,
            targetHandle: targetHandleId,
            data: { edgeType: 'found' },
            style: {
                strokeWidth: 2,
                stroke: isDarkMode ? '#FFFFFF' : '#171717',
            },
            markerEnd: {
                type: MarkerType.Arrow,
                width: 20,
                height: 20,
                color: isDarkMode ? '#FFFFFF' : '#171717'
            }
        };

        setEdges(prev => [...prev, newEdge]);
        onClose();
    };

    const handleCreateNewLifeLine = () => {
        const sourceNode = getNode(lifeLineId);
        if (!sourceNode || handleIndex === null) {
            onClose();
            return;
        }

        const HEADER_HEIGHT = 60; // Altura aproximada del header de la lifeline
        
        // Calcular la posición de la nueva lifeline (a la derecha de la actual)
        const newLifeLineId = `lifeLine_created_${generateUniqueId()}`;
        const newPositionX = sourceNode.position.x + 300;
        
        // Obtener la posición del handle desde los internals de React Flow
        const handleId = `${lifeLineId}_Handle-${handleIndex}`;
        const sourceNodeElement = document.querySelector(`[data-id="${lifeLineId}"]`);
        const handleElement = sourceNodeElement?.querySelector(`[data-handleid="${handleId}"]`);
        
        let newPositionY = sourceNode.position.y; // Default
        
        if (handleElement) {
            // Obtener la posición del handle relativa al nodo
            const handleRect = handleElement.getBoundingClientRect();
            const nodeRect = sourceNodeElement!.getBoundingClientRect();
            const handleTopInNode = handleRect.top - nodeRect.top;
            
            // La nueva lifeline debe posicionarse de modo que su header center esté a la altura del handle
            newPositionY = sourceNode.position.y + handleTopInNode - (HEADER_HEIGHT / 2);
        }

        // Crear la nueva lifeline
        const newLifeLine = {
            id: newLifeLineId,
            type: 'lifeLine',
            position: { x: newPositionX, y: newPositionY },
            data: {
                orderedHandles: [],
                isCreatedLifeLine: true
            },
            connectable: true,
            draggable: true,
        };

        // Crear el edge de creación
        const edgeId = `create-${lifeLineId}-${newLifeLineId}-${generateUniqueId()}`;
        const sourceHandleId = `${lifeLineId}_Handle-${handleIndex}`;

        const newEdge = {
            id: edgeId,
            type: 'createLifeLineEdge',
            source: lifeLineId,
            target: newLifeLineId,
            sourceHandle: sourceHandleId,
            targetHandle: null,
            data: { edgeType: 'create' },
            style: {
                strokeWidth: 2,
                stroke: isDarkMode ? '#FFFFFF' : '#171717',
                strokeDasharray: '5,5'
            },
            markerEnd: {
                type: MarkerType.Arrow,
                width: 20,
                height: 20,
                color: isDarkMode ? '#FFFFFF' : '#171717'
            }
        };

        setNodes(prev => [...prev, newLifeLine]);
        setEdges(prev => [...prev, newEdge]);
        onClose();
    };

    return (
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-sky-600 dark:border-neutral-700 min-w-[220px] overflow-hidden">
            {/* Handle predeterminado */}
            <div
                onClick={() => handleItemClick('default')}
                className="flex items-center gap-3 px-4 py-2 hover:bg-sky-100 dark:hover:bg-neutral-700 cursor-pointer text-sm dark:text-white"
            >
                <div className="rounded-full bg-neutral-400 dark:bg-neutral-300 w-6 h-6"></div>
                <p>Handle predeterminado</p>
            </div>
            <div className="border-b border-sky-600 dark:border-neutral-700"></div>
            
            {/* Evento de destrucción */}
            <div
                onClick={() => handleItemClick('destroy')}
                className="flex items-center gap-3 px-4 py-2 hover:bg-sky-100 dark:hover:bg-neutral-700 cursor-pointer text-sm dark:text-white"
            >
                <div className="rounded-full w-6 h-6">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" className="w-full h-full stroke-black dark:stroke-neutral-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"/>
                    </svg>
                </div>
                <p>Evento de destrucción</p>
            </div>
            <div className="border-b border-sky-600 dark:border-neutral-700"></div>
            
            {/* Mensaje perdido */}
            <div
                onClick={handleLostMessage}
                className="flex items-center gap-3 px-4 py-2 hover:bg-sky-100 dark:hover:bg-neutral-700 cursor-pointer text-sm dark:text-white"
            >
                <div className="w-6 h-6 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <line x1="4" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="20" cy="12" r="3" fill="currentColor"/>
                        <path d="M12 8L16 12L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                <p>Mensaje perdido</p>
            </div>
            <div className="border-b border-sky-600 dark:border-neutral-700"></div>
            
            {/* Mensaje encontrado */}
            <div
                onClick={handleFoundMessage}
                className="flex items-center gap-3 px-4 py-2 hover:bg-sky-100 dark:hover:bg-neutral-700 cursor-pointer text-sm dark:text-white"
            >
                <div className="w-6 h-6 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="4" cy="12" r="3" fill="currentColor"/>
                        <line x1="8" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="2"/>
                        <path d="M16 8L20 12L16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                <p>Mensaje encontrado</p>
            </div>
            <div className="border-b border-sky-600 dark:border-neutral-700"></div>
            
            {/* Crear nueva línea de vida */}
            <div
                onClick={handleCreateNewLifeLine}
                className="flex items-center gap-3 px-4 py-2 hover:bg-sky-100 dark:hover:bg-neutral-700 cursor-pointer text-sm dark:text-white"
            >
                <div className="w-6 h-6 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-full h-full">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                </div>
                <p>Crear nueva línea de vida</p>
            </div>
        </div>
    )
}