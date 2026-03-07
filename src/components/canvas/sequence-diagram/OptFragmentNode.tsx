import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useCanvas } from "../../../hooks/useCanvas";
import { NodeResizer, type NodeProps, useReactFlow } from "@xyflow/react";

const TEXT_AREA_MAX_LEN = 30;

const OptFragmentNode = ({ id, data, selected }: NodeProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { setNodes } = useReactFlow();
  const { setIsZoomOnScrollEnabled } = useCanvas();

  const [guard, setGuard] = useState((data as any)?.guard || "");
  const [isEditingGuard, setIsEditingGuard] = useState(false);

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

  useEffect(() => {
    const mustFill = (data as any)?.mustFillGuard;
    const current = String((data as any)?.guard ?? guard ?? "").trim();

    if (!isEditingGuard && mustFill && current === "") {
      // apaga el flag para que NO se dispare en bucle
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id
            ? {
                ...n,
                data: { ...n.data, mustFillGuard: false, guardError: null },
              }
            : n
        )
      );

      setIsEditingGuard(true);
      setIsZoomOnScrollEnabled(false);

      setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.select();
      }, 0);
    }
  }, [id, (data as any)?.mustFillGuard, (data as any)?.guard, guard, isEditingGuard, setNodes, setIsZoomOnScrollEnabled]);
  
const onGuardDoubleClick = useCallback(() => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, guardError: null } } : n
      )
    );
    setIsEditingGuard(true);
    setIsZoomOnScrollEnabled(false);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.select();
      }
    }, 0);
},[id, setNodes, setIsZoomOnScrollEnabled]);

  const onGuardChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, guardError: null } } : n
      )
    );
    
    const raw = evt.target.value.replace(/^\[|\]$/g, "");
    setGuard(raw.slice(0, TEXT_AREA_MAX_LEN));
  }, [id, setNodes]);

  const onGuardBlur = useCallback(() => {
    setIsEditingGuard(false);
    setIsZoomOnScrollEnabled(true);

    const trimmed = guard.trim();

    setNodes((nds) =>
      nds.map((n) =>
        n.id === id
          ? {
              ...n,
              data: {
                ...n.data,
                guard: trimmed,
                guardError: trimmed ? null : "No puede estar vacío.",
              },
            }
          : n
      )
    );
  }, [guard, id, setNodes, setIsZoomOnScrollEnabled]);

  return (
    <div
      className="border-2 border-gray-800 dark:border-neutral-200 bg-white/10 dark:bg-neutral-800/10 w-full h-full"
      style={{ minWidth: "300px", minHeight: "100px", pointerEvents: selected ? 'auto' : 'none' }}
    >
      <NodeResizer minWidth={300} minHeight={100} color="#0084D1" isVisible={selected} />

      {/* Pentágono con la palabra clave "opt" */}
      <div className="flex items-start">
        <div
          className="bg-gray-800 dark:bg-neutral-200 text-white dark:text-neutral-800 font-mono font-bold text-xs px-3 py-1"
          style={{
            clipPath: 'polygon(100% 0, 100% 50%, 90% 100%, 0 100%, 0 0)',
            width: '50px',
            height: '25px',
          }}
        >
          opt
        </div>

        {/* Guard del fragmento opcional */}
        <div className="flex-1 cursor-text" onDoubleClick={onGuardDoubleClick}>
          <textarea
            ref={textareaRef}
            placeholder="[condición]"
            className={`no-wheel nodrag w-full placeholder-gray-400 bg-transparent dark:text-white border-none outline-none resize-none text-sm px-2 py-1 overflow-hidden font-mono
              ${isEditingGuard ? "pointer-events-auto" : "pointer-events-none"}
              ${!isEditingGuard && (data as any)?.guardError ? "node-textarea-error" : ""}`}
            rows={1}
            onMouseDown={(e) => e.stopPropagation()}
            onChange={onGuardChange}
            onBlur={onGuardBlur}
            value={isEditingGuard ? guard : guard ? `[${guard}]` : ""}
          />

          {!isEditingGuard && (data as any)?.guardError && (
            <p className="node-error-text">{(data as any).guardError}</p>
          )}
        </div>
      </div>

      {/* Área del operando (sin separadores) */}
      <div className="w-full h-[calc(100%-25px)] relative">
        {/* Espacio para contenido del fragmento */}
      </div>
    </div>
  );
};

export default memo(OptFragmentNode);
