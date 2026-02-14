import { useCallback, useRef, useState, useEffect } from "react";
import { useCanvas } from "../../hooks/useCanvas";
import { useSequenceDiagram } from "../../hooks/useSequenceDiagram";
import BaseHandle from "./BaseHandle";
import { TEXT_AREA_MAX_LEN } from "./variables";
import { useHandle, type HandleData } from "../../hooks/useHandle";
import ContextMenuPortal from "./sequence-diagram/contextMenus/ContextMenuPortal";
import DeleteIcon from "./sequence-diagram/contextMenus/DeleteIcon";
import "./styles/nodeStyles.css";
import { useNodeId } from "@xyflow/react";
import type { DataProps } from "../../types/canvas";

export default function NoteComponent({data} : DataProps) {

    const nodeId = useNodeId();
    const { setNodes, setEdges } = useSequenceDiagram();

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(data.label || "");
    const [contextMenuEvent, setContextMenuEvent] = useState<MouseEvent | null>(null);
    const { setIsZoomOnScrollEnabled } = useCanvas();

    const [showHandles, setShowHandles] = useState(false);
    const nodeRef = useRef<HTMLDivElement>(null);
    const handleRef = useRef<HTMLDivElement>(null);
    const { handles, magneticHandle } = useHandle({ 
        handleRef, 
        nodeRef,
        initialHandles: data?.handles as HandleData[] | undefined
    });

    const setHandleRef = useCallback((node: HTMLDivElement | null) => {
        handleRef.current = node;
    }, []);

    // Sincronizamos handles con node.data cuando cambien
    useEffect(() => {
        if (!nodeId) return;
        setNodes(nodes => nodes.map(n =>
            n.id === nodeId
                ? { ...n, data: { ...n.data, handles, label: value } }
                : n
        ));
    }, [handles, nodeId, setNodes, value]);

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

    // Handler para abrir el menú contextual
    const handleContextMenu = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenuEvent(e.nativeEvent);
    }, []);

    // Handler para cerrar el menú contextual
    const closeContextMenu = useCallback(() => {
        setContextMenuEvent(null);
    }, []);

    // Handler para eliminar el nodo
    const deleteNode = useCallback(() => {
        if (!nodeId) return;
        
        // Eliminar el nodo
        setNodes(prev => prev.filter(node => node.id !== nodeId));
        
        // Eliminar todas las conexiones (edges) asociadas al nodo
        setEdges(prev => prev.filter(edge => 
            edge.source !== nodeId && edge.target !== nodeId
        ));
        
        closeContextMenu();
    }, [nodeId, setNodes, setEdges, closeContextMenu]);


    return (
        <div
            onDoubleClick={handleDoubleClick}
            onMouseEnter={() => setShowHandles(true)}
            onMouseLeave={() => setShowHandles(false)}
            className="bg-transparent p-4 relative"
            onMouseMove={magneticHandle}
            onContextMenu={handleContextMenu}
        >
            {/* Overlay para capturar clic derecho */}
            <div 
                className="absolute inset-0 z-0"
                style={{ pointerEvents: 'auto' }}
                onContextMenu={handleContextMenu}
            />
            
            <div
                ref={nodeRef}
                className="node-note relative min-w-[200px] p-2 text-[12px] border border-neutral-800 bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:border-white dark:hover:bg-zinc-600 transition-colors duration-150 z-10"
            >
                {handles.map((handle, i) => (
                    <BaseHandle
                        key={handle.id}
                        id={handle.id}
                        ref={i === handles.length - 1 ? setHandleRef : undefined}
                        showHandle={i === handles.length - 1 ? showHandles : false}
                        position={handle.position}
                    />
                ))}

                {!isEditing && (
                    <div className="italic text-[11px] mb-1 select-none text-center">
                        «note»
                    </div>
                )}

                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={onChange}
                    onBlur={handleBlur}
                    onWheel={(e) => e.stopPropagation()}
                    placeholder="Nota"
                    rows={1}
                    className={`node-textarea nowheel ${isEditing
                        ? "node-textarea-editing"
                        : "node-textarea-readonly"
                        }`}
                />

                {isEditing && (
                    <p className="char-counter char-counter-right">
                        {`${value.length}/${TEXT_AREA_MAX_LEN}`}
                    </p>
                )}
            </div>

            {/* Menú contextual */}
            {contextMenuEvent && (
                <ContextMenuPortal event={contextMenuEvent} onClose={closeContextMenu}>
                    <div
                        className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-sky-600 dark:border-neutral-700 min-w-[180px] overflow-hidden"
                        onContextMenu={(e) => e.preventDefault()}
                    >
                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-neutral-700">
                            Nota
                        </div>
                        <div className="flex flex-col">
                            <div
                                onClick={deleteNode}
                                className="px-4 py-2 cursor-pointer text-sm dark:text-white hover:bg-red-100 dark:hover:bg-red-700 transition-colors flex items-center gap-2"
                            >
                                <DeleteIcon />
                                Eliminar
                            </div>
                        </div>
                    </div>
                </ContextMenuPortal>
            )}
        </div>
    );

}
