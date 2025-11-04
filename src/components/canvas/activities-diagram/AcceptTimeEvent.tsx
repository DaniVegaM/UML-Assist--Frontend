import { useCallback, useEffect, useRef, useState } from "react";
import { useCanvas } from "../../../hooks/useCanvas";
import { Position } from "@xyflow/react";
import BaseHandle from "../BaseHandle";
import { TEXT_AREA_MAX_LEN } from "../variables";


export default function AcceptTimeEvent() {
    const [isEditing, setIsEditing] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [value, setValue] = useState("");
    const { setIsZoomOnScrollEnabled, isTryingToConnect } = useCanvas();
    const [showSourceHandle, setShowSourceHandle] = useState(true);

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
            className="relative flex flex-col items-center justify-center transition-all duration-150"
            style={{
                marginRight: '-10px',
                marginLeft: '-10px',
            }}
            onMouseEnter={() => setShowSourceHandle(true)}
            onMouseLeave={() => setShowSourceHandle(false)}
        >
            <div className="z-10">
                <div
                    className="relative w-12 h-6 bg-gray-400 dark:bg-neutral-800"
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
            </div>

            <BaseHandle id={0} position={Position.Right} showHandle={showSourceHandle && !isTryingToConnect} className="!absolute !right-9 !top-6" />
            <BaseHandle id={1} position={Position.Left} showHandle={isTryingToConnect} className="!absolute !left-12 !top-6" />

            {/* Textarea debajo, sin position absolute */}
            <div className="mt-2 w-full flex justify-center">
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={onChange}
                    onBlur={handleBlur}
                    onWheel={(e) => e.stopPropagation()}
                    placeholder={`(Particiones...)\nEvento de tiempo`}
                    className={`nodrag placeholder-gray-400 bg-transparent dark:text-white border-none outline-none resize-none text-center text-sm py-1 overflow-hidden max-w-[120px] w-4/5 ${isEditing ? 'pointer-events-auto' : 'pointer-events-none'
                        }`}
                />
                {isEditing &&
                    <p className="w-full text-[10px] text-right text-neutral-400">{`${value.length}/${TEXT_AREA_MAX_LEN}`}</p>
                }
            </div>
        </div>
    )
}
