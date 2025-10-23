import { useDraggable } from "@neodrag/react";
import { useReactFlow, type XYPosition } from "@xyflow/react";
import { useRef, useState } from "react";
import type { DraggableNodeProps } from "../../types/canvas";

let id = 0;
const getId = () => `node_${id++}`;

export function DraggableNode({ className, children, nodeType, setExtendedBar }: DraggableNodeProps) {
    const draggableRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<XYPosition>({ x: 0, y: 0 });
    const { setNodes, screenToFlowPosition } = useReactFlow();

    useDraggable(draggableRef as React.RefObject<HTMLElement>, {
        position: position,
        onDrag: ({ offsetX, offsetY }) => {
            setPosition({
                x: offsetX,
                y: offsetY,
            });
        },
        onDragEnd: ({ event }) => {
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

                //Creamos el nodo
                const newNode = {
                    id: getId(),
                    type: nodeType,
                    position: flowPosition,
                    data: { label: `${nodeType} node` },
                    draggable: true,
                    selectable: true,
                    connectable: true,
                };
                //Agregamos el nodo
                setNodes((nds) => nds.concat(newNode));
            }
        },
    });

    return (
        <div className={`${className} cursor-grab active:cursor-grabbing`} ref={draggableRef}>
            {children}
        </div>
    );
}