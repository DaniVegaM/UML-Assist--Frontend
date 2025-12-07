import BaseHandle from "../BaseHandle";
import { useCanvas } from "../../../hooks/useCanvas";
import { useCallback, useRef, useState } from "react";
import { useHandle } from "../../../hooks/useHandle";

export default function FinalNode() {
    const { isTryingToConnect } = useCanvas();
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
            className="bg-transparent p-4"
            onMouseEnter={() => setShowHandles(isTryingToConnect)}
            onMouseLeave={() => setShowHandles(false)}
            onMouseMove={(evt) => { magneticHandle(evt) }}
        >
            <div ref={nodeRef} className="relative w-15 h-15 bg-neutral-900 flex flex-col items-center justify-center transition-all duration-150 rounded-full">
                {handles.map((handle, i) => (
                    <BaseHandle key={handle.id} id={handle.id} ref={i == handles.length - 1 ? setHandleRef : undefined} showHandle={i == handles.length - 1 ? showHandles : false} position={handle.position} />
                ))}
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
        </div>
    )
}