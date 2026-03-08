import { useCallback, useEffect, useState } from "react";
import BaseHandle from "../BaseHandle";
import { Position, useNodeConnections, useNodeId, useReactFlow, useUpdateNodeInternals } from "@xyflow/react";
import { useCanvas } from "../../../hooks/useCanvas";
import "../styles/nodeStyles.css";
import type { DataProps } from "../../../types/canvas";
import SuggestionTooltip from "../SuggestionTooltip";

export default function ParallelizationNode({ data }: DataProps) {
    const [showHandles, setShowHandles] = useState(false);
    const { isTryingToConnect, openContextMenu } = useCanvas();
    const [sourceHandlesIds, setSourceHandlesIds] = useState<number[]>([0, 1]);
    const [targetHandlesIds, setTargetHandlesIds] = useState<number[]>([0, 1]);

    const nodeId = useNodeId();
    const { setNodes } = useReactFlow();
    const updateNodeInternals = useUpdateNodeInternals();

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

    const connections = useNodeConnections({
        id: nodeId ? nodeId : '',
    });

    const targetConnectionsLength = connections.filter(conn => conn.target === nodeId).length;
    const sourceConnectionsLength = connections.filter(conn => conn.source === nodeId).length;

    useEffect(() => {
        console.log('connections', connections.length);
        setSourceHandlesIds(prev => (sourceConnectionsLength >= prev.length ? [...prev, prev.length] : prev));
        updateNodeInternals(nodeId ? nodeId : '');
        setTargetHandlesIds(prev => (targetConnectionsLength >= prev.length ? [...prev, prev.length] : prev));
        updateNodeInternals(nodeId ? nodeId : '');
    }, [connections, updateNodeInternals]);

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
                className="node-bar"
                onMouseEnter={() => setShowHandles(true)}
                onMouseLeave={() => setShowHandles(false)}
                onContextMenu={handleContextMenu}
            >
            <div className="flex">
                <div className="flex flex-col">
                    {targetHandlesIds.map((_, id) => (
                        <BaseHandle key={`target-${id}`} id={`target-${id}`} position={Position.Left} showHandle={isTryingToConnect} className="!relative !top-0 !my-[15px]" />
                    ))}
                </div>
                <div className="flex flex-col">
                    {sourceHandlesIds.map((_, id) => (
                        <BaseHandle key={`source-${id}`} id={`source-${id}`} position={Position.Right} showHandle={showHandles} className="!relative !top-0 !right-0 !my-[15px]" />
                    ))}
                </div>
            </div>
            </div>
        </>
    )
}
