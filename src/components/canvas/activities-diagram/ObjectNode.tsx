import { useCallback, useRef, useState, useEffect } from "react";
import { useCanvas } from "../../../hooks/useCanvas";
import { Position, useNodeId } from "@xyflow/react";
import { useNode } from "../useNode";
import ObjectHandle from "../ObjectHandle";
import { nodeStyles } from "../styles/nodeStyles";

export default function ObjectNode() {
    const TEXT_AREA_MAX_LEN = 50;

    const { showSourceHandleOptions, 
        setShowSourceHandleOptions, 
        showTargetHandleOptions, 
        setShowTargetHandleOptions 
    } = useNode();

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState("");
    const { setIsZoomOnScrollEnabled, isTryingToConnect } = useCanvas();
    const nodeId = useNodeId();

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
            className={ nodeStyles }
            onDoubleClick={ handleDoubleClick }
            onMouseEnter={ onMouseEnter }
            onMouseLeave={ onMouseLeave }
        >
            {/* SOURCE HANDLES */}
            <ObjectHandle 
                id={0} 
                type="source" 
                position={Position.Top} 
                showSourceHandleOptions={showSourceHandleOptions} 
                showTargetHandleOptions={showTargetHandleOptions}
            />
            <ObjectHandle 
                id={1} 
                type="source" 
                position={Position.Right} 
                showSourceHandleOptions={showSourceHandleOptions} 
                showTargetHandleOptions={showTargetHandleOptions}
            />
            <ObjectHandle 
                id={2} 
                type="source" 
                position={Position.Left} 
                showSourceHandleOptions={showSourceHandleOptions} 
                showTargetHandleOptions={showTargetHandleOptions}
            />
            <ObjectHandle 
                id={3} 
                type="source" 
                position={Position.Bottom} 
                showSourceHandleOptions={showSourceHandleOptions} 
                showTargetHandleOptions={showTargetHandleOptions}
            />

            {/* TARGET HANDLES */}
            <ObjectHandle 
                id={4} 
                type="target" 
                position={Position.Top} 
                showSourceHandleOptions={showSourceHandleOptions} 
                showTargetHandleOptions={showTargetHandleOptions}
            />
            <ObjectHandle 
                id={5} 
                type="target" 
                position={Position.Right} 
                showSourceHandleOptions={showSourceHandleOptions} 
                showTargetHandleOptions={showTargetHandleOptions}
            />
            <ObjectHandle 
                id={6} 
                type="target" 
                position={Position.Left} 
                showSourceHandleOptions={showSourceHandleOptions} 
                showTargetHandleOptions={showTargetHandleOptions}
            />
            <ObjectHandle 
                id={7} 
                type="target" 
                position={Position.Bottom} 
                showSourceHandleOptions={showSourceHandleOptions} 
                showTargetHandleOptions={showTargetHandleOptions}
            />

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