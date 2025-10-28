import { useCanvas } from "../../../hooks/useCanvas";
import { Position, useNodeId } from "@xyflow/react";
import { useNode } from "../useNode";
import BaseHandle from "../BaseHandle";


export default function InitialNode() {
    const { showSourceHandleOptions, setShowSourceHandleOptions, showTargetHandleOptions, setShowTargetHandleOptions } = useNode();
    const { isTryingToConnect } = useCanvas();
    const nodeId = useNodeId();

    const onMouseEnter = () => {
        if (isTryingToConnect.isTrying && isTryingToConnect.sourceNodeId !== nodeId) {
            setShowSourceHandleOptions(false);
            setShowTargetHandleOptions(false);
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
            className="relative w-12 h-12 bg-neutral-900 flex flex-col items-center justify-center transition-all duration-150"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            style={{
                clipPath: 'circle(50.0% at 50% 50%)',
            }}
        >
            <BaseHandle id={4} type="source" position={Position.Top} maxSourceConnections={1} maxTargetConnections={0} className="!border-none !w-5 !h-5" showSourceHandleOptions={showSourceHandleOptions} showTargetHandleOptions={showTargetHandleOptions} />
            <BaseHandle id={5} type="source" position={Position.Right} maxSourceConnections={1} maxTargetConnections={0} className="!border-none !w-5 !h-5" showSourceHandleOptions={showSourceHandleOptions} showTargetHandleOptions={showTargetHandleOptions} />
            <BaseHandle id={6} type="source" position={Position.Left} maxSourceConnections={1} maxTargetConnections={0} className="!border-none !w-5 !h-5" showSourceHandleOptions={showSourceHandleOptions} showTargetHandleOptions={showTargetHandleOptions} />
            <BaseHandle id={7} type="source" position={Position.Bottom} maxSourceConnections={1} maxTargetConnections={0} className="!border-none !w-5 !h-5" showSourceHandleOptions={showSourceHandleOptions} showTargetHandleOptions={showTargetHandleOptions} />
        </div>
    )
}