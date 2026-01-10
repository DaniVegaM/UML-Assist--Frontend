import { useDraggable } from "@neodrag/react";
import { useReactFlow, type XYPosition } from "@xyflow/react";
import { useRef, useState } from "react";
import type { DraggableNodeProps } from "../../types/canvas";


export function DraggableNode({ className, children, nodeType, setExtendedBar }: DraggableNodeProps) {
    const draggableRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<XYPosition>({ x: 0, y: 0 });
    const { getNodes, setNodes, screenToFlowPosition, getIntersectingNodes } = useReactFlow();

    let id = 0;
    const getId = () => `${nodeType}_${id++}`;

    useDraggable(draggableRef as React.RefObject<HTMLElement>, {
        position: position,
        onDrag: ({ offsetX, offsetY }) => {
            setPosition({
                x: offsetX,
                y: offsetY,
            });
        },
        onDragEnd: async ({ event }) => {
            setExtendedBar?.(false);
            setPosition({ x: 0, y: 0 });

            const flow = document.querySelector('.react-flow');
            const flowRect = flow?.getBoundingClientRect();
            const screenPosition = { x: event.clientX, y: event.clientY };

            //Revisar que el elemento se haya soltado dentro del lienzo
            const isInFlow =
                flowRect &&
                screenPosition.x >= flowRect.left &&
                screenPosition.x <= flowRect.right &&
                screenPosition.y >= flowRect.top &&
                screenPosition.y <= flowRect.bottom;

            //Si sí está dentro entonces se agrega el nodo
            if (isInFlow) {
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

                const newNode = {
                    id: getId(),
                    type: nodeType,
                    position: flowPosition,
                    data: {
                        label: `${nodeType} node`,
                        incomingEdge: incomingEdge,
                        outgoingEdge: outgoingEdge
                    },
                    draggable: true,
                    connectable: true,
                    // Fragmentos y activities tienen zIndex bajo para quedar detrás de otros nodos
                    zIndex: ['activity', 'baseFragment', 'altFragment', 'optFragment', 'loopFragment'].includes(nodeType) ? -1 : 1,
                };

                await setNodes((nds) => nds.concat(newNode));

                // Si se esta soltando sobre un activity node, hacer que sea hijo de este 
                await new Promise(resolve => setTimeout(resolve, 50));
                const nodes = getNodes();
                const currentNode = nodes.find(n => n.id === newNode.id);
                if (!currentNode) return;
                const intersections = getIntersectingNodes(currentNode).map((n) => n.id);

                if (currentNode.type !== 'activity' && intersections.some(nodeId => nodeId.startsWith('activity'))) {
                    setNodes((nds) => nds.map(node => {
                        if (node.id === currentNode.id) {
                            return {
                                ...node,
                                parentId: intersections.find(nodeId => nodeId.startsWith('activity')) || undefined,
                                extent: 'parent',
                            }
                        }
                        else {
                            return node;
                        }
                    }));
                }
            }
        },
    });

    return (
        <div className={`${className} cursor-grab active:cursor-grabbing`} ref={draggableRef}>
            {children}
        </div>
    );
}
