import { Position } from "@xyflow/react";
import BaseHandle from "../BaseHandle";
import { useState } from "react";



export default function InitialNode() {
    const [showHandles, setShowHandles] = useState(false);
    
    return (
        <div
            className="relative w-12 h-12 bg-neutral-900 flex flex-col items-center justify-center transition-all duration-150"
            style={{
                clipPath: 'circle(50.0% at 50% 50%)',
            }}
            onMouseEnter={() => setShowHandles(true)}
            onMouseLeave={() => setShowHandles(false)}
        >
            <BaseHandle id={0} position={Position.Top} showHandle={showHandles} className="!absolute !top-1" />
            <BaseHandle id={1} position={Position.Right} showHandle={showHandles} className="!absolute !right-1" />
            <BaseHandle id={2} position={Position.Bottom} showHandle={showHandles} className="!absolute !bottom-1" />
            <BaseHandle id={3} position={Position.Left} showHandle={showHandles} className="!absolute !left-1" />
        </div>
    )
}