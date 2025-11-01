import { useCallback, useRef, useState, useEffect } from "react";
import { useCanvas } from "../../../hooks/useCanvas";


export default function ConnectorNode() {

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
      className="relative border border-gray-300 dark:border-neutral-900 rounded-full p-2 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-zinc-600 w-[70px] h-[70px] flex flex-col items-center justify-center transition-all duration-150"
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        onBlur={handleBlur}
        onWheel={(e) => e.stopPropagation()}
        placeholder="ABC"
        className={`font-black nodrag w-full placeholder-gray-400 bg-transparent dark:text-white border-none outline-none resize-none text-center text-sm px-2 py-1 overflow-hidden ${isEditing ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
        rows={1}
      />
      {isEditing &&
        <p className="font-black w-full text-[10px] text-right text-neutral-400">{`${value.length}/3`}</p>
      }
    </div>
  )
}