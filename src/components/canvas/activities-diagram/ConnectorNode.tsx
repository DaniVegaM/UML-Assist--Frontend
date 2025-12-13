import { useCallback, useRef, useState, useEffect } from "react";
import { useCanvas } from "../../../hooks/useCanvas";
import BaseHandle from "../BaseHandle";
import { Position } from "@xyflow/react";
import "../styles/nodeStyles.css";


export default function ConnectorNode() {
  const [showHandles, setShowHandles] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState("");
  const { setIsZoomOnScrollEnabled } = useCanvas();

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

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className="node-circle-outline w-[70px] h-[70px]"
      onMouseEnter={() => setShowHandles(true)}
      onMouseLeave={() => setShowHandles(false)}
    >
      <BaseHandle id={0} position={Position.Top} showHandle={showHandles} className="!absolute !top-1" />
      <BaseHandle id={1} position={Position.Right} showHandle={showHandles} className="!absolute !right-1" />
      <BaseHandle id={2} position={Position.Bottom} showHandle={showHandles} className="!absolute !bottom-1" />
      <BaseHandle id={3} position={Position.Left} showHandle={showHandles} className="!absolute !left-1" />
      
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
  )
}