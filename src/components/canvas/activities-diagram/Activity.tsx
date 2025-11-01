import { useCallback, useRef, useState, useEffect } from "react";
import { useCanvas } from "../../../hooks/useCanvas";
import { NodeResizer, useNodeId, useReactFlow } from "@xyflow/react";


export default function Activity() {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState("");
    const { setIsZoomOnScrollEnabled } = useCanvas();

    // Obtener el estado del nodo
    const { getNode } = useReactFlow();
    const nodeId = useNodeId();
    const node = getNode(nodeId!);
    const isSelected = node?.selected ?? false;

    const onChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (evt.target.value.length >= 50) {
            setValue(evt.target.value.trim().slice(0, 50));
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
            className="relative border border-gray-300 dark:border-neutral-900 rounded-lg p-2 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-zinc-600 w-full h-full min-w-[200px] min-h-[60px] flex flex-col items-center justify-start transition-all duration-150"
        >
            <NodeResizer
                color="#0084D1"
                isVisible={isSelected}
                minWidth={200}
                minHeight={60}
            />
            <div className="flex flex-col">
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={onChange}
                    onBlur={handleBlur}
                    onWheel={(e) => e.stopPropagation()}
                    placeholder="Actividad"
                    className={`nodrag w-full placeholder-gray-400 bg-transparent dark:text-white border-none outline-none resize-none text-center text-sm px-2 py-1 overflow-hidden ${isEditing ? 'pointer-events-auto' : 'pointer-events-none'
                        }`}
                    rows={1}
                />
                {isEditing &&
                    <p className="w-full text-[10px] text-right text-neutral-400">{`${value.length}/50`}</p>
                }
            </div>
        </div>
    )
}