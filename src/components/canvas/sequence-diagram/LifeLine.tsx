import { useCallback, useEffect, useRef, useState } from "react";
import { useCanvas } from "../../../hooks/useCanvas";
import { LIFE_LINE_MAX_LEN_TEXT } from "../variables";
import { useSequenceDiagram } from "../../../hooks/useSequenceDiagram";
import { useNodeId, useUpdateNodeInternals } from "@xyflow/react";
import BaseHandle from "../BaseHandle";
import ChangeHandleType from "./contextMenus/ChangeHandleType";
import ContextMenuPortal from "./contextMenus/ContextMenuPortal";
import { useHandle } from "../../../hooks/useHandle";


export default function LifeLine() {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    // const handlesContainerRef = useRef<HTMLDivElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState("");
    const { setIsZoomOnScrollEnabled, generateUniqueId } = useCanvas();
    const { nodes, setNodes } = useSequenceDiagram();
    const nodeId = useNodeId();
    const updateNodeInternals = useUpdateNodeInternals();

    // Manejo de handles
    const [showHandles, setShowHandles] = useState(false);
    const nodeRef = useRef<HTMLDivElement>(null);
    const handleRef = useRef<HTMLDivElement>(null);
    const { handles, magneticHandle } = useHandle({ handleRef, nodeRef, disableMagneticPoints: true, disableBottom: true, disableTop: true, disableLeft: true, });

    // Callback ref para actualizar handleRef cuando cambie el último handle
    const setHandleRef = useCallback((node: HTMLDivElement | null) => {
        handleRef.current = node;
    }, []);

    const [contextMenuEvent, setContextMenuEvent] = useState<MouseEvent | null>(null);
    const [selectedHandle, setSelectedHandle] = useState<string | null>(null);
    // const [containerHeight, setContainerHeight] = useState(0);

    //Verificamos si este es el último lifeLine para mostrar el botón de agregar otro lifeLine
    // const isLastLifeLine = useMemo(() => {
    //     //Buscamos si el id incluye lifeline sino vamos retrocediendo hasta encontrar un lifeline
    //     const lifeLineNodes = nodes.filter(n => n.type === 'lifeLine');
    //     if (lifeLineNodes.length === 0) return false;
    //     return lifeLineNodes[lifeLineNodes.length - 1].id === nodeId;
    // }, [nodes, nodeId]);

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

    // useEffect(() => { //Medimos la altura real del contenedor de handles dinámicamente
    //     if (handlesContainerRef.current) {
    //         const height = handlesContainerRef.current.scrollHeight;
    //         setContainerHeight(height);
    //     }
    // }, [nodes, nodeId]);

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

    //Función para agregar una nueva LifeLine
    // const addNewLifeLine = useCallback(() => {
    //     const currentIndex = parseInt(nodeId?.split('_')[1] || '0');
    //     const positionX = 400 + ((currentIndex + 1) * 200) + 112 * (currentIndex + 1);

    //     const newLifeLineId = `lifeLine_${currentIndex + 1}`;

    //     setNodes(prev => {

    //         //Le colocamos a la nueva lifeLine la misma cantidad de handles que la primera lifeLine
    //         //De modo que sea todo el layout como una tabla uniforme
    //         const totalHandlesPerLifeLine = prev[0].data.orderedHandles?.length || 0;

    //         const orderedHandles: { id: string, order: number }[] = [];
    //         for (let i = 0; i < totalHandlesPerLifeLine; i++) {
    //             orderedHandles.push({
    //                 id: `defaultHandle_${generateUniqueId()}_belongsTo_${newLifeLineId}`,
    //                 order: i
    //             });
    //         }

    //         return [...prev, {
    //             id: newLifeLineId,
    //             type: 'lifeLine',
    //             position: { x: positionX, y: 100 },
    //             data: {
    //                 orderedHandles: orderedHandles
    //             },
    //             connectable: true,
    //             zIndex: -1,
    //             style: {
    //                 zIndex: -1
    //             }
    //         }]
    //     });
    // }, [nodeId, setNodes]);

    useEffect(() => {
        if (nodes.length > 0) {
            const nodeIds = nodes.map(n => n.id);
            updateNodeInternals(nodeIds);
        }
    }, [nodes, updateNodeInternals]);

    const closeContextMenu = () => {
        setContextMenuEvent(null);
        setSelectedHandle(null);
    };

    // const dashedLineHeight = useMemo(() => {
    //     if (containerHeight > 0) {
    //         return containerHeight;
    //     }
    //     return 10000;
    // }, [containerHeight]);

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
            <div className="bg-transparent px-4 w-6" style={{ height: `${1000}px` }} onMouseMove={(evt) => { magneticHandle(evt) }} onMouseEnter={() => setShowHandles(true)} onMouseLeave={() => setShowHandles(false)}>
                <div className={`relative w-[1px] h-full`}
                    ref={nodeRef}
                >
                    <div
                        className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-0 border-r-2 border-dashed border-neutral-300 pointer-events-none"
                        aria-hidden="true"
                    > {/* Aspecto de dashed line */}
                    </div>
                    {handles.map((handle, i) => (
                        <BaseHandle key={handle.id} id={handle.id} ref={i == handles.length - 1 ? setHandleRef : undefined} showHandle={i == handles.length - 1 ? showHandles : false} position={handle.position} className="!w-3 !h-3"/>
                    ))}
                </div>
            </div>
            {contextMenuEvent && (
                <ContextMenuPortal event={contextMenuEvent} onClose={closeContextMenu}>
                    <ChangeHandleType
                        id="change-handle-type-menu"
                        onClose={closeContextMenu}
                        handleId={selectedHandle}
                        lifeLineId={nodeId!}
                    />
                </ContextMenuPortal>
            )}
        </div>
    )
}
