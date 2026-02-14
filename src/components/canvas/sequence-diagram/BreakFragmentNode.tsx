import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useCanvas } from "../../../hooks/useCanvas";
import { NodeResizer, type NodeProps, useNodeId } from "@xyflow/react";
import { useSequenceDiagram } from "../../../hooks/useSequenceDiagram";
import ContextMenuPortal from "./contextMenus/ContextMenuPortal";
import DeleteIcon from "./contextMenus/DeleteIcon";

const TEXT_AREA_MAX_LEN = 30;

const BreakFragmentNode = ({ id, data, selected }: NodeProps) => {
  const nodeId = useNodeId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { setNodes, setEdges } = useSequenceDiagram();
  const { setIsZoomOnScrollEnabled } = useCanvas();

  const [guard, setGuard] = useState((data as any)?.guard || "");
  const [isEditingGuard, setIsEditingGuard] = useState(false);
  const [contextMenuEvent, setContextMenuEvent] = useState<MouseEvent | null>(null);

  // Sincronizar guard con el nodo de React Flow
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: { ...node.data, guard },
          };
        }
        return node;
      })
    );
  }, [guard, id, setNodes]);

  const onGuardDoubleClick = useCallback(() => {
    setIsEditingGuard(true);
    setIsZoomOnScrollEnabled(false);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.select();
      }
    }, 0);
  }, [setIsZoomOnScrollEnabled]);

  const onGuardChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    const raw = evt.target.value.replace(/^\[|\]$/g, "");
    setGuard(raw.slice(0, TEXT_AREA_MAX_LEN));
  }, []);

  const onGuardBlur = useCallback(() => {
    setIsEditingGuard(false);
    setIsZoomOnScrollEnabled(true);
  }, [setIsZoomOnScrollEnabled]);

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

  return (
    <div
      className="border-2 border-gray-800 dark:border-neutral-200 bg-white/10 dark:bg-neutral-800/10 w-full h-full relative"
      style={{ minWidth: "300px", minHeight: "100px", pointerEvents: selected ? 'auto' : 'none' }}
      onContextMenu={handleContextMenu}
    >
      {/* Overlay para capturar clic derecho cuando el nodo no está seleccionado */}
      <div 
        className="absolute inset-0 z-0"
        style={{ pointerEvents: 'auto' }}
        onContextMenu={handleContextMenu}
      />
      
      <NodeResizer minWidth={300} minHeight={100} color="#0084D1" isVisible={selected} />

      {/* Pentágono con la palabra clave "break" */}
      <div className="flex items-start relative z-10">
        <div
          className="bg-gray-800 dark:bg-neutral-200 text-white dark:text-neutral-800 font-mono font-bold text-xs px-3 py-1 flex items-center justify-center"
          style={{
            clipPath: "polygon(0 0, 100% 0, 90% 100%, 0 100%)",
            minWidth: "60px",
            height: "25px",
          }}
        >
          break
        </div>

        {/* Guard del fragmento break */}
        <div className="flex-1 cursor-text relative z-10" onDoubleClick={onGuardDoubleClick}>
          <textarea
            ref={textareaRef}
            placeholder="[condición]"
            className={`no-wheel nodrag w-full placeholder-gray-400 bg-transparent dark:text-white border-none outline-none resize-none text-sm px-2 py-1 overflow-hidden font-mono ${
              isEditingGuard ? "pointer-events-auto" : "pointer-events-none"
            }`}
            rows={1}
            onMouseDown={(e) => e.stopPropagation()}
            onChange={onGuardChange}
            onBlur={onGuardBlur}
            value={isEditingGuard ? guard : guard ? `[${guard}]` : ""}
          />
        </div>
      </div>

      {/* Área del operando (sin separadores) */}
      <div className="w-full h-[calc(100%-25px)] relative z-10">
        {/* Espacio para contenido del fragmento */}
      </div>

      {/* Menú contextual */}
      {contextMenuEvent && (
        <ContextMenuPortal event={contextMenuEvent} onClose={closeContextMenu}>
          <div
            className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-sky-600 dark:border-neutral-700 min-w-[180px] overflow-hidden"
            onContextMenu={(e) => e.preventDefault()}
          >
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-neutral-700">
              Fragmento Break
            </div>
            <div className="flex flex-col">
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
  );
};

export default memo(BreakFragmentNode);
