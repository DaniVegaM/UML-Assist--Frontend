import BaseHandle from "../BaseHandle";
import { useCanvas } from "../../../hooks/useCanvas";
import { useCallback, useRef, useState, useEffect } from "react";
import { useHandle, type HandleData } from "../../../hooks/useHandle";
import { useTheme } from "../../../hooks/useTheme";
import { useNodeId, useReactFlow } from "@xyflow/react";
import "../styles/nodeStyles.css";
import type { DataProps } from "../../../types/canvas";
import NodeSuggestionTooltip from "../NodeSuggestionTooltip";

export default function FinalNode({ data }: DataProps) {
    const nodeId = useNodeId();
    const { setNodes } = useReactFlow();
    const { isTryingToConnect, openContextMenu } = useCanvas();
    const { isDarkMode } = useTheme();
    const [showSuggestion, setShowSuggestion] = useState(false);
    // Manejo de handles
    const [showHandles, setShowHandles] = useState(false);
    const nodeRef = useRef<HTMLDivElement>(null);
    const handleRef = useRef<HTMLDivElement>(null);
    const { handles, magneticHandle } = useHandle({ 
        handleRef, 
        nodeRef, 
        maxHandles: 1,
        initialHandles: data?.handles as HandleData[] | undefined
    });

    // Callback ref para actualizar handleRef cuando cambie el último handle
    const setHandleRef = useCallback((node: HTMLDivElement | null) => {
        handleRef.current = node;
    }, []);

    // Sincronizamos handles con node.data cuando cambien
    useEffect(() => {
        if (!nodeId) return;
        setNodes(nodes => nodes.map(n => 
            n.id === nodeId 
                ? { ...n, data: { ...n.data, handles } }
                : n
        ));
    }, [handles, nodeId, setNodes]);


    const clearSuggestion = useCallback(() => {
        if (!nodeId) return;
        setShowSuggestion(false);
        setNodes(nodes => nodes.map(n =>
            n.id === nodeId ? { ...n, data: { ...n.data, suggestion: undefined } } : n
        ));
    }, [nodeId, setNodes]);

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
            className="bg-transparent p-4"
            onMouseEnter={() => setShowHandles(isTryingToConnect)}
            onMouseLeave={() => setShowHandles(false)}
            onContextMenu={handleContextMenu}
            onMouseMove={(evt) => { magneticHandle(evt) }}
        >
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
            <div ref={nodeRef} className="node-circle node-circle-md"
            style={{
                clipPath: 'circle(50.0% at 50% 50%)'
            }}>
                {handles.map((handle, i) => (
                    <BaseHandle key={handle.id} id={handle.id} ref={i == handles.length - 1 ? setHandleRef : undefined} showHandle={i == handles.length - 1 ? showHandles : false} position={handle.position} left={handle.left} top={handle.top} />
                ))}
                <div
                    className={`absolute w-14 h-14 flex items-center justify-center ${isDarkMode ? 'bg-neutral-800' : 'bg-white'}`}
                    style={{
                        clipPath: 'circle(50.0% at 50% 50%)',
                        zIndex: 1,
                    }}
                ></div>
                <div
                    className={`absolute w-10 h-10 ${isDarkMode ? 'bg-neutral-100' : 'bg-neutral-900'}`}
                    style={{
                        clipPath: 'circle(50.0% at 50% 50%)',
                        zIndex: 1,
                    }}
                ></div>
            </div>
        </div>
    )
}