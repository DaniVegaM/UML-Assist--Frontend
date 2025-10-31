import { Position, useNodeId } from "@xyflow/react";
import BaseHandle from "../BaseHandle";
import { useNode } from "../useNode";
import { useCanvas } from "../../../hooks/useCanvas";

export default function ParallelizationNode() {
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
            className="p-2 bg-neutral-900 dark:bg-neutral-500 hover:bg-neutral-950 dark:hover:bg-neutral-400 w-[8px] min-h-[100px] flex flex-col items-center justify-center transition-all duration-150"
        >
            <div className="absolute">
            <BaseHandle id={0} type="source" position={Position.Right} maxTargetConnections={Infinity} maxSourceConnections={Infinity} showSourceHandleOptions={showSourceHandleOptions} showTargetHandleOptions={showTargetHandleOptions} className="!w-3 !h-3 !relative !top-auto !bottom-auto !left-auto !right-auto !my-2"/>
            </div>
            <div className="absolute">
            <BaseHandle id={1} type="target" position={Position.Left} maxTargetConnections={Infinity} maxSourceConnections={Infinity} showSourceHandleOptions={showSourceHandleOptions} showTargetHandleOptions={showTargetHandleOptions} className="!w-3 !h-3 !relative !top-auto !bottom-auto !left-auto !right-auto !my-2"/>
            </div>
        </div >
    )
}
