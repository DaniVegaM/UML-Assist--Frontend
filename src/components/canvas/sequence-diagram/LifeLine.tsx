import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCanvas } from "../../../hooks/useCanvas";
import { LIFE_LINE_MAX_LEN_TEXT, LIFE_LINE_BASE_HEIGHT, LIFE_LINE_HEIGHT_PER_HANDLE } from "../variables";
import { useSequenceDiagram } from "../../../hooks/useSequenceDiagram";
import { Position, useNodeId, useUpdateNodeInternals } from "@xyflow/react";
import BaseHandle from "../BaseHandle";
import ChangeHandleType from "./contextMenus/ChangeHandleType";
import ContextMenuPortal from "./contextMenus/ContextMenuPortal";
import { useHandle } from "../../../hooks/useHandle";


export default function LifeLine() {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState("");
    const { setIsZoomOnScrollEnabled } = useCanvas();
    const { nodes } = useSequenceDiagram();
    const nodeId = useNodeId();
    const updateNodeInternals = useUpdateNodeInternals();

    // Manejo de handles
    const [showHandles, setShowHandles] = useState(false);
    const nodeRef = useRef<HTMLDivElement>(null);
    const handleRef = useRef<HTMLDivElement>(null);
    const { handles, setHandles, magneticHandle } = useHandle({ handleRef, nodeRef, disableMagneticPoints: true, disableBottom: true, disableTop: true, disableLeft: true, });

    // Callback ref para actualizar handleRef cuando cambie el último handle
    const setHandleRef = useCallback((node: HTMLDivElement | null) => {
        handleRef.current = node;
    }, []);

    const [contextMenuEvent, setContextMenuEvent] = useState<MouseEvent | null>(null);
    const [selectedHandle, setSelectedHandle] = useState<string | null>(null);
    const [selectedHandleIndex, setSelectedHandleIndex] = useState<number | null>(null);
    
    // Estado para el evento de destrucción - guarda el índice del handle que tiene la destrucción
    const [destroyHandleIndex, setDestroyHandleIndex] = useState<number | null>(null);

    const onChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (evt.target.value.length >= LIFE_LINE_MAX_LEN_TEXT) {
            setValue(evt.target.value.trim().slice(0, LIFE_LINE_MAX_LEN_TEXT));
        } else {
            setValue(evt.target.value);
        }
    }, []);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [value]);

    const handleDoubleClick = useCallback(() => {
        if (!isEditing) {
            setIsEditing(true);
            setIsZoomOnScrollEnabled(false);
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.focus();
                    textareaRef.current.select();
                }
            }, 0);
        }
    }, [isEditing, setIsZoomOnScrollEnabled]);

    const handleBlur = useCallback(() => {
        setIsEditing(false);
        setIsZoomOnScrollEnabled(true);
    }, [setIsZoomOnScrollEnabled]);

    useEffect(() => {
        if (nodes.length > 0) {
            const nodeIds = nodes.map(n => n.id);
            updateNodeInternals(nodeIds);
        }
    }, [nodes, updateNodeInternals]);

    const handleContextMenu = (event: React.MouseEvent, handleId: string, handleIndex: number) => {
        event.preventDefault();
        event.stopPropagation();
        setContextMenuEvent(event.nativeEvent);
        setSelectedHandle(handleId);
        setSelectedHandleIndex(handleIndex);
    };

    const closeContextMenu = () => {
        setContextMenuEvent(null);
        setSelectedHandle(null);
        setSelectedHandleIndex(null);
    };

    // Callback para cuando se selecciona el evento de destrucción
    const handleDestroyEvent = useCallback((action: 'destroy' | 'default') => {
        if (action === 'destroy' && selectedHandleIndex !== null) {
            // Guardar el índice del handle con destrucción
            setDestroyHandleIndex(selectedHandleIndex);
            
            // Si el handle con destrucción es el último, crear un nuevo handle para que sea el magnético
            if (selectedHandleIndex === handles.length - 1) {
                setHandles(prev => [...prev, {
                    id: prev.length,
                    position: Position.Right,
                    top: undefined,
                    left: undefined
                }]);
                updateNodeInternals(nodeId || '');
            }
        } else if (action === 'default') {
            // Si el handle seleccionado es el que tiene la destrucción, quitarla
            if (selectedHandleIndex === destroyHandleIndex) {
                setDestroyHandleIndex(null);
            }
        }
    }, [selectedHandleIndex, destroyHandleIndex, handles.length, setHandles, updateNodeInternals, nodeId]);

    // Calcular altura dinámica basada en la cantidad de handles
    const lifeLineHeight = useMemo(() => {
        return LIFE_LINE_BASE_HEIGHT + (handles.length * LIFE_LINE_HEIGHT_PER_HANDLE);
    }, [handles.length]);

    // Calcular la posición Y del handle de destrucción
    const destroyPosition = useMemo(() => {
        if (destroyHandleIndex === null || !handles[destroyHandleIndex]) return null;
        const handle = handles[destroyHandleIndex];
        return handle.top ? (typeof handle.top === 'string' ? parseInt(handle.top) : handle.top) : null;
    }, [destroyHandleIndex, handles]);

    // Verificar si la lifeline está destruida
    const isDestroyed = destroyPosition !== null;

    return (
        <div className="flex flex-col justify-center items-center"> {/*LIFELINE COMPLETA*/}
            <div
                onDoubleClick={handleDoubleClick}
                className="relative border border-neutral-600 dark:border-neutral-900 p-2 hover:bg-gray-200 dark:hover:bg-zinc-600 min-w-[200px] flex flex-col items-center justify-center transition-all duration-150"
            > {/*HEAD DE LA LIFELINE*/}
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={onChange}
                    onBlur={handleBlur}
                    onWheel={(e) => e.stopPropagation()}
                    placeholder={`Rol : Clase`}
                    className={`nodrag w-full placeholder-gray-400 bg-transparent dark:text-white border-none outline-none resize-none text-center text-sm px-2 py-1 overflow-hidden ${isEditing ? 'pointer-events-auto' : 'pointer-events-none'
                        }`}
                    rows={1}
                />
                {isEditing &&
                    <p className="w-full text-[10px] text-right text-neutral-400">{`${value.length}/${LIFE_LINE_MAX_LEN_TEXT}`}</p>
                }
            </div>
            {/*DASHED LINE DE LA LIFELINE*/}
            <div 
                className="bg-transparent px-4 w-6" 
                style={{ height: `${lifeLineHeight}px` }} 
                onMouseMove={(evt) => { magneticHandle(evt) }} 
                onMouseEnter={() => { setShowHandles(true) }} 
                onMouseLeave={() => setShowHandles(false)}
            >
                <div className={`relative w-[1px] h-full`}
                    ref={nodeRef}
                >
                    <div
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-0 border-r-2 border-dashed border-neutral-300 pointer-events-none"
                        style={{ height: isDestroyed ? `${destroyPosition}px` : '100%' }}
                        aria-hidden="true"
                    > {/* Aspecto de dashed line */}
                    </div>
                    
                    {handles.map((handle, i) => {
                        const isLastHandle = i === handles.length - 1;
                        const hasDestruction = i === destroyHandleIndex;
                        
                        return (
                            <BaseHandle 
                                key={handle.id} 
                                id={handle.id} 
                                ref={isLastHandle ? setHandleRef : undefined} 
                                showHandle={isLastHandle ? showHandles : false} 
                                position={handle.position} 
                                className={`!w-3 !h-3 ${hasDestruction ? '!opacity-0' : ''}`}
                                onContextMenu={isLastHandle && !hasDestruction ? (e) => handleContextMenu(e, handle.id.toString(), i) : undefined}
                            />
                        );
                    })}
                    
                    {isDestroyed && destroyHandleIndex !== null && handles[destroyHandleIndex] && (
                        <div 
                            className="absolute left-1/2 -translate-x-1/2 w-6 h-6 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform z-10"
                            style={{ top: `${destroyPosition! - 12}px` }}
                            onContextMenu={(e) => handleContextMenu(e, handles[destroyHandleIndex].id.toString(), destroyHandleIndex)}
                        >
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                strokeWidth="2" 
                                stroke="currentColor" 
                                className="w-6 h-6 text-neutral-600 dark:text-neutral-300"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </div>
                    )}
                </div>
            </div>
            {contextMenuEvent && (
                <ContextMenuPortal event={contextMenuEvent} onClose={closeContextMenu}>
                    <ChangeHandleType
                        id="change-handle-type-menu"
                        onClose={closeContextMenu}
                        handleId={selectedHandle}
                        lifeLineId={nodeId!}
                        onDestroyEvent={handleDestroyEvent}
                    />
                </ContextMenuPortal>
            )}
        </div>
    )
}
