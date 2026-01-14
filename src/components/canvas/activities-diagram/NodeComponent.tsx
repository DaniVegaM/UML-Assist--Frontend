import { useCallback, useRef, useState, useEffect } from "react";
import { useCanvas } from "../../../hooks/useCanvas";
import BaseHandle from "../BaseHandle";
import { TEXT_AREA_MAX_LEN } from "../../canvas/variables";
import { useHandle } from "../../../hooks/useHandle";
import "../styles/nodeStyles.css";

export default function NoteNode() {

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState("");
    const { setIsZoomOnScrollEnabled } = useCanvas();

    // 🔹 Handles (MISMO patrón que ObjectNode)
    const [showHandles, setShowHandles] = useState(false);
    const nodeRef = useRef<HTMLDivElement>(null);
    const handleRef = useRef<HTMLDivElement>(null);
    const { handles, magneticHandle } = useHandle({ handleRef, nodeRef });

    const setHandleRef = useCallback((node: HTMLDivElement | null) => {
        handleRef.current = node;
    }, []);

    const onChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (evt.target.value.length >= TEXT_AREA_MAX_LEN) {
            setValue(evt.target.value.trim().slice(0, TEXT_AREA_MAX_LEN));
        } else {
            setValue(evt.target.value);
        }
    }, []);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [value]);

    const handleDoubleClick = useCallback(() => {
        if (!isEditing) {
            setIsEditing(true);
            setIsZoomOnScrollEnabled(false);
            setTimeout(() => {
                textareaRef.current?.focus();
                textareaRef.current?.select();
            }, 0);
        }
    }, [isEditing, setIsZoomOnScrollEnabled]);

    const handleBlur = useCallback(() => {
        setIsEditing(false);
        setIsZoomOnScrollEnabled(true);
        setValue(v => v.trim());
    }, [setIsZoomOnScrollEnabled]);

    return (
        <div
            onDoubleClick={handleDoubleClick}
            onMouseEnter={() => setShowHandles(true)}
            onMouseLeave={() => setShowHandles(false)}
            className="bg-transparent p-4"
            onMouseMove={magneticHandle}
        >
            <div ref={nodeRef} className="node-note">

                {/* 🔹 HANDLES (idéntico comportamiento a ObjectNode) */}
                {handles.map((handle, i) => (
                    <BaseHandle
                        key={handle.id}
                        id={handle.id}
                        ref={i === handles.length - 1 ? setHandleRef : undefined}
                        showHandle={i === handles.length - 1 ? showHandles : false}
                        position={handle.position}
                    />
                ))}

                {/* Título UML */}
                {!isEditing && (
                    <div className="node-note-title">«note»</div>
                )}

                {/* Contenido */}
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={onChange}
                    onBlur={handleBlur}
                    onWheel={(e) => e.stopPropagation()}
                    placeholder="Nota"
                    rows={1}
                    className={`node-textarea nowheel ${isEditing ? "node-textarea-editing" : "node-textarea-readonly"
                        }`}
                />

                {isEditing && (
                    <p className="char-counter char-counter-right">
                        {`${value.length}/${TEXT_AREA_MAX_LEN}`}
                    </p>
                )}
            </div>
        </div>
    );
}
