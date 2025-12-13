import { useCallback, useEffect, useMemo } from "react";
import { useSequenceDiagram } from "./useSequenceDiagram";

export function useAddLifeLinesBtns() {
    const { nodes, setNodes } = useSequenceDiagram();

    const showAddLLBtns = useCallback(() => {
        setNodes(prevNodes => {
            //Obtenemos las LifeLines principales (las que están en y=100)
            const topLifeLines = prevNodes.filter(node => node.type === 'lifeLine' && node.position.y === 100).sort((a, b) => a.position.x - b.position.x);
            
            const LIFELINE_WIDTH = 200; //Ancho de cada LifeLine
            const SPACING = 100; //Espacio entre LifeLines
            const BTN_WIDTH = 32; //Ancho del botón

            //Calculamos las posiciones X para los botones de agregar LifeLine
            const addLLBtnPositionsX: { x: number, y: number }[] = [];

            if (topLifeLines.length === 0) {
                //Si no hay LifeLines, colocamos un primer boton en la posición inicial
                addLLBtnPositionsX.push({ x: 400, y: 100 });
            } else {
                //Botón antes de la primera LifeLine (a la izquierda)
                //Centrado visualmente: centro del botón a SPACING/2 del borde del LifeLine
                addLLBtnPositionsX.push({ x: topLifeLines[0].position.x - (SPACING / 2) - (BTN_WIDTH / 2), y: 100 });

                //Botones entre cada par de LifeLines consecutivas
                for (let i = 0; i < topLifeLines.length - 1; i++) {
                    // Fin de la primera LifeLine
                    const endOfFirstLL = topLifeLines[i].position.x + LIFELINE_WIDTH;
                    // Inicio de la segunda LifeLine
                    const startOfSecondLL = topLifeLines[i + 1].position.x;
                    // Punto medio del espacio entre ellas, ajustado para centrar el botón
                    const midX = ((endOfFirstLL + startOfSecondLL) / 2) - (BTN_WIDTH / 2);
                    addLLBtnPositionsX.push({ x: midX, y: 100 });
                }

                //Botón después de la última LifeLine (a la derecha)
                //Centrado visualmente: centro del botón a SPACING/2 del borde del LifeLine
                const lastLLEnd = topLifeLines[topLifeLines.length - 1].position.x + LIFELINE_WIDTH;
                addLLBtnPositionsX.push({ x: lastLLEnd + (SPACING / 2) - (BTN_WIDTH / 2), y: 100 });
            }

            //Filtramos los nodos que no son botones de agregar LifeLine
            const nonAddLLBtnNodes = prevNodes.filter(node => node.type !== 'addLifeLineBtn');
            //Creamos los nuevos nodos de botones de agregar LifeLine
            const addLLBtnNodes = addLLBtnPositionsX.map((pos, index) => ({
                id: `addLifeLineBtn_${index}`,
                type: 'addLifeLineBtn',
                position: { x: pos.x, y: pos.y },
                data: {},
                connectable: false,
                zIndex: 10,
                style: {
                    zIndex: 10
                }
            }));
            //Devolvemos la combinación de nodos normales y nodos de botones actualizados
            return [...nonAddLLBtnNodes, ...addLLBtnNodes];
        });
    }, [setNodes]);

    //Creamos un identificador único basado solo en las LifeLines (no en los botones)
    const lifeLineSignature = useMemo(() => {
        const lifeLines = nodes
            .filter(n => n.type === 'lifeLine' && n.position.y === 100)
            .sort((a, b) => a.position.x - b.position.x);
        
        return lifeLines.map(ll => `${ll.id}_${ll.position.x}`).join('|');
    }, [nodes]);

    //Actualizamos botones solo cuando cambia la configuración de LifeLines
    useEffect(() => {
        showAddLLBtns();
    }, [lifeLineSignature, showAddLLBtns]);

    return { showAddLLBtns };
}