import { useCallback, useRef, useState, useEffect } from "react";
import { useCanvas } from "../../../hooks/useCanvas";
import { Handle, Position, useNodeConnections, useNodeId } from "@xyflow/react";


export default function SimpleAction() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState("");
  const [showSourceHandleOptions, setShowSourceHandleOptions] = useState(false);
  const [showTargetHandleOptions, setShowTargetHandleOptions] = useState(false);
  const { setIsZoomOnScrollEnabled, isTryingToConnect } = useCanvas();
  const nodeId = useNodeId();

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

  const sourceHandleconnections = useNodeConnections({
    handleType: 'source',
  });

  const targetHandleconnections = useNodeConnections({
    handleType: 'target',
  });

  const canConnectSource = sourceHandleconnections.length < 1;

  // Permitir nueva conexión de ENTRADA solo si hay 0 conexiones de entrada actuales
  const canConnectTarget = targetHandleconnections.length < 1;


  return (
    <div
      onDoubleClick={handleDoubleClick}
      className="relative border border-gray-300 dark:border-neutral-900 rounded-lg p-2 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-zinc-600 min-w-[200px] flex flex-col items-center justify-center transition-all duration-150"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* SOURCE HANDLES */}
      <Handle
        id={`${nodeId}_sourceHandle-1`}
        type="source"
        position={Position.Top}
        style={{
          opacity: showSourceHandleOptions ? 1 : 0,
          pointerEvents: 'all',
          transition: 'opacity 0.2s'
        }}
        isConnectable={canConnectSource}
      />
      <Handle
        id={`${nodeId}_sourceHandle-2`}
        type="source"
        position={Position.Right}
        style={{
          opacity: showSourceHandleOptions ? 1 : 0,
          pointerEvents: 'all',
          transition: 'opacity 0.2s'
        }}
        isConnectable={canConnectSource}
      />
      <Handle
        id={`${nodeId}_sourceHandle-3`}
        type="source"
        position={Position.Left}
        style={{
          opacity: showSourceHandleOptions ? 1 : 0,
          pointerEvents: 'all',
          transition: 'opacity 0.2s'
        }}
        isConnectable={canConnectSource}
      />
      <Handle
        id={`${nodeId}_sourceHandle-4`}
        type="source"
        position={Position.Bottom}
        style={{
          opacity: showSourceHandleOptions ? 1 : 0,
          pointerEvents: 'all',
          transition: 'opacity 0.2s'
        }}
        isConnectable={canConnectSource}
      />

      {/* TARGET HANDLES */}
      <Handle
        id={`${nodeId}_targetHandle-1`}
        type="target"
        position={Position.Top}
        style={{
          opacity: showTargetHandleOptions ? 1 : 0,
          pointerEvents: 'all',
          transition: 'opacity 0.2s'
        }}
        isConnectable={canConnectTarget}
      />
      <Handle
        id={`${nodeId}_targetHandle-2`}
        type="target"
        position={Position.Right}
        style={{
          opacity: showTargetHandleOptions ? 1 : 0,
          pointerEvents: 'all',
          transition: 'opacity 0.2s'
        }}
        isConnectable={canConnectTarget}
      />
      <Handle
        id={`${nodeId}_targetHandle-3`}
        type="target"
        position={Position.Left}
        style={{
          opacity: showTargetHandleOptions ? 1 : 0,
          pointerEvents: 'all',
          transition: 'opacity 0.2s'
        }}
        isConnectable={canConnectTarget}
      />
      <Handle
        id={`${nodeId}_targetHandle-4`}
        type="target"
        position={Position.Bottom}
        style={{
          opacity: showTargetHandleOptions ? 1 : 0,
          pointerEvents: 'all',
          transition: 'opacity 0.2s'
        }}
        isConnectable={canConnectTarget}
      />
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