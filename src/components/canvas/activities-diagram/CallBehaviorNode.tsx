import { useCallback, useRef, useState, useEffect } from "react";
import { useCanvas } from "../../../hooks/useCanvas";
import BaseHandle from "../BaseHandle";
import { Position } from "@xyflow/react";
import { TEXT_AREA_MAX_LEN } from "../variables";


export default function CallBehaviorNode() {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState("");
    const { setIsZoomOnScrollEnabled } = useCanvas();
    const [showHandles, setShowHandles] = useState(false);

    const onChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (evt.target.value.length >= TEXT_AREA_MAX_LEN) {
            setValue(evt.target.value.trim().slice(0, TEXT_AREA_MAX_LEN));
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
            className="relative border border-gray-300 dark:border-neutral-900 rounded-lg p-2 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-zinc-600 min-w-[200px] flex flex-col items-center justify-center transition-all duration-150"
            onMouseEnter={() => setShowHandles(true)}
            onMouseLeave={() => setShowHandles(false)}
        >
            <BaseHandle id={0} position={Position.Top} showHandle={showHandles} className="!absolute !top-0 !left-1/4" />
            <BaseHandle id={1} position={Position.Top} showHandle={showHandles} className="!absolute !top-0 !left-3/4" />
            <BaseHandle id={2} position={Position.Right} showHandle={showHandles} className="!absolute !top-1/4 right-0" />
            <BaseHandle id={3} position={Position.Right} showHandle={showHandles} className="!absolute !top-3/4 right-0" />
            <BaseHandle id={4} position={Position.Left} showHandle={showHandles} className="!absolute !top-1/4 left-0" />
            <BaseHandle id={5} position={Position.Left} showHandle={showHandles} className="!absolute !top-3/4 left-0" />
            <BaseHandle id={6} position={Position.Bottom} showHandle={showHandles} className="!absolute !bottom-0 !left-1/4" />
            <BaseHandle id={7} position={Position.Bottom} showHandle={showHandles} className="!absolute !bottom-0 !left-3/4" />
            <textarea
                ref={textareaRef}
                value={value}
                onChange={onChange}
                onBlur={handleBlur}
                onWheel={(e) => e.stopPropagation()}
                placeholder={`(Particiones...)\nLlamada a un comportamiento`}
                className={`nodrag w-full placeholder-gray-400 bg-transparent dark:text-white border-none outline-none resize-none text-center text-sm px-2 py-1 overflow-hidden ${isEditing ? 'pointer-events-auto' : 'pointer-events-none'
                    }`}
                rows={1}
            />
            <div className={`flex ${isEditing ? 'justify-between' : 'justify-end'} gap-6 w-full`}>
                {isEditing &&
                    <p className="w-full text-[10px] text-left text-neutral-400">{`${value.length}/${TEXT_AREA_MAX_LEN}`}</p>
                }
                <div className="bg-neutral-700 w-[20px] h-[20px]"
                    style={{
                        clipPath: 'polygon(40% 0, 60% 0, 60% 45%, 100% 45%, 100% 100%, 80% 100%, 80% 60%, 60% 60%, 59% 100%, 40% 100%, 40% 60%, 20% 60%, 20% 100%, 0 100%, 0 45%, 40% 45%)'
                    }}></div>
            </div>
        </div>
    )
}