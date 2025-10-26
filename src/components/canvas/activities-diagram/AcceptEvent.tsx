import { Position, useNodeId } from "@xyflow/react";
import BaseHandle from "../BaseHandle";
import { useNode } from "../useNode";
import { useCanvas } from "../../../hooks/useCanvas";
import { useCallback, useEffect, useRef, useState } from "react";

export default function AcceptEvent() {
    const { showSourceHandleOptions, setShowSourceHandleOptions, showTargetHandleOptions, setShowTargetHandleOptions } = useNode();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isEditing, setIsEditing] = useState(false);
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
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className="p-2 bg-gray-300 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-zinc-600 min-w-[150px] min-h-[50px] flex flex-col items-center justify-center transition-all duration-150"
            style={{
                clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 20% 50%)',
                padding: '10px',
                marginRight: '-2px',
                marginLeft: '-20px',
            }}
        >
            <BaseHandle id={0} type="target" position={Position.Right} showSourceHandleOptions={showSourceHandleOptions} showTargetHandleOptions={showTargetHandleOptions} />
            <BaseHandle id={1} type="source" position={Position.Left} showSourceHandleOptions={showSourceHandleOptions} showTargetHandleOptions={showTargetHandleOptions} />
            <textarea
                ref={textareaRef}
                value={value}
                onChange={onChange}
                onBlur={handleBlur}
                onWheel={(e) => e.stopPropagation()}
                placeholder="Evento de aceptación"
                className={`nodrag w-4/5 placeholder-gray-400 bg-transparent dark:text-white border-none outline-none resize-none text-center text-sm pl-4 py-1 overflow-hidden ${isEditing ? 'pointer-events-auto' : 'pointer-events-none'
                    }`}
                rows={1}
            />
            {isEditing &&
                <p className="w-full text-[10px] text-right text-neutral-400">{`${value.length}/50`}</p>
            }
        </div >
    )
}
