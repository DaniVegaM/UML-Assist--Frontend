import { useCallback, useEffect, useMemo } from "react";
import { useSequenceDiagram } from "./useSequenceDiagram";

export function useAddLifeLinesBtns() {
    const { nodes, setNodes } = useSequenceDiagram();

    const showAddLLBtns = useCallback(() => {
        setNodes(prevNodes => {
            //Obtenemos las LifeLines principales (las que están en y=100)
            const topLifeLines = prevNodes.filter(node => node.type === 'lifeLine' && node.position.y === 100).sort((a, b) => a.position.x - b.position.x).map(node => {
                const newNode = {...node, position: { ...node.position, x: node.position.x + 100 }}; //Ajuste debido al width de el header de la LifeLine
                return newNode;
            });

            //Calculamos las posiciones X para los botones de agregar LifeLine
            const addLLBtnPositionsX: { x: number, y: number }[] = [];

            if (topLifeLines.length === 0) {
                //Si no hay LifeLines, colocamos un botón en la posición inicial
                addLLBtnPositionsX.push({ x: 210, y: 100 });
                addLLBtnPositionsX.push({ x: 750, y: 100 });
            } else {
                //Botón antes de la primera LifeLine
                addLLBtnPositionsX.push({ x: topLifeLines[0].position.x - 290, y: 100 });

                //Botones entre cada par de LifeLines consecutivas
                for (let i = 0; i < topLifeLines.length - 1; i++) {
                    const midX = (topLifeLines[i].position.x + topLifeLines[i + 1].position.x) / 2;
                    addLLBtnPositionsX.push({ x: midX, y: 100 });
                }

                //Botón después de la última LifeLine
                addLLBtnPositionsX.push({ x: topLifeLines[topLifeLines.length - 1].position.x + 250, y: 100 });
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

    // Crear un identificador único basado solo en las LifeLines (no en los botones)
    const lifeLineSignature = useMemo(() => {
        const lifeLines = nodes
            .filter(n => n.type === 'lifeLine' && n.position.y === 100)
            .sort((a, b) => a.position.x - b.position.x);
        
        return lifeLines.map(ll => `${ll.id}_${ll.position.x}`).join('|');
    }, [nodes]);

    // Actualizar botones solo cuando cambia la configuración de LifeLines
    useEffect(() => {
        showAddLLBtns();
    }, [lifeLineSignature, showAddLLBtns]);

    return { showAddLLBtns };
}