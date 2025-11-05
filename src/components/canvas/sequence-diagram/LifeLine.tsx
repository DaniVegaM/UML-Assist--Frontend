import { useCallback, useEffect, useRef, useState } from "react";
import { useCanvas } from "../../../hooks/useCanvas";
import { LIFE_LINE_MAX_LEN_TEXT } from "../variables";
import { useSequenceDiagram } from "../../../hooks/useSequenceDiagram";
import { useNodeId, type Node } from "@xyflow/react";


export default function LifeLine() {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState("");
    const { setIsZoomOnScrollEnabled } = useCanvas();
    const { setNodes, lastLifeLine, nodesPerLifeLine, setNodesPerLifeLine } = useSequenceDiagram();
    const nodeId = useNodeId()

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

    const addNewLifeLine = () => {
        console.log('Añadiendo nueva línea de vida desde:', nodeId);
        const positionX = 400 + ((parseInt(nodeId?.split('_')[1] || '0') + 1) * 200) + 112 * (parseInt(nodeId?.split('_')[1] || '0') + 1);
        console.log('Posición X nueva línea de vida:', positionX);
        setNodes(prev => [...prev,
        {
            id: `lifeLine_${parseInt(nodeId?.split('_')[1] || '0') + 1}`,
            type: 'lifeLine',
            position: { x: positionX, y: 100 },
            data: {},
        }])
    }

    const lifelineNodeData = nodesPerLifeLine?.find(item => item.lifeLineId === nodeId);
    const lifelineNodes = lifelineNodeData?.nodes || [];

    const handleAddNode = useCallback((index: number) => {
        if (!nodeId || !setNodesPerLifeLine) return;

        const newNode: Node = {
            id: `node_${nodeId}_${Date.now()}`,
            type: 'default',
            data: { label: `Nodo ${index}` },
            position: { x: 0, y: 0 }, //La posición es manejada por el layout
        };

        setNodesPerLifeLine(prev => {
            const newNodesPerLifeLine = (prev || []).map(item => {
                if (item.lifeLineId === nodeId) {
                    const newNodes = [...item.nodes];
                    newNodes.splice(index, 0, newNode);
                    return { ...item, nodes: newNodes };
                }
                return item;
            });

            const lifeLineExists = newNodesPerLifeLine.some(item => item.lifeLineId === nodeId);
            if (!lifeLineExists) {
                newNodesPerLifeLine.push({
                    lifeLineId: nodeId,
                    nodes: [newNode]
                });
            }

            return newNodesPerLifeLine;
        });

    }, [nodeId, setNodesPerLifeLine]);

    return (
        <div className={`${lastLifeLine?.id === nodeId ? 'grid grid-cols-2 gap-28' : ''} nodrag`}>
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
                <div className="relative h-[10000px] w-40 bg-red-300">
                    <div
                        className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-0 border-r-2 border-dashed border-neutral-700 pointer-events-none"
                        aria-hidden="true"
                    >
                    </div>
                    <div className="absolute top-0 left-0 w-full flex flex-col items-center">
                        <button className="bg-purple-500 w-20 h-20" onClick={() => handleAddNode(0)}>Añadir nodo</button>
                        {/* Mapeo de nodos con sus addNodeZone en medio" */}
                        {lifelineNodes.map((node, i) => (
                            <div key={node.id}>
                                <div className="bg-green-500 h-30 w-30">
                                    <h2>Este es un nodo de activation o algo asi</h2>
                                </div>
                                <button className="bg-purple-500 w-20 h-20" onClick={() => handleAddNode(i + 1)}>Añadir nodo</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            { /*SUGERENCIA DE NUEVO LIFELINE*/
                lastLifeLine && lastLifeLine?.id === nodeId ? (
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
