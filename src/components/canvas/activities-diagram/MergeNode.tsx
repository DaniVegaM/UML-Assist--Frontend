import { useCallback, useState } from "react";
import BaseHandle from "../BaseHandle";
import { useCanvas } from "../../../hooks/useCanvas";
import { Position, useNodeId } from "@xyflow/react";
import "../styles/nodeStyles.css";


export default function MergeNodel() {
    const nodeId = useNodeId();
    const [showHandles, setShowHandles] = useState(false);
    const { isTryingToConnect, openContextMenu } = useCanvas();

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
            className="node-diamond"
            style={{
                clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            }}
            onMouseEnter={() => setShowHandles(true)}
            onMouseLeave={() => setShowHandles(false)}
            onContextMenu={handleContextMenu}
        >
            <BaseHandle id={0} position={Position.Top} showHandle={showHandles && isTryingToConnect} className="!absolute !top-1"/>
            <BaseHandle id={3} position={Position.Left} showHandle={showHandles && isTryingToConnect} className="!absolute !left-1"/>
            <BaseHandle id={1} position={Position.Right} showHandle={showHandles} className="!absolute !right-1"/>
            <BaseHandle id={2} position={Position.Bottom} showHandle={showHandles} className="!absolute !bottom-1"/>
        </div >
    )
}
