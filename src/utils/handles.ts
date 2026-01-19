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
    if (!handleId.startsWith(nodeId)) return null;

    const pos = handleId.lastIndexOf("Handle-");
    if (pos === -1) return null;

    const nStr = handleId.slice(pos + "Handle-".length);
    const n = Number(nStr);
    return Number.isFinite(n) ? n : null;
}

function replaceHandleIndex(handleId: string, newIndex: number): string {
    const pos = handleId.lastIndexOf("Handle-");
    if (pos === -1) return handleId;

    return handleId.slice(0, pos + "Handle-".length) + String(newIndex);
}


function ensureAtLeastOneFreeHandle(handles: HandleDataLike[], usedNew: Set<number>): HandleDataLike[] {
    const allUsed = handles.every(h => usedNew.has(Number(h.id)));
    if (!allUsed) return handles;

    const maxId = Math.max(...handles.map(h => Number(h.id)));
    const nextId = String((Number.isFinite(maxId) ? maxId : handles.length - 1) + 1);

    const last = handles[handles.length - 1];
    return [...handles, { ...last, id: nextId }];
}


export function compactHandlesAfterEdgeRemoval(nodes: Node[], edges: Edge[]): CompactResult {
    console.log("compactHandlesAfterEdgeRemoval EJECUTADO");
    console.log("Nodos antes:", nodes);
    console.log("Edges antes:", edges);

    let nextEdges = [...edges];
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

        //Filtrar handles: conservamos los usados y (por seguridad) el 0
        const indexed = handles
        .map((h) => ({ h, oldIndex: Number(h.id) }))
        .filter((x) => Number.isFinite(x.oldIndex));

        const kept = indexed
        .filter(({ oldIndex }) => usedOld.has(oldIndex) || oldIndex === 0)
        .sort((a, b) => a.oldIndex - b.oldIndex);

        // Si por alguna razón se quedó vacío, dejamos el primero original
        const safeKept = kept.length > 0 ? kept : indexed.slice(0, 1);

        //Reindexar consecutivo y construir mapa old->new
        const oldToNew = new Map<number, number>();
        const reindexed: HandleDataLike[] = safeKept.map(({ h, oldIndex }, newIndex) => {
            oldToNew.set(oldIndex, newIndex);
            return { ...h, id: String(newIndex) };
        });

        //Remapear edges que apunten a este nodeId
        nextEdges = nextEdges.map((e) => {
            let changed = false;
            const upd: Edge = { ...e };

            if (upd.source === nodeId) {
                const oldIdx = getHandleIndexFromEdgeHandleId(nodeId, upd.sourceHandle);
                if (oldIdx !== null && oldToNew.has(oldIdx) && upd.sourceHandle) {
                    upd.sourceHandle = replaceHandleIndex(upd.sourceHandle, oldToNew.get(oldIdx)!);
                    changed = true;
                }
            }

            if (upd.target === nodeId) {
                const oldIdx = getHandleIndexFromEdgeHandleId(nodeId, upd.targetHandle);
                if (oldIdx !== null && oldToNew.has(oldIdx) && upd.targetHandle) {
                    upd.targetHandle = replaceHandleIndex(upd.targetHandle, oldToNew.get(oldIdx)!);
                    changed = true;
                }
            }

        return changed ? upd : e;
        });

        //asegurar que exista un handle libre al final
        const usedNew = new Set<number>();
        for (const e of nextEdges) {
            if (e.source === nodeId) {
                const idx = getHandleIndexFromEdgeHandleId(nodeId, e.sourceHandle);
                if (idx !== null) usedNew.add(idx);
            }
            if (e.target === nodeId) {
                const idx = getHandleIndexFromEdgeHandleId(nodeId, e.targetHandle);
                if (idx !== null) usedNew.add(idx);
            }
        }

        const finalHandles = ensureAtLeastOneFreeHandle(reindexed, usedNew);

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
