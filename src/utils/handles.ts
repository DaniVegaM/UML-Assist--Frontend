import type { Edge, Node } from "@xyflow/react";


export type HandleDataLike = {
    id: string;         
    position?: any;
    left?: number;
    top?: number;
    [k: string]: any;
};

type CompactResult = { nodes: Node[]; edges: Edge[] };

function getHandleIndexFromEdgeHandleId(nodeId: string, handleId?: string | null): number | null {
    if (!handleId) return null;

    // debe pertenecer al nodo
    if (!handleId.startsWith(nodeId)) return null;

    // soporta: _Handle-  _sourceHandle-  _targetHandle-
    const pos =
        handleId.lastIndexOf("_Handle-") !== -1
        ? handleId.lastIndexOf("_Handle-") + "_Handle-".length
        : handleId.lastIndexOf("_sourceHandle-") !== -1
        ? handleId.lastIndexOf("_sourceHandle-") + "_sourceHandle-".length
        : handleId.lastIndexOf("_targetHandle-") !== -1
        ? handleId.lastIndexOf("_targetHandle-") + "_targetHandle-".length
        : -1;

    if (pos === -1) return null;

    const nStr = handleId.slice(pos);
    const n = Number(nStr);
    return Number.isFinite(n) ? n : null;
}


function ensureAtLeastOneFreeHandle(handles: HandleDataLike[], usedNew: Set<number>): HandleDataLike[] {
    const allUsed = handles.every(h => usedNew.has(Number(h.id)));
    if (!allUsed) return handles;

    const maxId = Math.max(...handles.map(h => Number(h.id)));
    const nextId = String((Number.isFinite(maxId) ? maxId : handles.length - 1) + 1);

    const last = handles[handles.length - 1];
    return [...handles, { ...last, id: nextId, left: undefined, top: undefined }];
}


export function compactHandlesAfterEdgeRemoval(nodes: Node[], edges: Edge[]): CompactResult {
    console.log("compactHandlesAfterEdgeRemoval EJECUTADO");
    console.log("Nodos antes:", nodes);
    console.log("Edges antes:", edges);

    const nextEdges = edges;
    const nextNodes = nodes.map((node) => {
        const nodeId = node.id;
        const handles: HandleDataLike[] | undefined = node.data?.handles;

        if (!Array.isArray(handles) || handles.length === 0) return node;

        //Qué índices siguen usados por edges
        const usedOld = new Set<number>();
        for (const e of nextEdges) {
            if (e.source === nodeId) {
                const idx = getHandleIndexFromEdgeHandleId(nodeId, e.sourceHandle);
                if (idx !== null) usedOld.add(idx);
            }
            if (e.target === nodeId) {
                const idx = getHandleIndexFromEdgeHandleId(nodeId, e.targetHandle);
                if (idx !== null) usedOld.add(idx);
            }
        }

        //indices usados (ya lo tienes en usedOld)

        //Conserva los usados y el 0, pero NO cambies ids
        const indexed = handles
        .map((h) => ({ h, oldIndex: Number(h.id) }))
        .filter((x) => Number.isFinite(x.oldIndex));

        const kept = indexed
        .filter(({ oldIndex }) => usedOld.has(oldIndex) || oldIndex === 0)
        .sort((a, b) => a.oldIndex - b.oldIndex)
        .map(({ h }) => h);

        //Si por alguna razón quedó vacío, deja el primero
        const safeKept = kept.length > 0 ? kept : [handles[0]];

        // Asegura que exista un handle libre (sin reindexar)
        const usedIds = new Set<number>();
        for (const e of nextEdges) {
        if (e.source === nodeId) {
            const idx = getHandleIndexFromEdgeHandleId(nodeId, e.sourceHandle);
            if (idx !== null) usedIds.add(idx);
        }
        if (e.target === nodeId) {
            const idx = getHandleIndexFromEdgeHandleId(nodeId, e.targetHandle);
            if (idx !== null) usedIds.add(idx);
        }
        }

        //reutiliza el helper pero ajustado a ids reales
        const finalHandles = ensureAtLeastOneFreeHandle(safeKept, usedIds);

        return {
        ...node,
        data: {
            ...node.data,
            handles: finalHandles,
        },
        };

    });

    console.log("Nodos después:", nextNodes);
    console.log("Edges después:", nextEdges);

    return { nodes: nextNodes, edges: nextEdges };
}
