import { Position } from "@xyflow/react";
import BaseHandle from "../BaseHandle";
import { useState } from "react";
import { useCanvas } from "../../../hooks/useCanvas";
import "../styles/nodeStyles.css";


export default function DecitionControl() {
    const [showHandles, setShowHandles] = useState(false);
    const {isTryingToConnect} = useCanvas();

    return (
        <div
            className="node-diamond"
            style={{
                clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            }}
            onMouseEnter={() => setShowHandles(true)}
            onMouseLeave={() => setShowHandles(false)}
        >
            <BaseHandle id={0} position={Position.Top} showHandle={showHandles} className="!absolute !top-1"/>
            <BaseHandle id={3} position={Position.Left} showHandle={showHandles} className="!absolute !left-1"/>
            <BaseHandle id={1} position={Position.Right} showHandle={showHandles && !isTryingToConnect} className="!absolute !right-1"/>
            <BaseHandle id={2} position={Position.Bottom} showHandle={showHandles && !isTryingToConnect} className="!absolute !bottom-1"/>
        </div >
    )
}
