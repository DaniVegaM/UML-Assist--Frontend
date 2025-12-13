import { Position } from "@xyflow/react";
import BaseHandle from "../BaseHandle";
import { useState } from "react";
import "../styles/nodeStyles.css";



export default function InitialNode() {
    const [showHandles, setShowHandles] = useState(false);
    
    return (
        <div
            className="node-circle node-circle-sm"
            style={{
                clipPath: 'circle(50.0% at 50% 50%)',
            }}
            onMouseEnter={() => setShowHandles(true)}
            onMouseLeave={() => setShowHandles(false)}
        >
            <BaseHandle id={0} position={Position.Top} showHandle={showHandles} className="handle-inverted !absolute !top-1" />
            <BaseHandle id={1} position={Position.Right} showHandle={showHandles} className="handle-inverted !absolute !right-1" />
            <BaseHandle id={2} position={Position.Bottom} showHandle={showHandles} className="handle-inverted !absolute !bottom-1" />
            <BaseHandle id={3} position={Position.Left} showHandle={showHandles} className="handle-inverted !absolute !left-1" />
        </div>
    )
}