import { useCallback, useRef, useState, useEffect } from "react";
import { useCanvas } from "../../../hooks/useCanvas";
import { Position, useNodeId } from "@xyflow/react";
import { useNode } from "../useNode";
import BaseHandle from "../BaseHandle";


export default function CallOperation() {
    const { showSourceHandleOptions, setShowSourceHandleOptions, showTargetHandleOptions, setShowTargetHandleOptions } = useNode();

    const classTextRef = useRef<HTMLTextAreaElement>(null);
    const operationTextRef = useRef<HTMLTextAreaElement>(null);
    const classContainerRef = useRef<HTMLDivElement>(null);
    const operationContainerRef = useRef<HTMLDivElement>(null);
    const [isEditingClass, setIsEditingClass] = useState(false);
    const [isEditingOperation, setIsEditingOperation] = useState(false);
    const [classValue, setClassValue] = useState("");
    const [operationValue, setOperationValue] = useState("");
    const { setIsZoomOnScrollEnabled, isTryingToConnect } = useCanvas();
    const nodeId = useNodeId();

    const onClassChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (evt.target.value.length >= 25) {
            setClassValue(evt.target.value.trim().slice(0, 25));
        } else {
            setClassValue(evt.target.value);
        }
    }, []);

    const onOperationChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (evt.target.value.length >= 25) {
            setOperationValue(evt.target.value.trim().slice(0, 25));
        } else {
            setOperationValue(evt.target.value);
        }
    }, []);

    useEffect(() => {
        if (classTextRef.current) {
            classTextRef.current.style.height = 'auto';
            classTextRef.current.style.height = `${classTextRef.current.scrollHeight}px`;
        }
    }, [classValue]);

    useEffect(() => {
        if (operationTextRef.current) {
            operationTextRef.current.style.height = 'auto';
            operationTextRef.current.style.height = `${operationTextRef.current.scrollHeight}px`;
        }
    }, [operationValue]);

    const handleClassDoubleClick = useCallback(() => {
        setIsEditingClass(true);
        setIsZoomOnScrollEnabled(false);
        setTimeout(() => {
            if (classTextRef.current) {
                classTextRef.current.focus();
                classTextRef.current.select();
            }
        }, 0);
    }, [setIsZoomOnScrollEnabled]);

    const handleOperationDoubleClick = useCallback(() => {
        setIsEditingOperation(true);
        setIsZoomOnScrollEnabled(false);
        setTimeout(() => {
            if (operationTextRef.current) {
                operationTextRef.current.focus();
                operationTextRef.current.select();
            }
        }, 0);
    }, [setIsZoomOnScrollEnabled]);

    const handleClassBlur = useCallback(() => {
        setIsEditingClass(false);
        setIsZoomOnScrollEnabled(true);
    }, [setIsZoomOnScrollEnabled]);

    const handleOperationBlur = useCallback(() => {
        setIsEditingOperation(false);
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

    return (
        <div
            className="relative border border-gray-300 dark:border-neutral-900 rounded-lg p-2 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-zinc-600 min-w-[200px] flex flex-col items-center justify-center transition-all duration-150"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {/* SOURCE HANDLES */}
            <BaseHandle id={0} type="source" position={Position.Top} showSourceHandleOptions={showSourceHandleOptions} showTargetHandleOptions={showTargetHandleOptions} />
            <BaseHandle id={1} type="source" position={Position.Right} showSourceHandleOptions={showSourceHandleOptions} showTargetHandleOptions={showTargetHandleOptions} />
            <BaseHandle id={2} type="source" position={Position.Left} showSourceHandleOptions={showSourceHandleOptions} showTargetHandleOptions={showTargetHandleOptions} />
            <BaseHandle id={3} type="source" position={Position.Bottom} showSourceHandleOptions={showSourceHandleOptions} showTargetHandleOptions={showTargetHandleOptions} />

            {/* TARGET HANDLES */}
            <BaseHandle id={4} type="target" position={Position.Top} showSourceHandleOptions={showSourceHandleOptions} showTargetHandleOptions={showTargetHandleOptions} />
            <BaseHandle id={5} type="target" position={Position.Right} showSourceHandleOptions={showSourceHandleOptions} showTargetHandleOptions={showTargetHandleOptions} />
            <BaseHandle id={6} type="target" position={Position.Left} showSourceHandleOptions={showSourceHandleOptions} showTargetHandleOptions={showTargetHandleOptions} />
            <BaseHandle id={7} type="target" position={Position.Bottom} showSourceHandleOptions={showSourceHandleOptions} showTargetHandleOptions={showTargetHandleOptions} />

            <div className="flex justify-center items-center gap-1 w-full">
                <div 
                    ref={classContainerRef}
                    onDoubleClick={handleClassDoubleClick}
                    className="w-full"
                >
                    <textarea
                        ref={classTextRef}
                        value={classValue}
                        onChange={onClassChange}
                        onBlur={handleClassBlur}
                        onWheel={(e) => e.stopPropagation()}
                        placeholder="Clase"
                        className={`nodrag w-full placeholder-gray-400 bg-transparent dark:text-white border-none outline-none resize-none text-center text-sm px-2 py-1 overflow-hidden ${isEditingClass ? 'pointer-events-auto' : 'pointer-events-none'
                            }`}
                        rows={1}
                    />
                </div>
                <p className="dark:text-white text-gray-600 select-none">::</p>
                <div 
                    ref={operationContainerRef}
                    onDoubleClick={handleOperationDoubleClick}
                    className="w-full"
                >
                    <textarea
                        ref={operationTextRef}
                        value={operationValue}
                        onChange={onOperationChange}
                        onBlur={handleOperationBlur}
                        onWheel={(e) => e.stopPropagation()}
                        placeholder="Operación"
                        className={`nodrag w-full placeholder-gray-400 bg-transparent dark:text-white border-none outline-none resize-none text-center text-sm px-2 py-1 overflow-hidden ${isEditingOperation ? 'pointer-events-auto' : 'pointer-events-none'
                            }`}
                        rows={1}
                    />
                </div>
            </div>
        </div>
    )
}