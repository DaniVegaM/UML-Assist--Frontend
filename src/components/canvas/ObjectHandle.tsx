import { Handle, Position, useNodeConnections, useNodeId, useReactFlow, type Connection, type Edge } from "@xyflow/react";
import { useCallback } from "react";
import type { BaseHandleProps } from "../../types/canvas";

export default function ObjectHandle({id, type, position, maxSourceConnections = 1, maxTargetConnections = 1, showSourceHandleOptions, showTargetHandleOptions, className} : BaseHandleProps) {
    const nodeId = useNodeId();
    const { getNode } = useReactFlow();

    const allConnections = useNodeConnections();
    const sourceConnections = allConnections.filter(conn => conn.source === nodeId);
    const targetConnections = allConnections.filter(conn => conn.target === nodeId);

    const canConnectSource = sourceConnections.length < maxSourceConnections;
    const canConnectTarget = targetConnections.length < maxTargetConnections;

    const isValidSourceConnection = useCallback((connection: Connection | Edge) => {
        const currentNode = getNode(nodeId!);
        const targetNode = getNode(connection.target!);

        // Verificar límite de conexiones source
        const currentSourceConnections = allConnections.filter(conn => conn.source === nodeId);
        const hasSpaceForConnection = currentSourceConnections.length < maxSourceConnections;
        
        // Evitar auto-conexión
        const isNotSelfConnection = connection.source !== connection.target;
        
        // Validación específica: object/data solo puede conectarse a simpleAction
        let isValidNodeType = true;
        if (currentNode?.type === 'object' || currentNode?.type === 'data') {
            isValidNodeType = targetNode?.type === 'simpleAction';
        }
        
        const result = hasSpaceForConnection && isNotSelfConnection && isValidNodeType;
        
        return result;
    }, [allConnections, nodeId, getNode, maxSourceConnections]);

    const isValidTargetConnection = useCallback((connection: Connection | Edge) => {
        const currentNode = getNode(nodeId!);
        const sourceNode = getNode(connection.source!);

        // Verificar límite de conexiones target
        const currentTargetConnections = allConnections.filter(conn => conn.target === nodeId);
        const hasSpaceForConnection = currentTargetConnections.length < maxTargetConnections;
        
        // Evitar auto-conexión
        const isNotSelfConnection = connection.source !== connection.target;
        
        // Validación específica: object/data solo puede recibir de simpleAction
        let isValidNodeType = true;
        if (currentNode?.type === 'object' || currentNode?.type === 'data') {
            isValidNodeType = sourceNode?.type === 'simpleAction';
        }
        
        const result = hasSpaceForConnection && isNotSelfConnection && isValidNodeType;
        
        return result;
    }, [allConnections, nodeId, getNode, maxTargetConnections]);

    return (
        <Handle
            id={`${nodeId}_${type}Handle-${id}`}
            type={type}
            position={position ? position : Position.Top}
            style={{
                opacity: (type == 'source' ? showSourceHandleOptions : showTargetHandleOptions) ? 1 : 0,
                pointerEvents: 'all',
                transition: 'opacity 0.2s'
            }}
            isConnectable={type === 'source' ? canConnectSource : canConnectTarget}
            isValidConnection={type === 'source' ? isValidSourceConnection : isValidTargetConnection}
            className={className}
        />
    )
}