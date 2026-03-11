import { useState, useEffect } from "react";
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, useReactFlow } from "@xyflow/react";
import type { EdgeProps } from "@xyflow/react";
import EdgeSuggestionTooltip from './EdgeSuggestionTooltip';
import type { EdgeDataProps } from '../../types/canvas';

export type NoteEdgeProps = Omit<EdgeProps, 'data'> & {
    data?: EdgeDataProps;
};

export function NoteEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style,
    data,
}: NoteEdgeProps) {
    const { setEdges } = useReactFlow();
    const [showSuggestion, setShowSuggestion] = useState(false);

    useEffect(() => {
        if (data?.suggestion) {
            setShowSuggestion(true);
        } else {
            setShowSuggestion(false);
        }
    }, [data?.suggestion]);

    const clearSuggestion = () => {
        setEdges((eds) =>
            eds.map((e) => {
                if (e.id === id) {
                    const dataWithoutSuggestion = { ...(e.data || {}) } as Record<string, unknown>;
                    delete dataWithoutSuggestion.suggestion;
                    return { ...e, data: dataWithoutSuggestion };
                }
                return e;
            })
        );
        setShowSuggestion(false);
    };

    const SNAP_THRESHOLD = 25;

    let finalTargetX = targetX;
    let finalTargetY = targetY;

    if (Math.abs(targetY - sourceY) < SNAP_THRESHOLD) {
        finalTargetY = sourceY;
    }

    if (Math.abs(targetX - sourceX) < SNAP_THRESHOLD) {
        finalTargetX = sourceX;
    }

    const [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX: finalTargetX,
        targetY: finalTargetY,
        targetPosition,
        borderRadius: 0,
    });

    return (
        <>
            <BaseEdge
                id={id}
                path={edgePath}
                style={{
                    stroke: "#555",
                    strokeWidth: 1.5,
                    strokeDasharray: "6 4",
                    ...style,
                }}
            />
            <EdgeLabelRenderer>
                {data?.suggestion && (
                    <div
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${labelX + 20}px, ${labelY - 20}px)`,
                            pointerEvents: 'all',
                        }}
                        className="nodrag nopan"
                    >
                        <button
                            onDoubleClick={(e) => e.stopPropagation()}
                            onClick={(e) => { e.stopPropagation(); setShowSuggestion(prev => !prev); }}
                            title="Ver sugerencia de IA"
                            className="w-5 h-5 rounded-full bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold flex items-center justify-center shadow-md transition-colors cursor-pointer"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-6" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0m-9 5.25h.008v.008H12z"/>
                            </svg>
                        </button>
                    </div>
                )}
            </EdgeLabelRenderer>

            <EdgeSuggestionTooltip
                isVisible={showSuggestion}
                suggestionText={typeof data?.suggestion === 'string' ? data.suggestion : ''}
                labelX={labelX}
                labelY={labelY}
                onMinimize={() => setShowSuggestion(false)}
                onDiscard={clearSuggestion}
            />
        </>
    );
}
