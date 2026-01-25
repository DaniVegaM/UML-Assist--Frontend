import { BaseEdge, getSmoothStepPath } from "@xyflow/react";
import type { EdgeProps } from "@xyflow/react";

export function NoteEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style,
}: EdgeProps) {

    const SNAP_THRESHOLD = 25;

    let finalTargetX = targetX;
    let finalTargetY = targetY;

    if (Math.abs(targetY - sourceY) < SNAP_THRESHOLD) {
        finalTargetY = sourceY;
    }

    if (Math.abs(targetX - sourceX) < SNAP_THRESHOLD) {
        finalTargetX = sourceX;
    }

    const [edgePath] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX: finalTargetX,
        targetY: finalTargetY,
        targetPosition,
        borderRadius: 0,
    });

    return (
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
    );
}
