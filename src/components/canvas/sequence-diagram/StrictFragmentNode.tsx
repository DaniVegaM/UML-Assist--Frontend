import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useCanvas } from "../../../hooks/useCanvas";
import { NodeResizer, useReactFlow, useNodeId, type NodeProps } from "@xyflow/react";
import { useSequenceDiagram } from "../../../hooks/useSequenceDiagram";
import ContextMenuPortal from "./contextMenus/ContextMenuPortal";
import DeleteIcon from "./contextMenus/DeleteIcon";


const StrictFragmentNode = ({ selected }: NodeProps) => {
  const nodeId = useNodeId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [separators, setSeparators] = useState<number[]>([]);
  const [separatorPositions, setSeparatorPositions] = useState<number[]>([]);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [contextMenuEvent, setContextMenuEvent] = useState<MouseEvent | null>(null);
  const { setIsZoomOnScrollEnabled } = useCanvas();
  const { getZoom } = useReactFlow();
  const { setNodes, setEdges } = useSequenceDiagram();

  // Handler para abrir el menú contextual
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuEvent(e.nativeEvent);
  }, []);

  // Handler para cerrar el menú contextual
  const closeContextMenu = useCallback(() => {
    setContextMenuEvent(null);
  }, []);

  // Handler para agregar separador
  const addSeparator = useCallback(() => {
    setSeparators(prev => [...prev, prev.length + 1]);
    setSeparatorPositions(prev => {
      const containerHeight = containerRef.current?.clientHeight || 0;
      const newPosition = containerHeight / (prev.length + 2) * (prev.length + 1);
      return [...prev, newPosition];
    });
    closeContextMenu();
  }, [closeContextMenu]);

  // Handler para eliminar separador
  const removeSeparator = useCallback(() => {
    setSeparators(prev => {
      if (prev.length > 0) return prev.slice(0, -1);
      return prev;
    });
    setSeparatorPositions(prev => {
      if (prev.length > 0) return prev.slice(0, -1);
      return prev;
    });
    closeContextMenu();
  }, [closeContextMenu]);

  // Handler para eliminar el nodo
  const deleteNode = useCallback(() => {
    if (!nodeId) return;
    
    // Eliminar el nodo
    setNodes(prev => prev.filter(node => node.id !== nodeId));
    
    // Eliminar todas las conexiones (edges) asociadas al nodo
    setEdges(prev => prev.filter(edge => 
      edge.source !== nodeId && edge.target !== nodeId
    ));
    
    closeContextMenu();
  }, [nodeId, setNodes, setEdges, closeContextMenu]);

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
      className="border-2 border-gray-800 dark:border-neutral-200 bg-white/10 dark:bg-neutral-800/10 w-full h-full grid grid-cols-[auto_1fr] grid-rows-[auto_1fr] transition-all duration-150 relative"
      style={{ minWidth: '350px', minHeight: '150px', zIndex: -1, pointerEvents: selected ? 'auto' : 'none' }}
      onContextMenu={handleContextMenu}
    >
      {/* Overlay para capturar clic derecho cuando el nodo no está seleccionado */}
      <div 
        className="absolute inset-0 z-0"
        style={{ pointerEvents: 'auto' }}
        onContextMenu={handleContextMenu}
      />
      
      <NodeResizer
        minWidth={350}
        minHeight={150}
        color="#0084D1"
        isVisible={selected}
      />
      <div
        className="bg-gray-800 dark:bg-neutral-200 text-white dark:text-neutral-800 font-mono font-bold text-xs px-3 py-1 relative z-10"
        style={{
          clipPath: 'polygon(100% 0, 100% 50%, 90% 100%, 0 100%, 0 0)',
          width: '60px',
          height: '25px',
        }}
      >
        strict
      </div>

      {/* Espacio vacío donde iría la guarda (strict no requiere guarda) */}
      <div className="relative z-10" />

      <div ref={containerRef} className="col-span-2 w-full h-full flex flex-col relative z-10">

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

      {/* Menú contextual */}
      {contextMenuEvent && (
        <ContextMenuPortal event={contextMenuEvent} onClose={closeContextMenu}>
          <div
            className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-sky-600 dark:border-neutral-700 min-w-[180px] overflow-hidden"
            onContextMenu={(e) => e.preventDefault()}
          >
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-neutral-700">
              Fragmento Strict
            </div>
            <div className="flex flex-col">
              <div
                onClick={addSeparator}
                className="px-4 py-2 cursor-pointer text-sm dark:text-white hover:bg-sky-100 dark:hover:bg-sky-700 transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Agregar operando
              </div>
              <div className="border-t border-gray-200 dark:border-neutral-700"></div>
              <div
                onClick={separators.length > 0 ? removeSeparator : undefined}
                className={`px-4 py-2 text-sm flex items-center gap-2 transition-colors ${
                  separators.length > 0
                    ? 'cursor-pointer dark:text-white hover:bg-sky-100 dark:hover:bg-sky-700'
                    : 'cursor-not-allowed text-gray-400 dark:text-gray-600'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
                Eliminar operando
                {separators.length > 0 && (
                  <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                    ({separators.length})
                  </span>
                )}
              </div>
              <div className="border-t border-gray-200 dark:border-neutral-700"></div>
              <div
                onClick={deleteNode}
                className="px-4 py-2 cursor-pointer text-sm dark:text-white hover:bg-red-100 dark:hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <DeleteIcon />
                Eliminar
              </div>
            </div>
          </div>
        </ContextMenuPortal>
      )}
    </div>
  )
}

export default memo(StrictFragmentNode);
