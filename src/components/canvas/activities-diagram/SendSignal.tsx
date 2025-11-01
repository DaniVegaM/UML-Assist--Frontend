import { useCanvas } from "../../../hooks/useCanvas";
import { useCallback, useEffect, useRef, useState } from "react";
import BaseHandle from "../BaseHandle";
import { Position } from "@xyflow/react";

export default function SendSignal() {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState("");
    const { setIsZoomOnScrollEnabled, isTryingToConnect } = useCanvas();
    const [showSourceHandle, setShowSourceHandle] = useState(true);

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

    return (
        <div
            onDoubleClick={handleDoubleClick}
            className="p-2 bg-gray-300 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-zinc-600 min-w-[150px] min-h-[50px] flex flex-col items-center justify-center transition-all duration-150"
            style={{
                clipPath: 'polygon(75% 0, 100% 50%, 75% 100%, 0 100%, 0 0)',
                padding: '10px',
                marginRight: '-4px',
                marginLeft: '-2px',
            }}
            onMouseEnter={() => setShowSourceHandle(true)}
            onMouseLeave={() => setShowSourceHandle(false)}
        >
            <BaseHandle id={0} position={Position.Right} showHandle={showSourceHandle && !isTryingToConnect} className="!absolute !right-1" />
            <BaseHandle id={1} position={Position.Left} showHandle={isTryingToConnect} className="!absolute !left-0" />
            <textarea
                ref={textareaRef}
                value={value}
                onChange={onChange}
                onBlur={handleBlur}
                onWheel={(e) => e.stopPropagation()}
                placeholder="Envio de señal"
                className={`nodrag w-4/5 placeholder-gray-400 bg-transparent dark:text-white border-none outline-none resize-none text-center text-sm pr-4 py-1 overflow-hidden ${isEditing ? 'pointer-events-auto' : 'pointer-events-none'
                    }`}
                rows={1}
            />
            {isEditing &&
                <p className="w-full text-[10px] text-left text-neutral-400">{`${value.length}/50`}</p>
            }
        </div >
    )
}
