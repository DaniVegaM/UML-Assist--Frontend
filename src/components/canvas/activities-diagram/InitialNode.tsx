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
            setShowSourceHandleOptions(true);
            setShowTargetHandleOptions(false);
        } else {
            setShowTargetHandleOptions(true);
            setShowSourceHandleOptions(false);
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
            <BaseHandle id={4} type="target" position={Position.Top} maxSourceConnections={0} maxTargetConnections={1} className="!border-none !w-5 !h-5" showSourceHandleOptions={showSourceHandleOptions} showTargetHandleOptions={showTargetHandleOptions} />
            <BaseHandle id={5} type="target" position={Position.Right} maxSourceConnections={0} maxTargetConnections={1} className="!border-none !w-5 !h-5" showSourceHandleOptions={showSourceHandleOptions} showTargetHandleOptions={showTargetHandleOptions} />
            <BaseHandle id={6} type="target" position={Position.Left} maxSourceConnections={0} maxTargetConnections={1} className="!border-none !w-5 !h-5" showSourceHandleOptions={showSourceHandleOptions} showTargetHandleOptions={showTargetHandleOptions} />
            <BaseHandle id={7} type="target" position={Position.Bottom} maxSourceConnections={0} maxTargetConnections={1} className="!border-none !w-5 !h-5" showSourceHandleOptions={showSourceHandleOptions} showTargetHandleOptions={showTargetHandleOptions} />
        </div>
    )
}