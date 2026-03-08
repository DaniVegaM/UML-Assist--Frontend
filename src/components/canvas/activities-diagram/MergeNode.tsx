import { useCallback, useState, useEffect } from "react";
import BaseHandle from "../BaseHandle";
import { useCanvas } from "../../../hooks/useCanvas";
import { Position, useNodeId, useReactFlow } from "@xyflow/react";
import "../styles/nodeStyles.css";
import type { DataProps } from "../../../types/canvas";
import SuggestionTooltip from "../SuggestionTooltip";


export default function MergeNodel({ data }: DataProps) {
    const nodeId = useNodeId();
    const { setNodes } = useReactFlow();
    const [showHandles, setShowHandles] = useState(false);
    const { isTryingToConnect, openContextMenu } = useCanvas();

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
                    <SuggestionTooltip
                        isVisible={showSuggestion}
                        suggestionText={data.suggestion}
                        onMinimize={() => setShowSuggestion(false)}
                        onDiscard={clearSuggestion}
                    />
                </>
            )}
            <div
                className="node-diamond"
                style={{
                    clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                }}
                onMouseEnter={() => setShowHandles(true)}
                onMouseLeave={() => setShowHandles(false)}
                onContextMenu={handleContextMenu}
            >
                <BaseHandle id={0} position={Position.Top} showHandle={showHandles && isTryingToConnect} className="!absolute !top-1"/>
                <BaseHandle id={3} position={Position.Left} showHandle={showHandles && isTryingToConnect} className="!absolute !left-1"/>
                <BaseHandle id={1} position={Position.Right} showHandle={showHandles} className="!absolute !right-1"/>
                <BaseHandle id={2} position={Position.Bottom} showHandle={showHandles} className="!absolute !bottom-1"/>
            </div>
        </>
    )
}
