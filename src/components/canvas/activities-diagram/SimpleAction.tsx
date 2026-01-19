import { useCallback, useRef, useState, useEffect } from "react";
import { useCanvas } from "../../../hooks/useCanvas";
import BaseHandle from "../BaseHandle";
import { TEXT_AREA_MAX_LEN } from "../variables";
import { useHandle, type HandleData } from "../../../hooks/useHandle";
import { useNodeId, useReactFlow, type NodeProps } from "@xyflow/react";
import "../styles/nodeStyles.css";

function sameHandles(a: HandleData[], b: HandleData[]) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (Number(a[i].id) !== Number(b[i].id)) return false;
    if (a[i].position !== b[i].position) return false;
  }
  return true;
}


export default function SimpleAction({ data }: NodeProps) {
  const nodeId = useNodeId();
  const { setNodes } = useReactFlow();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState("");
  const { setIsZoomOnScrollEnabled } = useCanvas();

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

  useEffect(() => {
  if (!nodeId) return;

  const next = handles.map(h => ({ id: h.id, position: h.position })) as HandleData[];

  setNodes((nodes) =>
    nodes.map((n) => {
      if (n.id !== nodeId) return n;

      const current = (n.data?.handles ?? []) as HandleData[];

      if (sameHandles(current, next)) return n;

      return { ...n, data: { ...n.data, handles: next } };
    })
  );
}, [handles, nodeId, setNodes]);



  // Manejo del textarea
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

  return (
    <div
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setShowHandles(true)}
      onMouseLeave={() => setShowHandles(false)}
      className="bg-transparent p-4"
      onMouseMove={(evt) => { magneticHandle(evt) }}
    >
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
          placeholder={`(Particiones...)\nAcción`}
          className={`node-textarea ${isEditing ? 'node-textarea-editing' : 'node-textarea-readonly'}`}
          rows={1}
        />
        {isEditing &&
          <p className="char-counter char-counter-right">{`${value.length}/${TEXT_AREA_MAX_LEN}`}</p>
        }
      </div>
    </div>
  )
}