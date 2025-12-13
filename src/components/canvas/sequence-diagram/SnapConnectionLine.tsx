import { getStraightPath, getSmoothStepPath, ConnectionLineType, type ConnectionLineComponentProps } from '@xyflow/react';

export function SnapConnectionLine({
    fromX,
    fromY,
    toX,
    toY,
    fromPosition,
    toPosition,
    connectionStatus,
    connectionLineType,
}: ConnectionLineComponentProps) {
    const SNAPY_THRESHOLD = 25;
    const SNAPX_THRESHOLD = 25;
    
    const deltaX = toX - fromX;
    const deltaY = toY - fromY;
    const isSnappingX = Math.abs(deltaX) < SNAPX_THRESHOLD;
    const isSnappingY = Math.abs(deltaY) < SNAPY_THRESHOLD;
    const finalToX = isSnappingX ? fromX : toX;
    const finalToY = isSnappingY ? fromY : toY;

    let path = '';

    if (connectionLineType === ConnectionLineType.SmoothStep) {
        [path] = getSmoothStepPath({
            sourceX: fromX,
            sourceY: fromY,
            sourcePosition: fromPosition,
            targetX: finalToX,
            targetY: finalToY,
            targetPosition: toPosition,
            borderRadius: 5,
        });
    } else {
        [path] = getStraightPath({
            sourceX: fromX,
            sourceY: fromY,
            targetX: finalToX,
            targetY: finalToY,
        });
    }

    const strokeColor = connectionStatus === 'valid' ? '#0084D1' : '#D1D5DB';

    return (
        <g>
            <defs>
                <marker
                    id="snapArrowOpen"
                    markerWidth="20"
                    markerHeight="20"
                    refX="10"
                    refY="10"
                    orient="auto"
                >
                    <polyline
                        points="5 6 10 10 5 14"
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </marker>
            </defs>
            <path
                d={path}
                fill="none"
                stroke={strokeColor}
                strokeWidth={2}
                markerEnd="url(#snapArrowOpen)"
            />
        </g>
    );
}
