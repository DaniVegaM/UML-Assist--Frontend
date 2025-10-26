import { Handle, Position, useNodeConnections, useNodeId, type Connection, type Edge } from "@xyflow/react";
import { useCallback } from "react";
import type { BaseHandleProps } from "../../types/canvas";

export default function BaseHandle({id, type, position, maxSourceConnections = 1, maxTargetConnections = 1, showSourceHandleOptions, showTargetHandleOptions, className} : BaseHandleProps) {
    const nodeId = useNodeId();

    const allConnections = useNodeConnections();
    const sourceConnections = allConnections.filter(conn => conn.source === nodeId);
    const targetConnections = allConnections.filter(conn => conn.target === nodeId);

    const canConnectSource = sourceConnections.length < maxSourceConnections;
    const canConnectTarget = targetConnections.length < maxTargetConnections;

    const isValidSourceConnection = useCallback((connection: Connection | Edge) => {
        //Verificamos si este nodo ya tiene una conexión source
        const currentSourceConnections = allConnections.filter(conn => conn.source === nodeId);
        return currentSourceConnections.length < maxSourceConnections && connection.source !== connection.target;
    }, [allConnections, nodeId]);

    const isValidTargetConnection = useCallback((connection: Connection | Edge) => {
        //Verificamos si este nodo ya tiene una conexión target
        const currentTargetConnections = allConnections.filter(conn => conn.target === nodeId);
        return currentTargetConnections.length < maxTargetConnections && connection.source !== connection.target;
    }, [allConnections, nodeId]);

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
            className={className || ''}
        />
    )
}
