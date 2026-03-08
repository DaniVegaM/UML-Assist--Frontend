import { NodeResizer, useNodeId, useReactFlow } from "@xyflow/react";
import { useCallback, useEffect, useState } from "react";
import { useCanvas } from "../../../hooks/useCanvas";
import "../styles/nodeStyles.css";
import type { DataProps } from "../../../types/canvas";
import SuggestionTooltip from "../SuggestionTooltip";

export default function InterruptActivityRegion({ data }: DataProps) {
    const { setIsZoomOnScrollEnabled, openContextMenu } = useCanvas();
    const nodeId = useNodeId();
    const { getNode, setNodes } = useReactFlow();
    const [isHovered, setIsHovered] = useState(false);

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

    const node = getNode(nodeId!);
    const isSelected = node?.selected ?? false;
    
    const showResizer = isSelected || isHovered;

    const onMouseDown = useCallback(() => {
        setIsZoomOnScrollEnabled(false);
    }, [setIsZoomOnScrollEnabled]);

    const onMouseUp = useCallback(() => {
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
            onMouseEnter={() => setIsHovered(true)} 
            onMouseLeave={() => setIsHovered(false)}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onContextMenu={handleContextMenu}
            className="interruptible-region"
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                pointerEvents: "all",
            }}
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
                    <SuggestionTooltip
                        isVisible={showSuggestion}
                        suggestionText={data.suggestion}
                        onMinimize={() => setShowSuggestion(false)}
                        onDiscard={clearSuggestion}
                    />
                </>
            )}
            <NodeResizer
                minWidth={200}
                minHeight={150}
                isVisible={showResizer}
                shouldResize={() => true}
                handleStyle={{
                    width: 36,
                    height: 36,
                    opacity: 0,
                }}
                lineStyle={{
                    stroke: 'currentColor',
                    strokeWidth: 2,
                }}
            />
        </div>
    );
}
