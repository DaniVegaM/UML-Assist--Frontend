import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCanvas } from "../../../hooks/useCanvas";
import { LIFE_LINE_MAX_LEN_TEXT } from "../variables";
import { useSequenceDiagram } from "../../../hooks/useSequenceDiagram";
import { Position, useNodeId, useUpdateNodeInternals } from "@xyflow/react";
import BaseHandle from "../BaseHandle";
import ChangeHandleType from "./contextMenus/ChangeHandleType";
import ContextMenuPortal from "./contextMenus/ContextMenuPortal";


export default function LifeLine() {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const handlesContainerRef = useRef<HTMLDivElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState("");
    const { setIsZoomOnScrollEnabled, generateUniqueId } = useCanvas();
    const { nodes, setNodes } = useSequenceDiagram();
    const nodeId = useNodeId();
    const [showHandles, setShowHandles] = useState(false);
    const updateNodeInternals = useUpdateNodeInternals();

    const [contextMenuEvent, setContextMenuEvent] = useState<MouseEvent | null>(null);
    const [selectedHandle, setSelectedHandle] = useState<string | null>(null);
    const [containerHeight, setContainerHeight] = useState(0);

    //Verificamos si este es el último lifeLine para mostrar el botón de agregar otro lifeLine
    const isLastLifeLine = useMemo(() => {
        return nodes[nodes.length - 1]?.id === nodeId;
    }, [nodes, nodeId]);

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

    useEffect(() => { //Medimos la altura real del contenedor de handles dinámicamente
        if (handlesContainerRef.current) {
            const height = handlesContainerRef.current.scrollHeight;
            setContainerHeight(height);
        }
    }, [nodes, nodeId]);

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
    const addNewLifeLine = useCallback(() => {
        const currentIndex = parseInt(nodeId?.split('_')[1] || '0');
        const positionX = 400 + ((currentIndex + 1) * 200) + 112 * (currentIndex + 1);

        const newLifeLineId = `lifeLine_${currentIndex + 1}`;

        setNodes(prev => {

            //Le colocamos a la nueva lifeLine la misma cantidad de handles que la primera lifeLine
            //De modo que sea todo el layout como una tabla uniforme
            const totalHandlesPerLifeLine = prev[0].data.orderedHandles?.length || 0;

            const orderedHandles: { id: string, order: number }[] = [];
            for (let i = 0; i < totalHandlesPerLifeLine; i++) {
                orderedHandles.push({
                    id: `defaultHandle_${generateUniqueId()}_belongsTo_${newLifeLineId}`,
                    order: i
                });
            }

            return [...prev, {
                id: newLifeLineId,
                type: 'lifeLine',
                position: { x: positionX, y: 100 },
                data: {
                    orderedHandles: orderedHandles
                },
                connectable: true,
                zIndex: -1,
                style: {
                    zIndex: -1
                }
            }]
        });
    }, [nodeId, setNodes]);

    const addHandle = useCallback((order: number, handleType: string = 'defaultHandle') => {
        setNodes(nodes => {

            return nodes.map(node => {

                const newHandle = {
                    id: `${handleType}_${generateUniqueId()}_belongsTo_${node.id}`,
                    order: order,
                };

                const currentHandles = node.data.orderedHandles || [];

                //Si el ultimo handle de este node es de tipo destroy evito que se agreguen más handles despues del destroy
                const lastHandle = currentHandles[currentHandles.length - 1];
                if (lastHandle && lastHandle.id.includes('destroyHandle') && order > lastHandle.order) {
                    return node;
                }

                const updatedHandles = [...currentHandles];
                updatedHandles.splice(order, 0, newHandle);

                //Actualizamos el orden de los handles
                const reorderedHandles = updatedHandles.map((handle, index) => ({
                    ...handle,
                    order: index
                }));

                return {
                    ...node,
                    data: {
                        ...node.data,
                        orderedHandles: reorderedHandles
                    }
                };
            })
        });
    }, [nodeId, setNodes, updateNodeInternals, generateUniqueId]);

    useEffect(() => {
        if (nodes.length > 0) {
            const nodeIds = nodes.map(n => n.id);
            updateNodeInternals(nodeIds);
        }
    }, [nodes, updateNodeInternals]);

    const handleContextMenu = (event: React.MouseEvent, handleId: string) => {
        event.preventDefault();
        event.stopPropagation();
        setContextMenuEvent(event.nativeEvent);
        setSelectedHandle(handleId);
    };

    const closeContextMenu = () => {
        setContextMenuEvent(null);
        setSelectedHandle(null);
    };

    const dashedLineHeight = useMemo(() => {
        if (containerHeight > 0) {
            return containerHeight;
        }
        return 10000;
    }, [containerHeight]);

    return (
        <div className={`${isLastLifeLine ? 'grid grid-cols-2 gap-28' : ''} nodrag`}>
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
                <div className={`relative w-20`} style={{ height: `${dashedLineHeight}px` }}
                    onMouseEnter={() => setShowHandles(true)}
                    onMouseLeave={() => setShowHandles(false)}
                >
                    <div
                        className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-0 border-r-2 border-dashed border-neutral-300 pointer-events-none"
                        aria-hidden="true"
                    > {/* Aspecto de dashed line */}
                    </div>
                    <div ref={handlesContainerRef} className="absolute top-0 left-0 w-full flex flex-col items-center justify-center">
                        <button
                            className={`mt-10 bg-neutral-300 hover:bg-neutral-400 dark:bg-neutral-600 dark:hover:bg-neutral-500 transition-all duration-300 w-10 h-10 flex items-center justify-center rounded-full cursor-pointer ${showHandles ? 'opacity-100' : 'opacity-0'}`}
                            onClick={() => addHandle(0)}
                        > {/* Botón para agregar el primer nodo */}
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </button>

                        {/* Renderizar los handles que pertenecen a esta lifeLine */}
                        {nodes.find(node => node.id == nodeId) ? nodes.find(node => node.id == nodeId)!.data.orderedHandles?.map((handle, index) => (
                            <div key={handle.id} className="flex flex-col justify-center items-center space-y-10">
                                <div className="relative w-8 h-8 flex justify-center items-center"
                                    onContextMenu={handle.order == nodes.find(node => node.id == nodeId)!.data.orderedHandles!.length - 1 ? (e: React.MouseEvent<Element, MouseEvent>) => handleContextMenu(e, handle.id) : undefined}>
                                    {handle.id.includes('defaultHandle') ? (
                                        <BaseHandle id={handle.id} position={Position.Bottom} className="!absolute !w-4 !h-4 !top-1/2 !left-1/2 !bg-neutral-200" showHandle={true} />
                                    ) : (
                                        <div className="cursor-pointer rounded-full w-12 h-12 absolute top-1/2 -left-1/4">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="black" className="w-full h-full">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                {/* Botón para agregar otro handle después de este */}
                                {handle.id.includes('defaultHandle') ? (
                                    <button
                                        className={`bg-neutral-300 hover:bg-neutral-400 dark:bg-neutral-600 dark:hover:bg-neutral-500 transition-all duration-300 w-10 h-10 flex items-center justify-center rounded-full cursor-pointer ${showHandles ? 'opacity-100' : 'opacity-0'}`}
                                        onClick={() => addHandle(index + 1)}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                        </svg>
                                    </button>
                                ) : null}
                            </div>
                        )) : null}
                    </div>
                </div>
            </div>
            { /*SUGERENCIA DE NUEVO LIFELINE*/
                isLastLifeLine ? (
                    <div className="flex flex-col justify-start items-center">
                        <div className="mb-2 border border-neutral-600 border-dashed dark:border-neutral-900 p-2 min-w-[200px]">
                            <p className="text-neutral-400 font-bold text-center">Nueva linea de vida</p>
                        </div>
                        <button onClick={addNewLifeLine} className="cursor-pointer w-8 h-8 rounded-full border-neutral-400 border-2 flex items-center justify-center hover:bg-neutral-400 hover:text-white transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="oklch(70.8% 0 0)" className="w-full h-full hover:stroke-white">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </button>
                    </div>
                ) : null
            }
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
