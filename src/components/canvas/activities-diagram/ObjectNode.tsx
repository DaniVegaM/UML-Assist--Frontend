import { useCallback, useRef, useState, useEffect } from "react";
import { useCanvas } from "../../../hooks/useCanvas";
import { nodeStyles } from "../styles/nodeStyles";

export default function ObjectNode() {
    const TEXT_AREA_MAX_LEN = 50;

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState("");
    const { setIsZoomOnScrollEnabled } = useCanvas();

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
        setValue(prevValue => prevValue.trim());
    }, [setIsZoomOnScrollEnabled]);

    return (
        <div
            className={ nodeStyles }
            onDoubleClick={ handleDoubleClick }
        >

            <textarea
                className={`nodrag nowheel w-full placeholder-gray-400 bg-transparent dark:text-white border-none outline-none resize-none text-center text-sm px-2 py-1 overflow-hidden ${isEditing ? 'pointer-events-auto' : 'pointer-events-none'}`}
                ref={textareaRef}
                value={value}
                onChange={onChange}
                onBlur={handleBlur}
                placeholder={"nombre:Tipo"}
                rows={1}
                maxLength={TEXT_AREA_MAX_LEN}
            />
            {isEditing &&
                <p className="w-full text-[10px] text-right text-neutral-400">{`${value.length}/${TEXT_AREA_MAX_LEN}`}</p>
            }
        </div>
    )
}