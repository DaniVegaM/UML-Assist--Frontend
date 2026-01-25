import { useDraggable } from "@neodrag/react";
import { useReactFlow, type XYPosition } from "@xyflow/react";
import { useRef, useState } from "react";
import type { DraggableNodeProps } from "../../types/canvas";
import type { Node } from "@xyflow/react";


export function DraggableNode({ className, children, nodeType, setExtendedBar }: DraggableNodeProps) {
    const draggableRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<XYPosition>({ x: 0, y: 0 });
    const { getNodes, setNodes, screenToFlowPosition, getIntersectingNodes } = useReactFlow();

    const getId = () => {
        const nodes = getNodes();
        // Encontramos el ID más alto para este tipo de nodo y continuamos desde ahí
        const existingIds = nodes
            .filter(n => n.id.startsWith(`${nodeType}_`))
            .map(n => {
                const match = n.id.match(new RegExp(`^${nodeType}_(\\d+)$`));
                return match ? parseInt(match[1], 10) : -1;
            })
            .filter(id => id >= 0);

        const nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 0;
        return `${nodeType}_${nextId}`;
    };

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
                    style: nodeType === 'InterruptActivityRegion'
                        ? {
                            width: 420,
                            height: 260,
                        }
                        : undefined,
                    zIndex: nodeType !== 'activity' ? 1 : -1,
                };

                await setNodes((nds) => {
                    const nodesToAdd: Node[] = [newNode as Node];
                    if (nodeType === 'InterruptActivityRegion') {
                        const acceptEventNode: Node = {
                            id: `accept_${newNode.id}`,
                            type: 'acceptEvent',
                            parentId: newNode.id,
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
                const currentNode = nodes.find(n => n.id === newNode.id);
                if (!currentNode) return;
                const intersections = getIntersectingNodes(currentNode).map((n) => n.id);

                const parentRegionId = intersections.find(nodeId =>
                    nodeId.startsWith('activity') ||
                    nodeId.startsWith('InterruptActivityRegion')
                );
                if (
                    currentNode.type !== 'activity' &&
                    currentNode.type !== 'InterruptActivityRegion' &&
                    parentRegionId
                ) {
                    setNodes((nds) =>
                        nds.map((node) => {
                            if (node.id === currentNode.id) {
                                return {
                                    ...node,
                                    parentId: parentRegionId,
                                    extent: 'parent',
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
        <div className={`${className} cursor-grab active:cursor-grabbing`} ref={draggableRef}>
            {children}
        </div>
    );
}
