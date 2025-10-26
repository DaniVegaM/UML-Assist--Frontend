import { useCallback, useEffect, useRef, useState } from "react";
import { useNode } from "../useNode";
import { useCanvas } from "../../../hooks/useCanvas";
import { Position, useNodeId } from "@xyflow/react";
import BaseHandle from "../BaseHandle";


export default function AcceptTimeEvent() {
    const { showSourceHandleOptions, setShowSourceHandleOptions, showTargetHandleOptions, setShowTargetHandleOptions } = useNode();
    const [isEditing, setIsEditing] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [value, setValue] = useState("");
    const { setIsZoomOnScrollEnabled, isTryingToConnect } = useCanvas();
    const nodeId = useNodeId();

    const onChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (evt.target.value.length >= 50) {
            setValue(evt.target.value.trim().slice(0, 50));
        } else {
            setValue(evt.target.value);
        }
    }, []);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [value]);

    const handleDoubleClick = useCallback(() => {
        if (!isEditing) {
            setIsEditing(true);
            setIsZoomOnScrollEnabled(false);
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.focus();
                    textareaRef.current.select();
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
            onDoubleClick={handleDoubleClick}
            className="flex flex-col items-center justify-center transition-all duration-150"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            style={{
                marginRight: '-10px',
                marginLeft: '-10px',
            }}
        >
            <div className="relative z-10">
                <div
                    className="w-12 h-6 bg-gray-400 dark:bg-neutral-800"
                    style={{
                        clipPath: 'polygon(50% 100%, 100% 0, 0 0)',
                    }}
                ></div>
                <div
                    className="w-12 h-6 bg-gray-400 dark:bg-neutral-800"
                    style={{
                        clipPath: 'polygon(0 100%, 100% 100%, 50% 0)',
                    }}
                ></div>
                {/** SOURCE HANDLES */}
                <BaseHandle id={0} type="source" position={Position.Right} className="absolute right-0 top-1/2 -translate-y-1/2" showSourceHandleOptions={showSourceHandleOptions} showTargetHandleOptions={showTargetHandleOptions} />
                <BaseHandle id={1} type="source" position={Position.Left} className="absolute left-0 top-1/2 -translate-y-1/2" showSourceHandleOptions={showSourceHandleOptions} showTargetHandleOptions={showTargetHandleOptions} />
                {/** TARGETY HANDLES */}
                <BaseHandle id={2} type="target" position={Position.Right} className="absolute right-0 top-1/2 -translate-y-1/2" showSourceHandleOptions={showSourceHandleOptions} showTargetHandleOptions={showTargetHandleOptions} />
                <BaseHandle id={3} type="target" position={Position.Left} className="absolute left-0 top-1/2 -translate-y-1/2" showSourceHandleOptions={showSourceHandleOptions} showTargetHandleOptions={showTargetHandleOptions} />
            </div>

            {/* Textarea debajo, sin position absolute */}
            <div className="mt-2 w-full flex justify-center">
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={onChange}
                    onBlur={handleBlur}
                    onWheel={(e) => e.stopPropagation()}
                    placeholder="Evento de tiempo"
                    className={`nodrag placeholder-gray-400 bg-transparent dark:text-white border-none outline-none resize-none text-center text-sm py-1 overflow-hidden max-w-[120px] ${isEditing ? 'pointer-events-auto' : 'pointer-events-none'
                        }`}
                />
            </div>
        </div>
    )
}
