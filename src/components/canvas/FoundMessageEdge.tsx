import { useState } from 'react';
import {
    BaseEdge,
    EdgeLabelRenderer,
    useReactFlow,
    type EdgeProps
} from '@xyflow/react';

export function FoundMessageEdge({
    id,
    targetX,
    targetY,
    style,
    markerEnd,
    label,
}: EdgeProps) {
    const { setEdges } = useReactFlow();
    const [isEditing, setIsEditing] = useState(false);
    const [editingLabel, setEditingLabel] = useState('');

    // El círculo negro está 60px a la izquierda del target
    const circleX = targetX - 60;
    const circleY = targetY;
    const circleRadius = 8;

    const edgePath = `M ${circleX + circleRadius} ${circleY} L ${targetX} ${targetY}`;

    const labelX = targetX - 30;
    const labelY = targetY - 15;

    const onSave = () => {
        setIsEditing(false);
        const trimmedLabel = editingLabel.trim();
        setEdges((currentEdges) =>
            currentEdges.map((e) => {
                if (e.id === id) {
                    return { ...e, label: trimmedLabel };
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
            <circle
                cx={circleX}
                cy={circleY}
                r={circleRadius}
                fill="currentColor"
                className="text-neutral-800 dark:text-neutral-200"
            />
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
            </EdgeLabelRenderer>
        </>
    );
}
