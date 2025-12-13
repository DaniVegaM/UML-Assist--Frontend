import { useCallback } from "react";
import { useSequenceDiagram } from "../../../hooks/useSequenceDiagram"; // Ajusta tu import
import type { NodeProps } from "@xyflow/react";

// Recibimos el ID y la posición directamente del nodo
export default function AddLifeLineButton({ id, positionAbsoluteX }: NodeProps) {
    const { nodes, setNodes } = useSequenceDiagram();

    const addNewLifeLine = useCallback(() => {
        // 1. Protección contra NaN: Si positionAbsoluteX falla, buscamos el nodo en el estado
        let currentBtnX = positionAbsoluteX;

        if (typeof currentBtnX !== 'number') {
             const thisNode = nodes.find(n => n.id === id);
             if (thisNode) {
                 currentBtnX = thisNode.position.x;
             } else {
                 return; // No podemos calcular, salimos
             }
        }

        // Definimos el ancho del espacio a crear (GAP)
        const SPACE_TO_ADD = 300; 

        setNodes((prevNodes) => {
            // 2. Identificamos qué nodos están a la derecha del botón para empujarlos
            // (Asumimos que el botón está justo donde queremos insertar)
            
            return prevNodes.map(node => {
                // Si el nodo es una LifeLine y está a la derecha de este botón...
                if (node.type === 'lifeLine' && node.position.x > currentBtnX!) {
                    // ...Lo empujamos a la derecha para hacer hueco
                    return {
                        ...node,
                        position: {
                            ...node.position,
                            x: node.position.x + SPACE_TO_ADD
                        }
                    };
                }
                return node;
            }).concat([
                // 3. Agregamos la nueva LifeLine en la posición del botón (ajustada para centrar)
                {
                    id: `lifeLine_${Date.now()}`,
                    type: 'lifeLine',
                    data: { label: 'Nueva LifeLine' }, // Quité 'order', no es necesario para la posición física
                    // Usamos la X del botón menos un offset para centrar la lifeline
                    position: { x: currentBtnX! - 80, y: 100 }, 
                    connectable: true,
                    zIndex: -1,
                    style: { zIndex: -1 }
                }
            ]);
        });
    }, [id, positionAbsoluteX, nodes, setNodes]);

    return (
        <button 
            onClick={addNewLifeLine} 
            className="nodrag cursor-pointer bg-neutral-500 hover:bg-neutral-600 text-white p-2 rounded-full shadow-md flex items-center justify-center w-8 h-8 transition-transform hover:scale-110"
            title="Agregar línea de vida aquí"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
        </button>
    )
}