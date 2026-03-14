import { useState } from 'react';
import {
    BaseEdge,
    EdgeLabelRenderer,
    useReactFlow,
    type EdgeProps as ReactFlowEdgeProps
} from '@xyflow/react';
import EdgeSuggestionTooltip from './EdgeSuggestionTooltip';
import type { EdgeDataProps } from '../../types/canvas';

// Extend the original EdgeProps to properly type our custom data
export type LostMessageEdgeProps = Omit<ReactFlowEdgeProps, 'data'> & {
    data?: EdgeDataProps;
};

export function LostMessageEdge({
    id,
    sourceX,
    sourceY,
    style,
    markerEnd,
    label,
    data
}: LostMessageEdgeProps) {
    const { setEdges } = useReactFlow();
    const [isEditing, setIsEditing] = useState(false);
    const [editingLabel, setEditingLabel] = useState('');
    const [showSuggestion, setShowSuggestion] = useState(false);

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

    // El círculo negro está 60px a la derecha del source
    const circleX = sourceX + 60;
    const circleY = sourceY;
    const circleRadius = 8;

    const edgePath = `M ${sourceX} ${sourceY} L ${circleX - circleRadius} ${circleY}`;

    const labelX = sourceX + 30;
    const labelY = sourceY - 15;

    const onSave = () => {
        setIsEditing(false);
        const trimmedLabel = editingLabel.trim();
        setEdges((currentEdges) =>
            currentEdges.map((e) => {
                if (e.id === id) {
                    return { ...e, label: trimmedLabel, data: { ...(e.data || {}), y: sourceY } };
                }
                return e;
            })
        );
    };

    const onDoubleClick = () => {
        const currentText = String(label || '');
        setEditingLabel(currentText);
        setIsEditing(true);
    };

    return (
        <>
            <BaseEdge
                id={id}
                path={edgePath}
                style={style}
                markerEnd={markerEnd}
            />
            <path
                d={edgePath}
                fill="none"
                stroke="transparent"
                strokeWidth={20}
                onDoubleClick={onDoubleClick}
                cursor="pointer"
            />
            <circle
                cx={circleX}
                cy={circleY}
                r={circleRadius}
                fill="currentColor"
                className="text-neutral-800 dark:text-neutral-200"
            />
            <EdgeLabelRenderer>
                <div
                    className="absolute nodrag nopan"
                    style={{
                        transform: `translate(-50%, -100%) translate(${labelX}px, ${labelY}px)`,
                        pointerEvents: isEditing ? 'all' : 'none',
                    }}
                >
                    {isEditing ? (
                        <div className="flex flex-col">
                            <input
                                autoFocus
                                value={editingLabel}
                                onChange={(e) => setEditingLabel(e.target.value.slice(0, 30))}
                                maxLength={30}
                                onBlur={onSave}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') onSave();
                                    if (e.key === 'Escape') setIsEditing(false);
                                }}
                                className="py-0.5 px-1 border-none rounded text-xs w-28 bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                            />
                            <div className="text-xs text-right text-gray-500 dark:text-gray-400 mt-0.5">
                                {editingLabel.length} / 30
                            </div>
                        </div>
                    ) : (
                        label && (
                            <div
                                className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200 px-1 py-0.5 rounded text-xs"
                            >
                                {label}
                            </div>
                        )
                    )}
                </div>

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
