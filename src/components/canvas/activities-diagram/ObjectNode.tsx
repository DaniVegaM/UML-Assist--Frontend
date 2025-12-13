import { useCallback, useRef, useState, useEffect } from "react";
import { useCanvas } from "../../../hooks/useCanvas";
import BaseHandle from "../BaseHandle";
import { Position } from "@xyflow/react";
import { TEXT_AREA_MAX_LEN } from "../../canvas/variables";
import "../styles/nodeStyles.css";

export default function ObjectNode() {
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
        setValue(prevValue => prevValue.trim());
    }, [setIsZoomOnScrollEnabled]);

    return (
        <div
            className="node-rect"
            onDoubleClick={ handleDoubleClick }
            onMouseEnter={() => setShowHandles(true)}
            onMouseLeave={() => setShowHandles(false)}
        >
            <BaseHandle id={0} position={Position.Top} showHandle={showHandles} />
            <BaseHandle id={1} position={Position.Right} showHandle={showHandles} />
            <BaseHandle id={2} position={Position.Bottom} showHandle={showHandles} />
            <BaseHandle id={3} position={Position.Left} showHandle={showHandles} />
            <textarea
                className={`node-textarea nowheel ${isEditing ? 'node-textarea-editing' : 'node-textarea-readonly'}`}
                ref={textareaRef}
                value={value}
                onChange={onChange}
                onBlur={handleBlur}
                placeholder={`(Particiones...)\nnombre:Tipo`}
                rows={1}
            />
            {isEditing &&
                <p className="char-counter char-counter-right">{`${value.length}/${TEXT_AREA_MAX_LEN}`}</p>
            }
        </div>
    )
}