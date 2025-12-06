import { Position, useNodeId, useUpdateNodeInternals } from "@xyflow/react";
import { useCallback } from "react"

export function useHandle() {
    const nodeId = useNodeId();
    const updateNodeInternals = useUpdateNodeInternals();

    const magneticHandle = useCallback((evt: React.MouseEvent, nodeRef:React.RefObject<HTMLDivElement | null>, handleRef:React.RefObject<HTMLDivElement | null>, setHandlePosition:React.Dispatch<React.SetStateAction<Position>>) => {
        if (!nodeRef.current || !handleRef.current) return;
        const bounds = nodeRef.current.getBoundingClientRect();

        console.log('Magnetic Handle Move');
        console.log('Bounds:', bounds);
        console.log('Event ClientX:', evt.clientX, 'ClientY:', evt.clientY);

        // Calculamos la posición relativa dentro del nodo
        const clientX = evt.clientX - bounds.left;
        const clientY = evt.clientY - bounds.top;

        // Distancias a los bordes del nodo para saber cuál es el más cercano
        const distLeft = clientX;
        const distRight = bounds.width - clientX;
        const distTop = clientY;
        const distBottom = bounds.height - clientY;
        const min = Math.min(distLeft, distRight, distTop, distBottom);

        let newX = '0px';
        let newY = '0px';
        let newPos = Position.Top;

        // Calculamos la posicion del handle relativa al borde más cercano
        if (min === distLeft) {
            newX = `0`; newY = `${clientY}px`; newPos = Position.Left;
        } else if (min === distRight) {
            newX = `auto`; newY = `${clientY}px`; newPos = Position.Right;
        } else if (min === distTop) {
            newX = `${clientX}px`; newY = `0`; newPos = Position.Top;
        } else if (min === distBottom) {
            newX = `${clientX}px`; newY = `auto`; newPos = Position.Bottom;
        }

        handleRef.current.style.left = newX;
        handleRef.current.style.top = newY;

        setHandlePosition((prev) => (prev !== newPos ? newPos : prev));
        updateNodeInternals(nodeId ? nodeId : '');
    }, []);

    return {
        magneticHandle,
    }
}