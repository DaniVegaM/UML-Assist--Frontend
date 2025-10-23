import { useCallback, useRef, useState, useEffect } from "react";
import { useCanvas } from "../../../hooks/useCanvas";
import { Handle, Position, useNodeId } from "@xyflow/react";


export default function SimpleAction() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState("");
  const [textareaHeight, setTextareaHeight] = useState(24); //Altura inicial
  const [showSourceHandleOptions, setShowSourceHandleOptions] = useState(false);
  const [showTargetHandleOptions, setShowTargetHandleOptions] = useState(false);
  const { setIsZoomOnScrollEnabled, isTryingToConnect } = useCanvas();
  const nodeId = useNodeId();

  const onChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(evt.target.value);
    adjustHeight(evt.target);
  }, []);

  const adjustHeight = (element: HTMLTextAreaElement) => {
    element.style.height = 'auto';
    const scrollHeight = element.scrollHeight;
    const newHeight = Math.min(scrollHeight, 144); //Calculamos la nueva altura del div padre
    element.style.height = `${newHeight}px`;
    setTextareaHeight(newHeight);
  };

  const handleDoubleClick = useCallback(() => {
    if (!isEditing) {
      setIsEditing(true);
      setIsZoomOnScrollEnabled(false); //Desactiva el zoom con scroll del ViewPort
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.select();
          adjustHeight(textareaRef.current);
        }
      }, 0);
    }
  }, [isEditing, setIsZoomOnScrollEnabled]);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    setIsZoomOnScrollEnabled(true); //Reactiva el zoom al salir de edición
  }, [setIsZoomOnScrollEnabled]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      adjustHeight(textareaRef.current);
    }
  }, [isEditing]);

  const containerHeight = textareaHeight + 16;

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
      className="relative border border-gray-300 dark:border-neutral-900 rounded-lg p-2 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-zinc-600 w-[200px] flex items-center justify-center transition-all duration-150"
      style={{
        height: `${containerHeight}px`,
        maxHeight: '160px'
      }}
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
      />
      
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={onChange}
          onBlur={handleBlur}
          onWheel={(e) => e.stopPropagation()}
          placeholder="Acción"
          className="nodrag nowheel w-full placeholder-gray-400 bg-transparent dark:text-white border-none outline-none resize-none text-center text-sm px-2 py-1 overflow-y-auto"
          style={{
            height: `${textareaHeight}px`,
            maxHeight: '144px'
          }}
        />
      ) : (
        <div className={`w-full h-full px-2 py-1 text-center text-sm overflow-hidden text-ellipsis line-clamp-4 ${value == '' ? 'text-gray-400 dark:text-gray-500' : 'text-black dark:text-white'}`}>
          {value || "Acción"}
        </div>
      )}
    </div>
  )
}
