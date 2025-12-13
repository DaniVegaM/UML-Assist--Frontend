import BaseHandle from "../BaseHandle";
import { useCanvas } from "../../../hooks/useCanvas";
import { useCallback, useRef, useState } from "react";
import { useHandle } from "../../../hooks/useHandle";
import { useTheme } from "../../../hooks/useTheme";
import "../styles/nodeStyles.css";

export default function FinalFlowNode() {
    const { isTryingToConnect } = useCanvas();
    const { isDarkMode } = useTheme();

    // Manejo de handles
    const [showHandles, setShowHandles] = useState(false);
    const nodeRef = useRef<HTMLDivElement>(null);
    const handleRef = useRef<HTMLDivElement>(null);
    const { handles, magneticHandle } = useHandle({ handleRef, nodeRef, maxHandles: 1 });

    // Callback ref para actualizar handleRef cuando cambie el último handle
    const setHandleRef = useCallback((node: HTMLDivElement | null) => {
        handleRef.current = node;
    }, []);

    return (
        <div
            onMouseEnter={() => setShowHandles(isTryingToConnect)}
            onMouseLeave={() => setShowHandles(false)}
            className="bg-transparent p-4"
            onMouseMove={(evt) => { magneticHandle(evt) }}
        >
            <div ref={nodeRef} className="node-circle-outline node-circle-sm">
                {handles.map((handle, i) => (
                    <BaseHandle key={handle.id} id={handle.id} ref={i == handles.length - 1 ? setHandleRef : undefined} showHandle={i == handles.length - 1 ? showHandles : false} position={handle.position} />
                ))}

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
        </div>
    )
}