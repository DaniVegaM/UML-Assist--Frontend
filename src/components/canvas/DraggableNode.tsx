import { useDraggable } from "@neodrag/react";
import { useReactFlow, type XYPosition } from "@xyflow/react";
import { useRef, useState } from "react";
import type { DraggableNodeProps } from "../../types/canvas";
import type { Node } from "@xyflow/react";
import { createPrefixedNodeId, type NodeTypeIdKey } from "../../utils/idGenerator";


function DraggableNode({ className, children, nodeType, setExtendedBar }: DraggableNodeProps) {    
    const draggableRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<XYPosition>({ x: 0, y: 0 });
    const { getNodes, setNodes, screenToFlowPosition, getIntersectingNodes } = useReactFlow();

    const getId = () => createPrefixedNodeId(nodeType as NodeTypeIdKey);


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
                
                const newNodeId = getId();
                const isAlt = nodeType === "altFragment";
                const isLoop = nodeType === "loopFragment";
                const isNote = nodeType === "note";
                const isSimpleAction = nodeType === "simpleAction";
                const isCallOperation = nodeType === "callOperation";
                const isObjectNode = nodeType === "objectNode";
                const isDataNode = nodeType === "dataNode";
                const isAcceptEvent = nodeType === "acceptEvent";
                const isAcceptTimeEvent = nodeType === "acceptTimeEvent";
                const isSendSignal = nodeType === "sendSignal";
                const isCallBehavior = nodeType === "callBehavior";
                const isExceptionHandling = nodeType === "exceptionHandling";
                const isActivity = nodeType === "activity";
                const isConnectorNode = nodeType === "connectorNode";

                const needsGuard = ['optFragment', 'loopFragment', 'breakFragment'].includes(nodeType);

                const newNode = {
                    id: newNodeId,
                    type: nodeType,
                    position: flowPosition,
                    selected: true, 
                    data: {
                        label: "",
                        incomingEdge,
                        outgoingEdge,

                        ...(needsGuard
                            ? {
                                guard: "",
                                mustFillGuard: true,
                                guardError: null,
                            }
                        : {}),

                        ...(isLoop
                            ? {
                                minIterations: "0",
                                maxIterations: "*",
                            }
                        : {}),

                        ...(isAlt
                            ? {
                                firstOperand: "",
                                mustFillFirstOperand: true,
                                firstOperandError: null,
                                separatorValues: [],
                                separatorPositions: [],
                                separatorErrors: [],
                            }
                        : {}),
                        ...(isNote
                            ? {
                                // label ya existe arriba y es lo que usa NoteComponent
                                mustFillText: true,
                                labelError: null,
                                }
                        : {}),
                        ...(isSimpleAction
                            ? {
                                mustFillLabel: true,
                                labelError: null,
                                }
                        : {}),
                        ...(isCallOperation
                            ? {
                                mustFillLabel: true,
                                labelError: null,
                            }
                        : {}),
                        ...(isObjectNode
                            ? {
                                mustFillLabel: true,
                                labelError: null,
                            }
                        : {}),
                        ...(isDataNode
                            ? {
                                mustFillLabel: true,
                                labelError: null,
                            }
                        : {}),
                        ...(isAcceptEvent
                            ? {
                                mustFillLabel: true,
                                labelError: null,
                            }
                        : {}),
                        ...(isAcceptTimeEvent
                            ? {
                                mustFillLabel: true,
                                labelError: null,
                            }
                        : {}),
                        ...(isSendSignal
                        ? {
                            mustFillLabel: true,
                            labelError: null,
                        }
                        : {}),
                        ...(isCallBehavior
                        ? {
                            mustFillLabel: true,
                            labelError: null,
                        }
                        : {}),
                        ...(isExceptionHandling
                            ? {
                                mustFillLabel: true,
                                labelError: null,
                            }
                        : {}),
                        ...(isActivity
                        ? {
                            mustFillLabel: true,
                            labelError: null,
                            }
                        : {}),
                        ...(isConnectorNode
                        ? {
                            mustFillLabel: true,
                            labelError: null,
                            }
                        : {}),
                    },
                    draggable: true,
                    connectable: true,
                    style: nodeType === 'InterruptActivityRegion'
                        ? {
                            width: 420,
                            height: 260,
                        }
                        : undefined,
                    // Fragmentos y activities tienen zIndex bajo para quedar detrás de otros nodos
                    zIndex: ['activity', 'baseFragment', 'altFragment', 'optFragment', 'loopFragment', 'breakFragment', 'note'].includes(nodeType) ? -1 : 1,
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
                            data: {
                                label: "",
                                mustFillLabel: true,
                                labelError: null,
                            },
                            draggable: true,
                            connectable: true,
                            zIndex: 2,
                        };


                        nodesToAdd.push(acceptEventNode);
                    }

                    return [
                    ...nds.map((n) => ({ ...n, selected: false } as Node)),
                    ...nodesToAdd,
                    ];
                });


                // Si se esta soltando sobre un activity node, hacer que sea hijo de este 
                await new Promise(resolve => setTimeout(resolve, 50));
                const nodes = getNodes();
                const currentNode = nodes.find(n => n.id === newNodeId);
                if (!currentNode) return;
                const intersections = getIntersectingNodes(currentNode);


                const parentRegionId = intersections.find((n) =>
                n.type === "activity" || n.type === "InterruptActivityRegion"
                )?.id;
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
export { DraggableNode };
export default DraggableNode;