import BaseHandle from "../BaseHandle";
import { useCanvas } from "../../../hooks/useCanvas";
import { useCallback, useRef, useState, useEffect } from "react";
import { useHandle, type HandleData } from "../../../hooks/useHandle";
import { useTheme } from "../../../hooks/useTheme";
import { useNodeId, useReactFlow, type NodeProps } from "@xyflow/react";
import "../styles/nodeStyles.css";

export default function FinalFlowNode({ data }: NodeProps) {
    const nodeId = useNodeId();
    const { setNodes } = useReactFlow();
    const { isTryingToConnect } = useCanvas();
    const { isDarkMode } = useTheme();

    // Manejo de handles
    const [showHandles, setShowHandles] = useState(false);
    const nodeRef = useRef<HTMLDivElement>(null);
    const handleRef = useRef<HTMLDivElement>(null);
    const { handles, magneticHandle } = useHandle({ 
        handleRef, 
        nodeRef, 
        maxHandles: 1,
        initialHandles: data?.handles as HandleData[] | undefined
    });

    // Callback ref para actualizar handleRef cuando cambie el último handle
    const setHandleRef = useCallback((node: HTMLDivElement | null) => {
        handleRef.current = node;
    }, []);

    // Sincronizamos handles con node.data cuando cambien
    useEffect(() => {
        if (!nodeId) return;
        setNodes(nodes => nodes.map(n => 
            n.id === nodeId 
                ? { ...n, data: { ...n.data, handles } }
                : n
        ));
    }, [handles, nodeId, setNodes]);

    return (
        <div
            onMouseEnter={() => setShowHandles(isTryingToConnect)}
            onMouseLeave={() => setShowHandles(false)}
            className="bg-transparent p-4"
            onMouseMove={(evt) => { magneticHandle(evt) }}
        >
            <div ref={nodeRef} className="node-circle-outline node-circle-sm">
                {handles.map((handle, i) => (
                    <BaseHandle key={handle.id} id={handle.id} ref={i == handles.length - 1 ? setHandleRef : undefined} showHandle={i == handles.length - 1 ? showHandles : false} position={handle.position} left={handle.left} top={handle.top} />
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