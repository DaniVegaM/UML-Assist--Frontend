import { useCanvas } from "../../../hooks/useCanvas";
import { Position, useNodeId } from "@xyflow/react";
import { useNode } from "../useNode";
import BaseHandle from "../BaseHandle";


export default function FinalNode() {
    const { showSourceHandleOptions, setShowSourceHandleOptions, showTargetHandleOptions, setShowTargetHandleOptions } = useNode();
    const { isTryingToConnect } = useCanvas();
    const nodeId = useNodeId();

    const onMouseEnter = () => {
        if (isTryingToConnect.isTrying && isTryingToConnect.sourceNodeId !== nodeId) {
            setShowSourceHandleOptions(false);
            setShowTargetHandleOptions(true);
        } else {
            setShowTargetHandleOptions(false);
            setShowSourceHandleOptions(false);
        }
    }

    const onMouseLeave = () => {
        setShowSourceHandleOptions(false);
        setShowTargetHandleOptions(false);
    }

    return (
        <div
            className="relative w-15 h-15 bg-neutral-900 flex flex-col items-center justify-center transition-all duration-150"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            style={{
                clipPath: 'circle(50.0% at 50% 50%)',
                zIndex: 1,
            }}
        >
            <BaseHandle id={0} type="target" position={Position.Top} maxSourceConnections={0} maxTargetConnections={1} className="!border-none !w-5 !h-5" showSourceHandleOptions={showSourceHandleOptions} showTargetHandleOptions={showTargetHandleOptions} />
            <BaseHandle id={1} type="target" position={Position.Right} maxSourceConnections={0} maxTargetConnections={1} className="!border-none !w-5 !h-5" showSourceHandleOptions={showSourceHandleOptions} showTargetHandleOptions={showTargetHandleOptions} />
            <BaseHandle id={2} type="target" position={Position.Left} maxSourceConnections={0} maxTargetConnections={1} className="!border-none !w-5 !h-5" showSourceHandleOptions={showSourceHandleOptions} showTargetHandleOptions={showTargetHandleOptions} />
            <BaseHandle id={3} type="target" position={Position.Bottom} maxSourceConnections={0} maxTargetConnections={1} className="!border-none !w-5 !h-5" showSourceHandleOptions={showSourceHandleOptions} showTargetHandleOptions={showTargetHandleOptions} />
            <div
                className="absolute w-14 h-14 bg-white flex flex-col items-center justify-center transition-all duration-150"
                style={{
                    clipPath: 'circle(50.0% at 50% 50%)',
                    zIndex: 1,
                }}
            ></div>
            <div
                className="absolute w-10 h-10 bg-neutral-900 flex flex-col items-center justify-center transition-all duration-150"
                style={{
                    clipPath: 'circle(50.0% at 50% 50%)',
                    zIndex: 1,
                }}
            ></div>
        </div>
    )
}