import { useCallback, useRef, useState, useEffect } from "react";
import { useCanvas } from "../../../hooks/useCanvas";
import BaseHandle from "../BaseHandle";
import { Position } from "@xyflow/react";
import { TEXT_AREA_MAX_LEN } from "../variables";
import { useTheme } from "../../../hooks/useTheme";
import "../styles/nodeStyles.css";


export default function CallBehaviorNode() {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState("");
    const { setIsZoomOnScrollEnabled } = useCanvas();
    const [showHandles, setShowHandles] = useState(false);
    const { isDarkMode } = useTheme();

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
            className="node-rounded"
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
                className={`node-textarea ${isEditing ? 'node-textarea-editing' : 'node-textarea-readonly'}`}
                rows={1}
            />
            <div className={`flex ${isEditing ? 'justify-between' : 'justify-end'} gap-6 w-full`}>
                {isEditing &&
                    <p className="char-counter char-counter-left">{`${value.length}/${TEXT_AREA_MAX_LEN}`}</p>
                }
                <div className={`w-5 h-5 ${isDarkMode ? 'bg-neutral-300' : 'bg-neutral-700'}`}
                    style={{
                        clipPath: 'polygon(40% 0, 60% 0, 60% 45%, 100% 45%, 100% 100%, 80% 100%, 80% 60%, 60% 60%, 59% 100%, 40% 100%, 40% 60%, 20% 60%, 20% 100%, 0 100%, 0 45%, 40% 45%)'
                    }}></div>
            </div>
        </div>
    )
}