import { useCallback, useEffect, useRef, useState } from "react";
import { useCanvas } from "../../../hooks/useCanvas";
import { Position, useNodeId, useReactFlow } from "@xyflow/react";
import BaseHandle from "../BaseHandle";
import { TEXT_AREA_MAX_LEN } from "../variables";
import { useTheme } from "../../../hooks/useTheme";
import "../styles/nodeStyles.css";
import type { DataProps } from "../../../types/canvas";


export default function AcceptTimeEvent({data}: DataProps) {
    const [isEditing, setIsEditing] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [value, setValue] = useState(data.label || '');
    const { setIsZoomOnScrollEnabled, isTryingToConnect, openContextMenu } = useCanvas();
    const [showSourceHandle, setShowSourceHandle] = useState(true);
    const { isDarkMode } = useTheme();
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

    const handleContextMenu = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        openContextMenu({
            x: e.clientX,
            y: e.clientY,
            nodeId: nodeId ?? "",
        });
    }, [openContextMenu, nodeId]);

    return (
        <div
            onDoubleClick={handleDoubleClick}
            onContextMenu={handleContextMenu}
            className="flex flex-col items-center justify-center transition-all duration-150 relative"
            style={{
                marginRight: '-10px',
                marginLeft: '-10px',
            }}
            onMouseEnter={() => setShowSourceHandle(true)}
            onMouseLeave={() => setShowSourceHandle(false)}
        >
            <div className="z-10">
                <div
                    className={`relative w-12 h-6 ${isDarkMode ? 'bg-neutral-800' : 'bg-gray-400'}`}
                    style={{
                        clipPath: 'polygon(50% 100%, 100% 0, 0 0)',
                    }}
                ></div>
                <div
                    className={`relative w-12 h-6 ${isDarkMode ? 'bg-neutral-800' : 'bg-gray-400'}`}
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
                    className={`node-textarea max-w-[120px] w-4/5 ${isEditing ? 'node-textarea-editing' : 'node-textarea-readonly'}`}
                />
                {isEditing &&
                    <p className="char-counter char-counter-right">{`${value.length}/${TEXT_AREA_MAX_LEN}`}</p>
                }
            </div>
        </div>
    )
}
