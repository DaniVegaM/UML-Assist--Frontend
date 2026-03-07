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
                readOnly={!isEditing}
                placeholder={`(Particiones...)\nEnvio de señal`}
                className={`node-textarea w-4/5 pr-4 ${
                    isEditing ? 'node-textarea-editing' : 'node-textarea-readonly'
                } ${
                    !isEditing && labelError ? 'node-textarea-error' : ''
                }`}
                rows={1}
            />
            {!isEditing && labelError && (
                <p className="node-error-text">{labelError}</p>
            )}
            {isEditing &&
                <p className="char-counter char-counter-left">{`${value.length}/${TEXT_AREA_MAX_LEN}`}</p>
            }
        </div >
    )
}
