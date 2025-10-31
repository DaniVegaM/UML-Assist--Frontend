import { Position, useNodeId } from "@xyflow/react";
import BaseHandle from "../BaseHandle";
import { useNode } from "../useNode";
import { useCanvas } from "../../../hooks/useCanvas";

export default function MergeNodel() {
    const { showSourceHandleOptions, setShowSourceHandleOptions, showTargetHandleOptions, setShowTargetHandleOptions } = useNode();
    const { isTryingToConnect } = useCanvas();
    const nodeId = useNodeId();

    const onMouseEnter = () => {
        if (isTryingToConnect.isTrying && isTryingToConnect.sourceNodeId !== nodeId) {
            setShowSourceHandleOptions(false);
            setShowTargetHandleOptions(true);
        } else {
            setShowTargetHandleOptions(false);
            setShowSourceHandleOptions(true);
        }
    }

    const onMouseLeave = () => {
        setShowSourceHandleOptions(false);
        setShowTargetHandleOptions(false);
    }

    return (
        <div
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className="p-2 bg-gray-300 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-zinc-600 min-w-[50px] min-h-[50px] flex flex-col items-center justify-center transition-all duration-150"
            style={{
                clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            }}
        >
            <BaseHandle id={0} type="source" position={Position.Right} maxTargetConnections={3} maxSourceConnections={1} showSourceHandleOptions={showSourceHandleOptions} showTargetHandleOptions={showTargetHandleOptions} className="!w-3 !h-3" />
            <BaseHandle id={1} type="source" position={Position.Bottom} maxTargetConnections={3} maxSourceConnections={1} showSourceHandleOptions={showSourceHandleOptions} showTargetHandleOptions={showTargetHandleOptions} className="!w-3 !h-3" />
            <BaseHandle id={2} type="target" position={Position.Top} maxTargetConnections={3} maxSourceConnections={1} showSourceHandleOptions={showSourceHandleOptions} showTargetHandleOptions={showTargetHandleOptions} className="!w-3 !h-3" />
            <BaseHandle id={3} type="target" position={Position.Right} maxTargetConnections={3} maxSourceConnections={1} showSourceHandleOptions={showSourceHandleOptions} showTargetHandleOptions={showTargetHandleOptions} className="!w-3 !h-3" />
            <BaseHandle id={4} type="target" position={Position.Bottom} maxTargetConnections={3} maxSourceConnections={1} showSourceHandleOptions={showSourceHandleOptions} showTargetHandleOptions={showTargetHandleOptions} className="!w-3 !h-3" />
            <BaseHandle id={5} type="target" position={Position.Left} maxTargetConnections={3} maxSourceConnections={1} showSourceHandleOptions={showSourceHandleOptions} showTargetHandleOptions={showTargetHandleOptions} className="!w-3 !h-3" />
        </div >
    )
}
