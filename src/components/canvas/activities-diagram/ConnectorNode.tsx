import { useCallback, useRef, useState, useEffect } from "react";
import { useCanvas } from "../../../hooks/useCanvas";
import BaseHandle from "../BaseHandle";
import { useHandle, type HandleData } from "../../../hooks/useHandle";
import { useNodeId, useReactFlow } from "@xyflow/react";
import "../styles/nodeStyles.css";
import type { DataProps } from "../../../types/canvas";
import SuggestionTooltip from "../SuggestionTooltip";


export default function ConnectorNode({ data }: DataProps) {
  const nodeId = useNodeId();
  const { setNodes } = useReactFlow();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(data.label || "");
  const { setIsZoomOnScrollEnabled, openContextMenu } = useCanvas();

  const [showSuggestion, setShowSuggestion] = useState(false);

  const clearSuggestion = useCallback(() => {
    if (!nodeId) return;
    setShowSuggestion(false);
    setNodes(nodes => nodes.map(n =>
      n.id === nodeId ? { ...n, data: { ...n.data, suggestion: undefined } } : n
    ));
  }, [nodeId, setNodes]);

  useEffect(() => {
    if (data.suggestion) setShowSuggestion(true);
  }, [data.suggestion]);

  // Manejo de handles
  const [showHandles, setShowHandles] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const { handles, magneticHandle } = useHandle({ 
    handleRef, 
    nodeRef, 
    maxHandles: 1,
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
    if (evt.target.value.length >= 3) {
      setValue(evt.target.value.trim().toUpperCase().slice(0, 3));
    } else {
      setValue(evt.target.value.toUpperCase().trim());
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
            className="absolute -top-2 -right-2 z-10 w-5 h-5 rounded-full bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold flex items-center justify-center shadow-md transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-6" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0m-9 5.25h.008v.008H12z"/>
            </svg>
          </button>
          <SuggestionTooltip
            isVisible={showSuggestion}
            suggestionText={data.suggestion}
            onMinimize={() => setShowSuggestion(false)}
            onDiscard={clearSuggestion}
          />
        </>
      )}
      <div ref={nodeRef} className="node-circle-outline w-[70px] h-[70px]">
        {handles.map((handle, i) => (
          <BaseHandle key={handle.id} id={handle.id} ref={i == handles.length - 1 ? setHandleRef : undefined} showHandle={i == handles.length - 1 ? showHandles : false} position={handle.position} left={handle.left} top={handle.top} />
        ))}

        <textarea
          ref={textareaRef}
          value={value}
          onChange={onChange}
          onBlur={handleBlur}
          onWheel={(e) => e.stopPropagation()}
          placeholder="ABC"
          className={`font-black node-textarea ${isEditing ? 'node-textarea-editing' : 'node-textarea-readonly'}`}
          rows={1}
        />
        {isEditing &&
          <p className="font-black char-counter char-counter-right">{`${value.length}/3`}</p>
        }
      </div>
    </div>
  )
}