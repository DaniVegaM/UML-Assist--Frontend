import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useCanvas } from "../../../hooks/useCanvas";
import { NodeResizer, useReactFlow, type NodeProps } from "@xyflow/react";

/**
 * SeqFragmentNode - Fragmento de orden débil UML
 * 
 * Semántica: Es el orden predeterminado. Representa que los eventos en diferentes
 * líneas de vida pueden ocurrir en cualquier orden si están en operandos distintos.
 * 
 * Estructura: Múltiples operandos separados por líneas discontinuas (sin guardas obligatorias)
 */

interface SeqFragmentData {
  action?: 'addSeparator' | 'removeSeparator';
  separatorCount?: number;
  [key: string]: unknown;
}

const SeqFragmentNode = ({ id, selected, data }: NodeProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [separators, setSeparators] = useState<number[]>([]);
  const [separatorPositions, setSeparatorPositions] = useState<number[]>([]);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const { setIsZoomOnScrollEnabled, openContextMenu } = useCanvas();
  const { setNodes, getZoom } = useReactFlow();

  // Handler para abrir el menú contextual
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openContextMenu({
      x: e.clientX,
      y: e.clientY,
      nodeId: id
    });
  }, [id, openContextMenu]);

  // Ref para evitar procesar la misma acción múltiples veces
  const lastProcessedAction = useRef<string | null>(null);

  // Escuchar cambios desde el menú contextual
  useEffect(() => {
    const nodeData = data as SeqFragmentData;
    const currentAction = nodeData?.action;
    
    if (!currentAction || lastProcessedAction.current === currentAction) {
      return;
    }
    
    lastProcessedAction.current = currentAction;
    
    if (currentAction === 'addSeparator') {
      setSeparators(prev => [...prev, prev.length + 1]);
      setSeparatorPositions(prev => {
        const containerHeight = containerRef.current?.clientHeight || 0;
        const newPosition = containerHeight / (prev.length + 2) * (prev.length + 1);
        return [...prev, newPosition];
      });
    } else if (currentAction === 'removeSeparator') {
      setSeparators(prev => {
        if (prev.length > 0) return prev.slice(0, -1);
        return prev;
      });
      setSeparatorPositions(prev => {
        if (prev.length > 0) return prev.slice(0, -1);
        return prev;
      });
    }
    
    setNodes(nodes => nodes.map(n => 
      n.id === id ? { ...n, data: { ...n.data, action: undefined } } : n
    ));
    
    setTimeout(() => {
      lastProcessedAction.current = null;
    }, 100);
  }, [data, id, setNodes]);

  // Sincronizar separatorCount con el estado actual
  useEffect(() => {
    setNodes(nodes => nodes.map(n => 
      n.id === id ? { ...n, data: { ...n.data, separatorCount: separators.length } } : n
    ));
  }, [separators.length, id, setNodes]);

  const handleMouseDown = useCallback((index: number) => (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    setDraggingIndex(index);
    setIsZoomOnScrollEnabled(false);
  }, [setIsZoomOnScrollEnabled]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (draggingIndex !== null && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const zoom = getZoom();
      
      const newY = (e.clientY - rect.top) / zoom;
      const containerHeight = rect.height / zoom;

      const clampedY = Math.max(10, Math.min(newY, containerHeight - 10));

      setSeparatorPositions(prev => {
        const newPositions = [...prev];
        newPositions[draggingIndex] = clampedY;
        return newPositions;
      });
    }
  }, [draggingIndex, getZoom]);

  const handleMouseUp = useCallback(() => {
    setDraggingIndex(null);
    setIsZoomOnScrollEnabled(true);
  }, [setIsZoomOnScrollEnabled]);

  const previousHeightRef = useRef<number | null>(null);

  useEffect(() => {
    if (draggingIndex !== null) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggingIndex, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const padding = 40;

    const resizeObserver = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry) {
        const newHeight = entry.contentRect.height;
        const prevHeight = previousHeightRef.current;

        if (prevHeight === null) {
          previousHeightRef.current = newHeight;
          return;
        }

        if (newHeight < prevHeight) {
          setSeparatorPositions(prevPositions => {
            let hasChanged = false;

            const clampedPositions = prevPositions.map(pos => {
              const newPos = Math.max(padding, Math.min(pos, newHeight - padding));
              if (newPos !== pos) {
                hasChanged = true;
              }
              return newPos;
            });

            return hasChanged ? clampedPositions : prevPositions;
          });
        }

        previousHeightRef.current = newHeight;
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.unobserve(container);
    };
  }, []);

  return (
    <div
      className="border-2 border-gray-800 dark:border-neutral-200 bg-white/10 dark:bg-neutral-800/10 w-full h-full grid grid-cols-[auto_1fr] grid-rows-[auto_1fr] transition-all duration-150"
      style={{ minWidth: '350px', minHeight: '150px', zIndex: -1 }}
      onContextMenu={handleContextMenu}
    >
      <NodeResizer
        minWidth={350}
        minHeight={150}
        color="#0084D1"
        isVisible={selected}
      />
      <div
        className="bg-gray-800 dark:bg-neutral-200 text-white dark:text-neutral-800 font-mono font-bold text-xs px-3 py-1"
        style={{
          clipPath: 'polygon(100% 0, 100% 50%, 90% 100%, 0 100%, 0 0)',
          width: '50px',
          height: '25px',
        }}
      >
        seq
      </div>

      {/* Espacio vacío donde iría la guarda (seq no requiere guarda) */}
      <div />

      <div ref={containerRef} className="col-span-2 w-full h-full flex flex-col relative">

        {/* Separadores */}
        {separators.map((_, index) => (
          <div
            key={index}
            className="absolute w-full nodrag"
            style={{
              top: `${separatorPositions[index]}px`,
            }}
          >
            {/* Área de arrastre */}
            <div
              className="absolute w-full cursor-ns-resize"
              style={{
                top: '-6px',
                height: '12px',
              }}
              onMouseDown={handleMouseDown(index)}
            />
            
            {/* Línea punteada */}
            <div className="w-full border-t-2 border-dashed border-gray-600 dark:border-neutral-600" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default memo(SeqFragmentNode);
