import { useCallback, useRef, useState } from "react";
import { useCanvas } from "../../../hooks/useCanvas";
import { Position, useNodeId } from "@xyflow/react";
import { useNode } from "../useNode";
import BaseHandle from "../BaseHandle";


export default function CallOperation() {
    const { showSourceHandleOptions, setShowSourceHandleOptions, showTargetHandleOptions, setShowTargetHandleOptions } = useNode();

    const leftInputRef = useRef<HTMLInputElement>(null);
    const rightInputRef = useRef<HTMLInputElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [leftValue, setLeftValue] = useState("");
    const [rightValue, setRightValue] = useState("");
    const { setIsZoomOnScrollEnabled, isTryingToConnect } = useCanvas();
    const nodeId = useNodeId();

    const handleDoubleClick = useCallback(() => {
        if (!isEditing) {
            setIsEditing(true);
            setIsZoomOnScrollEnabled(false);
            setTimeout(() => {
                if (leftInputRef.current) {
                    leftInputRef.current.focus();
                }
            }, 0);
        }
    }, [isEditing, setIsZoomOnScrollEnabled]);

    const handleBlur = useCallback(() => {
        setIsEditing(false);
        setIsZoomOnScrollEnabled(true);
    }, [setIsZoomOnScrollEnabled]);

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
            onDoubleClick={handleDoubleClick}
            className="relative border border-gray-300 dark:border-neutral-900 rounded-lg p-2 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-zinc-600 min-w-[200px] flex flex-col items-center justify-center transition-all duration-150"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {/* SOURCE HANDLES */}
            <BaseHandle id={0} type="source" position={Position.Top} showSourceHandleOptions={showSourceHandleOptions} showTargetHandleOptions={showTargetHandleOptions} />
            <BaseHandle id={1} type="source" position={Position.Right} showSourceHandleOptions={showSourceHandleOptions} showTargetHandleOptions={showTargetHandleOptions} />
            <BaseHandle id={2} type="source" position={Position.Left} showSourceHandleOptions={showSourceHandleOptions} showTargetHandleOptions={showTargetHandleOptions} />
            <BaseHandle id={3} type="source" position={Position.Bottom} showSourceHandleOptions={showSourceHandleOptions} showTargetHandleOptions={showTargetHandleOptions} />

            {/* TARGET HANDLES */}
            <BaseHandle id={4} type="target" position={Position.Top} showSourceHandleOptions={showSourceHandleOptions} showTargetHandleOptions={showTargetHandleOptions} />
            <BaseHandle id={5} type="target" position={Position.Right} showSourceHandleOptions={showSourceHandleOptions} showTargetHandleOptions={showTargetHandleOptions} />
            <BaseHandle id={6} type="target" position={Position.Left} showSourceHandleOptions={showSourceHandleOptions} showTargetHandleOptions={showTargetHandleOptions} />
            <BaseHandle id={7} type="target" position={Position.Bottom} showSourceHandleOptions={showSourceHandleOptions} showTargetHandleOptions={showTargetHandleOptions} />

            <div className="flex items-center justify-center w-full">
                <input
                    ref={leftInputRef}
                    type="text"
                    value={leftValue}
                    onChange={(e) => setLeftValue(e.target.value.slice(0, 25))}
                    onBlur={handleBlur}
                    onWheel={(e) => e.stopPropagation()}
                    placeholder="Clase"
                    className={`nodrag flex-1 min-w-0 placeholder-gray-400 bg-transparent dark:text-white border-none outline-none text-center text-sm px-1 py-1 ${
                        isEditing ? 'pointer-events-auto' : 'pointer-events-none'
                    }`}
                />
                <span className="text-gray-400 dark:text-neutral-500 text-sm mx-1">::</span>
                <input
                    ref={rightInputRef}
                    type="text"
                    value={rightValue}
                    onChange={(e) => setRightValue(e.target.value.slice(0, 25))}
                    onBlur={handleBlur}
                    onWheel={(e) => e.stopPropagation()}
                    placeholder="Operación"
                    className={`nodrag flex-1 min-w-0 placeholder-gray-400 bg-transparent dark:text-white border-none outline-none text-center text-sm px-1 py-1 ${
                        isEditing ? 'pointer-events-auto' : 'pointer-events-none'
                    }`}
                />
            </div>
        </div>
    )
}