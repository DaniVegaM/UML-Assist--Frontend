import { useCallback, useRef, useState } from "react";
import { useCanvas } from "../../../hooks/useCanvas";
import BaseHandle from "../BaseHandle";
import { Position } from "@xyflow/react";


export default function CallOperation() {
    const leftInputRef = useRef<HTMLInputElement>(null);
    const rightInputRef = useRef<HTMLInputElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [leftValue, setLeftValue] = useState("");
    const [rightValue, setRightValue] = useState("");
    const { setIsZoomOnScrollEnabled } = useCanvas();
    const [showHandles, setShowHandles] = useState(false);

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

    return (
        <div
            onDoubleClick={handleDoubleClick}
            className="relative border border-gray-300 dark:border-neutral-900 rounded-lg p-2 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-zinc-600 min-w-[200px] flex flex-col items-center justify-center transition-all duration-150"
            onMouseEnter={() => setShowHandles(true)}
            onMouseLeave={() => setShowHandles(false)}
        >
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
                
                <BaseHandle id={0} position={Position.Top} showHandle={showHandles} className="!absolute !top-0 !left-1/4" />
                <BaseHandle id={1} position={Position.Top} showHandle={showHandles} className="!absolute !top-0 !left-3/4" />
                <BaseHandle id={2} position={Position.Right} showHandle={showHandles} className="!absolute !top-1/4 right-0" />
                <BaseHandle id={3} position={Position.Right} showHandle={showHandles} className="!absolute !top-3/4 right-0" />
                <BaseHandle id={4} position={Position.Left} showHandle={showHandles} className="!absolute !top-1/4 left-0" />
                <BaseHandle id={5} position={Position.Left} showHandle={showHandles} className="!absolute !top-3/4 left-0" />
                <BaseHandle id={6} position={Position.Bottom} showHandle={showHandles} className="!absolute !bottom-0 !left-1/4" />
                <BaseHandle id={7} position={Position.Bottom} showHandle={showHandles} className="!absolute !bottom-0 !left-3/4" />

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