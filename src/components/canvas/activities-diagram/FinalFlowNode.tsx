import { useCanvas } from "../../../hooks/useCanvas";
import { Position, useNodeId } from "@xyflow/react";
import { useNode } from "../useNode";
import BaseHandle from "../BaseHandle";


export default function FinalFlowNode() {
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
            className="relative w-12 h-12 flex items-center justify-center"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <BaseHandle id={0} type="source" position={Position.Top} maxSourceConnections={1} maxTargetConnections={0} className="!border-none !bg-transparent !w-5 !h-5" showSourceHandleOptions={showSourceHandleOptions} showTargetHandleOptions={showTargetHandleOptions} />
            <BaseHandle id={1} type="source" position={Position.Right} maxSourceConnections={1} maxTargetConnections={0} className="!border-none !bg-transparent !w-5 !h-5" showSourceHandleOptions={showSourceHandleOptions} showTargetHandleOptions={showTargetHandleOptions} />
            <BaseHandle id={2} type="source" position={Position.Left} maxSourceConnections={1} maxTargetConnections={0} className="!border-none !bg-transparent !w-5 !h-5" showSourceHandleOptions={showSourceHandleOptions} showTargetHandleOptions={showTargetHandleOptions} />
            <BaseHandle id={3} type="source" position={Position.Bottom} maxSourceConnections={1} maxTargetConnections={0} className="!border-none !bg-transparent !w-5 !h-5" showSourceHandleOptions={showSourceHandleOptions} showTargetHandleOptions={showTargetHandleOptions} />
            
            <div
                className="absolute inset-0 border-4 border-neutral-900 bg-transparent z-0 rounded-full"
                style={{
                    clipPath: 'circle(50% at 50% 50%)',
                }}
            />

            <div className="absolute inset-0 flex items-center justify-center z-0">
                <div className="relative w-[45px] h-[45px]">
                    <div
                        className="absolute bg-neutral-900"
                        style={{
                            width: '2px',
                            height: '100%',
                            left: '50%',
                            top: '0',
                            transform: 'translateX(-50%) rotate(45deg)',
                            transformOrigin: 'center'
                        }}
                    />
                    <div
                        className="absolute bg-neutral-900"
                        style={{
                            width: '2px',
                            height: '100%',
                            left: '50%',
                            top: '0',
                            transform: 'translateX(-50%) rotate(-45deg)',
                            transformOrigin: 'center'
                        }}
                    />
                </div>
            </div>
        </div>
    )
}