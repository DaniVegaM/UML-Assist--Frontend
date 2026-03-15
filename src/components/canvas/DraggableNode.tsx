import { useDraggable } from "@neodrag/react";
import { useReactFlow, type XYPosition } from "@xyflow/react";
import { useRef, useState } from "react";
import type { DraggableNodeProps } from "../../types/canvas";
import type { Node } from "@xyflow/react";
import { createPrefixedNodeId, type NodeTypeIdKey } from "../../utils/idGenerator";


export function DraggableNode({ className, children, nodeType, setExtendedBar }: DraggableNodeProps) {
    const draggableRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<XYPosition>({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [startRect, setStartRect] = useState({ top: 0, left: 0, width: 0, height: 0 });
    const { getNodes, setNodes, screenToFlowPosition, getIntersectingNodes } = useReactFlow();

   const getId = () => createPrefixedNodeId(nodeType as NodeTypeIdKey);


    useDraggable(draggableRef as React.RefObject<HTMLElement>, {
        position: position,
        onDragStart: () => {
            if (draggableRef.current?.parentElement) {
                const rect = draggableRef.current.parentElement.getBoundingClientRect();
                setStartRect({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
            }
            setIsDragging(true);
        },
        onDrag: ({ offsetX, offsetY }) => {
            setPosition({
                x: offsetX,
                y: offsetY,
            });
        },
        onDragEnd: async ({ event }) => {
            setIsDragging(false);
            setExtendedBar?.(false);
            setPosition({ x: 0, y: 0 });

            const flow = document.querySelector('.react-flow');
            const flowRect = flow?.getBoundingClientRect();
            const toolsBar = document.querySelector('aside');
            const toolsBarRect = toolsBar?.getBoundingClientRect();

            const screenPosition = { x: event.clientX, y: event.clientY };

            //Revisar que el elemento se haya soltado dentro del lienzo y fuera de la barra de elementos
            const isInFlow =
                flowRect &&
                screenPosition.x >= flowRect.left &&
                screenPosition.x <= flowRect.right &&
                screenPosition.y >= flowRect.top &&
                screenPosition.y <= flowRect.bottom;

            const isOutsideBar = 
                !toolsBarRect || 
                screenPosition.x > toolsBarRect.right;

            //Si sí está dentro entonces se agrega el nodo
            if (isInFlow && isOutsideBar) {
                const flowPosition = screenToFlowPosition(screenPosition);

                // Define el tipo de edge según el tipo de nodo
                let incomingEdge = 'smoothstep'; // tipo por defecto
                let outgoingEdge = 'smoothstep'; // tipo por defecto

                // TODO: en caso de edges personalizados, asignar aquí
                if (nodeType === 'dataNode') {
                    incomingEdge = 'dataIncomingEdge';
                    outgoingEdge = 'dataOutgoingEdge';
                }
                if (nodeType === 'exceptionHandling') {
                    incomingEdge = 'exceptionHandlingEdge';
                }

                const newNodeId = getId();

                const newNode = {
                    id: newNodeId,
                    type: nodeType,
                    position: flowPosition,
                    data: {
                        label: "",
                        incomingEdge: incomingEdge,
                        outgoingEdge: outgoingEdge
                    },
                    draggable: true,
                    connectable: true,
                    style: nodeType === 'InterruptActivityRegion'
                        ? {
                            width: 420,
                            height: 260,
                        }
                        : undefined,
                    // activities tienen zIndex bajo para quedar detrás de otros nodos
                    zIndex: ['activity'].includes(nodeType) ? -1 : 1,
                };

                await setNodes((nds) => {
                    const nodesToAdd: Node[] = [newNode as Node];
                    if (nodeType === 'InterruptActivityRegion') {
                        const acceptEventNode: Node = {
                            id: createPrefixedNodeId("acceptEvent"),
                            type: 'acceptEvent',
                            parentId: newNodeId,
                            extent: 'parent',
                            position: { x: 260, y: 180 },
                            data: {},
                            draggable: true,
                            connectable: true,
                            zIndex: 2,
                        };


                        nodesToAdd.push(acceptEventNode);
                    }

                    return nds.concat(nodesToAdd);
                });


                // Si se esta soltando sobre un activity node, hacer que sea hijo de este 
                await new Promise(resolve => setTimeout(resolve, 50));
                const nodes = getNodes();
                const currentNode = nodes.find(n => n.id === newNodeId);
                if (!currentNode) return;
                const intersections = getIntersectingNodes(currentNode);


                const parentRegion = intersections.find((n) =>
                    n.type === "activity" || n.type === "InterruptActivityRegion"
                );
                if (
                    currentNode.type !== 'activity' &&
                    currentNode.type !== 'InterruptActivityRegion' &&
                    parentRegion
                ) {
                    setNodes((nds) =>
                        nds.map((node) => {
                            if (node.id === currentNode.id) {
                                return {
                                    ...node,
                                    parentId: parentRegion.id,
                                    extent: 'parent',
                                    // Convertir posición absoluta a relativa al padre
                                    position: {
                                        x: node.position.x - parentRegion.position.x,
                                        y: node.position.y - parentRegion.position.y,
                                    },
                                };
                            }
                            return node;
                        })
                    );
                }
            }
        },
    });

    return (
        <div className="relative w-full h-full">
            {/* Elemento estático que siempre mantiene el espacio en el grid de ElementsBar */}
            <div className={`${className} ${isDragging ? 'opacity-50' : 'opacity-100'}`}>
                {children}
            </div>

            {/* Clon arrastrable que captura eventos y se desengancha del overflow */}
            <div 
                ref={draggableRef}
                className={`${className} cursor-grab active:cursor-grabbing`}
                style={{
                    position: isDragging ? 'fixed' : 'absolute',
                    top: isDragging ? startRect.top : 0,
                    left: isDragging ? startRect.left  : 0,
                    width: isDragging ? startRect.width : '100%',
                    height: isDragging ? startRect.height : '100%',
                    margin: 0,
                    zIndex: isDragging ? 9999 : 10,
                    opacity: isDragging ? 1 : 0,
                }}
            >
                {children}
            </div>
        </div>
    );
}
