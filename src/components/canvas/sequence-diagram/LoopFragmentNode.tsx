import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useCanvas } from "../../../hooks/useCanvas";
import { NodeResizer, type NodeProps, useReactFlow } from "@xyflow/react";

const TEXT_AREA_MAX_LEN = 30;
const NUMBER_MAX_LEN = 5;

const LoopFragmentNode = ({ id, data, selected }: NodeProps) => {
  const guardTextareaRef = useRef<HTMLTextAreaElement>(null);
  const minInputRef = useRef<HTMLInputElement>(null);
  const maxInputRef = useRef<HTMLInputElement>(null);
  const { setNodes } = useReactFlow();
  const { setIsZoomOnScrollEnabled } = useCanvas();

  const [guard, setGuard] = useState((data as any)?.guard || "");
  const [minIterations, setMinIterations] = useState((data as any)?.minIterations || "0");
  const [maxIterations, setMaxIterations] = useState((data as any)?.maxIterations || "*");
  const [isEditingGuard, setIsEditingGuard] = useState(false);
  const [isEditingMin, setIsEditingMin] = useState(false);
  const [isEditingMax, setIsEditingMax] = useState(false);

  // Sincronizar datos con el nodo de React Flow
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: { ...node.data, guard, minIterations, maxIterations },
          };
        }
        return node;
      })
    );
  }, [guard, minIterations, maxIterations, id, setNodes]);

  const onGuardDoubleClick = useCallback(() => {
    setIsEditingGuard(true);
    setIsZoomOnScrollEnabled(false);

    setTimeout(() => {
      if (guardTextareaRef.current) {
        guardTextareaRef.current.focus();
        guardTextareaRef.current.select();
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

  const onMinClick = useCallback(() => {
    setIsEditingMin(true);
    setIsZoomOnScrollEnabled(false);

    setTimeout(() => {
      if (minInputRef.current) {
        minInputRef.current.focus();
        minInputRef.current.select();
      }
    }, 0);
  }, [setIsZoomOnScrollEnabled]);

  const onMinChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    const value = evt.target.value;
    // Permitir solo números
    if (/^\d*$/.test(value)) {
      setMinIterations(value.slice(0, NUMBER_MAX_LEN));
    }
  }, []);

  const onMinBlur = useCallback(() => {
    setIsEditingMin(false);
    setIsZoomOnScrollEnabled(true);
    // Si está vacío, establecer en 0
    if (minIterations === "") {
      setMinIterations("0");
    }
  }, [setIsZoomOnScrollEnabled, minIterations]);

  const onMaxClick = useCallback(() => {
    setIsEditingMax(true);
    setIsZoomOnScrollEnabled(false);

    setTimeout(() => {
      if (maxInputRef.current) {
        maxInputRef.current.focus();
        maxInputRef.current.select();
      }
    }, 0);
  }, [setIsZoomOnScrollEnabled]);

  const onMaxChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    const value = evt.target.value;
    // Permitir números o asterisco
    if (/^[\d*]*$/.test(value)) {
      setMaxIterations(value.slice(0, NUMBER_MAX_LEN));
    }
  }, []);

  const onMaxBlur = useCallback(() => {
    setIsEditingMax(false);
    setIsZoomOnScrollEnabled(true);
    // Si está vacío, establecer en *
    if (maxIterations === "") {
      setMaxIterations("*");
    }
  }, [setIsZoomOnScrollEnabled, maxIterations]);

  return (
    <div
      className="border-2 border-gray-800 dark:border-neutral-200 bg-white/10 dark:bg-neutral-800/10 w-full h-full"
      style={{ minWidth: "300px", minHeight: "100px" }}
    >
      <NodeResizer minWidth={300} minHeight={100} color="#0084D1" isVisible={selected} />

      {/* Pentágono con la palabra clave "loop" y especificación de iteración */}
      <div className="flex items-start">
        <div
          className="bg-gray-800 dark:bg-neutral-200 text-white dark:text-neutral-800 font-mono font-bold text-xs px-2 py-1 flex items-center gap-1"
          style={{
            clipPath: 'polygon(100% 0, 100% 50%, 90% 100%, 0 100%, 0 0)',
            minWidth: "120px",
            height: "25px",
          }}
        >
          <span>loop</span>
          <span className="text-white dark:text-neutral-800">(</span>
          <input
            ref={minInputRef}
            type="text"
            value={minIterations}
            onChange={onMinChange}
            onBlur={onMinBlur}
            onClick={onMinClick}
            onMouseDown={(e) => e.stopPropagation()}
            className={`nodrag bg-transparent border-none outline-none text-center font-mono font-bold w-8 ${
              isEditingMin ? "pointer-events-auto" : "pointer-events-none cursor-pointer"
            }`}
            placeholder="0"
          />
          <span className="text-white dark:text-neutral-800">..</span>
          <input
            ref={maxInputRef}
            type="text"
            value={maxIterations}
            onChange={onMaxChange}
            onBlur={onMaxBlur}
            onClick={onMaxClick}
            onMouseDown={(e) => e.stopPropagation()}
            className={`nodrag bg-transparent border-none outline-none text-center font-mono font-bold w-8 ${
              isEditingMax ? "pointer-events-auto" : "pointer-events-none cursor-pointer"
            }`}
            placeholder="*"
          />
          <span className="text-white dark:text-neutral-800">)</span>
        </div>

        {/* Guard del fragmento loop */}
        <div className="flex-1" onDoubleClick={onGuardDoubleClick}>
          <textarea
            ref={guardTextareaRef}
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
      <div className="w-full h-[calc(100%-25px)] relative">
        {/* Espacio para contenido del fragmento */}
      </div>
    </div>
  );
};

export default memo(LoopFragmentNode);
