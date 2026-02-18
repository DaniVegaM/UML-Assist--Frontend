import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useCanvas } from "../../../hooks/useCanvas";
import { NodeResizer, type NodeProps, useReactFlow, useNodeId } from "@xyflow/react";
import { useSequenceDiagram } from "../../../hooks/useSequenceDiagram";

const TEXT_AREA_MAX_LEN = 30;

const BreakFragmentNode = ({ id, data, selected }: NodeProps) => {
  const nodeId = useNodeId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { setNodes, getNodesBounds, getInternalNode } = useReactFlow();
  const { setIsZoomOnScrollEnabled } = useCanvas();
  const { nodes: allNodes, edges } = useSequenceDiagram();

  const [guard, setGuard] = useState((data as any)?.guard || "");
  const [isEditingGuard, setIsEditingGuard] = useState(false);

  const [containedEdgeIds, setContainedEdgeIds] = useState<string[]>([]);
  const lastFragmentBoundsRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
  const initialCalcDone = useRef(false);

  const computeContainedEdges = useCallback(() => {
    if (!nodeId) return;
    const fragmentBounds = getNodesBounds([nodeId]);
    if (!fragmentBounds || fragmentBounds.width === 0) return;
    const currentBounds = { x: Math.round(fragmentBounds.x), y: Math.round(fragmentBounds.y), w: Math.round(fragmentBounds.width), h: Math.round(fragmentBounds.height) };
    if (initialCalcDone.current) {
      const prev = lastFragmentBoundsRef.current;
      if (prev && prev.x === currentBounds.x && prev.y === currentBounds.y && prev.w === currentBounds.w && prev.h === currentBounds.h) return;
    }
    lastFragmentBoundsRef.current = currentBounds;
    initialCalcDone.current = true;
    const fragLeft = fragmentBounds.x, fragRight = fragmentBounds.x + fragmentBounds.width, fragTop = fragmentBounds.y, fragBottom = fragmentBounds.y + fragmentBounds.height;
    const insideEdgeIds: string[] = [];
    for (const edge of edges) {
      if (edge.type !== 'messageEdge' && edge.type !== 'selfMessageEdge') continue;
      const sourceInternal = getInternalNode(edge.source);
      const targetInternal = getInternalNode(edge.target);
      if (!sourceInternal || !targetInternal) continue;
      const sourceHandle = sourceInternal.internals.handleBounds?.source?.find(h => h.id === edge.sourceHandle) ?? sourceInternal.internals.handleBounds?.target?.find(h => h.id === edge.sourceHandle);
      const targetHandle = targetInternal.internals.handleBounds?.target?.find(h => h.id === edge.targetHandle) ?? targetInternal.internals.handleBounds?.source?.find(h => h.id === edge.targetHandle);
      if (!sourceHandle && !targetHandle) continue;
      const sourceAbsX = sourceInternal.internals.positionAbsolute.x + (sourceHandle?.x ?? 0), sourceAbsY = sourceInternal.internals.positionAbsolute.y + (sourceHandle?.y ?? 0);
      const targetAbsX = targetInternal.internals.positionAbsolute.x + (targetHandle?.x ?? 0), targetAbsY = targetInternal.internals.positionAbsolute.y + (targetHandle?.y ?? 0);
      if (sourceAbsX >= fragLeft && sourceAbsX <= fragRight && sourceAbsY >= fragTop && sourceAbsY <= fragBottom && targetAbsX >= fragLeft && targetAbsX <= fragRight && targetAbsY >= fragTop && targetAbsY <= fragBottom) {
        insideEdgeIds.push(edge.id);
      }
    }
    setContainedEdgeIds(prev => { const prevStr = JSON.stringify(prev); const newStr = JSON.stringify(insideEdgeIds); return prevStr === newStr ? prev : insideEdgeIds; });
  }, [nodeId, edges, getNodesBounds, getInternalNode]);

  useEffect(() => { const timeout = setTimeout(() => { computeContainedEdges(); }, 100); return () => clearTimeout(timeout); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { if (!initialCalcDone.current) return; computeContainedEdges(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allNodes]);

  // Sincronizar guard con el nodo de React Flow
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: { ...node.data, label: guard, guard },
          };
        }
        return node;
      })
    );
  }, [guard, id, setNodes]);

  // Sincronizar edges contenidos por separado
  useEffect(() => {
    if (!nodeId) return;
    setNodes(nodes => nodes.map(n =>
      n.id === nodeId ? { ...n, data: { ...n.data, edges: containedEdgeIds } } : n
    ));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containedEdgeIds]);

  const onGuardDoubleClick = useCallback(() => {
    setIsEditingGuard(true);
    setIsZoomOnScrollEnabled(false);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.select();
      }
    }, 0);
  }, [setIsZoomOnScrollEnabled]);

  const onGuardChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    const raw = evt.target.value.replace(/^\[|\]$/g, "");
    setGuard(raw.slice(0, TEXT_AREA_MAX_LEN));
  }, []);

  const onGuardBlur = useCallback(() => {
    setIsEditingGuard(false);
    setIsZoomOnScrollEnabled(true);
  }, [setIsZoomOnScrollEnabled]);

  return (
    <div
      className="border-2 border-gray-800 dark:border-neutral-200 bg-white/10 dark:bg-neutral-800/10 w-full h-full"
      style={{ minWidth: "300px", minHeight: "100px", pointerEvents: selected ? 'auto' : 'none' }}
    >
      <NodeResizer minWidth={300} minHeight={100} color="#0084D1" isVisible={selected} />

      {/* Pentágono con la palabra clave "break" */}
      <div className="flex items-start">
        <div
          className="bg-gray-800 dark:bg-neutral-200 text-white dark:text-neutral-800 font-mono font-bold text-xs px-3 py-1 flex items-center justify-center"
          style={{
            clipPath: "polygon(0 0, 100% 0, 90% 100%, 0 100%)",
            minWidth: "60px",
            height: "25px",
          }}
        >
          break
        </div>

        {/* Guard del fragmento break */}
        <div className="flex-1 cursor-text" onDoubleClick={onGuardDoubleClick}>
          <textarea
            ref={textareaRef}
            placeholder="[condición]"
            className={`no-wheel nodrag w-full placeholder-gray-400 bg-transparent dark:text-white border-none outline-none resize-none text-sm px-2 py-1 overflow-hidden font-mono ${
              isEditingGuard ? "pointer-events-auto" : "pointer-events-none"
            }`}
            rows={1}
            onMouseDown={(e) => e.stopPropagation()}
            onChange={onGuardChange}
            onBlur={onGuardBlur}
            value={isEditingGuard ? guard : guard ? `[${guard}]` : ""}
          />
        </div>
      </div>

      {/* Área del operando (sin separadores) */}
      <div className="w-full h-[calc(100%-25px)] relative">
        {/* Espacio para contenido del fragmento */}
      </div>
    </div>
  );
};

export default memo(BreakFragmentNode);
