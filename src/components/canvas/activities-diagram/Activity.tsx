import { useCallback, useRef, useState, useEffect } from "react";
import { useCanvas } from "../../../hooks/useCanvas";
import { NodeResizer, Position, useNodeId, useReactFlow, Handle, useUpdateNodeInternals } from "@xyflow/react";
import { TEXT_AREA_MAX_LEN } from "../variables";
import "../styles/nodeStyles.css";
import type { DataProps } from "../../../types/canvas";

export default function Activity({ data }: DataProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(data.label || "");
    const { setIsZoomOnScrollEnabled } = useCanvas();

    const { setNodes, getNode, setEdges } = useReactFlow();

    const nodeId = useNodeId();
    const node = getNode(nodeId!);
    const isSelected = node?.selected ?? false;
    const updateNodeInternals = useUpdateNodeInternals();

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
        <div onDoubleClick={handleDoubleClick} className="node-container">
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