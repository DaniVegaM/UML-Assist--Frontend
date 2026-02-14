import { NodeResizer, useNodeId, useReactFlow } from "@xyflow/react";
import { useCallback, useState } from "react";
import { useCanvas } from "../../../hooks/useCanvas";
import "../styles/nodeStyles.css";

export default function InterruptActivityRegion() {
    const { setIsZoomOnScrollEnabled, openContextMenu } = useCanvas();
    const nodeId = useNodeId();
    const { getNode } = useReactFlow();
    const [isHovered, setIsHovered] = useState(false);
    
    const node = getNode(nodeId!);
    const isSelected = node?.selected ?? false;
    
    const showResizer = isSelected || isHovered;

    const onMouseDown = useCallback(() => {
        setIsZoomOnScrollEnabled(false);
    }, [setIsZoomOnScrollEnabled]);

    const onMouseUp = useCallback(() => {
        setIsZoomOnScrollEnabled(true);
    }, [setIsZoomOnScrollEnabled]);

    const handleContextMenu = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        openContextMenu({
        x: e.clientX,
        y: e.clientY,
        nodeId: nodeId ?? "",
        });
    }, [openContextMenu, nodeId]);

    return (
        <div
            onMouseEnter={() => setIsHovered(true)} 
            onMouseLeave={() => setIsHovered(false)}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onContextMenu={handleContextMenu}
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
                isVisible={showResizer}
                shouldResize={() => true}
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
