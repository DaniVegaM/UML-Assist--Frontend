import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCanvas } from "../../../hooks/useCanvas";
import { LIFE_LINE_MAX_LEN_TEXT } from "../variables";
import { useSequenceDiagram } from "../../../hooks/useSequenceDiagram";
import { useNodeId } from "@xyflow/react";
import { Description, Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import ExecutionSpecification from "./ExecutionSpecification";
import SelfMessage from "./SelfMessage";
import DestructionEvent from "./DestructionEvent";


export default function LifeLine() {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState("");
    const { setIsZoomOnScrollEnabled, generateUniqueId } = useCanvas();
    const { nodes, setNodes } = useSequenceDiagram();
    const [openChooseNodeTypeModal, setOpenChooseNodeTypeModal] = useState<{open:boolean, nodeIndex:number}>({open:false, nodeIndex:0});
    const nodeId = useNodeId();

    //Filtramos solo los nodos que pertenecen a este lifeLine
    const myNodes = useMemo(() => {
        return nodes.filter(node => node.id.includes(`belongsTo_${nodeId}`));
    }, [nodes, nodeId]);

    const allLifeLines = useMemo(() => {
        return nodes.filter(node => node.type === 'lifeLine').sort((a, b) => {
            const aIndex = parseInt(a.id.split('_')[1] || '0');
            const bIndex = parseInt(b.id.split('_')[1] || '0');
            return aIndex - bIndex;
        });
    }, [nodes]);

    //Verificamos si este es el último lifeLine para mostrar el botón de agregar otro lifeLine
    const isLastLifeLine = useMemo(() => {
        return allLifeLines[allLifeLines.length - 1]?.id === nodeId;
    }, [allLifeLines, nodeId]);

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

    //Función para agregar una nueva LifeLine
    const addNewLifeLine = useCallback(() => {
        const currentIndex = parseInt(nodeId?.split('_')[1] || '0');
        const positionX = 400 + ((currentIndex + 1) * 200) + 112 * (currentIndex + 1);
        
        setNodes(prev => [...prev, {
            id: `lifeLine_${currentIndex + 1}`,
            type: 'lifeLine',
            position: { x: positionX, y: 100 },
            data: {},
        }]);
    }, [nodeId, setNodes]);

    const handleAddNode = useCallback((nodeType: string) => {
        if (!nodeId) return;
        
        const newNode = {
            id: `${nodeType}_${generateUniqueId()}_belongsTo_${nodeId}`,
            type: nodeType,
            data: { 
                label: `${nodeType}`,
                nodeType: nodeType,
                lifeLineId: nodeId,
                order: openChooseNodeTypeModal.nodeIndex //Indicamos el índice donde se quiere insertar
            },
            position: { x: 0, y: 0 }, //La posicion es irrelevante, porque cada nodo se renderiza dentro del LifeLine
            hidden: true, //Ocultamos el nodo del canvas de ReactFlow porque lo renderizamos manualmente dentro del LifeLine
        };

        setNodes(prev => {
            //Obtenemos los nodos que no pertenecen a esta lifeLine
            const otherNodes = prev.filter(node => !node.id.includes(`belongsTo_${nodeId}`));
            
            //Colocamos el nuevo nodo en la posición correcta dentro de los nodos de esta lifeLine
            const updatedMyNodes = [...myNodes];
            updatedMyNodes.splice(openChooseNodeTypeModal.nodeIndex, 0, newNode);
            
            //Actualizamos el indice (order) de todos los nodos de esta lifeLine
            const reorderedMyNodes = updatedMyNodes.map((node, index) => ({
                ...node,
                data: { ...node.data, order: index }
            }));
            
            //Juntamos los nodos que no pertenecen a esta lifeLine con los nodos actualizados de esta lifeLine
            const updated = [...otherNodes, ...reorderedMyNodes];
            return updated;
        });
        setOpenChooseNodeTypeModal({open: false, nodeIndex: 0});
    }, [nodeId, myNodes, openChooseNodeTypeModal.nodeIndex, setNodes]);

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
                <div className="relative h-[10000px] w-40">
                    <div
                        className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-0 border-r-2 border-dashed border-neutral-300 pointer-events-none"
                        aria-hidden="true"
                    > {/* Aspecto de dashed line */}
                    </div>
                    <div className="absolute top-0 left-0 w-full flex flex-col items-center justify-center space-y-10">
                        <button 
                            className="mt-10 bg-neutral-300 hover:bg-neutral-400 dark:bg-neutral-600 dark:hover:bg-neutral-500 transition-all duration-300 w-10 h-10 flex items-center justify-center rounded-full cursor-pointer" 
                            onClick={() => setOpenChooseNodeTypeModal({open:true, nodeIndex:0})}
                        > {/* Botón para agregar el primer nodo */}
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </button>
                        
                        {/* Renderizar los nodos que pertenecen a esta lifeLine */}
                        {myNodes.map((node, index) => (
                            <div key={node.id} className="flex flex-col justify-center items-center space-y-10">
                                {/* Renderizar el nodo según su tipo */}
                                {node.type === 'executionSpecification' && (<ExecutionSpecification nodeId={node.id}/>)}
                                {node.type === 'selfMessage' && (<SelfMessage nodeId={node.id}/>)}
                                {node.type === 'destructionEvent' && (<DestructionEvent nodeId={node.id}/>)}
                                
                                {/* Botón para agregar otro nodo después de este */}
                                <button 
                                    className="bg-neutral-300 hover:bg-neutral-400 dark:bg-neutral-600 dark:hover:bg-neutral-500 transition-all duration-300 w-10 h-10 flex items-center justify-center rounded-full cursor-pointer" 
                                    onClick={() => setOpenChooseNodeTypeModal({open:true, nodeIndex: index + 1})}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                        <Dialog open={openChooseNodeTypeModal.open} onClose={() => setOpenChooseNodeTypeModal(prev => ({...prev, open: false}))} className="relative z-50">
                            <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
                                <DialogPanel className="max-w-2xl space-y-4 border border-sky-600 rounded-xl bg-neutral-50 dark:bg-neutral-800 dark:text-white p-12">
                                    <DialogTitle className="font-black text-sky-600 uppercase">¿Qué nodo deseas agregar?</DialogTitle>
                                    <Description>Selecciona el tipo de nodo que quieres colocar sobre la Línea de Vida</Description>
                                    <div className="flex flex-col gap-3">
                                        <button
                                            onClick={() => handleAddNode('executionSpecification')}
                                            className="cursor-pointer w-full p-4 border border-sky-600 rounded-md text-left hover:bg-gray-100 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <div className="flex justify-start items-center gap-5">
                                                <svg className="dark:fill-white dark:stroke-white" width="20" height="52" viewBox="0 0 20 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <rect x="1.5" y="1.5" width="17" height="49" fill="white" stroke="black" strokeWidth="3" />
                                                </svg>
                                                <div className="flex flex-col">
                                                    <p className="font-semibold">Especificación de Ejecución</p>
                                                    <p className="text-sm text-gray-600">Muestra un período de tiempo en que el objeto está activo.</p>
                                                </div>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => handleAddNode('selfMessage')}
                                            className="cursor-pointer w-full p-4 border border-sky-600 rounded-md text-left hover:bg-gray-100 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <div className="flex justify-start items-center gap-5">
                                                <svg className="dark:fill-white dark:stroke-white" width="58" height="52" viewBox="0 0 58 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <rect x="1.5" y="1.5" width="17" height="49" fill="white" stroke="black" strokeWidth="3" />
                                                    <rect x="17" y="12" width="6" height="17" fill="white" stroke="black" strokeWidth="2" />
                                                    <line x1="24" y1="14" x2="58" y2="14" stroke="black" strokeWidth="2" />
                                                    <path d="M24.2929 25.2929C23.9024 25.6834 23.9024 26.3166 24.2929 26.7071L30.6569 33.0711C31.0474 33.4616 31.6805 33.4616 32.0711 33.0711C32.4616 32.6805 32.4616 32.0474 32.0711 31.6569L26.4142 26L32.0711 20.3431C32.4616 19.9526 32.4616 19.3195 32.0711 18.9289C31.6805 18.5384 31.0474 18.5384 30.6569 18.9289L24.2929 25.2929ZM58 26V25L25 25V26V27L58 27V26Z" fill="black" />
                                                    <line x1="57" y1="26" x2="57" y2="14" stroke="black" strokeWidth="2" />
                                                </svg>
                                                <div className="flex flex-col">
                                                    <p className="font-semibold">Mensaje a sí mismo</p>
                                                    <p className="text-sm text-gray-600">Es cuando un objeto se envía un mensaje a sí mismo, para mostrar el comportamiento que se está ejecutando internamente.</p>
                                                </div>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => handleAddNode('destructionEvent')}
                                            className="cursor-pointer w-full p-4 border border-sky-600 rounded-md text-left hover:bg-gray-100 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <div className="flex justify-start items-center gap-5">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                                </svg>
                                                <div className="flex flex-col">
                                                    <p className="font-semibold">Evento de Destrucción</p>
                                                    <p className="text-sm text-gray-600">Indica el fin de la vida del objeto.</p>
                                                </div>
                                            </div>
                                        </button>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            onClick={() => setOpenChooseNodeTypeModal(prev => ({...prev, open: false}))}
                                            className="cursor-pointer px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-md border border-sky-600 hover:bg-gray-100"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </DialogPanel>
                            </div>
                        </Dialog>
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
        </div>
    )
}
