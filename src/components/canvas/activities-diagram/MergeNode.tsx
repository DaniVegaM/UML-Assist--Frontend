import { useState } from "react";
import BaseHandle from "../BaseHandle";
import { useCanvas } from "../../../hooks/useCanvas";
import { Position } from "@xyflow/react";


export default function MergeNodel() {
    const [showHandles, setShowHandles] = useState(false);
    const {isTryingToConnect} = useCanvas();

    return (
        <div
            className="p-2 bg-gray-300 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-zinc-600 min-w-[50px] min-h-[50px] flex flex-col items-center justify-center transition-all duration-150"
            style={{
                clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            }}
            onMouseEnter={() => setShowHandles(true)}
            onMouseLeave={() => setShowHandles(false)}
        >
            <BaseHandle id={0} position={Position.Top} showHandle={showHandles && isTryingToConnect} className="!absolute !top-1"/>
            <BaseHandle id={3} position={Position.Left} showHandle={showHandles && isTryingToConnect} className="!absolute !left-1"/>
            <BaseHandle id={1} position={Position.Right} showHandle={showHandles} className="!absolute !right-1"/>
            <BaseHandle id={2} position={Position.Bottom} showHandle={showHandles} className="!absolute !bottom-1"/>
        </div >
    )
}
