import { Position } from "@xyflow/react";
import BaseHandle from "../BaseHandle";
import { useCanvas } from "../../../hooks/useCanvas";
import { useTheme } from "../../../hooks/useTheme";
import "../styles/nodeStyles.css";

export default function FinalFlowNode() {
    const {isTryingToConnect} = useCanvas();
    const { isDarkMode } = useTheme();
    
    return (
        <div
            className="node-circle-outline node-circle-sm"
        >

            <BaseHandle id={0} position={Position.Top} showHandle={isTryingToConnect} className="handle-inverted !absolute !top-1" />
            <BaseHandle id={1} position={Position.Right} showHandle={isTryingToConnect} className="handle-inverted !absolute !right-1" />
            <BaseHandle id={2} position={Position.Bottom} showHandle={isTryingToConnect} className="handle-inverted !absolute !bottom-1" />
            <BaseHandle id={3} position={Position.Left} showHandle={isTryingToConnect} className="handle-inverted !absolute !left-1" />
            
            <div
                className={`absolute inset-0 border-4 bg-transparent z-0 rounded-full ${isDarkMode ? 'border-neutral-100' : 'border-neutral-900'}`}
                style={{
                    clipPath: 'circle(50% at 50% 50%)',
                }}
            />

            <div className="absolute inset-0 flex items-center justify-center z-0">
                <div className="relative w-[45px] h-[45px]">
                    <div
                        className={`absolute ${isDarkMode ? 'bg-neutral-100' : 'bg-neutral-900'}`}
                        style={{
                            width: '2px',
                            height: '100%',
                            left: '50%',
                            top: '0',
                            transform: 'translateX(-50%) rotate(45deg)',
                            transformOrigin: 'center'
                        }}
                    />
                    <div
                        className={`absolute ${isDarkMode ? 'bg-neutral-100' : 'bg-neutral-900'}`}
                        style={{
                            width: '2px',
                            height: '100%',
                            left: '50%',
                            top: '0',
                            transform: 'translateX(-50%) rotate(-45deg)',
                            transformOrigin: 'center'
                        }}
                    />
                </div>
            </div>
        </div>
    )
}