import BaseHandle from "../BaseHandle";
import { Position } from "@xyflow/react";
import { useCanvas } from "../../../hooks/useCanvas";
import { useTheme } from "../../../hooks/useTheme";
import "../styles/nodeStyles.css";

export default function FinalNode() {
    const { isTryingToConnect } = useCanvas();
    const { isDarkMode } = useTheme();

    return (
        <div
            className="node-circle node-circle-md"
            style={{
                clipPath: 'circle(50.0% at 50% 50%)'
            }}
        >
            <BaseHandle id={0} position={Position.Top} showHandle={isTryingToConnect} className="handle-inverted !absolute !top-1" />
            <BaseHandle id={1} position={Position.Right} showHandle={isTryingToConnect} className="handle-inverted !absolute !right-1" />
            <BaseHandle id={2} position={Position.Bottom} showHandle={isTryingToConnect} className="handle-inverted !absolute !bottom-1" />
            <BaseHandle id={3} position={Position.Left} showHandle={isTryingToConnect} className="handle-inverted !absolute !left-1" />

            <div
                className={`absolute w-14 h-14 flex items-center justify-center ${isDarkMode ? 'bg-neutral-800' : 'bg-white'}`}
                style={{
                    clipPath: 'circle(50.0% at 50% 50%)',
                    zIndex: 1,
                }}
            ></div>
            <div
                className={`absolute w-10 h-10 ${isDarkMode ? 'bg-neutral-100' : 'bg-neutral-900'}`}
                style={{
                    clipPath: 'circle(50.0% at 50% 50%)',
                    zIndex: 1,
                }}
            ></div>
        </div>
    )
}