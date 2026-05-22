import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
    BaseEdge,
    EdgeLabelRenderer,
    getStraightPath,
    useReactFlow,
    type EdgeProps as ReactFlowEdgeProps,
} from '@xyflow/react';

import ContextMenuPortal from './sequence-diagram/contextMenus/ContextMenuPortal';
import ChangeEdgeType from './sequence-diagram/contextMenus/ChangeEdgeType';
import EdgeSuggestionTooltip from './EdgeSuggestionTooltip';
import type { EdgeDataProps } from '../../types/canvas';
import { useUndoableEdgeLabel } from '../../hooks/useNodeHistory';

// Extend the original EdgeProps to properly type our custom data
export type MessageEdgeProps = Omit<ReactFlowEdgeProps, 'data'> & {
    data?: EdgeDataProps;
};

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
        paramsText.split(',').every((p: string) => /^[A-Za-z_]\w*$/.test(p.trim()));

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

const MAX_MESSAGE_LENGTH = 100;

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
    }: MessageEdgeProps) {
    const { setEdges } = useReactFlow();

    const [isEditing, setIsEditing] = useState(false);
    const [editingLabel, setEditingLabel] = useState('');
    const [contextMenuEvent, setContextMenuEvent] = useState<MouseEvent | null>(
        null
    );
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showSuggestion, setShowSuggestion] = useState(false);
    const [portalPos, setPortalPos] = useState<{ x: number; y: number } | null>(null);
    const { begin, commit } = useUndoableEdgeLabel();

    // Track input position with rAF so the portal tooltip always stays above the input
    // even when the user pans or zooms the canvas.
    useEffect(() => {
        if (!isEditing) { setPortalPos(null); return; }
        let animId: number;
        let lastX = -1, lastY = -1;
        const track = () => {
            if (inputRef.current) {
                const r = inputRef.current.getBoundingClientRect();
                const x = Math.round(r.left + r.width / 2);
                const y = Math.round(r.top);
                if (x !== lastX || y !== lastY) {
                    setPortalPos({ x, y });
                    lastX = x; lastY = y;
                }
            }
            animId = requestAnimationFrame(track);
        };
        animId = requestAnimationFrame(track);
        return () => cancelAnimationFrame(animId);
    }, [isEditing]);

    const clearSuggestion = () => {
        setEdges((eds) =>
            eds.map((e) => {
                if (e.id === id) {
                    const dataWithoutSuggestion = { ...(e.data || {}) } as Record<string, unknown>;
                    delete dataWithoutSuggestion.suggestion;
                    return { ...e, data: dataWithoutSuggestion };
                }
                return e;
            })
        );
        setShowSuggestion(false);
    };

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
        begin(currentText);
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
        commit(trimmed);

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
                    y: sourceY,
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
                    data: { ...(e.data || {}), labelError: null, y: sourceY },
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
                    y: sourceY,
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
            strokeWidth={50}
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
                <div className="flex items-center justify-center relative">
                {/* ── Input only — tooltip renders in a body portal above all nodes ── */}
                <input
                    ref={inputRef}
                    autoFocus
                    value={editingLabel}
                    onChange={onLabelChange}
                    maxLength={MAX_MESSAGE_LENGTH}
                    onBlur={finishEditing}
                    onKeyDown={onKeyDown}
                    className={`
                        py-1 px-2.5
                        border rounded-lg shadow-sm
                        text-xs w-36
                        text-center
                        bg-white dark:bg-gray-900
                        text-gray-900 dark:text-gray-200
                        focus:outline-none focus:ring-2
                        transition-colors duration-150
                        ${errorMessage
                            ? 'border-red-400 dark:border-red-600 focus:ring-red-400 focus:border-red-400'
                            : parts.matchOk && !isEmpty
                                ? 'border-emerald-400 dark:border-emerald-600 focus:ring-emerald-400 focus:border-emerald-400'
                                : 'border-gray-300 dark:border-gray-600 focus:ring-sky-500 focus:border-sky-500'
                        }
                    `}
                />
                <span className="text-[9px] text-gray-300 dark:text-gray-600 whitespace-nowrap absolute -right-7 top-1.5 tabular-nums">
                    {editingLabel.length}/{MAX_MESSAGE_LENGTH}
                </span>
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
                    onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleContextMenu(e);
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
                        maxWidth: '200px',       
                        wordWrap: 'break-word',
                        border: (data as any)?.labelError ? '1px solid #ef4444' : 'none',
                        color: (data as any)?.labelError ? '#ef4444' : 'inherit'
                    }}
                    >
                    {label}
                    </div>
                )}
                </div>
            )}
            </div>

            {data?.suggestion && (
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX + 20}px, ${labelY - 20}px)`,
                        pointerEvents: 'all',
                    }}
                    className="nodrag nopan"
                >
                    <button
                        onDoubleClick={(e) => e.stopPropagation()}
                        onClick={(e) => { e.stopPropagation(); setShowSuggestion(prev => !prev); }}
                        title="Ver sugerencia de IA"
                        className="w-5 h-5 rounded-full bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold flex items-center justify-center shadow-md transition-colors cursor-pointer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-6" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0m-9 5.25h.008v.008H12z"/>
                        </svg>
                    </button>
                </div>
            )}
        </EdgeLabelRenderer>

        <EdgeSuggestionTooltip
            isVisible={showSuggestion}
            suggestionText={typeof data?.suggestion === 'string' ? data.suggestion : ''}
            labelX={labelX}
            labelY={labelY}
            onMinimize={() => setShowSuggestion(false)}
            onDiscard={clearSuggestion}
        />

        {/* ── Structure helper — rendered in document.body to always appear above all nodes ── */}
        {isEditing && portalPos && createPortal(
            <div
                style={{
                    position: 'fixed',
                    top: portalPos.y - 10,
                    left: portalPos.x,
                    transform: 'translate(-50%, -100%)',
                    zIndex: 99999,
                    pointerEvents: 'none',
                    fontFamily: 'inherit',
                }}
            >
                <div className="relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl shadow-2xl px-3 pt-2.5 pb-2.5 min-w-max">

                    {/* Header */}
                    <div className="flex items-center gap-1.5 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-sky-500 shrink-0">
                            <path d="M12 .75a8.25 8.25 0 1 0 0 16.5A8.25 8.25 0 0 0 12 .75Zm.75 4.5a.75.75 0 0 0-1.5 0v4.69L9.47 8.19a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.06 0l2.25-2.25a.75.75 0 0 0-1.06-1.06L12.75 9.44V5.25Z" />
                        </svg>
                        <span className="text-[9px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none">
                            Estructura del mensaje
                        </span>
                        {parts.matchOk && !errorMessage && !isEmpty && (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-emerald-500 ml-1">
                                <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                            </svg>
                        )}
                    </div>

                    {/* Error banner */}
                    {!isEmpty && errorMessage && (
                        <div className="flex items-center gap-1 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-[10px] px-2 py-1 rounded-lg mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 shrink-0">
                                <path fillRule="evenodd" d="M6.701 2.25c.577-1 2.02-1 2.598 0l5.196 9a1.5 1.5 0 0 1-1.299 2.25H2.804a1.5 1.5 0 0 1-1.3-2.25l5.197-9ZM8 4a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                            </svg>
                            {errorMessage}
                        </div>
                    )}

                    {isEmpty ? (
                        <div className="flex flex-col gap-2">
                            {/* Mandatory warning with book reason */}
                            <div className="flex items-start gap-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-2 py-1.5">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 text-amber-500 shrink-0 mt-0.5">
                                    <path fillRule="evenodd" d="M6.701 2.25c.577-1 2.02-1 2.598 0l5.196 9a1.5 1.5 0 0 1-1.299 2.25H2.804a1.5 1.5 0 0 1-1.3-2.25l5.197-9ZM8 4a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                                </svg>
                                <span className="text-[10px] text-amber-700 dark:text-amber-400 leading-tight">
                                    <span className="font-semibold">Nombre obligatorio.</span> Los mensajes deben identificarse por un nombre para expresar la operación que se invoca.
                                </span>
                            </div>
                            {/* Clean format without [ ] */}
                            <div className="flex items-center gap-0.5 font-mono text-[11px]">
                                <span className="px-1 py-0.5 rounded border border-dashed border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600">var =</span>
                                <span className="px-1.5 py-0.5 rounded border border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 font-semibold mx-1">nombre</span>
                                <span className="px-1 py-0.5 rounded border border-dashed border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600">(params)</span>
                                <span className="px-1 py-0.5 rounded border border-dashed border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600 ml-0.5">: tipo</span>
                            </div>
                            <div className="flex items-center gap-3 text-[9px] text-gray-400 dark:text-gray-600">
                                <span className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 inline-block" />
                                    nombre requerido
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 inline-block" />
                                    resto opcional
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-0.5 font-mono text-[11px]">
                                <span className={`px-1.5 py-0.5 rounded-md border transition-all duration-150 ${
                                    parts.variableOk
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700'
                                        : 'bg-gray-50 text-gray-300 border-gray-100 dark:bg-gray-800 dark:text-gray-600 dark:border-gray-700'
                                }`}>
                                    {parts.variableOk ? parts.variable : 'var'}
                                </span>
                                <span className={`px-0.5 transition-colors duration-150 ${
                                    parts.variableOk ? 'text-emerald-500' : 'text-gray-200 dark:text-gray-700'
                                }`}>=</span>
                                <span className={`px-1.5 py-0.5 rounded-md border font-semibold transition-all duration-150 ${
                                    parts.nameOk || parts.draftNameOk
                                        ? 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-700'
                                        : 'bg-amber-50 text-amber-500 border-amber-200 dark:bg-amber-900/20 dark:text-amber-500 dark:border-amber-800'
                                }`}>
                                    {parts.nameOk ? parts.name : parts.draftNameOk ? parts.draftName : 'nombre*'}
                                </span>
                                <span className={`px-0.5 transition-colors duration-150 ${
                                    parts.hasOpenParen ? 'text-sky-500 dark:text-sky-400' : 'text-gray-200 dark:text-gray-700'
                                }`}>(</span>
                                <span className={`px-1.5 py-0.5 rounded-md border transition-all duration-150 ${
                                    !parts.paramsOk
                                        ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                                        : parts.hasCloseParen
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700'
                                            : 'bg-gray-50 text-gray-300 border-gray-100 dark:bg-gray-800 dark:text-gray-600 dark:border-gray-700'
                                }`}>
                                    {parts.params ? parts.params : 'params'}
                                </span>
                                <span className={`px-0.5 transition-colors duration-150 ${
                                    parts.hasCloseParen ? 'text-sky-500 dark:text-sky-400' : 'text-gray-200 dark:text-gray-700'
                                }`}>)</span>
                                <span className={`px-0.5 transition-colors duration-150 ${
                                    parts.hasColon ? 'text-sky-500 dark:text-sky-400' : 'text-gray-200 dark:text-gray-700'
                                }`}>:</span>
                                <span className={`px-1.5 py-0.5 rounded-md border transition-all duration-150 ${
                                    parts.returnOk
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700'
                                        : 'bg-gray-50 text-gray-300 border-gray-100 dark:bg-gray-800 dark:text-gray-600 dark:border-gray-700'
                                }`}>
                                    {parts.returnOk ? parts.returnType : 'tipo'}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-[9px] text-gray-400 dark:text-gray-600">
                                <span className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 inline-block" />
                                    nombre requerido
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                                    válido
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                                    inválido
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Arrow pointing down toward the input */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[7px] w-3.5 h-3.5 bg-white dark:bg-gray-900 border-b border-r border-gray-100 dark:border-gray-700 rotate-45" />
                </div>
            </div>,
            document.body
        )}

        {contextMenuEvent && (
            <ContextMenuPortal event={contextMenuEvent} onClose={closeContextMenu}>
            <ChangeEdgeType onClose={closeContextMenu} edgeId={id} />
            </ContextMenuPortal>
        )}
        </>
    );
    }
