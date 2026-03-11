import { useCallback, useRef, useState, useEffect } from "react";
import { useCanvas } from "../../../hooks/useCanvas";
import { NodeResizer, Position, useNodeId, useReactFlow, Handle, useUpdateNodeInternals } from "@xyflow/react";
import { TEXT_AREA_MAX_LEN } from "../variables";
import "../styles/nodeStyles.css";
import type { DataProps } from "../../../types/canvas";
import NodeSuggestionTooltip from "../NodeSuggestionTooltip";

export default function Activity({ data }: DataProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(data.label || "");
    const { setIsZoomOnScrollEnabled, openContextMenu } = useCanvas();
    const [sourceHandlesIds, setSourceHandlesIds] = useState<string[] | null>(null);
    const [targetHandlesIds, setTargetHandlesIds] = useState<string[] | null>(null);
    const updateNodeInternals = useUpdateNodeInternals();

    const { setNodes, getNode, setEdges } = useReactFlow();

    const nodeId = useNodeId();
    const node = getNode(nodeId!);
    const isSelected = node?.selected ?? false;

    // Manejo de sugerencias IA
    const [showSuggestion, setShowSuggestion] = useState(false);

    const clearSuggestion = useCallback(() => {
        if (!nodeId) return;
        setShowSuggestion(false);
        setNodes(nodes => nodes.map(n =>
            n.id === nodeId ? { ...n, data: { ...n.data, suggestion: undefined } } : n
        ));
    }, [nodeId, setNodes]);

    useEffect(() => {
        if (data.suggestion) setShowSuggestion(true);
    }, [data.suggestion]);

    const [sourceBoxes, setSourceBoxes] = useState<number[]>(() => {
        if (data.sourceBoxesLength) {
            return Array.from({ length: data.sourceBoxesLength }, (_, i) => i);
        }
        return [0];
    });
    const [targetBoxes, setTargetBoxes] = useState<number[]>(() => {
        if (data.targetBoxesLength) {
            return Array.from({ length: data.targetBoxesLength }, (_, i) => i);
        }
        return [0];
    });

    const [hoveringSource, setHoveringSource] = useState<{ [key: number]: boolean }>({});
    const [hoveringTarget, setHoveringTarget] = useState<{ [key: number]: boolean }>({});
    const [boxContextMenu, setBoxContextMenu] = useState<{
        x: number;
        y: number;
        type: "source" | "target";
        id: number;
    } | null>(null);

    const menuRef = useRef<HTMLDivElement>(null);


    const BOX_HEIGHT = 40;
    const BOX_SPACING = 10;

    const onChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => {
        setValue(evt.target.value.slice(0, TEXT_AREA_MAX_LEN));
    }, []);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [value]);

    useEffect(() => {
        if (!nodeId) return;
        setNodes(nodes => nodes.map(n =>
            n.id === nodeId
                ? { ...n, data: { ...n.data, label: value, sourceBoxesLength: sourceBoxes.length, targetBoxesLength: targetBoxes.length } }
                : n
        ));
    }, [nodeId, setNodes, value, sourceBoxes.length, targetBoxes.length]);

    const handleDoubleClick = useCallback(() => {
        if (!isEditing) {
            setIsEditing(true);
            setIsZoomOnScrollEnabled(false);
            setTimeout(() => {
                textareaRef.current?.focus();
                textareaRef.current?.select();
            }, 0);
        }
    }, [isEditing, setIsZoomOnScrollEnabled]);

    const handleBlur = useCallback(() => {
        setIsEditing(false);
        setIsZoomOnScrollEnabled(true);
    }, [setIsZoomOnScrollEnabled]);

    const handleContextMenu = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        openContextMenu({
            x: e.clientX,
            y: e.clientY,
            nodeId: nodeId ?? "",
        });
    }, [openContextMenu, nodeId]);

    const onClickSourceBtn = () => {
        setSourceHandlesIds((prev) => {
            if (prev && prev?.length > 0) {
                return [...prev, 'source_' + prev.length];
            } else {
                return ['source_0'];
            }
        });
    };
                            
    const addSourceBox = () => {
        setSourceBoxes(prev => {
            const newBoxes = [...prev, prev.length];
            updateNodeInternals(nodeId!);
            return newBoxes;
        });
    };

    const addTargetBox = () => {
        setTargetBoxes(prev => {
            const newBoxes = [...prev, prev.length];
            updateNodeInternals(nodeId!);
            return newBoxes;
        });
    };

    const deleteBox = () => {
        if (!boxContextMenu || !nodeId) return;

        let handlesToDelete: string[] = [];

        if (boxContextMenu.type === "source") {
            handlesToDelete = [
                `source_source_${boxContextMenu.id}`,
                `source_target_${boxContextMenu.id}`,
            ];
        } else {
            handlesToDelete = [
                `target_left_${boxContextMenu.id}`,
                `target_right_${boxContextMenu.id}`,
            ];
        }

        setEdges((edges) =>
            edges.filter((edge) => {
                const isSameNode =
                    edge.source === nodeId || edge.target === nodeId;

                const usesDeletedHandle =
                    handlesToDelete.includes(edge.sourceHandle || "") ||
                    handlesToDelete.includes(edge.targetHandle || "");

                return !(isSameNode && usesDeletedHandle);
            })
        );

        if (boxContextMenu.type === "source") {
            setSourceBoxes(prev => prev.filter(id => id !== boxContextMenu.id));
        } else {
            setTargetBoxes(prev => prev.filter(id => id !== boxContextMenu.id));
        }

        updateNodeInternals(nodeId);
        setBoxContextMenu(null);
    };



    useEffect(() => {
        if (!boxContextMenu) return;

        const handleClose = (event: Event) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setBoxContextMenu(null);
            }
        };

        document.addEventListener("mousedown", handleClose, true);
        document.addEventListener("contextmenu", handleClose, true);
        document.addEventListener("wheel", handleClose, true);
        document.addEventListener("touchstart", handleClose, true);
        document.addEventListener("pointerdown", handleClose, true);

        return () => {
            document.removeEventListener("mousedown", handleClose, true);
            document.removeEventListener("contextmenu", handleClose, true);
            document.removeEventListener("wheel", handleClose, true);
            document.removeEventListener("touchstart", handleClose, true);
            document.removeEventListener("pointerdown", handleClose, true);
        };
    }, [boxContextMenu]);



    return (
        <div 
            onDoubleClick={handleDoubleClick} 
            onContextMenu={handleContextMenu} 
            className="node-container"
        >
            {data.suggestion && (
                <>
                    <button
                        onDoubleClick={(e) => e.stopPropagation()}
                        onClick={(e) => { e.stopPropagation(); setShowSuggestion(prev => !prev); }}
                        title="Ver sugerencia de IA"
                        className="absolute -top-2 -right-2 z-10 w-5 h-5 rounded-full bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold flex items-center justify-center shadow-md transition-colors cursor-pointer"
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
                    />
                </>
            )}
            <NodeResizer
                color="#0084D1"
                isVisible={isSelected}
                minWidth={1000}
                minHeight={600}
            />

              <div className="flex flex-col">
                  <textarea
                      ref={textareaRef}
                      value={value}
                      onChange={onChange}
                      onBlur={handleBlur}
                      onWheel={(e) => e.stopPropagation()}
                      placeholder="Actividad"
                      className={`node-textarea ${isEditing ? 'node-textarea-editing' : 'node-textarea-readonly'}`}
                      rows={1}
                  />
                  {isEditing &&
                      <p className="char-counter char-counter-right">{`${value.length}/${TEXT_AREA_MAX_LEN}`}</p>
                  }
              </div>

            <div className="flex justify-between items-start w-full mt-2">
                <div className="flex flex-col justify-start items-center relative">
                    {sourceBoxes.map((id, index) => (
                        <div
                            key={id}
                            className="box-div"
                            style={{
                                top: `${index * (BOX_HEIGHT + BOX_SPACING)}px`,
                            }}
                            onContextMenu={(e) => {
                                e.preventDefault();
                                e.stopPropagation();

                                setBoxContextMenu({
                                    x: e.clientX,
                                    y: e.clientY,
                                    type: "source",
                                    id
                                });
                            }}

                            onMouseEnter={() => setHoveringSource(prev => ({ ...prev, [id]: true }))}
                            onMouseLeave={() => setHoveringSource(prev => ({ ...prev, [id]: false }))}
                        >
                            <Handle
                                type="target"
                                position={Position.Left}
                                id={`source_target_${id}`}
                                style={{
                                    opacity: hoveringSource[id] ? 1 : 0,
                                    transition: "opacity 0.2s",
                                }}
                            />
                            <div className="inner-box"></div>
                            <Handle
                                type="source"
                                position={Position.Right}
                                id={`source_source_${id}`}
                                style={{
                                    opacity: hoveringSource[id] ? 1 : 0,
                                    transition: "opacity 0.2s",
                                }}
                            />
                        </div>
                    ))}
                    <div
                        style={{ top: `${sourceBoxes.length * (BOX_HEIGHT + BOX_SPACING)}px` }}
                        className="absolute z-30"
                    >
                        <button onClick={addSourceBox} className="add-box-btn">+</button>
                    </div>

                </div>

                <div className="flex flex-col justify-start items-center relative">
                    {targetBoxes.map((id, index) => (
                        <div
                            key={id}
                            className="box-div"
                            style={{
                                top: `${index * (BOX_HEIGHT + BOX_SPACING)}px`,
                            }}
                            onContextMenu={(e) => {
                                e.preventDefault();
                                e.stopPropagation();

                                setBoxContextMenu({
                                    x: e.clientX,
                                    y: e.clientY,
                                    type: "target",
                                    id
                                });
                            }}

                            onMouseEnter={() => setHoveringTarget(prev => ({ ...prev, [id]: true }))}
                            onMouseLeave={() => setHoveringTarget(prev => ({ ...prev, [id]: false }))}
                        >
                            <Handle
                                type="target"
                                position={Position.Left}
                                id={`target_left_${id}`}
                                style={{
                                    opacity: hoveringTarget[id] ? 1 : 0,
                                    transition: "opacity 0.2s",
                                }}
                            />
                            <div className="inner-box"></div>
                            <Handle
                                type="source"
                                position={Position.Right}
                                id={`target_right_${id}`}
                                style={{
                                    opacity: hoveringTarget[id] ? 1 : 0,
                                    transition: "opacity 0.2s",
                                }}
                            />
                        </div>
                    ))}

                    <div
                        style={{ top: `${targetBoxes.length * (BOX_HEIGHT + BOX_SPACING)}px` }}
                        className="absolute z-30"
                    >
                        <button onClick={addTargetBox} className="add-box-btn">+</button>
                    </div>

                </div>
            </div>
            {boxContextMenu && (
                <div
                    ref={menuRef}
                    className="fixed z-50 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-sky-600 dark:border-neutral-700 min-w-[160px] overflow-hidden"
                    style={{ top: boxContextMenu.y, left: boxContextMenu.x }}
                    onContextMenu={(e) => e.preventDefault()}
                >
                    <div className="flex flex-col">
                        <div
                            onClick={deleteBox}
                            className="px-4 py-2 cursor-pointer text-sm dark:text-white hover:bg-sky-100 dark:hover:bg-sky-700 transition-colors"
                        >
                            Eliminar
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}