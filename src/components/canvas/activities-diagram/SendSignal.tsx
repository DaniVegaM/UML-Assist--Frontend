import { useCanvas } from "../../../hooks/useCanvas";
import { useCallback, useEffect, useRef, useState } from "react";
import BaseHandle from "../BaseHandle";
import { Position, useNodeId, useReactFlow } from "@xyflow/react";
import { TEXT_AREA_MAX_LEN } from "../variables";
import "../styles/nodeStyles.css";
import type { DataProps } from "../../../types/canvas";
import NodeSuggestionTooltip from "../NodeSuggestionTooltip";

export default function SendSignal({data}: DataProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(data.label || "");
    const { setIsZoomOnScrollEnabled, isTryingToConnect, openContextMenu } = useCanvas();
    const [showSourceHandle, setShowSourceHandle] = useState(true);
    const { setNodes } = useReactFlow();
    const nodeId = useNodeId();

    const [showSuggestion, setShowSuggestion] = useState(false);

    const clearSuggestion = useCallback(() => {
        if (!nodeId) return;
        setShowSuggestion(false);
        setNodes(nodes => nodes.map(n =>
            n.id === nodeId ? { ...n, data: { ...n.data, suggestion: undefined } } : n
        ));
    }, [nodeId, setNodes]);

    useEffect(() => {
        if (data.suggestion) setShowSuggestion(true);
    }, [data.suggestion]);

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
        <>
            {data.suggestion && (
                <>
                    <button
                        onDoubleClick={(e) => e.stopPropagation()}
                        onClick={(e) => { e.stopPropagation(); setShowSuggestion(prev => !prev); }}
                        title="Ver sugerencia de IA"
                        className="absolute -top-2 -right-2 z-10 w-5 h-5 rounded-full bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold flex items-center justify-center shadow-md transition-colors cursor-pointer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-6" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0m-9 5.25h.008v.008H12z"/>
                        </svg>
                    </button>
                    <NodeSuggestionTooltip
                        isVisible={showSuggestion}
                        suggestionText={data.suggestion}
                        onMinimize={() => setShowSuggestion(false)}
                        onDiscard={clearSuggestion}
                    />
                </>
            )}
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
                onContextMenu={handleContextMenu}
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
            </div>
        </>
    )
}
