import { useCallback, useEffect, useRef, useState } from "react";
import { useCanvas } from "../../../hooks/useCanvas";
import { Position, useNodeId, useReactFlow } from "@xyflow/react";
import BaseHandle from "../BaseHandle";
import { TEXT_AREA_MAX_LEN } from "../variables";
import { useTheme } from "../../../hooks/useTheme";
import "../styles/nodeStyles.css";
import type { DataProps } from "../../../types/canvas";

type AcceptTimeEventData = {
    label?: string;
    labelError?: string | null;
    mustFillLabel?: boolean;
};

export default function AcceptTimeEvent({data}: DataProps) {
    const [isEditing, setIsEditing] = useState(false);

    const acceptTimeEventData = data as AcceptTimeEventData;

    const labelFromNode = acceptTimeEventData.label ?? "";
    const labelError = acceptTimeEventData.labelError ?? null;
    const mustFillLabel = acceptTimeEventData.mustFillLabel ?? false;
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [value, setValue] = useState(labelFromNode);
    const { setIsZoomOnScrollEnabled, isTryingToConnect } = useCanvas();
    const [showSourceHandle, setShowSourceHandle] = useState(true);
    const { isDarkMode } = useTheme();
    const { setNodes } = useReactFlow();
    const nodeId = useNodeId();

    const raw = value.trim();
    const hasOpenParen = raw.startsWith("(");
    const hasCloseParen = raw.includes(")");

    let partitionsText = "";
    let eventText = "";
    let isOpenPartitions = false;

    if (raw.startsWith("(")) {
        const closeIndex = raw.indexOf(")");

        if (closeIndex === -1) {
            isOpenPartitions = true;
            partitionsText = raw.slice(1).trim();
            eventText = "";
        } else {
            partitionsText = raw.slice(1, closeIndex).trim();
            eventText = raw.slice(closeIndex + 1).trim();
        }
    } else {
        eventText = raw;
    }

    const parsedPartitions = partitionsText
        ? partitionsText.split(",").map((p) => p.trim()).filter(Boolean)
        : [];

    const nextPartitionLabel = `P${parsedPartitions.length + 1}...`;
    const hasTrailingComma = /,\s*$/.test(partitionsText);

    const acceptTimeGuide = {
        partitionsOk: parsedPartitions.length > 0,
        partitionsText: parsedPartitions.join(", "),
        isOpenPartitions,
        nextPartitionLabel,
        hasTrailingComma, 
        eventOk: eventText.length > 0,
        eventText,
    };

    const onChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (!nodeId) return;

        let newValue = evt.target.value;

        if (newValue.length > TEXT_AREA_MAX_LEN) {
            newValue = newValue.slice(0, TEXT_AREA_MAX_LEN);
        }

        const normalizedValue = newValue.trim() ? newValue : "";

        setValue(normalizedValue);

        setNodes((nodes) =>
            nodes.map((n) =>
                n.id === nodeId
                    ? {
                        ...n,
                        data: {
                            ...n.data,
                            label: normalizedValue,
                            labelError: normalizedValue ? null : "No puede estar vacío.",
                        },
                    }
                    : n
            )
        );
    }, [nodeId, setNodes]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [value]);

    useEffect(() => {
        if (!nodeId || !isEditing) return;

        setNodes(nodes => nodes.map(n =>
            n.id === nodeId
                ? { ...n, data: { ...n.data, label: value } }
                : n
        ));
    }, [nodeId, setNodes, value, isEditing]);

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
                                labelError: n.data.labelError ?? null,
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
            className="flex flex-col items-center justify-center transition-all duration-150 relative"
            style={{
                marginRight: '-10px',
                marginLeft: '-10px',
            }}
            onMouseEnter={() => setShowSourceHandle(true)}
            onMouseLeave={() => setShowSourceHandle(false)}
        >
            <div className="z-10">
                <div
                    className={`relative w-12 h-6 ${isDarkMode ? 'bg-neutral-800' : 'bg-gray-400'}`}
                    style={{
                        clipPath: 'polygon(50% 100%, 100% 0, 0 0)',
                    }}
                ></div>
                <div
                    className={`relative w-12 h-6 ${isDarkMode ? 'bg-neutral-800' : 'bg-gray-400'}`}
                    style={{
                        clipPath: 'polygon(0 100%, 100% 100%, 50% 0)',
                    }}
                ></div>
            </div>

            <BaseHandle id={0} position={Position.Right} showHandle={showSourceHandle && !isTryingToConnect} className="!absolute !right-9 !top-6" />
            <BaseHandle id={1} position={Position.Left} showHandle={isTryingToConnect} className="!absolute !left-12 !top-6" />

            {/* Textarea debajo, sin position absolute */}
            <div className="mt-2 w-full flex flex-col items-center">
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={onChange}
                    onBlur={handleBlur}
                    onWheel={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            textareaRef.current?.blur();
                        }
                    }}
                    readOnly={!isEditing}
                    placeholder={`(Particiones...)\nEvento de tiempo`}
                    className={`node-textarea max-w-[120px] w-4/5 ${
                        isEditing ? 'node-textarea-editing' : 'node-textarea-readonly'
                    }`}
                />
                {!isEditing && labelError && value.trim() === "" && (
                    <p className="node-error-text mt-1 text-center">{labelError}</p>
                )}
                {isEditing &&
                    <p className="char-counter char-counter-right">{`${value.length}/${TEXT_AREA_MAX_LEN}`}</p>
                }
                {isEditing && (
                    <div className="mt-1 text-[11px] leading-5 font-mono text-center select-none">
                        <span className={hasOpenParen ? "text-green-600" : "text-gray-400"}>(</span>

                        {acceptTimeGuide.partitionsOk ? (
                            <>
                                <span className="text-green-600">
                                    {acceptTimeGuide.partitionsText}
                                </span>

                                {(acceptTimeGuide.isOpenPartitions || acceptTimeGuide.hasTrailingComma) && (
                                    <>
                                        <span className="text-gray-400">, </span>
                                        <span className="text-gray-400">{acceptTimeGuide.nextPartitionLabel}</span>
                                    </>
                                )}

                                {!acceptTimeGuide.isOpenPartitions && !acceptTimeGuide.hasTrailingComma && (
                                    <span className={hasCloseParen ? "text-green-600" : "text-gray-400"}>)</span>
                                )}
                            </>
                        ) : (
                            <>
                                <span className="text-gray-400">P1, P2...</span>
                                <span className={hasCloseParen ? "text-green-600" : "text-gray-400"}>)</span>
                            </>
                        )}

                        <span className="text-gray-400">{" "}</span>

                        <span className={acceptTimeGuide.eventOk ? "text-green-600" : "text-gray-400"}>
                            {acceptTimeGuide.eventOk ? acceptTimeGuide.eventText : "Tiempo"}
                        </span>
                    </div>
                )}
            </div>
        </div>
    )
}
