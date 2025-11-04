import BaseHandle from "../BaseHandle";
import { Position } from "@xyflow/react";
import { useCanvas } from "../../../hooks/useCanvas";

export default function FinalNode() {
    const { isTryingToConnect } = useCanvas();

    return (
        <div
            className="relative w-15 h-15 bg-neutral-900 flex flex-col items-center justify-center transition-all duration-150"
            style={{
                clipPath: 'circle(50.0% at 50% 50%)'
            }}
        >
            <BaseHandle id={0} position={Position.Top} showHandle={isTryingToConnect} className="!bg-black !dark:pink !absolute !top-1" />
            <BaseHandle id={1} position={Position.Right} showHandle={isTryingToConnect} className="!bg-black !dark:pink !absolute !right-1" />
            <BaseHandle id={2} position={Position.Bottom} showHandle={isTryingToConnect} className="!bg-black !dark:pink !absolute !bottom-1" />
            <BaseHandle id={3} position={Position.Left} showHandle={isTryingToConnect} className="!bg-black !dark:pink !absolute !left-1" />

            <div
                className="absolute w-14 h-14 bg-white flex flex-col items-center justify-center transition-all duration-150"
                style={{
                    clipPath: 'circle(50.0% at 50% 50%)',
                    zIndex: 1,
                }}
            ></div>
            <div
                className="absolute w-10 h-10 bg-neutral-900 flex flex-col items-center justify-center transition-all duration-150"
                style={{
                    clipPath: 'circle(50.0% at 50% 50%)',
                    zIndex: 1,
                }}
            ></div>
        </div>
    )
}