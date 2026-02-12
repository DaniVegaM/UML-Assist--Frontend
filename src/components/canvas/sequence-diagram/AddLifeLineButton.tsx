import { useCallback } from "react";
import { useSequenceDiagram } from "../../../hooks/useSequenceDiagram"; // Ajusta tu import
import type { NodeProps } from "@xyflow/react";
import { createPrefixedNodeId } from "../../../utils/idGenerator";

// Recibimos el ID y la posición directamente del nodo
export default function AddLifeLineButton({ id, positionAbsoluteX, data }: NodeProps) {
    const { nodes, setNodes } = useSequenceDiagram();
    const isHiding = data?.isHiding as boolean || false;

    const addNewLifeLine = useCallback(() => {
        //Si positionAbsoluteX falla, buscamos el nodo en el estado
        let currentBtnX = positionAbsoluteX;

        if (typeof currentBtnX !== 'number') {
             const thisNode = nodes.find(n => n.id === id);
             if (thisNode) {
                 currentBtnX = thisNode.position.x;
             } else {
                 return; // No podemos calcular, salimos
             }
        }

        const LIFELINE_WIDTH = 200; //Ancho de cada LifeLine
        const SPACING = 100; //Espacio entre LifeLines
        const TOTAL_SPACE = LIFELINE_WIDTH + SPACING; //Total

        setNodes((prevNodes) => {
            // Obtenemos las LifeLines ordenadas por posición X
            const lifeLines = prevNodes
                .filter(n => n.type === 'lifeLine' && n.position.y === 100)
                .sort((a, b) => a.position.x - b.position.x);
            // Encontramos la LifeLine más a la izquierda que está a la derecha del botón
            const lifeLinesOnRight = lifeLines.filter(ll => ll.position.x > currentBtnX!);
            // Encontramos la LifeLine más a la derecha que está a la izquierda del botón
            const lifeLinesOnLeft = lifeLines.filter(ll => ll.position.x + LIFELINE_WIDTH < currentBtnX!);

            let newLifeLineX: number;

            if (lifeLinesOnLeft.length === 0 && lifeLinesOnRight.length > 0) {
                // Botón a la izquierda de todos: nueva LifeLine toma la posición de la primera
                // y la primera se empuja a la derecha
                newLifeLineX = lifeLinesOnRight[0].position.x;
            } else if (lifeLinesOnRight.length === 0 && lifeLinesOnLeft.length > 0) {
                // Botón a la derecha de todos: nueva LifeLine va después de la última
                const lastLL = lifeLinesOnLeft[lifeLinesOnLeft.length - 1];
                newLifeLineX = lastLL.position.x + LIFELINE_WIDTH + SPACING;
            } else if (lifeLinesOnLeft.length > 0 && lifeLinesOnRight.length > 0) {
                // Botón entre LifeLines: nueva LifeLine toma la posición de la siguiente
                // y las de la derecha se empujan
                newLifeLineX = lifeLinesOnRight[0].position.x;
            } else {
                // No hay LifeLines: posición inicial
                newLifeLineX = 400;
            }

            // Empujamos las LifeLines que están a la derecha del botón
            const updatedNodes = prevNodes.map(node => {
                if (node.type === 'lifeLine' && node.position.y === 100 && node.position.x > currentBtnX!) {
                    return {
                        ...node,
                        position: {
                            ...node.position,
                            x: node.position.x + TOTAL_SPACE
                        }
                    };
                }
                return node;
            });

            // Agregamos la nueva LifeLine
            return updatedNodes.concat([{
                id: createPrefixedNodeId("lifeLine"),
                type: 'lifeLine',
                data: { label: "" },
                position: { x: newLifeLineX, y: 100 },
                connectable: true,
                zIndex: -1,
                style: { zIndex: -1 }
            }]);
        });
    }, [id, positionAbsoluteX, nodes, setNodes]);

    return (
        <button 
            onClick={addNewLifeLine} 
            className="nodrag cursor-pointer bg-neutral-500 hover:bg-neutral-600 text-white p-2 rounded-full shadow-md flex items-center justify-center w-8 h-8 transition-all duration-300 ease-in-out hover:scale-110"
            title="Agregar línea de vida aquí"
            style={{
                animation: isHiding ? 'fadeOut 0.3s ease-in-out forwards' : 'fadeIn 0.3s ease-in-out'
            }}
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
        </button>
    )
}