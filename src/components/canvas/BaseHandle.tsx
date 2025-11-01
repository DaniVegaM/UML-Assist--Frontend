import { Handle, Position, useNodeId } from "@xyflow/react";
import type { BaseHandleProps } from "../../types/canvas";

export default function BaseHandle({ id, position, className, showHandle }: BaseHandleProps) {
    const nodeId = useNodeId();
    

    return (
        <Handle
            id={`${nodeId}_Handle-${id}`}
            type={'source'}
            position={position ? position : Position.Top}
            className={className || ''}
            style={{
                opacity: showHandle ? 1 : 0,
                transition: 'opacity 0.2s ease-in-out',
                pointerEvents: showHandle ? 'all' : 'none',
                width: '8px',
                height: '8px',
                backgroundColor: '#9F9FA9',
            }}
            isConnectable={showHandle}
        />
    )
}