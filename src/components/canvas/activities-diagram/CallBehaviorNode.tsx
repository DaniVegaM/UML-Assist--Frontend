import { useCallback, useRef, useState, useEffect } from "react";
import { useCanvas } from "../../../hooks/useCanvas";
import BaseHandle from "../BaseHandle";
import { TEXT_AREA_MAX_LEN } from "../variables";
import { useHandle, type HandleData } from "../../../hooks/useHandle";
import { useTheme } from "../../../hooks/useTheme";
import { useNodeId, useReactFlow } from "@xyflow/react";
import "../styles/nodeStyles.css";
import type { DataProps } from "../../../types/canvas";


export default function CallBehaviorNode({ data }: DataProps) {
    const nodeId = useNodeId();
    const { setNodes } = useReactFlow();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(data.label || "");
    const { setIsZoomOnScrollEnabled } = useCanvas();

    // Manejo de handles
    const [showHandles, setShowHandles] = useState(false);
    const nodeRef = useRef<HTMLDivElement>(null);
    const handleRef = useRef<HTMLDivElement>(null);
    const { handles, magneticHandle } = useHandle({ 
        handleRef, 
        nodeRef,
        initialHandles: data?.handles as HandleData[] | undefined
    });

    // Callback ref para actualizar handleRef cuando cambie el último handle
    const setHandleRef = useCallback((node: HTMLDivElement | null) => {
        handleRef.current = node;
    }, []);
    const { isDarkMode } = useTheme();

    // Sincronizamos handles con node.data cuando cambien
    useEffect(() => {
        if (!nodeId) return;
        setNodes(nodes => nodes.map(n => 
            n.id === nodeId 
                ? { ...n, data: { ...n.data, handles, label: value } }
                : n
        ));
    }, [handles, nodeId, setNodes, value]);

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
            onMouseEnter={() => setShowHandles(true)}
            onMouseLeave={() => setShowHandles(false)}
            className="bg-transparent p-4"
            onMouseMove={(evt) => { magneticHandle(evt) }}
        >
            <div ref={nodeRef} className="node-rounded">
                {handles.map((handle, i) => (
                    <BaseHandle key={handle.id} id={handle.id} ref={i == handles.length - 1 ? setHandleRef : undefined} showHandle={i == handles.length - 1 ? showHandles : false} position={handle.position} left={handle.left} top={handle.top} />
                ))}
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
        </div>
    )
}