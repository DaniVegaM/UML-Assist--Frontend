import { Position, useNodeId, useReactFlow } from "@xyflow/react";
import BaseHandle from "../BaseHandle";
import { useCanvas } from "../../../hooks/useCanvas";
import { useCallback, useEffect, useRef, useState } from "react";
import { TEXT_AREA_MAX_LEN } from "../variables";
import "../styles/nodeStyles.css";
import type { DataProps } from "../../../types/canvas";

type AcceptEventData = {
    label?: string;
    labelError?: string | null;
    mustFillLabel?: boolean;
};

export default function AcceptEvent({data}: DataProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const acceptEventData = data as AcceptEventData;

    const labelFromNode = acceptEventData.label ?? "";
    const labelError = acceptEventData.labelError ?? null;
    const mustFillLabel = acceptEventData.mustFillLabel ?? false;

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

        setNodes((nodes) =>
            nodes.map((n) =>
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
                clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 20% 50%)',
                padding: '10px',
                marginRight: '-2px',
                marginLeft: '-20px',
            }}
            onMouseEnter={() => setShowSourceHandle(true)}
            onMouseLeave={() => setShowSourceHandle(false)}
        >
            <BaseHandle id={0} position={Position.Right} showHandle={showSourceHandle && !isTryingToConnect} className="!absolute !right-1"/>
            <BaseHandle id={1} position={Position.Left} showHandle={isTryingToConnect} className="!absolute !left-9"/>
            <textarea
                ref={textareaRef}
                value={value}
                onChange={onChange}
                onBlur={handleBlur}
                onWheel={(e) => e.stopPropagation()}
                readOnly={!isEditing}
                placeholder={`(Particiones...)\nEvento general`}
                className={`node-textarea w-4/5 pl-4 ${
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
                <p className="char-counter char-counter-right">{`${value.length}/${TEXT_AREA_MAX_LEN}`}</p>
            }
        </div >
    )
}
