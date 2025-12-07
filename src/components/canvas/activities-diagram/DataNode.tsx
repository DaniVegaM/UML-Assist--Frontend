import { useCallback, useRef, useState, useEffect } from "react";
import { useCanvas } from "../../../hooks/useCanvas";
import BaseHandle from "../BaseHandle";
import { NodeToolbar, Position, useInternalNode, useNodeId } from "@xyflow/react";
import { TEXT_AREA_MAX_LEN } from "../../canvas/variables";
import { useHandle } from "../../../hooks/useHandle";

export default function DataNode() {

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState("");
    const nodeId = useNodeId();
    const node = useInternalNode(nodeId ? nodeId : '');
    const [dataType, setDataType] = useState<'centralBuffer' | 'datastore'>('datastore');
    const { setIsZoomOnScrollEnabled } = useCanvas();

    // Manejo de handles
    const [showHandles, setShowHandles] = useState(false);
    const nodeRef = useRef<HTMLDivElement>(null);
    const handleRef = useRef<HTMLDivElement>(null);
    const { handles, magneticHandle } = useHandle({ handleRef, nodeRef });

    // Callback ref para actualizar handleRef cuando cambie el último handle
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

    const onClick = useCallback((value: 'centralBuffer' | 'datastore') => {
        setDataType(value)
    }, []
    )

    const handleBlur = useCallback(() => {
        setIsEditing(false);
        setIsZoomOnScrollEnabled(true);
        setValue(prevValue => prevValue.trim());
    }, [setIsZoomOnScrollEnabled]);

    return (
        <div
            onDoubleClick={handleDoubleClick}
            onMouseEnter={() => setShowHandles(true)}
            onMouseLeave={() => setShowHandles(false)}
            className="bg-transparent p-4"
            onMouseMove={(evt) => { magneticHandle(evt) }}
        >
            <div ref={nodeRef} className="relative border border-gray-300 dark:border-neutral-900 rounded-lg bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-zinc-600 min-w-[200px] flex flex-col items-center justify-center transition-all duration-150">
                {handles.map((handle, i) => (
                    <BaseHandle key={handle.id} id={handle.id} ref={i == handles.length - 1 ? setHandleRef : undefined} showHandle={i == handles.length - 1 ? showHandles : false} position={handle.position} />
                ))}

                <NodeToolbar isVisible={node?.selected} position={Position.Top}
                    className="absolute top-1 w-80 py-1 px-1 flex justify-center items-center gap-2"
                >
                    <button
                        onClick={() => onClick('datastore')}
                        className={`border-neutral-600 border-1 py-1 px-2 rounded-sm hover:bg-neutral-600 ${dataType == 'centralBuffer' ? '' : 'bg-neutral-600 text-white'} hover:text-white font-bold transition-all duration-300 cursor-pointer`}
                    >
                        Data Store
                    </button>
                    <button
                        onClick={() => onClick('centralBuffer')}
                        className={`border-neutral-600 border-1 py-1 px-2 rounded-sm hover:bg-neutral-600 ${dataType == 'centralBuffer' ? 'bg-neutral-600 text-white' : ''} hover:text-white font-bold transition-all duration-300 cursor-pointer`}
                    >
                        Central Buffer
                    </button>
                </NodeToolbar>

                <p>{`<<${dataType}>>`}</p>

                <textarea
                    className={`nodrag nowheel w-full placeholder-gray-400 bg-transparent dark:text-white border-none outline-none resize-none text-center text-sm px-2 py-1 overflow-hidden ${isEditing ? 'pointer-events-auto' : 'pointer-events-none'}`}
                    ref={textareaRef}
                    value={value}
                    onChange={onChange}
                    onBlur={handleBlur}
                    placeholder={`(Particiones...)\n${dataType === 'centralBuffer' ? 'Nombre del búfer' : 'Nombre del datastore'}`}
                    rows={1}
                    maxLength={TEXT_AREA_MAX_LEN}
                />
                {isEditing &&
                    <p className="w-full text-[10px] text-right text-neutral-400">{`${value.length}/${TEXT_AREA_MAX_LEN}`}</p>
                }
            </div>
        </div>
    )
}