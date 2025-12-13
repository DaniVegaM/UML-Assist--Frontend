import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useReactFlow, useStore } from "@xyflow/react";
import { useSequenceDiagram } from "./useSequenceDiagram";

export function useAddLifeLinesBtns() {
    const { nodes, setNodes } = useSequenceDiagram();
    const { screenToFlowPosition } = useReactFlow();
    const [isVisible, setIsVisible] = useState(false);
    const [isHiding, setIsHiding] = useState(false); // Estado para controlar la animación de salida
    const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const fadeOutTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    
    // Detectar si alguna lifeline se está arrastrando
    const isDraggingLifeLine = useStore((state) => {
        // Verificar si hay algún nodo tipo lifeLine siendo arrastrado
        const draggingNodes = Array.from(state.nodeLookup.values()).filter(
            (node) => node.type === 'lifeLine' && node.dragging
        );
        return draggingNodes.length > 0;
    });

    // Rango Y donde se muestran los botones (cerca de los headers de las LifeLines)
    const HEADER_Y_MIN = 50;  // Límite superior
    const HEADER_Y_MAX = 150; // Límite inferior

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
                data: { isHiding: false },
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

    // Función para marcar los botones como "ocultándose" (para la animación)
    const setButtonsHiding = useCallback((hiding: boolean) => {
        setNodes(prevNodes => prevNodes.map(node => {
            if (node.type === 'addLifeLineBtn') {
                return {
                    ...node,
                    data: { ...node.data, isHiding: hiding }
                };
            }
            return node;
        }));
    }, [setNodes]);

    const hideAddLLBtns = useCallback(() => {
        setNodes(prevNodes => prevNodes.filter(node => node.type !== 'addLifeLineBtn'));
    }, [setNodes]);

    // Manejador para el movimiento del mouse en el canvas
    const handleMouseMove = useCallback((event: React.MouseEvent) => {
        // Si se está arrastrando una lifeline, no mostrar botones
        if (isDraggingLifeLine) {
            // Ocultar botones si están visibles durante el drag
            if (isVisible && !isHiding) {
                setIsHiding(true);
                setButtonsHiding(true);
                
                if (hideTimeoutRef.current) {
                    clearTimeout(hideTimeoutRef.current);
                }
                
                hideTimeoutRef.current = setTimeout(() => {
                    setIsVisible(false);
                    setIsHiding(false);
                    hideTimeoutRef.current = null;
                }, 300);
            }
            return;
        }

        // Convertimos las coordenadas de pantalla a coordenadas del canvas (sensibles a pan/zoom)
        const flowPosition = screenToFlowPosition({
            x: event.clientX,
            y: event.clientY
        });

        // Verificamos si el mouse está en la zona de los headers (coordenadas del canvas)
        const isInHeaderZone = flowPosition.y >= HEADER_Y_MIN && flowPosition.y <= HEADER_Y_MAX;

        if (isInHeaderZone && !isVisible) {
            // Cancelamos cualquier timeout de ocultar pendiente
            if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
                hideTimeoutRef.current = null;
            }
            if (fadeOutTimeoutRef.current) {
                clearTimeout(fadeOutTimeoutRef.current);
                fadeOutTimeoutRef.current = null;
            }
            setIsHiding(false);
            setIsVisible(true);
        } else if (!isInHeaderZone && isVisible && !isHiding) {
            // Iniciamos la animación de fade out
            if (!hideTimeoutRef.current) {
                setIsHiding(true);
                setButtonsHiding(true);
                
                // Esperamos a que termine la animación antes de eliminar los botones
                hideTimeoutRef.current = setTimeout(() => {
                    setIsVisible(false);
                    setIsHiding(false);
                    hideTimeoutRef.current = null;
                }, 300); // Duración de la animación
            }
        }
    }, [isVisible, isHiding, isDraggingLifeLine, HEADER_Y_MIN, HEADER_Y_MAX, screenToFlowPosition, setButtonsHiding]);

    //Creamos un identificador único basado solo en las LifeLines (no en los botones)
    const lifeLineSignature = useMemo(() => {
        const lifeLines = nodes
            .filter(n => n.type === 'lifeLine' && n.position.y === 100)
            .sort((a, b) => a.position.x - b.position.x);
        
        return lifeLines.map(ll => `${ll.id}_${ll.position.x}`).join('|');
    }, [nodes]);

    // Mostrar/ocultar botones basado en isVisible
    useEffect(() => {
        if (isVisible) {
            showAddLLBtns();
        } else {
            hideAddLLBtns();
        }
    }, [isVisible, showAddLLBtns, hideAddLLBtns]);

    // Ocultar botones cuando comienza el dragging de una lifeline
    useEffect(() => {
        if (isDraggingLifeLine && isVisible && !isHiding) {
            setIsHiding(true);
            setButtonsHiding(true);
            
            if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
            }
            
            hideTimeoutRef.current = setTimeout(() => {
                setIsVisible(false);
                setIsHiding(false);
                hideTimeoutRef.current = null;
            }, 300);
        }
    }, [isDraggingLifeLine, isVisible, isHiding, setButtonsHiding]);

    // Actualizar posiciones de botones cuando cambian las LifeLines (solo si están visibles)
    useEffect(() => {
        if (isVisible) {
            showAddLLBtns();
        }
    }, [lifeLineSignature, isVisible, showAddLLBtns]);

    // Limpieza del timeout al desmontar
    useEffect(() => {
        return () => {
            if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
            }
            if (fadeOutTimeoutRef.current) {
                clearTimeout(fadeOutTimeoutRef.current);
            }
        };
    }, []);

    return { showAddLLBtns, hideAddLLBtns, handleMouseMove, isVisible };
}