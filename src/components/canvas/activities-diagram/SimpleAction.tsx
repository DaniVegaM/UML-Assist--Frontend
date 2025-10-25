import { useCallback, useRef, useState, useEffect } from "react";
import { useCanvas } from "../../../hooks/useCanvas";
import { Position, useNodeId } from "@xyflow/react";
import { useNode } from "../useNode";
import BaseHandle from "../BaseHandle";


export default function SimpleAction() {
  const { showSourceHandleOptions, setShowSourceHandleOptions, showTargetHandleOptions, setShowTargetHandleOptions } = useNode();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState("");
  const { setIsZoomOnScrollEnabled, isTryingToConnect } = useCanvas();
  const nodeId = useNodeId();

  // const maxSourceConnections = 2; //Máximo número de edges que pueden ENTRAR
  // const maxTargetConnections = 1; //Máximo número de edges que pueden SALIR

  const onChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (evt.target.value.length >= 100) {
      setValue(evt.target.value.trim().slice(0, 100));
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

  const onMouseEnter = () => {
    if (isTryingToConnect.isTrying && isTryingToConnect.sourceNodeId !== nodeId) {
      setShowSourceHandleOptions(false);
      setShowTargetHandleOptions(true);
    } else {
      setShowTargetHandleOptions(false);
      setShowSourceHandleOptions(true);
    }
  }

  const onMouseLeave = () => {
    setShowSourceHandleOptions(false);
    setShowTargetHandleOptions(false);
  }

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className="relative border border-gray-300 dark:border-neutral-900 rounded-lg p-2 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-zinc-600 min-w-[200px] flex flex-col items-center justify-center transition-all duration-150"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* SOURCE HANDLES */}
      <BaseHandle id={0} type="source" position={Position.Top} showSourceHandleOptions={showSourceHandleOptions} showTargetHandleOptions={showTargetHandleOptions}/>
      <BaseHandle id={1} type="source" position={Position.Right} showSourceHandleOptions={showSourceHandleOptions} showTargetHandleOptions={showTargetHandleOptions}/>
      <BaseHandle id={2} type="source" position={Position.Left} showSourceHandleOptions={showSourceHandleOptions} showTargetHandleOptions={showTargetHandleOptions}/>
      <BaseHandle id={3} type="source" position={Position.Bottom} showSourceHandleOptions={showSourceHandleOptions} showTargetHandleOptions={showTargetHandleOptions}/>

      {/* TARGET HANDLES */}
      <BaseHandle id={4} type="target" position={Position.Top} showSourceHandleOptions={showSourceHandleOptions} showTargetHandleOptions={showTargetHandleOptions}/>
      <BaseHandle id={5} type="target" position={Position.Right} showSourceHandleOptions={showSourceHandleOptions} showTargetHandleOptions={showTargetHandleOptions}/>
      <BaseHandle id={6} type="target" position={Position.Left} showSourceHandleOptions={showSourceHandleOptions} showTargetHandleOptions={showTargetHandleOptions}/>
      <BaseHandle id={7} type="target" position={Position.Bottom} showSourceHandleOptions={showSourceHandleOptions} showTargetHandleOptions={showTargetHandleOptions}/>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        onBlur={handleBlur}
        onWheel={(e) => e.stopPropagation()}
        placeholder="Acción"
        className={`nodrag w-full placeholder-gray-400 bg-transparent dark:text-white border-none outline-none resize-none text-center text-sm px-2 py-1 overflow-hidden ${isEditing ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
        rows={1}
      />
      {isEditing &&
        <p className="w-full text-[10px] text-right text-neutral-400">{`${value.length}/100`}</p>
      }
    </div>
  )
}