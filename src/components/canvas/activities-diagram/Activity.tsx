import { useCallback, useRef, useState, useEffect } from "react";
import { useCanvas } from "../../../hooks/useCanvas";
import { NodeResizer, Position, useNodeId, useReactFlow, useUpdateNodeInternals } from "@xyflow/react";
import { TEXT_AREA_MAX_LEN } from "../variables";
import ActivityHandle from "../ActivityHandle";
import "../styles/nodeStyles.css";

export default function Activity() {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState("");
    const { setIsZoomOnScrollEnabled } = useCanvas();
    const [sourceHandlesIds, setSourceHandlesIds] = useState<string[] | null>(null);
    const [targetHandlesIds, setTargetHandlesIds] = useState<string[] | null>(null);
    const updateNodeInternals = useUpdateNodeInternals();

    // Obtener el estado del nodo
    const { getNode } = useReactFlow();
    const nodeId = useNodeId();
    const node = getNode(nodeId!);
    const isSelected = node?.selected ?? false;

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

    const onClickSourceBtn = () => {
        setSourceHandlesIds((prev) => {
            if (prev && prev?.length > 0) {
                return [...prev, 'source_' + prev.length];
            } else {
                return ['source_0'];
            }
        });
        updateNodeInternals(nodeId!);
    }

    const onClickTargetBtn = () => {
        setTargetHandlesIds((prev) => {
            if (prev && prev?.length > 0) {
                return [...prev, 'target_' + prev.length];
            } else {
                return ['target_0'];
            }
        });
        updateNodeInternals(nodeId!);
    }

    return (
            <div
                onDoubleClick={handleDoubleClick}
                className="node-container"
            >
                <NodeResizer
                    color="#0084D1"
                    isVisible={isSelected}
                    minWidth={1000}
                    minHeight={600}
                />
                <div className="flex flex-col">
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={onChange}
                        onBlur={handleBlur}
                        onWheel={(e) => e.stopPropagation()}
                        placeholder={`Actividad`}
                        className={`node-textarea ${isEditing ? 'node-textarea-editing' : 'node-textarea-readonly'}`}
                        rows={1}
                    />
                    {isEditing &&
                        <p className="char-counter char-counter-right">{`${value.length}/${TEXT_AREA_MAX_LEN}`}</p>
                    }
                </div>
                <div className="flex justify-between items-center w-full">
                    <div className="flex flex-col space-y-4 justify-center items-center">
                        {sourceHandlesIds && sourceHandlesIds.map((handleId) => (
                            <ActivityHandle id={handleId} key={handleId} position={Position.Left} setSourceHandle={setSourceHandlesIds} />
                        ))}
                        <button onClick={onClickSourceBtn} className="-translate-x-4 cursor-pointer z-50 w-8 h-8 rounded-full bg-neutral-300 hover:bg-neutral-400">+</button>
                    </div>
                    <div className="flex flex-col space-y-4 justify-center items-center">
                        {targetHandlesIds && targetHandlesIds.map((handleId) => (
                            <ActivityHandle id={handleId} key={handleId} position={Position.Right} setTargetHandle={setTargetHandlesIds} />
                        ))}
                        <button onClick={onClickTargetBtn} className="translate-x-4 cursor-pointer z-50 w-8 h-8 rounded-full bg-neutral-300 hover:bg-neutral-400">+</button>
                    </div>
                </div>
            </div>
    )
}