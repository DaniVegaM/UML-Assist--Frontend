import { Position, useConnection, useNodeConnections, useNodeId, useNodes, useReactFlow, useUpdateNodeInternals, useViewport } from "@xyflow/react";
import { useCallback, useEffect, useRef, useState } from "react"

export type HandleData = { id: number; position: Position; left?: number; top?: number };

type useHandleProps = {
    handleRef: React.RefObject<HTMLDivElement | null>;
    nodeRef: React.RefObject<HTMLDivElement | null>;
    maxHandles?: number;
    disableMagneticPoints?: boolean;
    disableTop?: boolean;
    disableRight?: boolean;
    disableBottom?: boolean;
    disableLeft?: boolean;
    allowSelfConnection?: boolean;
    initialHandles?: HandleData[];
}

const defaultHandles: HandleData[] = [{ id: 0, position: Position.Top }];
function areHandlesEqual(a: HandleData[], b: HandleData[]) {
    if (a.length !== b.length) return false;

    for (let i = 0; i < a.length; i++) {
        if (
            a[i].id !== b[i].id ||
            a[i].position !== b[i].position ||
            a[i].left !== b[i].left ||
            a[i].top !== b[i].top
        ) {
            return false;
        }
    }
    return true;
}
export function useHandle({ handleRef, nodeRef, disableMagneticPoints = false, disableTop, disableRight, disableBottom, disableLeft, maxHandles, allowSelfConnection = false, initialHandles }: useHandleProps) {
    const nodeId = useNodeId();
    const rfNodes = useNodes();
    const setNodes = useReactFlow().setNodes;
    const currentNode = rfNodes.find(n => n.id === nodeId);

    const [handles, setHandles] = useState<HandleData[]>(
        (currentNode?.data?.handles as HandleData[])?.length
            ? (currentNode?.data?.handles as HandleData[])
            : initialHandles?.length
                ? initialHandles
                : defaultHandles
    );



    useEffect(() => {
        const nodeHandles = currentNode?.data?.handles as HandleData[] | undefined;

        if (!nodeHandles) return;

        setHandles(prev => {
            if (areHandlesEqual(prev, nodeHandles)) {
                return prev;
            }

            return nodeHandles;
        });
    }, [currentNode?.data?.handles]);

    const lastHandleId = handles.length - 1;
    const updateNodeInternals = useUpdateNodeInternals();
    const { zoom } = useViewport();
    const connection = useConnection();
    const totalConnections = useNodeConnections().filter(conn => conn.sourceHandle?.includes(nodeId!) || conn.targetHandle?.includes(nodeId!)).length;
    const connections = useNodeConnections().filter(conn => (conn.sourceHandle?.includes('Handle-' + lastHandleId.toString()) && conn.sourceHandle?.includes(nodeId!)) ||
                                                    (conn.targetHandle?.includes('Handle-' + lastHandleId.toString()) && conn.targetHandle?.includes(nodeId!)));

    // Ref para rastrear si ya creamos el handle target para self-connection
    const selfConnectionHandleCreated = useRef(false);

    // Detectar cuando termina una conexión para resetear el flag
    useEffect(() => {
        if (!connection.inProgress) {
            selfConnectionHandleCreated.current = false;
        }
    }, [connection.inProgress]);
    const updateHandles = useCallback(
        (updater: (prev: HandleData[]) => HandleData[]) => {
            setHandles(prev => {
                const updated = updater(prev);

                if (areHandlesEqual(prev, updated)) {
                    return prev;
                }

                setNodes(nodes =>
                    nodes.map(n =>
                        n.id === nodeId
                            ? {
                                ...n,
                                data: {
                                    ...n.data,
                                    handles: updated,
                                },
                            }
                            : n
                    )
                );

                return updated;
            });
        },
        [nodeId, setNodes]
    );
        useEffect(() => {
        const nodeHandles = currentNode?.data?.handles as HandleData[] | undefined;

        if (!nodeHandles) return;

        updateHandles(prev => {
            const prevString = JSON.stringify(prev);
            const nextString = JSON.stringify(nodeHandles);

            if (prevString === nextString) {
                return prev;
            }

            return nodeHandles;
        });
    }, [ updateHandles]);


    const magneticHandle = useCallback((evt: React.MouseEvent) => {
        // Si allowSelfConnection es true, permitir que el handle aparezca incluso cuando la conexión viene del mismo nodo
        const blockSelfConnection = !allowSelfConnection && connection.inProgress && connection.fromNode.id === nodeId;
        if (!nodeRef.current || !handleRef.current || blockSelfConnection || (handles.length == maxHandles && totalConnections == maxHandles)) return;
        
        // Si hay una self-connection en progreso, crear un nuevo handle para el target
        const isSelfConnectionInProgress = allowSelfConnection && connection.inProgress && connection.fromNode.id === nodeId;
        
        if (isSelfConnectionInProgress && !selfConnectionHandleCreated.current) {
            // Crear un nuevo handle para el target de la self-connection
            selfConnectionHandleCreated.current = true;
            updateHandles(handles => [...handles, {
                id: handles.length,
                position: Position.Right
            }]);
            updateNodeInternals(nodeId ? nodeId : '');
            return; // Retornamos para que se actualice el handleRef al nuevo handle creado
        }
        
        if (connections.length > 0 && ((maxHandles && handles.length < maxHandles) || !maxHandles) && !isSelfConnectionInProgress) {
            // Si el ultimo handle ya tiene una conexión, se crea un nuevo handle en la posición por defecto
            updateHandles(handles => [...handles, {
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

        // Aseguramos que las coordenadas estén dentro de los límites del nodo en caso de que rawX/rawY se salgan
        const clientX = Math.max(0, Math.min(rawX, nodeWidth));
        const clientY = Math.max(0, Math.min(rawY, nodeHeight));

        const midWidth = nodeWidth / 2;
        const midHeight = nodeHeight / 2;

        const paddingMagnet = 0.065 * nodeWidth; // Pixeles del campo magnetico alrededor de los centros de cada lado del nodo  


        // Distancias a los bordes del nodo para saber cuál es el más cercano
        const distLeft = clientX;
        const distRight = nodeWidth - clientX;
        const distTop = clientY;
        const distBottom = nodeHeight - clientY;
        const min = Math.min(disableLeft ? 99999 : distLeft, disableRight ? 99999 : distRight, disableTop ? 99999 : distTop, disableBottom ? 99999 : distBottom);

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

            if (clientY >= midHeight - paddingMagnet && clientY <= midHeight + paddingMagnet && !disableMagneticPoints) {
                newY = `${midHeight}px`;
            }
        } else if (min === distRight) {
            newX = `auto`;
            newY = `${clientY}px`;
            newPos = Position.Right;

            if (clientY >= midHeight - paddingMagnet && clientY <= midHeight + paddingMagnet && !disableMagneticPoints) {
                newY = `${midHeight}px`;
            }
        } else if (min === distTop) {
            newX = `${clientX}px`;
            newY = `0`;
            newPos = Position.Top;

            if (clientX >= midWidth - paddingMagnet && clientX <= midWidth + paddingMagnet && !disableMagneticPoints) {
                newX = `${midWidth}px`;
            }
        } else if (min === distBottom) {
            newX = `${clientX}px`;
            newY = `auto`;
            newPos = Position.Bottom;

            if (clientX >= midWidth - paddingMagnet && clientX <= midWidth + paddingMagnet && !disableMagneticPoints) {
                newX = `${midWidth}px`;
            }
        }

        handleRef.current.style.left = newX;
        handleRef.current.style.top = newY;

        //Actualizamos la información de la posición del handle
        updateHandles(prev =>
            prev.map(handle => {
                if (handle.id === prev.length - 1) {
                    return {
                        ...handle,
                        position: newPos,
                        left: parseFloat(newX) || undefined,
                        top: parseFloat(newY) || undefined,
                    };
                }
                return handle;
            })
        );

        updateNodeInternals(nodeId ? nodeId : '');
    }, [zoom, nodeId, updateNodeInternals, connection, connections, handleRef, handles.length, allowSelfConnection]);

    return {
        handles,
        updateHandles,
        magneticHandle,
    }
}