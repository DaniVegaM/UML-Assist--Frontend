import { useCallback, useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useCanvas } from "../../../hooks/useCanvas";
import BaseHandle from "../BaseHandle";
import { TEXT_AREA_MAX_LEN } from "../variables";
import { useHandle, type HandleData } from "../../../hooks/useHandle";
import { useNodeId, useReactFlow } from "@xyflow/react";
import "../styles/nodeStyles.css";
import type { DataProps } from "../../../types/canvas";
import NodeSuggestionTooltip from "../NodeSuggestionTooltip";

// UML §7.2.2 + §7.5: CallOperation format is optionally (Partition1, Partition2) on first line,
// then ClassName::operationName on the next line (or as the only line).
const CALL_OP_REGEX = /^[A-Za-z_]\w*::[A-Za-z_]\w*$/;
const PARTITION_LINE_REGEX = /^\([^)]*\)$/;

function parseCallOperation(raw: string) {
    const lines = raw.trim().split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return { isEmpty: true };

    let partitionLine = '';
    let opLine = '';

    if (lines.length >= 2 && PARTITION_LINE_REGEX.test(lines[0])) {
        partitionLine = lines[0];
        opLine = lines.slice(1).join(' ').trim();
    } else {
        opLine = lines.join(' ').trim();
    }

    const hasPartition = !!partitionLine;
    const hasDoubleColon = opLine.includes('::');
    const parts = opLine.split('::');
    const className = parts[0]?.trim() ?? '';
    const opName = parts[1]?.trim() ?? '';
    const classOk = /^[A-Za-z_]\w*$/.test(className);
    const opOk = /^[A-Za-z_]\w*$/.test(opName);
    const opValid = CALL_OP_REGEX.test(opLine);

    return { isEmpty: false, hasPartition, partitionLine, opLine, className, opName, hasDoubleColon, classOk, opOk, opValid };
}

export default function CallOperation({ data }: DataProps) {
  const nodeId = useNodeId();
  const { setNodes } = useReactFlow();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(data.label || "");
  const { setIsZoomOnScrollEnabled, openContextMenu } = useCanvas();
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [tooltipPortalPos, setTooltipPortalPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!isEditing) { setTooltipPortalPos(null); return; }
    let animId: number;
    let lastX = -1, lastY = -1;
    const track = () => {
      if (textareaRef.current) {
        const r = textareaRef.current.getBoundingClientRect();
        const x = Math.round(r.left + r.width / 2);
        const y = Math.round(r.top);
        if (x !== lastX || y !== lastY) {
          setTooltipPortalPos({ x, y });
          lastX = x; lastY = y;
        }
      }
      animId = requestAnimationFrame(track);
    };
    animId = requestAnimationFrame(track);
    return () => cancelAnimationFrame(animId);
  }, [isEditing]);

  const clearSuggestion = useCallback(() => {
    if (!nodeId) return;
    setShowSuggestion(false);
    setNodes(nodes => nodes.map(n =>
      n.id === nodeId ? { ...n, data: { ...n.data, suggestion: undefined } } : n
    ));
  }, [nodeId, setNodes]);

  // Manejo de handles
  const [showHandles, setShowHandles] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const { handles, magneticHandle } = useHandle({ 
    handleRef, 
    nodeRef,
    initialHandles: data?.handles as HandleData[] | undefined
  });

  // Callback ref para actualizar handleRef cuando cambie el último handle
  const setHandleRef = useCallback((node: HTMLDivElement | null) => {
    handleRef.current = node;
  }, []);

  // Sincronizamos handles con node.data cuando cambien
  useEffect(() => {
    if (!nodeId) return;
    setNodes(nodes => nodes.map(n => 
      n.id === nodeId 
        ? { ...n, data: { ...n.data, handles, label: value } }
        : n
    ));
  }, [handles, nodeId, setNodes, value]);

  const onChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (evt.target.value.length >= TEXT_AREA_MAX_LEN) {
      setValue(evt.target.value.trim().slice(0, TEXT_AREA_MAX_LEN));
    } else {
      setValue(evt.target.value);
    }
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  const handleDoubleClick = useCallback(() => {
    if (!isEditing) {
      setIsEditing(true);
      setIsZoomOnScrollEnabled(false);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.select();
        }
      }, 0);
    }
  }, [isEditing, setIsZoomOnScrollEnabled]);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    setIsZoomOnScrollEnabled(true);
  }, [setIsZoomOnScrollEnabled]);

  const handleContextMenu = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    openContextMenu({
      x: e.clientX,
      y: e.clientY,
      nodeId: nodeId ?? "",
    });
  }, [openContextMenu, nodeId]);

  return (
    <div
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      onMouseEnter={() => setShowHandles(true)}
      onMouseLeave={() => setShowHandles(false)}
      className="bg-transparent p-4"
      onMouseMove={(evt) => { magneticHandle(evt) }}
    >
      {data.suggestion && (
        <>
          <button
            onDoubleClick={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); setShowSuggestion(prev => !prev); }}
            title="Ver sugerencia de IA"
            className="ver-ia absolute -top-2 -right-2 z-10 w-5 h-5 rounded-full bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold flex items-center justify-center shadow-md transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-6" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0m-9 5.25h.008v.008H12z"/>
            </svg>
          </button>
          <NodeSuggestionTooltip
            isVisible={showSuggestion}
            suggestionText={data.suggestion}
            onMinimize={() => setShowSuggestion(false)}
            onDiscard={clearSuggestion}
          />
        </>
      )}
      <div ref={nodeRef} className="node-rounded">
        {handles.map((handle, i) => (
          <BaseHandle key={handle.id} id={handle.id} ref={i == handles.length - 1 ? setHandleRef : undefined} showHandle={i == handles.length - 1 ? showHandles : false} position={handle.position} left={handle.left} top={handle.top} />
        ))}
        
        <textarea
          ref={textareaRef}
          value={value}
          onChange={onChange}
          onBlur={handleBlur}
          onWheel={(e) => e.stopPropagation()}
          placeholder={`(Particiones...)\nC::O`}
          className={`node-textarea ${isEditing ? 'node-textarea-editing' : 'node-textarea-readonly'}`}
          rows={1}
        />
        {isEditing &&
          <p className="char-counter char-counter-right">{`${value.length}/${TEXT_AREA_MAX_LEN}`}</p>
        }
      </div>

      {/* ── CallOperation format helper ── */}
      {(() => {
        if (!isEditing || !tooltipPortalPos) return null;
        const p = parseCallOperation(value);
        return createPortal(
          <div
            style={{
              position: 'fixed',
              top: tooltipPortalPos.y - 10,
              left: tooltipPortalPos.x,
              transform: 'translate(-50%, -100%)',
              zIndex: 99999,
              pointerEvents: 'none',
              fontFamily: 'inherit',
            }}
          >
            <div className="relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl shadow-2xl px-3 pt-2.5 pb-2.5 min-w-max">

              {/* Header */}
              <div className="flex items-center gap-1.5 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-sky-500 shrink-0">
                  <path fillRule="evenodd" d="M14.447 3.026a.75.75 0 0 1 .527.921l-4.5 16.5a.75.75 0 0 1-1.448-.394l4.5-16.5a.75.75 0 0 1 .921-.527ZM16.72 6.22a.75.75 0 0 1 1.06 0l5.25 5.25a.75.75 0 0 1 0 1.06l-5.25 5.25a.75.75 0 1 1-1.06-1.06L21.44 12l-4.72-4.72a.75.75 0 0 1 0-1.06Zm-9.44 0a.75.75 0 0 1 0 1.06L2.56 12l4.72 4.72a.75.75 0 0 1-1.06 1.06L.97 12.53a.75.75 0 0 1 0-1.06l5.25-5.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
                </svg>
                <span className="text-[9px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none">
                  Llamada a una operación
                </span>
                {!p.isEmpty && p.opValid && (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-emerald-500 ml-1">
                    <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                  </svg>
                )}
              </div>

              {p.isEmpty ? (
                /* Empty state */
                <div className="flex flex-col gap-1.5">
                  <div className="flex flex-col gap-1 font-mono text-[11px]">
                    <div className="flex items-center gap-0.5">
                      <span className="text-gray-300 dark:text-gray-600">(</span>
                      <span className="px-1 py-0.5 rounded border border-dashed border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600">Particion</span>
                      <span className="text-gray-300 dark:text-gray-600">,</span>
                      <span className="px-1 py-0.5 rounded border border-dashed border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600">Otra</span>
                      <span className="text-gray-300 dark:text-gray-600">)</span>
                      <span className="text-[9px] text-gray-300 dark:text-gray-700 ml-1">— opcional</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <span className="px-1 py-0.5 rounded border border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 font-semibold">Clase</span>
                      <span className="text-sky-400 dark:text-sky-500 font-bold">::</span>
                      <span className="px-1 py-0.5 rounded border border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 font-semibold">operacion</span>
                      <span className="text-[9px] text-amber-500 ml-1">— requerido</span>
                    </div>
                  </div>
                  <div className="text-[9px] text-gray-400 dark:text-gray-600 mt-0.5">
                    Ej: <span className="font-mono text-gray-500 dark:text-gray-400">(Estudiante) Sistema::registrar</span>
                  </div>
                </div>
              ) : (
                /* Active state */
                <div className="flex flex-col gap-1.5">
                  {/* Partition line */}
                  <div className="flex items-center gap-1 text-[11px]">
                    <span className={`px-1.5 py-0.5 rounded-md border font-mono transition-all duration-150 ${
                      p.hasPartition
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700'
                        : 'bg-gray-50 text-gray-300 border-gray-100 dark:bg-gray-800 dark:text-gray-600 dark:border-gray-700'
                    }`}>
                      {p.hasPartition ? p.partitionLine : '(Particion)'}
                    </span>
                    <span className="text-[9px] text-gray-400 dark:text-gray-600">opcional</span>
                  </div>

                  {/* Clase::operacion */}
                  <div className="flex items-center gap-0.5 font-mono text-[11px]">
                    <span className={`px-1.5 py-0.5 rounded-md border font-semibold transition-all duration-150 ${
                      p.classOk
                        ? 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-700'
                        : p.opLine
                          ? 'bg-amber-50 text-amber-500 border-amber-200 dark:bg-amber-900/20 dark:text-amber-500 dark:border-amber-800'
                          : 'bg-gray-50 text-gray-300 border-gray-100 dark:bg-gray-800 dark:text-gray-600 dark:border-gray-700'
                    }`}>
                      {p.className || 'Clase'}
                    </span>
                    <span className={`px-0.5 font-bold transition-colors duration-150 ${
                      p.hasDoubleColon ? 'text-sky-500 dark:text-sky-400' : 'text-gray-200 dark:text-gray-700'
                    }`}>::</span>
                    <span className={`px-1.5 py-0.5 rounded-md border font-semibold transition-all duration-150 ${
                      p.opOk
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700'
                        : p.hasDoubleColon
                          ? 'bg-amber-50 text-amber-500 border-amber-200 dark:bg-amber-900/20 dark:text-amber-500 dark:border-amber-800'
                          : 'bg-gray-50 text-gray-300 border-gray-100 dark:bg-gray-800 dark:text-gray-600 dark:border-gray-700'
                    }`}>
                      {p.opName || 'operacion'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[9px] text-gray-400 dark:text-gray-600">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 inline-block" />
                      Clase y operación requeridas
                    </span>
                  </div>
                </div>
              )}

              {/* Arrow pointing down */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[7px] w-3.5 h-3.5 bg-white dark:bg-gray-900 border-b border-r border-gray-100 dark:border-gray-700 rotate-45" />
            </div>
          </div>,
          document.body
        );
      })()}
    </div>
  )
}