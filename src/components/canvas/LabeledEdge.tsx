import React, { useState } from 'react';
import {
    BaseEdge,
    EdgeLabelRenderer,
    getSmoothStepPath,
    useReactFlow,
    type EdgeProps
} from '@xyflow/react';

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
    labelBgBorderRadius
}: EdgeProps) {

    const { setEdges } = useReactFlow();
    const [isEditing, setIsEditing] = useState(false);
    const [editingLabel, setEditingLabel] = useState('');

    const [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        borderRadius: 5,
    });

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

    const onDoubleClick = () => {
        const currentText = String(label || '').replace(/^\[|\]$/g, '');
        setEditingLabel(currentText);
        setIsEditing(true);
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
                strokeWidth={20}
                onDoubleClick={onDoubleClick}
                cursor="pointer"
            />

            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        pointerEvents: isEditing ? 'all' : 'none',
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
                                onBlur={onSave}
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
            </EdgeLabelRenderer>
        </>
    );
}