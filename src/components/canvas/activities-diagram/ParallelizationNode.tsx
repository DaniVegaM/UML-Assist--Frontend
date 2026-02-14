import { useCallback, useEffect, useState } from "react";
import BaseHandle from "../BaseHandle";
import { Position, useNodeConnections, useNodeId, useUpdateNodeInternals } from "@xyflow/react";
import { useCanvas } from "../../../hooks/useCanvas";
import "../styles/nodeStyles.css";

export default function ParallelizationNode() {
    const [showHandles, setShowHandles] = useState(false);
    const { isTryingToConnect, openContextMenu } = useCanvas();
    const [sourceHandlesIds, setSourceHandlesIds] = useState<number[]>([0, 1]);
    const [targetHandlesIds, setTargetHandlesIds] = useState<number[]>([0, 1]);

    const nodeId = useNodeId();
    const updateNodeInternals = useUpdateNodeInternals();

    const connections = useNodeConnections({
        id: nodeId ? nodeId : '',
    });

    const targetConnectionsLength = connections.filter(conn => conn.target === nodeId).length;
    const sourceConnectionsLength = connections.filter(conn => conn.source === nodeId).length;

    useEffect(() => {
        console.log('connections', connections.length);
        setSourceHandlesIds(prev => (sourceConnectionsLength >= prev.length ? [...prev, prev.length] : prev));
        updateNodeInternals(nodeId ? nodeId : '');
        setTargetHandlesIds(prev => (targetConnectionsLength >= prev.length ? [...prev, prev.length] : prev));
        updateNodeInternals(nodeId ? nodeId : '');
    }, [connections, updateNodeInternals]);

    const handleContextMenu = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        openContextMenu({
        x: e.clientX,
        y: e.clientY,
        nodeId: nodeId ?? "",
        });
    }, [openContextMenu, nodeId]);

    return (
        <div
            className="node-bar"
            onMouseEnter={() => setShowHandles(true)}
            onMouseLeave={() => setShowHandles(false)}
            onContextMenu={handleContextMenu}
        >
            <div className="flex">
                <div className="flex flex-col">
                    {targetHandlesIds.map((_, id) => (
                        <BaseHandle key={`target-${id}`} id={`target-${id}`} position={Position.Left} showHandle={isTryingToConnect} className="!relative !top-0 !my-[15px]" />
                    ))}
                </div>
                <div className="flex flex-col">
                    {sourceHandlesIds.map((_, id) => (
                        <BaseHandle key={`source-${id}`} id={`source-${id}`} position={Position.Right} showHandle={showHandles} className="!relative !top-0 !right-0 !my-[15px]" />
                    ))}
                </div>
            </div>
        </div >
    )
}
