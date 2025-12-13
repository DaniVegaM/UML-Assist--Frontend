import { getStraightPath, type ConnectionLineComponentProps } from '@xyflow/react';

export function SnapConnectionLine({
    fromX,
    fromY,
    toX,
    toY,
    connectionStatus,
}: ConnectionLineComponentProps) {
    const SNAP_THRESHOLD = 25;
    
    const deltaY = toY - fromY;
    const isSnapping = Math.abs(deltaY) < SNAP_THRESHOLD;
    const finalToY = isSnapping ? fromY : toY;

    const [path] = getStraightPath({
        sourceX: fromX,
        sourceY: fromY,
        targetX: toX - 10,
        targetY: finalToY,
    });

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
