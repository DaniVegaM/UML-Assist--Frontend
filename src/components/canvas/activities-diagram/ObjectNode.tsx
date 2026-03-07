import { useCallback, useRef, useState, useEffect } from "react";
import { useCanvas } from "../../../hooks/useCanvas";
import BaseHandle from "../BaseHandle";
import { TEXT_AREA_MAX_LEN } from "../../canvas/variables";
import { useHandle, type HandleData } from "../../../hooks/useHandle";
import { useNodeId, useReactFlow } from "@xyflow/react";
import "../styles/nodeStyles.css";
import type { DataProps } from "../../../types/canvas";

type ObjectNodeData = {
    label?: string;
    labelError?: string | null;
    mustFillLabel?: boolean;
    handles?: HandleData[];
};

export default function ObjectNode({ data }: DataProps) {
    const nodeId = useNodeId();
    const { setNodes } = useReactFlow();
    const objectData = data as ObjectNodeData;

    const labelFromNode = objectData.label ?? "";
    const labelError = objectData.labelError ?? null;
    const mustFillLabel = objectData.mustFillLabel ?? false;

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(labelFromNode);
    const { setIsZoomOnScrollEnabled } = useCanvas();

    // Manejo de handles
    const [showHandles, setShowHandles] = useState(false);
    const nodeRef = useRef<HTMLDivElement>(null);
    const handleRef = useRef<HTMLDivElement>(null);
    const { handles, magneticHandle } = useHandle({ 
        handleRef, 
        nodeRef,
        initialHandles: objectData.handles
    });

    // Callback ref para actualizar handleRef cuando cambie el último handle
    const setHandleRef = useCallback((node: HTMLDivElement | null) => {
        handleRef.current = node;
    }, []);

    // Sincronizamos handles con node.data cuando cambien
    useEffect(() => {
        if (!nodeId) return;

        setNodes((nodes) =>
            nodes.map((n) =>
                n.id === nodeId
                    ? { ...n, data: { ...n.data, handles } }
                    : n
            )
        );
    }, [handles, nodeId, setNodes]);

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
    }, [isEditing, setIsZoomOnScrollEnabled, nodeId, setNodes]);

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

    const rawName = value.split(":")[0]?.trim() ?? "";
    const rawType = value.includes(":") ? value.split(":")[1]?.trim() ?? "" : "";

    const objectGuide = {
        nameOk: rawName.length > 0,
        typeOk: rawType.length > 0,
        name: rawName,
        type: rawType,
    };

    return (
        <div
            onDoubleClick={handleDoubleClick}
            onMouseEnter={() => setShowHandles(true)}
            onMouseLeave={() => setShowHandles(false)}
            className="bg-transparent p-4"
            onMouseMove={(evt) => { magneticHandle(evt) }}
        >
            <div ref={nodeRef} className="node-rect">
                {handles.map((handle, i) => (
                    <BaseHandle key={handle.id} id={handle.id} ref={i == handles.length - 1 ? setHandleRef : undefined} showHandle={i == handles.length - 1 ? showHandles : false} position={handle.position} left={handle.left} top={handle.top} />
                ))}

                <textarea
                    className={`node-textarea nowheel ${
                        isEditing ? 'node-textarea-editing' : 'node-textarea-readonly'
                    } ${
                        !isEditing && labelError ? 'node-textarea-error' : ''
                    }`}
                    ref={textareaRef}
                    value={value}
                    onChange={onChange}
                    onBlur={handleBlur}
                    readOnly={!isEditing}
                    placeholder={`(Particiones...)\nnombre:Tipo`}
                    rows={1}
                />
                {!isEditing && labelError && (
                    <p className="node-error-text">{labelError}</p>
                )}
                {isEditing &&
                    <p className="char-counter char-counter-right">{`${value.length}/${TEXT_AREA_MAX_LEN}`}</p>
                }
                {isEditing && (
                    <div className="mt-1 text-[11px] leading-5 font-mono text-center select-none">
                        <span className={objectGuide.nameOk ? "text-green-600" : "text-gray-400"}>
                            {objectGuide.nameOk ? objectGuide.name : "nombre"}
                        </span>

                        <span className={value.includes(":") ? "text-green-600" : "text-gray-400"}>
                            :
                        </span>

                        <span className={objectGuide.typeOk ? "text-green-600" : "text-gray-400"}>
                            {objectGuide.typeOk ? objectGuide.type : "Tipo"}
                        </span>
                    </div>
                )}
            </div>
        </div>
    )
}