import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useCanvas } from "../../../hooks/useCanvas";
import { NodeResizer, useReactFlow, type NodeProps } from "@xyflow/react";
import ContextMenuPortal from "./contextMenus/ContextMenuPortal";

const TEXT_AREA_MAX_LEN = 30;

const AltFragmentNode = ({ selected }: NodeProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const separatorTextareaRefs = useRef<Record<number, HTMLTextAreaElement | null>>({});
  const [separators, setSeparators] = useState<number[]>([]);
  const [separatorPositions, setSeparatorPositions] = useState<number[]>([]);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [separatorValues, setSeparatorValues] = useState<string[]>([]);
  const [editingSeparatorIndex, setEditingSeparatorIndex] = useState<number | null>(null);
  const [isEditingFirstOperand, setIsEditingFirstOperand] = useState<boolean>(false);
  const [rawFirstOperand, setRawFirstOperand] = useState<string>('');
  const [contextMenuEvent, setContextMenuEvent] = useState<MouseEvent | null>(null);
  const { setIsZoomOnScrollEnabled } = useCanvas();
  const { getZoom } = useReactFlow();

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
    setSeparatorValues(prev => [...prev, '']);
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
    setSeparatorValues(prev => {
      if (prev.length > 0) return prev.slice(0, -1);
      return prev;
    });
    setSeparatorPositions(prev => {
      if (prev.length > 0) return prev.slice(0, -1);
      return prev;
    });
    closeContextMenu();
  }, [closeContextMenu]);

  const onFirstOperandDoubleClick = useCallback(() => {
    setIsEditingFirstOperand(true);
    setIsZoomOnScrollEnabled(false);

    // Lógica de auto-enfoque
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.select();
      }
    }, 0);
  }, [setIsZoomOnScrollEnabled]);

  const onFirstOperandChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Quita corchetes por si el usuario los pega
    const raw = evt.target.value.replace(/^\[|\]$/g, '');
    setRawFirstOperand(raw.slice(0, TEXT_AREA_MAX_LEN));
  }, []);

  const onFirstOperandBlur = useCallback(() => {
    setIsEditingFirstOperand(false);
    setIsZoomOnScrollEnabled(true);
  }, [setIsZoomOnScrollEnabled]);

  useEffect(() => {
    if (editingSeparatorIndex !== null) {
      const textarea = separatorTextareaRefs.current[editingSeparatorIndex];
      if (textarea) {
        setTimeout(() => {
          textarea.focus();
          textarea.select();
        }, 0);
      }
    }
  }, [editingSeparatorIndex]);

  const handleMouseDown = useCallback((index: number) => (e: React.MouseEvent) => {
    // Solo permitir arrastrar con el botón izquierdo del ratón
    if (e.button !== 0) return;
    e.stopPropagation();
    setDraggingIndex(index);
    setIsZoomOnScrollEnabled(false);
  }, [setIsZoomOnScrollEnabled]);

  const handleSeparatorChange = useCallback((index: number) => (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    const raw = evt.target.value.replace(/^\[|\]$/g, '');
    setSeparatorValues(prev => {
      const newValues = [...prev];
      newValues[index] = raw.slice(0, TEXT_AREA_MAX_LEN);
      return newValues;
    });
  }, []);

  const handleSeparatorDoubleClick = useCallback((index: number) => () => {
    setEditingSeparatorIndex(index);
    setIsZoomOnScrollEnabled(false);
  }, [setIsZoomOnScrollEnabled]);

  const handleSeparatorBlur = useCallback(() => {
    setEditingSeparatorIndex(null);
    setIsZoomOnScrollEnabled(true);
  }, [setIsZoomOnScrollEnabled]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (draggingIndex !== null && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const zoom = getZoom();
      
      // Ajustar la posición del mouse considerando el zoom
      const newY = (e.clientY - rect.top) / zoom;
      const containerHeight = rect.height / zoom;

      // Limitar la posición dentro del contenedor
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

  // Ref para guardar la altura anterior del contenedor
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

        // Inicializar la altura anterior si es la primera vez
        if (prevHeight === null) {
          previousHeightRef.current = newHeight;
          return;
        }

        // Solo ajustar posiciones si el contenedor se hace más pequeño
        // y algún separador queda fuera de los límites
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

        // Actualizar la altura anterior
        previousHeightRef.current = newHeight;
      }
    });

    // Empezamos a observar el contenedor
    resizeObserver.observe(container);

    // Limpieza: dejamos de observar cuando el componente se desmonte
    return () => {
      resizeObserver.unobserve(container);
    };
  }, []);

  return (
    <div
      className="border-2 border-gray-800 dark:border-neutral-200 bg-white/10 dark:bg-neutral-800/10 w-full h-full grid grid-cols-[auto_1fr] grid-rows-[auto_1fr] transition-all duration-150"
      style={{ minWidth: '350px', minHeight: '150px', zIndex: -1, pointerEvents: selected ? 'auto' : 'none' }}
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
        alt
      </div>

      <div onDoubleClick={onFirstOperandDoubleClick} className="cursor-text">
        <textarea
          ref={textareaRef}
          placeholder={`[condición]`}
          className={`no-wheel nodrag w-full h-full placeholder-gray-400 bg-transparent dark:text-white border-none outline-none resize-none text-center text-sm px-2 py-1 overflow-hidden font-mono ${isEditingFirstOperand ? 'pointer-events-auto' : 'pointer-events-none'}`}
          rows={1}
          onMouseDown={e => e.stopPropagation()}
          onChange={onFirstOperandChange}
          onBlur={onFirstOperandBlur}
          value={isEditingFirstOperand ? rawFirstOperand : (rawFirstOperand ? `[${rawFirstOperand}]` : '')}
        />
      </div>

      <div ref={containerRef} className="col-span-2 w-full h-full flex flex-col relative">

        {/* Separadores */}
        {separators.map((_, index) => {
          const isEditingThis = editingSeparatorIndex === index;
          const rawValue = separatorValues[index] || '';

          return (
            <div
              key={index}
              className="absolute w-full nodrag"
              style={{
                top: `${separatorPositions[index]}px`,
              }}
            >
              {/* Área de arrastre: solo 5px arriba y 5px abajo de la línea */}
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

              {/* Wrapper para capturar doble clic cuando textarea tiene pointer-events-none */}
              <div 
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  handleSeparatorDoubleClick(index)();
                }}
              >
                <textarea
                  ref={el => void (separatorTextareaRefs.current[index] = el)}

                  value={isEditingThis
                    ? rawValue
                    : (rawValue ? `[${rawValue}]` : '')
                  }

                  onChange={handleSeparatorChange(index)}
                  onBlur={handleSeparatorBlur}

                  onMouseDown={e => e.stopPropagation()}

                  placeholder={`[condición]`}
                  className={`no-wheel nodrag w-full placeholder-gray-400 bg-transparent dark:text-white border-none outline-none resize-none text-center text-sm px-2 py-1 overflow-hidden font-mono
                    ${isEditingThis ? 'pointer-events-auto' : 'pointer-events-none'}
                  `}
                  rows={1}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Menú contextual */}
      {contextMenuEvent && (
        <ContextMenuPortal event={contextMenuEvent} onClose={closeContextMenu}>
          <div
            className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-sky-600 dark:border-neutral-700 min-w-[180px] overflow-hidden"
            onContextMenu={(e) => e.preventDefault()}
          >
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-neutral-700">
              Fragmento Alt
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
            </div>
          </div>
        </ContextMenuPortal>
      )}
    </div>
  )
}

export default memo(AltFragmentNode);
