import { useCallback, useRef, useState, useEffect } from "react";
import { useCanvas } from "../../../hooks/useCanvas";
import BaseHandle from "../BaseHandle";
import { TEXT_AREA_MAX_LEN } from "../variables";
import { useHandle, type HandleData } from "../../../hooks/useHandle";
import { useTheme } from "../../../hooks/useTheme";
import { useNodeId, useReactFlow } from "@xyflow/react";
import "../styles/nodeStyles.css";
import type { DataProps } from "../../../types/canvas";

type CallBehaviorData = {
    label?: string;
    labelError?: string | null;
    mustFillLabel?: boolean;
    handles?: HandleData[];
};

export default function CallBehaviorNode({ data }: DataProps) {
    const callBehaviorData = data as CallBehaviorData;

    const labelFromNode = callBehaviorData.label ?? "";
    const labelError = callBehaviorData.labelError ?? null;
    const mustFillLabel = callBehaviorData.mustFillLabel ?? false;

    const nodeId = useNodeId();
    const { setNodes } = useReactFlow();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(labelFromNode);
    const { setIsZoomOnScrollEnabled } = useCanvas();

    const raw = value.trim();

    let partitionsText = "";
    let behaviorText = "";
    let isOpenPartitions = false;

    if (raw.startsWith("(")) {
        const closeIndex = raw.indexOf(")");

        if (closeIndex === -1) {
            isOpenPartitions = true;
            partitionsText = raw.slice(1).trim();
            behaviorText = "";
        } else {
            partitionsText = raw.slice(1, closeIndex).trim();
            behaviorText = raw.slice(closeIndex + 1).trim();
        }
    } else {
        behaviorText = raw;
    }

    const parsedPartitions = partitionsText
        ? partitionsText.split(",").map((p) => p.trim()).filter(Boolean)
        : [];

    const nextPartitionLabel = `Partición ${parsedPartitions.length + 1}...`;

    const callBehaviorGuide = {
        partitionsOk: parsedPartitions.length > 0,
        partitionsText: parsedPartitions.join(", "),
        isOpenPartitions,
        nextPartitionLabel,
        behaviorOk: behaviorText.length > 0,
        behaviorText,
    };

    // Manejo de handles
    const [showHandles, setShowHandles] = useState(false);
    const nodeRef = useRef<HTMLDivElement>(null);
    const handleRef = useRef<HTMLDivElement>(null);
    const { handles, magneticHandle } = useHandle({ 
        handleRef, 
        nodeRef,
        initialHandles: callBehaviorData.handles
    });

    // Callback ref para actualizar handleRef cuando cambie el último handle
    const setHandleRef = useCallback((node: HTMLDivElement | null) => {
        handleRef.current = node;
    }, []);
    const { isDarkMode } = useTheme();

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
        setValue(labelFromNode);
    }, [labelFromNode]);

    useEffect(() => {
        if (!nodeId) return;

        const current = value.trim();

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
    }, [nodeId, mustFillLabel, value, isEditing, setNodes, setIsZoomOnScrollEnabled]);

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

    return (
        <div
            onDoubleClick={handleDoubleClick}
            onMouseEnter={() => setShowHandles(true)}
            onMouseLeave={() => setShowHandles(false)}
            className="bg-transparent p-4"
            onMouseMove={(evt) => { magneticHandle(evt) }}
        >
            <div ref={nodeRef} className="node-rounded">
                {handles.map((handle, i) => (
                    <BaseHandle key={handle.id} id={handle.id} ref={i == handles.length - 1 ? setHandleRef : undefined} showHandle={i == handles.length - 1 ? showHandles : false} position={handle.position} left={handle.left} top={handle.top} />
                ))}
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={onChange}
                    onBlur={handleBlur}
                    onWheel={(e) => e.stopPropagation()}
                    readOnly={!isEditing}
                    placeholder={`(Particiones...)\nLlamada a un comportamiento`}
                    className={`node-textarea ${
                        isEditing ? 'node-textarea-editing' : 'node-textarea-readonly'
                    }`}
                    rows={1}
                />
                {!isEditing && labelError && (
                    <p className="node-error-text">{labelError}</p>
                )}
                <div className="w-full">
                    <div className={`flex ${isEditing ? 'justify-between' : 'justify-end'} gap-6 w-full`}>
                        {isEditing &&
                            <p className="char-counter char-counter-left">{`${value.length}/${TEXT_AREA_MAX_LEN}`}</p>
                        }
                        <div
                            className={`w-5 h-5 ${isDarkMode ? 'bg-neutral-300' : 'bg-neutral-700'}`}
                            style={{
                                clipPath: 'polygon(40% 0, 60% 0, 60% 45%, 100% 45%, 100% 100%, 80% 100%, 80% 60%, 60% 60%, 59% 100%, 40% 100%, 40% 60%, 20% 60%, 20% 100%, 0 100%, 0 45%, 40% 45%)'
                            }}
                        ></div>
                    </div>

                    {isEditing && (
                        <div className="mt-1 text-[11px] leading-5 font-mono text-center select-none">
                            <span className="text-gray-400">(</span>

                            {callBehaviorGuide.partitionsOk ? (
                                <>
                                    <span className="text-green-600">
                                        {callBehaviorGuide.partitionsText}
                                    </span>

                                    {callBehaviorGuide.isOpenPartitions && (
                                        <>
                                            <span className="text-gray-400">, </span>
                                            <span className="text-gray-400">{callBehaviorGuide.nextPartitionLabel}</span>
                                        </>
                                    )}

                                    {!callBehaviorGuide.isOpenPartitions && (
                                        <span className="text-gray-400">)</span>
                                    )}
                                </>
                            ) : (
                                <>
                                    <span className="text-gray-400">Partición 1, Partición 2...</span>
                                    <span className="text-gray-400">)</span>
                                </>
                            )}

                            <span className="text-gray-400">{" "}</span>

                            <span className={callBehaviorGuide.behaviorOk ? "text-green-600" : "text-gray-400"}>
                                {callBehaviorGuide.behaviorOk ? callBehaviorGuide.behaviorText : "Comportamiento"}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}