import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useCanvas } from "../../../hooks/useCanvas";
import { LIFE_LINE_MAX_LEN_TEXT, LIFE_LINE_BASE_HEIGHT, LIFE_LINE_HEIGHT_PER_HANDLE } from "../variables";
import { useSequenceDiagram } from "../../../hooks/useSequenceDiagram";
import { useNodeId, useReactFlow, useUpdateNodeInternals, useViewport } from "@xyflow/react";
import BaseHandle from "../BaseHandle";
import ChangeHandleType from "./contextMenus/ChangeHandleType";
import ContextMenuPortal from "./contextMenus/ContextMenuPortal";
import DeleteIcon from "../shared/DeleteIcon";
import { useHandle, type HandleData } from "../../../hooks/useHandle";
import "../styles/nodeStyles.css";
import type { DataProps } from "../../../types/canvas";
import NodeSuggestionTooltip from "../NodeSuggestionTooltip";
import { selectLifeLineHeaderIcon, type LifeLineHeaderIcon } from "../../../utils/sweetAlert";

// UML spec (UML@Classroom §6.1): lifeline head format is roleName:Class
// Rules: roleName alone (no colon), :Class (colon required), roleName:Class,
//        roleName[selector]:Class, or the keyword "self".
const LIFELINE_HEADER_REGEX =
    /^\s*(?:self|(?:[A-Za-z_]\w*(?:\[[^\]]*\])?\s*:\s*[A-Za-z_]\w*)|(?:[A-Za-z_]\w*(?:\[[^\]]*\])?)|(?::\s*[A-Za-z_]\w*))\s*$/;

function parseLifelineHeader(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed) return { isEmpty: true, valid: false };
    if (trimmed === 'self') return { isEmpty: false, isSelf: true, valid: true };

    const hasColon = trimmed.includes(':');
    const selectorMatch = trimmed.match(/\[([^\]]*)\]/);
    const hasSelector = !!selectorMatch;
    const selector = selectorMatch?.[1] ?? '';

    if (hasColon) {
        const colonIdx = trimmed.indexOf(':');
        const beforeColon = trimmed.slice(0, colonIdx).replace(/\[[^\]]*\]/, '').trim();
        const afterColon = trimmed.slice(colonIdx + 1).trim();
        const roleOk = beforeColon === '' || /^[A-Za-z_]\w*$/.test(beforeColon);
        const classOk = /^[A-Za-z_]\w*$/.test(afterColon);
        return {
            isEmpty: false, hasColon, hasSelector, selector,
            role: beforeColon, className: afterColon,
            roleOk, classOk,
            valid: LIFELINE_HEADER_REGEX.test(trimmed),
        };
    }

    const role = trimmed.replace(/\[[^\]]*\]/, '').trim();
    return {
        isEmpty: false, hasColon: false, hasSelector, selector,
        role, className: '',
        roleOk: /^[A-Za-z_]\w*$/.test(role), classOk: false,
        valid: LIFELINE_HEADER_REGEX.test(trimmed),
    };
}

export default function LifeLine({ data }: DataProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(data.label || "");
    const valueRef = useRef(value);
    valueRef.current = value;
    const { setIsZoomOnScrollEnabled } = useCanvas();
    const { setMaxHandlesCount, maxHandlesCount } = useSequenceDiagram();
    const nodeId = useNodeId();
    const { setNodes, setEdges } = useReactFlow();
    const updateNodeInternals = useUpdateNodeInternals();
    const { zoom } = useViewport();

    const [showSuggestion, setShowSuggestion] = useState(false);
    const [headerIcon, setHeaderIcon] = useState<LifeLineHeaderIcon>((data?.headerIcon as LifeLineHeaderIcon) || 'rectangle');
    const prevHeaderIconRef = useRef<LifeLineHeaderIcon>(headerIcon);
    const [tooltipPortalPos, setTooltipPortalPos] = useState<{ x: number; y: number } | null>(null);

    useEffect(() => {
        if (!isEditing) { setTooltipPortalPos(null); return; }
        let animId: number;
        let lastX = -1, lastY = -1;
        const track = () => {
            if (textareaRef.current) {
                const r = textareaRef.current.getBoundingClientRect();
                const x = Math.round(r.left + r.width / 2);
                const y = Math.round(r.top);
                if (x !== lastX || y !== lastY) {
                    setTooltipPortalPos({ x, y });
                    lastX = x; lastY = y;
                }
            }
            animId = requestAnimationFrame(track);
        };
        animId = requestAnimationFrame(track);
        return () => cancelAnimationFrame(animId);
    }, [isEditing]);

    const clearSuggestion = useCallback(() => {
        if (!nodeId) return;
        setShowSuggestion(false);
        setNodes(nodes => nodes.map(n =>
            n.id === nodeId ? { ...n, data: { ...n.data, suggestion: undefined } } : n
        ));
    }, [nodeId, setNodes]);

    // Manejo de handles
    const [showHandles, setShowHandles] = useState(false);
    const nodeRef = useRef<HTMLDivElement>(null);
    const handleRef = useRef<HTMLDivElement>(null);
    const isSyncingHandles = useRef(false);
    const isSyncingDestroyY = useRef(false);
    const isSyncingHeaderIcon = useRef(false);
    const isSyncingValue = useRef(false);
    const { handles, setHandles, magneticHandle } = useHandle({ handleRef, nodeRef, disableMagneticPoints: true, disableBottom: true, disableTop: true, disableLeft: true, allowSelfConnection: true, initialHandles: data?.handles as HandleData[] | undefined});
    const handlesRef = useRef(handles);

    // Estados para el menú contextual y destrucción
    const [contextMenuEvent, setContextMenuEvent] = useState<MouseEvent | null>(null);
    const [selectedHandle, setSelectedHandle] = useState<string | null>(null);
    const [selectedHandleIndex, setSelectedHandleIndex] = useState<number | null>(null);
    const [showNodeContextMenu, setShowNodeContextMenu] = useState(false);
    const destroyYRef = useRef<number | null>(null);
    const [destroyY, setDestroyY] = useState<number | null>(() => {
        if (typeof (data as { destroyY?: number })?.destroyY === 'number') {
            return (data as { destroyY: number }).destroyY;
        }
        // Migración desde el formato antiguo (destroyHandleIndex)
        if (typeof data?.destroyHandleIndex === 'number' && data?.handles) {
            const h = (data.handles as HandleData[])[data.destroyHandleIndex];
            if (h?.top !== undefined && h?.top !== null) {
                return typeof h.top === 'string' ? parseInt(h.top) : h.top;
            }
        }
        return null;
    });
    destroyYRef.current = destroyY;
    const [xMarkMenuEvent, setXMarkMenuEvent] = useState<MouseEvent | null>(null);
    const contextMenuYRef = useRef<number | null>(null);

    // Callback ref para actualizar handleRef cuando cambie el último handle
    const setHandleRef = useCallback((node: HTMLDivElement | null) => {
        handleRef.current = node;
    }, []);

    // Mantiene handlesRef al día para que el effect de carga pueda comparar sin depender del estado
    useEffect(() => {
        handlesRef.current = handles;
    }, [handles]);

    // Sincronizamos handles con node.data cuando cambien (solo si no estamos sincronizando desde data)
    useEffect(() => {
        if (!nodeId || isSyncingHandles.current) return;
        isSyncingValue.current = true;
        setNodes(nodes => nodes.map(n =>
            n.id === nodeId
                ? { ...n, data: { ...n.data, handles, label: value, headerIcon } }
                : n
        ));
        // Actualizar el máximo de handles en el contexto
        setMaxHandlesCount(prev => Math.max(prev, handles.length));
        const t = setTimeout(() => { isSyncingValue.current = false; }, 0);
        return () => clearTimeout(t);
    }, [handles, nodeId, setNodes, value, headerIcon, setMaxHandlesCount]);

    // Sincronizar handles cuando data.handles cambie (al cargar diagrama).
    // Usa handlesRef para la comparación — sin handles en las deps para evitar el ciclo bidireccional.
    useEffect(() => {
        if (data?.handles && data.handles.length > 0) {
            const dataHandlesStr = JSON.stringify(data.handles);
            const currentHandlesStr = JSON.stringify(handlesRef.current);
            if (currentHandlesStr !== dataHandlesStr) {
                isSyncingHandles.current = true;
                setHandles(data.handles as HandleData[]);
                setTimeout(() => {
                    isSyncingHandles.current = false;
                }, 0);
            }
        }
    }, [data?.handles, setHandles]);

    // Sincronizamos destroyY y hasDestruction con node.data cuando cambie
    useEffect(() => {
        if (!nodeId || isSyncingDestroyY.current) return;
        setNodes(nodes => nodes.map(n =>
            n.id === nodeId
                ? { ...n, data: { ...n.data, destroyY, hasDestruction: destroyY !== null } }
                : n
        ));
    }, [destroyY, nodeId, setNodes]);

    // Sincronizar destroyY cuando data.destroyY cambie (al cargar diagrama)
    // Usa destroyYRef para comparar sin hacer destroyY una dep — evita ciclo con el effect de escritura.
    useEffect(() => {
        const dataDestroyY = (data as { destroyY?: number | null })?.destroyY;
        if (dataDestroyY !== undefined && dataDestroyY !== destroyYRef.current) {
            isSyncingDestroyY.current = true;
            setDestroyY(dataDestroyY);
            setTimeout(() => {
                isSyncingDestroyY.current = false;
            }, 0);
        }
    }, [(data as { destroyY?: number | null })?.destroyY]);

    // Sincronizar label cuando data.label cambie (al cargar diagrama)
    // Usa valueRef para comparar sin hacer value una dep — evita ciclo con el effect de escritura.
    // El flag isSyncingValue evita revertir mientras el effect de escritura acaba de actualizar data.
    useEffect(() => {
        if (isSyncingValue.current) return;
        if (data?.label !== undefined && data.label !== valueRef.current && !isEditing) {
            setValue(data.label);
        }
    }, [data?.label, isEditing]);

    useEffect(() => {
        if (data?.headerIcon && data.headerIcon !== prevHeaderIconRef.current) {
            isSyncingHeaderIcon.current = true;
            setHeaderIcon(data.headerIcon as LifeLineHeaderIcon);
            prevHeaderIconRef.current = data.headerIcon as LifeLineHeaderIcon;
            setTimeout(() => {
                isSyncingHeaderIcon.current = false;
            }, 0);
        }
    }, [data?.headerIcon]);

    // Forzar actualización de handles cuando se cargan datos con handles
    useEffect(() => {
        if (nodeId && data?.handles && data.handles.length > 0) {
            // Pequeño delay para asegurar que el DOM esté listo
            const timeoutId = setTimeout(() => {
                updateNodeInternals(nodeId);
            }, 0);
            return () => clearTimeout(timeoutId);
        }
    }, [nodeId, data?.handles, updateNodeInternals]);

    const onChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (evt.target.value.length >= LIFE_LINE_MAX_LEN_TEXT) {
            setValue(evt.target.value.trim().slice(0, LIFE_LINE_MAX_LEN_TEXT));
        } else {
            setValue(evt.target.value);
        }
    }, []);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [value]);

    const handleDoubleClick = useCallback(() => {
        if (!isEditing) {
            setIsEditing(true);
            setIsZoomOnScrollEnabled(false);
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.focus();
                    textareaRef.current.select();
                }
            }, 0);
        }
    }, [isEditing, setIsZoomOnScrollEnabled]);

    const handleBlur = useCallback(() => {
        setIsEditing(false);
        setIsZoomOnScrollEnabled(true);
    }, [setIsZoomOnScrollEnabled]);

    useEffect(() => {
        if (nodeId) {
            updateNodeInternals(nodeId);
        }
    }, [handles, nodeId, updateNodeInternals]);

    const handleContextMenu = (event: React.MouseEvent, handleId: string, handleIndex: number) => {
        event.preventDefault();
        event.stopPropagation();
        // Capturar posición Y relativa al nodeRef en coordenadas locales (sin zoom)
        if (nodeRef.current) {
            const bounds = nodeRef.current.getBoundingClientRect();
            contextMenuYRef.current = (event.clientY - bounds.top) / zoom;
        }
        setContextMenuEvent(event.nativeEvent);
        setSelectedHandle(handleId);
        setSelectedHandleIndex(handleIndex);
        setShowNodeContextMenu(false);
    };

    const handleNodeContextMenu = (event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        setContextMenuEvent(event.nativeEvent);
        setSelectedHandle(null);
        setSelectedHandleIndex(null);
        setShowNodeContextMenu(true);
    };

    const closeContextMenu = () => {
        setContextMenuEvent(null);
        setSelectedHandle(null);
        setSelectedHandleIndex(null);
        setShowNodeContextMenu(false);
    };

    const handleHeaderIconContextMenu = useCallback(async (event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();

        const selectedIcon = await selectLifeLineHeaderIcon(headerIcon);
        
        if (selectedIcon === 'DELETE') {
            if (nodeId) {
                setNodes(prev => prev.filter(n => n.id !== nodeId));
                setEdges(prev => prev.filter(e => e.source !== nodeId && e.target !== nodeId));
            }
            return;
        }

        if (selectedIcon) {
            isSyncingHeaderIcon.current = true;
            setHeaderIcon(selectedIcon);
            prevHeaderIconRef.current = selectedIcon;
            setTimeout(() => {
                isSyncingHeaderIcon.current = false;
            }, 0);
        }
    }, [headerIcon, nodeId, setNodes, setEdges]);

    // Callback para cuando se selecciona el evento de destrucción
    const handleDestroyEvent = useCallback((action: 'destroy' | 'default') => {
        if (action === 'destroy') {
            // Usar la posición Y capturada del click derecho
            const yPos = contextMenuYRef.current;
            if (yPos !== null) {
                setDestroyY(yPos);
                updateNodeInternals(nodeId || '');
            }
        } else if (action === 'default') {
            setDestroyY(null);
            updateNodeInternals(nodeId || '');
        }
    }, [updateNodeInternals, nodeId]);

    // Calcular altura dinámica basada en el máximo de handles global
    const lifeLineHeight = useMemo(() => {
        return LIFE_LINE_BASE_HEIGHT + (maxHandlesCount * LIFE_LINE_HEIGHT_PER_HANDLE);
    }, [maxHandlesCount]);

    // La posición de destrucción es directamente destroyY
    const destroyPosition = destroyY;
    const isDestroyed = destroyPosition !== null;

    // Calcular la altura final considerando destrucción
    const finalLifeLineHeight = useMemo(() => {
        if (isDestroyed && destroyPosition !== null) {
            return destroyPosition;
        }
        return lifeLineHeight;
    }, [isDestroyed, destroyPosition, lifeLineHeight]);

    const iconClasses = "w-16 h-16 text-neutral-700 dark:text-neutral-200";

    const HeaderIcon = useMemo(() => {
        switch (headerIcon) {
            case 'user':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={iconClasses}>
                        <circle cx="12" cy="6.5" r="2.5" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m0 0-3.5 4M12 15l3.5 4m-8-7h9" />
                    </svg>
                );
            case 'database':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={iconClasses}>
                        <ellipse cx="12" cy="5.5" rx="7" ry="2.5" />
                        <path d="M5 5.5v6c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-6" />
                        <path d="M5 11.5v6c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-6" />
                    </svg>
                );
            case 'server':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={iconClasses}>
                        <rect x="4" y="4" width="16" height="6" rx="1.5" />
                        <rect x="4" y="14" width="16" height="6" rx="1.5" />
                        <circle cx="8" cy="7" r="0.9" fill="currentColor" />
                        <circle cx="8" cy="17" r="0.9" fill="currentColor" />
                    </svg>
                );
            case 'circle':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={iconClasses}>
                        <circle cx="12" cy="12" r="7" />
                    </svg>
                );
            case 'rectangle':
            default:
                return null;
        }
    }, [headerIcon]);

    return (
        <>
            {headerIcon !== 'rectangle' && HeaderIcon && (
                <div className="relative flex flex-col items-center pointer-events-auto"
                    style={{zIndex: 999}}
                >
                    <div
                        onContextMenu={handleHeaderIconContextMenu}
                        className="p-2 rounded-lg bg-white dark:bg-zinc-800 border border-neutral-300 dark:border-neutral-600 cursor-pointer hover:shadow-md transition-shadow"
                        title="Click derecho para opciones"
                    >
                        {HeaderIcon}
                    </div>
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={onChange}
                        onBlur={handleBlur}
                        onWheel={(e) => e.stopPropagation()}
                        onDoubleClick={handleDoubleClick}
                        placeholder={`Nombre`}
                        className={`nodrag w-48 placeholder-gray-400 bg-transparent dark:text-white border-none outline-none resize-none text-center text-sm px-2 py-1 overflow-hidden pointer-events-auto cursor-text`}
                        rows={1}
                    />
                    {isEditing &&
                        <p className="text-[10px] text-neutral-400">{`${value.length}/${LIFE_LINE_MAX_LEN_TEXT}`}</p>
                    }
                </div>
            )}
            
            {data.suggestion && (
                <>
                    <button
                        onDoubleClick={(e) => e.stopPropagation()}
                        onClick={(e) => { e.stopPropagation(); setShowSuggestion(prev => !prev); }}
                        title="Ver sugerencia de IA"
                        className="ver-ia absolute -top-6 -right-6 z-10 w-5 h-5 rounded-full bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold flex items-center justify-center shadow-md transition-colors cursor-pointer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-6" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0m-9 5.25h.008v.008H12z"/>
                        </svg>
                    </button>
                    <NodeSuggestionTooltip
                        isVisible={showSuggestion}
                        suggestionText={data.suggestion}
                        onMinimize={() => setShowSuggestion(false)}
                        onDiscard={clearSuggestion}
                        bottomValue={25}
                    />
                </>
            )}
            
            {headerIcon === 'rectangle' && (
                <div
                    onDoubleClick={handleDoubleClick}
                    onContextMenu={handleHeaderIconContextMenu}
                    className="relative border border-neutral-600 dark:border-neutral-300 bg-white dark:bg-zinc-800 p-2 hover:bg-gray-100 dark:hover:bg-zinc-700 min-w-[200px] flex flex-col items-center justify-center transition-all duration-150 pointer-events-auto"
                    style={{zIndex: 999}}

                > {/*HEAD DE LA LIFELINE*/}
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={onChange}
                        onBlur={handleBlur}
                        onWheel={(e) => e.stopPropagation()}
                        placeholder={`Rol : Clase`}
                        className={`nodrag w-full placeholder-gray-400 bg-transparent dark:text-white border-none outline-none resize-none text-center text-sm px-2 py-1 overflow-hidden ${isEditing ? 'pointer-events-auto' : 'pointer-events-none'
                            }`}
                        rows={1}
                    />
                    {isEditing &&
                        <p className="w-full text-[10px] text-right text-neutral-400">{`${value.length}/${LIFE_LINE_MAX_LEN_TEXT}`}</p>
                    }
                </div>
            )}
            {/*DASHED LINE DE LA LIFELINE*/}
            <div
                className="absolute left-1/2 -translate-x-1/2 bg-transparent px-4 w-6 pointer-events-auto"
                style={{ height: `${finalLifeLineHeight}px`, top: headerIcon === 'rectangle' ? '100%' : 'auto', zIndex: 999 }}
                onMouseMove={(evt) => { magneticHandle(evt) }}
                onMouseEnter={() => { setShowHandles(true) }}
                onMouseLeave={() => setShowHandles(false)}
                onContextMenu={handleNodeContextMenu}
            >
                <div className={`relative w-[1px] h-full`}
                    ref={nodeRef}
                >
                    <div
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-0 border-r-2 border-dashed border-neutral-300 pointer-events-none"
                        style={{ height: isDestroyed ? `${destroyPosition}px` : '100%' }}
                        aria-hidden="true"
                    > {/* Aspecto de dashed line */}
                    </div>

                    {handles.map((handle, i) => {
                        const isLastHandle = i === handles.length - 1;

                        return (
                            <BaseHandle
                                key={handle.id}
                                id={handle.id}
                                ref={isLastHandle ? setHandleRef : undefined}
                                showHandle={isLastHandle ? showHandles : false}
                                position={handle.position}
                                left={handle.left}
                                top={handle.top}
                                className="!w-3 !h-3 pointer-events-auto"
                                onContextMenu={isLastHandle ? (e) => handleContextMenu(e, handle.id.toString(), i) : undefined}
                            />
                        );
                    })}

                    {isDestroyed && destroyPosition !== null && (
                        <div
                            className="absolute left-1/2 -translate-x-1/2 w-6 h-6 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform z-10 pointer-events-auto"
                            style={{ top: `${destroyPosition - 12}px` }}
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setXMarkMenuEvent(e.nativeEvent); }}
                            onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setXMarkMenuEvent(e.nativeEvent); }}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="2"
                                stroke="currentColor"
                                className="w-6 h-6 text-neutral-600 dark:text-neutral-300"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </div>
                    )}
                </div>
            </div>
            {contextMenuEvent && (
                <ContextMenuPortal event={contextMenuEvent} onClose={closeContextMenu}>
                    <ChangeHandleType
                        id="change-handle-type-menu"
                        onClose={closeContextMenu}
                        handleId={selectedHandle}
                        handleIndex={selectedHandleIndex}
                        lifeLineId={nodeId!}
                        onDestroyEvent={handleDestroyEvent}
                        showDeleteLifeLine={showNodeContextMenu}
                        alreadyDestroyed={destroyY !== null}
                    />
                </ContextMenuPortal>
            )}
            {xMarkMenuEvent && (
                <ContextMenuPortal event={xMarkMenuEvent} onClose={() => setXMarkMenuEvent(null)}>
                    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-sky-600 dark:border-neutral-700 min-w-[220px] overflow-hidden">
                        <div
                            onClick={() => { setDestroyY(null); setXMarkMenuEvent(null); updateNodeInternals(nodeId || ''); }}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-red-100 dark:hover:bg-red-700 cursor-pointer text-sm dark:text-white"
                        >
                            <div className="w-5 h-5 flex items-center justify-center">
                                <DeleteIcon className="w-full h-full" />
                            </div>
                            <p>Eliminar evento de destrucción</p>
                        </div>
                    </div>
                </ContextMenuPortal>
            )}

            {/* ── Lifeline header validation tooltip ── */}
            {(() => {
                if (!isEditing || !tooltipPortalPos) return null;
                const p = parseLifelineHeader(value);
                return createPortal(
                    <div
                        style={{
                            position: 'fixed',
                            top: tooltipPortalPos.y - 10,
                            left: tooltipPortalPos.x,
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
                                    <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" />
                                </svg>
                                <span className="text-[9px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none">
                                    Cabecera de lifeline
                                </span>
                                {!p.isEmpty && p.valid && (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-emerald-500 ml-1">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>

                            {p.isEmpty ? (
                                /* Empty state: clean format without meta-brackets */
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center gap-0.5 font-mono text-[11px]">
                                        <span className="px-1 py-0.5 rounded border border-dashed border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600">nombreObjeto</span>
                                        <span className="text-gray-300 dark:text-gray-600 mx-0.5">:</span>
                                        <span className="px-1 py-0.5 rounded border border-dashed border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600">NombreClase</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[9px] text-gray-400 dark:text-gray-600 flex-wrap">
                                        <span className="flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 inline-block" />
                                            objeto o clase (al menos uno)
                                        </span>
                                        <span className="text-gray-300 dark:text-gray-700">·</span>
                                        <span className="font-mono">self</span>
                                        <span>también válido</span>
                                    </div>
                                </div>
                            ) : p.isSelf ? (
                                /* self keyword */
                                <div className="flex items-center gap-1.5">
                                    <span className="px-1.5 py-0.5 rounded-md border bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-700 font-mono text-[11px] font-semibold">
                                        self
                                    </span>
                                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400">keyword especial ✓</span>
                                </div>
                            ) : (
                                /* Active parsing */
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center gap-0.5 font-mono text-[11px]">
                                        {/* role chip */}
                                        <span className={`px-1.5 py-0.5 rounded-md border transition-all duration-150 ${
                                            p.roleOk && p.role
                                                ? 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-700'
                                                : !p.hasColon && !p.role
                                                    ? 'bg-amber-50 text-amber-500 border-amber-200 dark:bg-amber-900/20 dark:text-amber-500 dark:border-amber-800'
                                                    : 'bg-gray-50 text-gray-300 border-gray-100 dark:bg-gray-800 dark:text-gray-600 dark:border-gray-700'
                                        }`}>
                                            {p.role || 'rol'}
                                        </span>

                                        {/* selector */}
                                        {p.hasSelector && (
                                            <>
                                                <span className="text-gray-300 dark:text-gray-600">[</span>
                                                <span className="px-1 py-0.5 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[10px]">
                                                    {p.selector || 'i'}
                                                </span>
                                                <span className="text-gray-300 dark:text-gray-600">]</span>
                                            </>
                                        )}

                                        {/* colon */}
                                        <span className={`px-0.5 transition-colors duration-150 ${
                                            p.hasColon ? 'text-sky-500 dark:text-sky-400 font-semibold' : 'text-gray-200 dark:text-gray-700'
                                        }`}>:</span>

                                        {/* class chip */}
                                        <span className={`px-1.5 py-0.5 rounded-md border font-semibold transition-all duration-150 ${
                                            p.classOk
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700'
                                                : p.hasColon
                                                    ? 'bg-amber-50 text-amber-500 border-amber-200 dark:bg-amber-900/20 dark:text-amber-500 dark:border-amber-800'
                                                    : 'bg-gray-50 text-gray-300 border-gray-100 dark:bg-gray-800 dark:text-gray-600 dark:border-gray-700'
                                        }`}>
                                            {p.className || 'Clase'}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3 text-[9px] text-gray-400 dark:text-gray-600">
                                        <span className="flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 inline-block" />
                                            nombre del objeto
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                                            nombre de la clase
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Arrow pointing down */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[7px] w-3.5 h-3.5 bg-white dark:bg-gray-900 border-b border-r border-gray-100 dark:border-gray-700 rotate-45" />
                        </div>
                    </div>,
                    document.body
                );
            })()}
        </>
    )
}

