import { NodeResizer, useNodeId, useReactFlow } from "@xyflow/react";
import { useCallback } from "react";
import { useCanvas } from "../../../hooks/useCanvas";
import "../styles/nodeStyles.css";

export default function InterruptActivityRegion() {
    const { setIsZoomOnScrollEnabled } = useCanvas();
    const nodeId = useNodeId();
    const { getNode } = useReactFlow();

    const node = getNode(nodeId!);
    const isSelected = node?.selected ?? false;

    const onMouseDown = useCallback(() => {
        setIsZoomOnScrollEnabled(false);
    }, [setIsZoomOnScrollEnabled]);

    const onMouseUp = useCallback(() => {
        setIsZoomOnScrollEnabled(true);
    }, [setIsZoomOnScrollEnabled]);

    return (
        <div
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            className="interruptible-region"
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                pointerEvents: "all",
            }}
        >
            <NodeResizer
                minWidth={200}
                minHeight={150}
                isVisible={isSelected}
                handleStyle={{
                    width: 36,
                    height: 36,
                    opacity: 0,
                }}
                lineStyle={{
                    stroke: 'currentColor',
                    strokeWidth: 2,
                }}
            />
        </div>
    );
}
