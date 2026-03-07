import { useCallback, useRef, useState, useEffect } from "react";
import { useCanvas } from "../../../hooks/useCanvas";
import BaseHandle from "../BaseHandle";
import { useInternalNode, useNodeId, useReactFlow } from "@xyflow/react";
import { TEXT_AREA_MAX_LEN } from "../../canvas/variables";
import { useHandle, type HandleData } from "../../../hooks/useHandle";
import "../styles/nodeStyles.css";
import type { DataProps } from "../../../types/canvas";

type DataNodeData = {
    label?: string;
    labelError?: string | null;
    mustFillLabel?: boolean;
    handles?: HandleData[];
    objectVariant?: string;
};

export default function DataNode({ data }: DataProps) {

    const dataNodeData = data as DataNodeData;

    const labelFromNode = dataNodeData.label ?? "";
    const labelError = dataNodeData.labelError ?? null;
    const mustFillLabel = dataNodeData.mustFillLabel ?? false;

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(labelFromNode);
    const nodeId = useNodeId();
    const node = useInternalNode(nodeId ? nodeId : '');
    const { setNodes } = useReactFlow();

    const { setIsZoomOnScrollEnabled, openContextMenu } = useCanvas();
    const [showHandles, setShowHandles] = useState(false);
    const nodeRef = useRef<HTMLDivElement>(null);
    const handleRef = useRef<HTMLDivElement>(null);
    const { handles, magneticHandle } = useHandle({ 
        handleRef, 
        nodeRef,
        initialHandles: dataNodeData.handles
    });

    // Callback ref para actualizar handleRef cuando cambie el último handle
    const setHandleRef = useCallback((node: HTMLDivElement | null) => {
        handleRef.current = node;
    }, []);

    // Sincronizamos handles con node.data cuando cambien
    useEffect(() => {
        if (!nodeId) return;
        setNodes(nodes => nodes.map(n => 
            n.id === nodeId 
                ? { ...n, data: { ...n.data, handles } }
                : n
        ));
    }, [handles, nodeId, setNodes]);

    useEffect(() => {
        setValue(labelFromNode);
    }, [labelFromNode]);

    useEffect(() => {
        if (!nodeId) return;

        const current = String(labelFromNode ?? value ?? "").trim();

        if (!isEditing && mustFillLabel && current === "") {
            setNodes((nodes) =>
                nodes.map((n) =>
                    n.id === nodeId
                        ? {
                            ...n,
                            data: {
                                ...n.data,
                                mustFillLabel: false,
                                labelError: null,
                            },
                        }
                        : n
                )
            );

            setIsEditing(true);
            setIsZoomOnScrollEnabled(false);

            setTimeout(() => {
                textareaRef.current?.focus();
                textareaRef.current?.select();
            }, 0);
        }
    }, [nodeId, mustFillLabel, labelFromNode, value, isEditing, setNodes, setIsZoomOnScrollEnabled]);

    useEffect(() => {
        if (!nodeId || !isEditing) return;

        setNodes((nodes) =>
            nodes.map((n) =>
                n.id === nodeId
                    ? { ...n, data: { ...n.data, label: value } }
                    : n
            )
        );
    }, [value, nodeId, setNodes, isEditing]);


    const onChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (!nodeId) return;

        setNodes((nodes) =>
            nodes.map((n) =>
                n.id === nodeId
                    ? { ...n, data: { ...n.data, labelError: null } }
                    : n
            )
        );
        
        if (evt.target.value.length >= TEXT_AREA_MAX_LEN) {
            setValue(evt.target.value.slice(0, TEXT_AREA_MAX_LEN));
        } else {
            setValue(evt.target.value);
        }
    }, [nodeId, setNodes]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [value]);


    const handleDoubleClick = useCallback(() => {
        if (!isEditing) {
            if (!nodeId) return;

            setNodes((nodes) =>
                nodes.map((n) =>
                    n.id === nodeId
                        ? { ...n, data: { ...n.data, labelError: null } }
                        : n
                )
            );               

            setIsEditing(true);
            setIsZoomOnScrollEnabled(false);
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.focus();
                    textareaRef.current.select();
                }
            }, 0);
        }
    }, [isEditing, nodeId, setNodes, setIsZoomOnScrollEnabled]);

    const handleBlur = useCallback(() => {
        if (!nodeId) return;

        setIsEditing(false);
        setIsZoomOnScrollEnabled(true);

        const trimmed = value.trim();

        setNodes((nodes) =>
            nodes.map((n) =>
                n.id === nodeId
                    ? {
                        ...n,
                        data: {
                            ...n.data,
                            mustFillLabel: false,
                            label: trimmed,
                            labelError: trimmed ? null : "No puede estar vacío.",
                        },
                    }
                    : n
            )
        );
    }, [nodeId, value, setNodes, setIsZoomOnScrollEnabled]);


    // Context Menu
    const handleContextMenu = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault(); // evita menú del navegador
        e.stopPropagation(); // evita que React Flow arrastre
        openContextMenu({
            x: e.clientX,
            y: e.clientY,
            nodeId: nodeId ?? "",
        });
    }, [openContextMenu, nodeId]);

    return (
        <div
            onMouseEnter={() => setShowHandles(true)}
            onMouseLeave={() => setShowHandles(false)}
            onContextMenu={handleContextMenu}
            onMouseMove={magneticHandle}
            className="bg-transparent p-4"
        >
            <div onDoubleClick={handleDoubleClick} style={{ pointerEvents: "auto" }}>
                <div ref={nodeRef} className="node-rect">
                    {handles.map((handle, i) => (
                        <BaseHandle key={handle.id} id={handle.id} ref={i == handles.length - 1 ? setHandleRef : undefined} showHandle={i == handles.length - 1 ? showHandles : false} position={handle.position} left={handle.left} top={handle.top} />
                    ))}

                    {/* Título */}
                    <p>{`<<${node?.data?.objectVariant ?? 'datastore'}>>`}</p>

                    {/* Textarea */}
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={onChange}
                        onBlur={handleBlur}
                        readOnly={!isEditing}
                        placeholder={`(Particiones...)\n${node?.data?.objectVariant === 'centralBuffer' ? 'Nombre del búfer' : 'Nombre del datastore'}`}
                        rows={1}
                        maxLength={TEXT_AREA_MAX_LEN}
                        className={`nodrag nowheel w-full placeholder-gray-400 bg-transparent dark:text-white border-none outline-none resize-none text-center text-sm px-2 py-1 overflow-hidden ${
                            isEditing ? 'pointer-events-auto' : 'pointer-events-none'
                        } ${
                            !isEditing && labelError ? 'node-textarea-error' : ''
                        }`}
                    />
                    {!isEditing && labelError && (
                        <p className="node-error-text">{labelError}</p>
                    )}
                    {isEditing &&
                        <p className="w-full text-[10px] text-right text-neutral-400">{`${value.length}/${TEXT_AREA_MAX_LEN}`}</p>
                    }
                </div>
            </div>
        </div>
    )
}