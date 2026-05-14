import { memo } from "react";
import { useViewport } from "@xyflow/react";

function PageGuides() {
    const { x, y, zoom } = useViewport();

    const PAGE_WIDTH = 1123;
    const PAGE_HEIGHT = 794;
    const range = 10000;

    const startX =
        Math.floor((-x / zoom - range) / PAGE_WIDTH) *
        PAGE_WIDTH;

    const endX =
        Math.ceil((-x / zoom + range) / PAGE_WIDTH) *
        PAGE_WIDTH;

    const startY =
        Math.floor((-y / zoom - range) / PAGE_HEIGHT) *
        PAGE_HEIGHT;

    const endY =
        Math.ceil((-y / zoom + range) / PAGE_HEIGHT) *
        PAGE_HEIGHT;

    const guides = [];

    // Verticales
    for (let px = startX; px <= endX; px += PAGE_WIDTH) {
        guides.push(
            <div
                key={`v-${px}`}
                style={{
                    position: "absolute",
                    left: px,
                    top: startY,
                    width: 1,
                    height: endY - startY,
                    borderLeft: "1px dashed rgba(0, 132, 209)",
                    pointerEvents: "none",
                }}
            />
        );
    }

    // Horizontales
    for (let py = startY; py <= endY; py += PAGE_HEIGHT) {
        guides.push(
            <div
                key={`h-${py}`}
                style={{
                    position: "absolute",
                    left: startX,
                    top: py,
                    height: 1,
                    width: endX - startX,
                    borderTop: "1px dashed rgba(0, 132, 209)",
                    pointerEvents: "none",
                }}
            />
        );
    }

    return (
        <div
            className="page-guides"
            style={{
                position: "absolute"
            }}
        >
            {guides}
        </div>
    );
}

export default memo(PageGuides);