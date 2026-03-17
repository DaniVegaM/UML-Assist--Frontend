import { useCanvas } from "../../../hooks/useCanvas";
import { useCallback, useEffect, useRef, useState } from "react";
import BaseHandle from "../BaseHandle";
import { Position, useNodeId, useReactFlow } from "@xyflow/react";
import { TEXT_AREA_MAX_LEN } from "../variables";
import "../styles/nodeStyles.css";
import type { DataProps } from "../../../types/canvas";

type SendSignalData = {
    label?: string;
    labelError?: string | null;
    mustFillLabel?: boolean;
};

export default function SendSignal({data}: DataProps) {

    const sendSignalData = data as SendSignalData;

    const labelFromNode = sendSignalData.label ?? "";
    const labelError = sendSignalData.labelError ?? null;
    const mustFillLabel = sendSignalData.mustFillLabel ?? false;

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(labelFromNode);
    const { setIsZoomOnScrollEnabled, isTryingToConnect } = useCanvas();
    const [showSourceHandle, setShowSourceHandle] = useState(true);
    const { setNodes } = useReactFlow();
    const nodeId = useNodeId();

    const raw = value.trim();
    const hasOpenParen = raw.startsWith("(");
    const hasCloseParen = raw.includes(")");

    let partitionsText = "";
    let signalText = "";
    let isOpenPartitions = false;

    if (raw.startsWith("(")) {
        const closeIndex = raw.indexOf(")");

        if (closeIndex === -1) {
            isOpenPartitions = true;
            partitionsText = raw.slice(1).trim();
            signalText = "";
        } else {
            partitionsText = raw.slice(1, closeIndex).trim();
            signalText = raw.slice(closeIndex + 1).trim();
        }
    } else {
        signalText = raw;
    }

    const parsedPartitions = partitionsText
        ? partitionsText.split(",").map((p) => p.trim()).filter(Boolean)
        : [];

    const nextPartitionLabel = `P${parsedPartitions.length + 1}...`;
    const hasTrailingComma = /,\s*$/.test(partitionsText);

    const sendSignalGuide = {
        partitionsOk: parsedPartitions.length > 0,
        partitionsText: parsedPartitions.join(", "),
        isOpenPartitions,
        nextPartitionLabel,
        hasTrailingComma,
        signalOk: signalText.length > 0,
        signalText,
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
    }, [nodeId, mustFillLabel, value, isEditing, setNodes, setIsZoomOnScrollEnabled]);

    useEffect(() => {
        setValue(labelFromNode);
    }, [labelFromNode]);

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
            className="node-signal"
            style={{
                clipPath: 'polygon(75% 0, 100% 50%, 75% 100%, 0 100%, 0 0)',
                padding: '10px',
                marginRight: '-4px',
                marginLeft: '-2px',
            }}
            onMouseEnter={() => setShowSourceHandle(true)}
            onMouseLeave={() => setShowSourceHandle(false)}
        >
            <BaseHandle id={0} position={Position.Right} showHandle={showSourceHandle && !isTryingToConnect} className="!absolute !right-1" />
            <BaseHandle id={1} position={Position.Left} showHandle={isTryingToConnect} className="!absolute !left-0" />
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
                placeholder={`(Particiones...)\nEnvio de señal`}
                className={`node-textarea w-4/5 pr-4 ${
                    isEditing ? 'node-textarea-editing' : 'node-textarea-readonly'
                }`}
                rows={1}
            />
            {!isEditing && labelError && value.trim() === "" && (
                <p className="text-[11px] text-red-600 text-center mt-1">{labelError}</p>
            )}
            {isEditing &&
                <p className="char-counter char-counter-left">{`${value.length}/${TEXT_AREA_MAX_LEN}`}</p>
            }
            {isEditing && (
                <div className="mt-1 text-[11px] leading-5 font-mono text-center select-none">
                    <span className={hasOpenParen ? "text-green-600" : "text-gray-400"}>(</span>

                    {sendSignalGuide.partitionsOk ? (
                        <>
                            <span className="text-green-600">
                                {sendSignalGuide.partitionsText}
                            </span>

                            {(sendSignalGuide.isOpenPartitions || sendSignalGuide.hasTrailingComma) && (
                                <>
                                    <span className="text-gray-400">, </span>
                                    <span className="text-gray-400">{sendSignalGuide.nextPartitionLabel}</span>
                                </>
                            )}

                            {!sendSignalGuide.isOpenPartitions && !sendSignalGuide.hasTrailingComma && (
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

                    <span className={sendSignalGuide.signalOk ? "text-green-600" : "text-gray-400"}>
                        {sendSignalGuide.signalOk ? sendSignalGuide.signalText : "Señal"}
                    </span>
                </div>
            )}
        </div >
    )
}
