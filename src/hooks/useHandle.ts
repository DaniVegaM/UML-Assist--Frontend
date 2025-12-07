import { Position, useConnection, useNodeConnections, useNodeId, useUpdateNodeInternals, useViewport } from "@xyflow/react";
import { useCallback, useState } from "react"

export function useHandle(handleRef: React.RefObject<HTMLDivElement | null>) {
    const [handles, setHandles] = useState<{ id: number; position: Position, left?: number, top?: number }[]>(
        [
            {
                id: 0,
                position: Position.Top
            },
        ]
    );

    const nodeId = useNodeId();
    const lastHandleId = handles.length - 1;
    const updateNodeInternals = useUpdateNodeInternals();
    const { zoom } = useViewport();
    const connection = useConnection();
    const connections = useNodeConnections().filter(conn => (conn.sourceHandle?.includes('Handle-' + lastHandleId.toString()) && conn.sourceHandle?.includes(nodeId!))|| 
                                                            (conn.targetHandle?.includes('Handle-' + lastHandleId.toString()) && conn.targetHandle?.includes(nodeId!)));
    
    const paddingMagnet = 25; // Pixeles del campo magnetico alrededor de los centros de cada lado del nodo                                                    

    const magneticHandle = useCallback((evt: React.MouseEvent, nodeRef: React.RefObject<HTMLDivElement | null>) => {
        if (!nodeRef.current || !handleRef.current || (connection.inProgress && connection.fromNode.id === nodeId)) return;

        if (connections.length > 0) {
            // Si el ultimo handle ya tiene una conexión, se crea un nuevo handle en la posición por defecto
            setHandles(handles => [...handles, {
                id: handles.length,
                position: Position.Top
            }]);

            updateNodeInternals(nodeId ? nodeId : '');
            return;
        }; // Retornamos para que se actualice el handleRef al nuevo handle creado


        // Calculamos la posición relativa del puntero dentro del nodo
        const bounds = nodeRef.current.getBoundingClientRect();
        const rawX = (evt.clientX - bounds.left) / zoom;
        const rawY = (evt.clientY - bounds.top) / zoom;

        const nodeWidth = bounds.width / zoom;
        const nodeHeight = bounds.height / zoom;

        const midWidth = nodeWidth / 2;
        const midHeight = nodeHeight / 2;

        // Aseguramos que las coordenadas estén dentro de los límites del nodo en caso de que rawX/rawY se salgan
        const clientX = Math.max(0, Math.min(rawX, nodeWidth));
        const clientY = Math.max(0, Math.min(rawY, nodeHeight));

        // Distancias a los bordes del nodo para saber cuál es el más cercano
        const distLeft = clientX;
        const distRight = nodeWidth - clientX;
        const distTop = clientY;
        const distBottom = nodeHeight - clientY;
        const min = Math.min(distLeft, distRight, distTop, distBottom);

        let newX = '0px';
        let newY = '0px';
        let newPos = Position.Top;

        // Calculamos la posicion del handle relativa al borde más cercano
        /* Se colocaron algunas positions como 'auto' para evitar problemas de CSS al posicionar el handle
        ya que ReactFlow maneja los Positions de manera específica */
        if (min === distLeft) {
            newX = `0`;
            newY = `${clientY}px`;
            newPos = Position.Left;

            if(clientY >= midHeight - paddingMagnet && clientY <= midHeight + paddingMagnet) {
                newY = `${midHeight}px`;
            }
        } else if (min === distRight) {
            newX = `auto`;
            newY = `${clientY}px`;
            newPos = Position.Right;

            if(clientY >= midHeight - paddingMagnet && clientY <= midHeight + paddingMagnet) {
                newY = `${midHeight}px`;
            }
        } else if (min === distTop) {
            newX = `${clientX}px`;
            newY = `0`;
            newPos = Position.Top;

            if(clientX >= midWidth - paddingMagnet && clientX <= midWidth + paddingMagnet) {
                newX = `${midWidth}px`;
            }
        } else if (min === distBottom) {
            newX = `${clientX}px`;
            newY = `auto`;
            newPos = Position.Bottom;

            if(clientX >= midWidth - paddingMagnet && clientX <= midWidth + paddingMagnet) {
                newX = `${midWidth}px`;
            }
        }

        handleRef.current.style.left = newX;
        handleRef.current.style.top = newY;

        //Actualizamos la información de la posición del handle
        setHandles(handles => handles.map(handle => {
            if (handle.id === handles.length - 1) {
                return {
                    ...handle,
                    position: newPos,
                    left: parseFloat(newX) || undefined,
                    top: parseFloat(newY) || undefined,
                };
            }
            return handle;
        }));

        updateNodeInternals(nodeId ? nodeId : '');
    }, [zoom, nodeId, updateNodeInternals, connection, connections, handleRef, handles.length]);

    return {
        handles,
        setHandles,
        magneticHandle,
    }
}