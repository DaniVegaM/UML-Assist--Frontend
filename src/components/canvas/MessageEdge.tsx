import React, { useState, useEffect, useRef } from 'react';
import {
    BaseEdge,
    EdgeLabelRenderer,
    getStraightPath,
    useReactFlow,
    type EdgeProps,
} from '@xyflow/react';

import ContextMenuPortal from './sequence-diagram/contextMenus/ContextMenuPortal';
import ChangeEdgeType from './sequence-diagram/contextMenus/ChangeEdgeType';

const SEQUENCE_MESSAGE_REGEX =
    /^\s*(?:(?<variable>[A-Za-z_]\w*)\s*=\s*)?(?<name>[A-Za-z_]\w*)(?:\s*\((?<params>[^)]*)\))?\s*(?::\s*(?<return>[A-Za-z_]\w*))?\s*$/;

function parseMessageParts(value: string) {
    const trimmed = value.trim();

    const draft = trimmed.match(
        /^\s*(?:[A-Za-z_]\w*\s*=\s*)?(?<name>[A-Za-z_]\w*)/
    );
    const draftName = (draft?.groups as any)?.name || '';

    const hasEquals = /=/.test(trimmed);
    const hasOpenParen = /\(/.test(trimmed);
    const hasCloseParen = /\)/.test(trimmed);
    const hasColon = /:/.test(trimmed);

    const match = trimmed.match(SEQUENCE_MESSAGE_REGEX);
    const g: any = match?.groups || {};

    const paramsText = (g.params ?? '').trim();
    const paramsOk =
        paramsText === '' ||
        paramsText.split(',').every((p) => /^[A-Za-z_]\w*$/.test(p.trim()));

    return {
        hasEquals,
        hasOpenParen,
        hasCloseParen,
        hasColon,

        variable: g.variable || '',
        name: g.name || '',
        params: paramsText,
        returnType: g.return || '',

        variableOk: !!g.variable,
        nameOk: !!g.name,
        paramsOk,
        returnOk: !!g.return,
        matchOk: !!match,
        draftName,
        draftNameOk: !!draftName,
    };
}

const MAX_MESSAGE_LENGTH = 50;

export function MessageEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    markerEnd,
    style,
    label,
    labelStyle,
    labelBgStyle,
    labelBgPadding,
    labelBgBorderRadius,
    data,
    }: EdgeProps) {
    const { setEdges } = useReactFlow();

    const [isEditing, setIsEditing] = useState(false);
    const [editingLabel, setEditingLabel] = useState('');
    const [contextMenuEvent, setContextMenuEvent] = useState<MouseEvent | null>(
        null
    );
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const SNAP_THRESHOLD = 25; //Umbral sobre eje Y para guias horizontales

    const deltaY = targetY - sourceY;
    
    // Si estamos dentro del umbral, ajustamos para que sea una linea recta horizontal
    if (Math.abs(deltaY) < SNAP_THRESHOLD) {
        targetY = sourceY;
    }

    const [edgePath, labelX, labelY] = getStraightPath({
        sourceX: sourceX,
        sourceY: sourceY,
        targetX : targetX -10,
        targetY: targetY,
    });
  
    const inputRef = useRef<HTMLInputElement | null>(null);

    const isEmpty = editingLabel.trim().length === 0;
    const parts = parseMessageParts(editingLabel);

    const validateLive = (rawValue: string) => {
        const trimmed = rawValue.trim();

        if (!trimmed) {
        setErrorMessage(null);
        return false;
        }

        const p = parseMessageParts(rawValue);

        const looksFinished =
        p.nameOk && (p.hasCloseParen || p.hasColon || (!p.hasOpenParen && !p.hasCloseParen));

        if (looksFinished && !SEQUENCE_MESSAGE_REGEX.test(trimmed)) {
        setErrorMessage('Mensaje inválido. Revisa el formato.');
        return false;
        }

        setErrorMessage(null);
        return SEQUENCE_MESSAGE_REGEX.test(trimmed);
    };

    useEffect(() => {
        if (!isEditing && (!label || label === '') && (data as any)?.mustFillLabel) {
        setEditingLabel('');
        setIsEditing(true);
        validateLive('');

        setEdges((currentEdges) =>
            currentEdges.map((e) =>
            e.id === id
                ? { ...e, data: { ...(e.data || {}), mustFillLabel: false } }
                : e
            )
        );
        }
    }, [data, label, isEditing, id, setEdges]);

    const isValidFinal = (raw: string) => {
        const trimmed = raw.trim();
        if (!trimmed) return false;
        return SEQUENCE_MESSAGE_REGEX.test(trimmed) && parseMessageParts(trimmed).paramsOk;
    };

    const startEditing = () => {
        if (isEditing) return;

        const currentText = String(label || '').trim();
        setEditingLabel(currentText);

        setEdges((eds) =>
        eds.map((e) =>
            e.id === id ? { ...e, data: { ...(e.data || {}), labelError: null } } : e
        )
        );

        setIsEditing(true);
        validateLive(currentText);
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    const finishEditing = () => {
        const trimmed = editingLabel.trim();

        if (!trimmed) {
        setEdges((eds) =>
            eds.map((e) =>
            e.id === id
                ? {
                    ...e,
                    label: '',
                    data: {
                    ...(e.data || {}),
                    labelError: 'El mensaje no puede estar vacío.',
                    },
                }
                : e
            )
        );
        setErrorMessage(null);
        setIsEditing(false);
        return;
        }

        if (isValidFinal(trimmed)) {
        const formattedLabel = trimmed;

        setEdges((eds) =>
            eds.map((e) =>
            e.id === id
                ? {
                    ...e,
                    label: formattedLabel,
                    data: { ...(e.data || {}), labelError: null },
                }
                : e
            )
        );
        setErrorMessage(null);
        setIsEditing(false);
        return;
        }

        setEdges((eds) =>
        eds.map((e) =>
            e.id === id
            ? {
                ...e,
                label: trimmed,
                data: {
                    ...(e.data || {}),
                    labelError: 'No cumple con la estructura de un mensaje válido',
                },
                }
            : e
        )
        );

        setErrorMessage(null);
        setIsEditing(false);
    };

    const onKeyDown = (evt: React.KeyboardEvent<HTMLInputElement>) => {
        if (evt.key === 'Enter') {
        finishEditing();
        } else if (evt.key === 'Escape') {
        const isMandatory = (data as any)?.mustFillLabel && (!label || label === '');
        if (!isMandatory) {
            setEdges((eds) =>
            eds.map((e) =>
                e.id === id ? { ...e, data: { ...(e.data || {}), labelError: null } } : e
            )
            );
            setErrorMessage(null);
            setIsEditing(false);
        }
        }
    };

    const onLabelChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        const value = evt.target.value.slice(0, MAX_MESSAGE_LENGTH);
        setEditingLabel(value);
        validateLive(value);
    };

    const handleContextMenu = (event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        setContextMenuEvent(event.nativeEvent);
    };

    const closeContextMenu = () => setContextMenuEvent(null);

    const ERROR_OFFSET_Y = 12;

    return (
        <>
        <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} />

        <path
            d={edgePath}
            fill="none"
            stroke="transparent"
            strokeWidth={20}
            onDoubleClick={(e) => {
            e.stopPropagation();
            startEditing();
            }}
            onContextMenu={handleContextMenu}
            className="nodrag nopan cursor-text"
        />

        <EdgeLabelRenderer>
            <div
            style={{
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                pointerEvents: isEditing || !!label ? 'auto' : 'none',
            }}
            className="nodrag nopan"
            >
            {isEditing ? (
                <div className="flex flex-col items-center">
                <div className="flex items-center justify-center gap-1 w-full">
                    <input
                    ref={inputRef}
                    autoFocus
                    value={editingLabel}
                    onChange={onLabelChange}
                    maxLength={MAX_MESSAGE_LENGTH}
                    onBlur={finishEditing}
                    onKeyDown={onKeyDown}
                    className="
                        py-0.5 px-1
                        border-none
                        rounded
                        text-xs
                        w-28
                        text-center
                        bg-gray-100
                        text-gray-900
                        dark:bg-gray-800
                        dark:text-gray-200
                        focus:outline-none
                        focus:ring-1
                        focus:ring-sky-500
                        focus:border-sky-500
                    "
                    />
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 whitespace-nowrap mt-1">
                    {editingLabel.length}/{MAX_MESSAGE_LENGTH}
                    </span>
                </div>

                {isEmpty ? (
                    <div
                    className="text-[11px] text-red-500 mt-1"
                    style={{ transform: `translateY(${ERROR_OFFSET_Y}px)` }}
                    >
                    El mensaje no puede estar vacío.
                    </div>
                ) : (
                    <>
                    {errorMessage && (
                        <div
                        className="text-[11px] text-red-500 mt-1"
                        style={{ transform: `translateY(${ERROR_OFFSET_Y}px)` }}
                        >
                        {errorMessage}
                        </div>
                    )}

                    <div className="mt-1 text-[11px] leading-5 font-mono">
                        <span
                        className={
                            parts.variableOk || parts.hasEquals ? 'text-green-600' : 'text-gray-400'
                        }
                        >
                        {parts.variableOk ? `${parts.variable} = ` : 'variable = '}
                        </span>

                        <span
                        className={
                            parts.nameOk || parts.draftNameOk ? 'text-green-600' : 'text-gray-400'
                        }
                        >
                        {parts.nameOk ? parts.name : parts.draftNameOk ? parts.draftName : 'Name'}
                        </span>

                        <span className={parts.hasOpenParen ? 'text-green-600' : 'text-gray-400'}>
                        (
                        </span>

                        <span
                        className={
                            !parts.paramsOk
                            ? 'text-red-500'
                            : parts.paramsOk && parts.hasCloseParen
                                ? 'text-green-600'
                                : 'text-gray-400'
                        }
                        >
                        {parts.params ? parts.params : 'param1, param2'}
                        </span>

                        <span className={parts.hasCloseParen ? 'text-green-600' : 'text-gray-400'}>
                        )
                        </span>

                        <span className={parts.hasColon ? 'text-green-600' : 'text-gray-400'}>
                        {' : '}
                        </span>

                        <span className={parts.returnOk ? 'text-green-600' : 'text-gray-400'}>
                        {parts.returnOk ? parts.returnType : 'ReturnType'}
                        </span>
                    </div>
                    </>
                )}
                </div>
            ) : (
                <div
                className="text-center"
                style={{
                    position: 'relative',
                    display: 'inline-block',
                }}
                >
                {label && (
                    <div
                    onDoubleClick={(e) => {
                        e.stopPropagation();
                        startEditing();
                    }}
                    style={{
                        ...labelStyle,
                        background: '#F3F4F6',
                        opacity: labelBgStyle?.fillOpacity,
                        padding: labelBgPadding
                        ? `${labelBgPadding[0]}px ${labelBgPadding[1]}px`
                        : '2px 4px',
                        fontSize: '12px',
                        borderRadius: labelBgBorderRadius,
                    }}
                    >
                    {label}
                    </div>
                )}

                {(data as any)?.labelError && (
                    <div
                    className="text-[11px] text-red-500"
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%) translateY(6px)',
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                    }}
                    >
                    {(data as any).labelError}
                    </div>
                )}
                </div>
            )}
            </div>
        </EdgeLabelRenderer>

        {contextMenuEvent && (
            <ContextMenuPortal event={contextMenuEvent} onClose={closeContextMenu}>
            <ChangeEdgeType onClose={closeContextMenu} edgeId={id} />
            </ContextMenuPortal>
        )}
        </>
    );
    }
