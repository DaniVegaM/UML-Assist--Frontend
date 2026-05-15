import React, { useState } from 'react';
import {
    BaseEdge,
    EdgeLabelRenderer,
    getSmoothStepPath,
    useReactFlow,
    type EdgeProps as ReactFlowEdgeProps
} from '@xyflow/react';
import EdgeSuggestionTooltip from './EdgeSuggestionTooltip';
import type { EdgeDataProps } from '../../types/canvas';

// Extend the original EdgeProps to properly type our custom data
export type LabeledEdgeProps = Omit<ReactFlowEdgeProps, 'data'> & {
    data?: EdgeDataProps;
};

export function LabeledEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    markerEnd,
    style,
    label,
    labelStyle,
    labelBgStyle,
    labelBgPadding,
    labelBgBorderRadius,
    data
}: LabeledEdgeProps) {

    const { setEdges } = useReactFlow();
    const [isEditing, setIsEditing] = useState(false);
    const [editingLabel, setEditingLabel] = useState('');
    const [showSuggestion, setShowSuggestion] = useState(false);
    const [openTime, setOpenTime] = useState(0);

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
        borderRadius: 5,
    });

    // Smart repositioning heuristic to avoid edge overlapping
    let isMidpointVertical = false;

    const isSourceHorizontal = sourcePosition === 'left' || sourcePosition === 'right';
    const isTargetHorizontal = targetPosition === 'left' || targetPosition === 'right';

    if (!isSourceHorizontal && !isTargetHorizontal) {
        // Top/Bottom to Top/Bottom: main middle segment is horizontal, unless X distance is very small
        isMidpointVertical = Math.abs(finalTargetX - sourceX) < 40;
    } else if (isSourceHorizontal && isTargetHorizontal) {
        // Left/Right to Left/Right: main middle segment is vertical, unless Y distance is very small
        isMidpointVertical = Math.abs(finalTargetY - sourceY) >= 40;
    } else {
        // Mixed: midpoint usually falls on the longer segment
        isMidpointVertical = Math.abs(finalTargetY - sourceY) > Math.abs(finalTargetX - sourceX);
    }

    // En lugar de usar offsets grandes con -50% -50%, usamos anclaje dinámico:
    // - Si es vertical, anclamos el lado izquierdo del texto a la derecha de la flecha (translate(0%, -50%)) con 12px de margen.
    // - Si es horizontal, anclamos la parte inferior del texto arriba de la flecha (translate(-50%, -100%)) con 12px de margen.
    const transformOrigin = isMidpointVertical ? 'translate(0%, -50%)' : 'translate(-50%, -100%)';
    const finalLabelX = isMidpointVertical ? labelX + 12 : labelX;
    const finalLabelY = isMidpointVertical ? labelY : labelY - 12;

    const onSave = () => {
        setIsEditing(false);
        const trimmedLabel = editingLabel.trim();
        let formattedLabel = '';

        if (trimmedLabel !== '') {
            if (trimmedLabel.startsWith('[') && trimmedLabel.endsWith(']')) {
                formattedLabel = trimmedLabel;
            } else {
                formattedLabel = `[${trimmedLabel}]`;
            }
        }

        setEdges((currentEdges) =>
            currentEdges.map((e) => {
                if (e.id === id) {
                    return { ...e, label: formattedLabel };
                }
                return e;
            })
        );
    };

    const handleBlur = () => {
        // Prevent accidental closes right after opening (e.g. from frantic clicking)
        if (Date.now() - openTime < 300) return;
        onSave();
    };

    const onDoubleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        const currentText = String(label || '').replace(/^\[|\]$/g, '');
        setEditingLabel(currentText);
        setIsEditing(true);
        setOpenTime(Date.now());
    };

    const onKeyDown = (evt: React.KeyboardEvent<HTMLInputElement>) => {
        if (evt.key === 'Enter') {
            onSave();
        } else if (evt.key === 'Escape') {
            setIsEditing(false);
        }
    };

    const onLabelChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        setEditingLabel(evt.target.value.slice(0, 30));
    };

    return (
        <>
            <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} />
            <path
                d={edgePath}
                fill="none"
                stroke="transparent"
                strokeWidth={25}
                onDoubleClick={onDoubleClick}
                cursor="pointer"
                className="react-flow__edge-interaction"
            />

            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `${transformOrigin} translate(${finalLabelX}px,${finalLabelY}px)`,
                        pointerEvents: isEditing ? 'all' : 'none',
                        userSelect: 'none',
                    }}
                    className="nodrag nopan"
                >
                    {isEditing ? (
                        <div className="flex flex-col">
                            <input
                                autoFocus
                                value={editingLabel}
                                onChange={onLabelChange}
                                maxLength={30}
                                onBlur={handleBlur}
                                onKeyDown={onKeyDown}
                                className="
                                py-0.5 px-1
                                border-none
                                rounded
                                text-xs
                                w-28
                                bg-gray-100
                                text-gray-900
                                dark:bg-gray-800
                                dark:text-gray-200
                                focus:outline-none
                                focus:ring-1
                                focus:ring-sky-500
                                focus:border-sky-500
                            "
                            />
                            <div className="text-xs text-right text-gray-500 dark:text-gray-400 mt-0.5">
                                {editingLabel.length} / 30
                            </div>
                        </div>
                    ) : (
                        label && (
                            <div
                                style={{
                                    ...labelStyle,
                                    background: '#F3F4F6',
                                    opacity: labelBgStyle?.fillOpacity,
                                    padding: labelBgPadding ? `${labelBgPadding[0]}px ${labelBgPadding[1]}px` : '2px 4px',
                                    fontSize: '12px',
                                    borderRadius: labelBgBorderRadius,
                                }}
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
                            // The suggestion button always sits nicely to the side of the label
                            transform: `translate(-50%, -50%) translate(${finalLabelX + (isMidpointVertical ? 40 : 25)}px, ${finalLabelY - 15}px)`,
                            pointerEvents: 'all',
                        }}
                        className="nodrag nopan"
                    >
                        <button
                            onDoubleClick={(e) => e.stopPropagation()}
                            onClick={(e) => { e.stopPropagation(); setShowSuggestion(prev => !prev); }}
                            title="Ver sugerencia de IA"
                            className="ver-ia w-5 h-5 rounded-full bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold flex items-center justify-center shadow-md transition-colors cursor-pointer"
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