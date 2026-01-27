import { useCanvas } from "../../../hooks/useCanvas";
import { useCallback, useEffect, useRef, useState } from "react";
import BaseHandle from "../BaseHandle";
import { Position, useNodeId, useReactFlow } from "@xyflow/react";
import { TEXT_AREA_MAX_LEN } from "../variables";
import "../styles/nodeStyles.css";
import type { DataProps } from "../../../types/canvas";

export default function SendSignal({data}: DataProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(data.label || "");
    const { setIsZoomOnScrollEnabled, isTryingToConnect } = useCanvas();
    const [showSourceHandle, setShowSourceHandle] = useState(true);
    const { setNodes } = useReactFlow();
    const nodeId = useNodeId();

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

    useEffect(() => {
        if (!nodeId) return;
        setNodes(nodes => nodes.map(n =>
            n.id === nodeId
                ? { ...n, data: { ...n.data, label: value } }
                : n
        ));
    }, [nodeId, setNodes, value]);

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
            className="node-signal"
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
                placeholder={`(Particiones...)\nEnvio de señal`}
                className={`node-textarea w-4/5 pr-4 ${isEditing ? 'node-textarea-editing' : 'node-textarea-readonly'}`}
                rows={1}
            />
            {isEditing &&
                <p className="char-counter char-counter-left">{`${value.length}/${TEXT_AREA_MAX_LEN}`}</p>
            }
        </div >
    )
}
