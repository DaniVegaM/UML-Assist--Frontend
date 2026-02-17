import { useCallback } from "react";
import type { Connection, Edge, Node } from "@xyflow/react";

export type ValidationSeverity = "error" | "warning" | "info";

export type ValidationResult = {
    ok: boolean;
    severity?: ValidationSeverity;
    reason?: string;
    code?: string;
};

export function useLocalValidations(nodes: Node[], edges: Edge[]) {
    const findNode = useCallback(
        (id?: string | null) => nodes.find((n) => n.id === id),
        [nodes]
    );

const hasAnyHandleUsed = useCallback(
    (conn: Connection | Edge) => {
        const sh = conn.sourceHandle;
        const th = conn.targetHandle;

        if (!sh && !th) return false;

        return edges.some((e) => {
            
            return (
                (sh && e.sourceHandle === sh) ||
                (sh && e.targetHandle === sh) ||
                (th && e.sourceHandle === th) ||
                (th && e.targetHandle === th)
            );
        });
    },
    [edges]
    );



    const hasEdge = useCallback(
        (sourceId: string, targetId: string) =>
        edges.some((e) => e.source === sourceId && e.target === targetId),
        [edges]
    );

    const hasReverseEdge = useCallback(
        (sourceId: string, targetId: string) =>
        edges.some((e) => e.source === targetId && e.target === sourceId),
        [edges]
    );

    const incomingCount = useCallback(
        (nodeId: string) => edges.filter((e) => e.target === nodeId).length,
        [edges]
    );

    const outgoingCount = useCallback(
        (nodeId: string) => edges.filter((e) => e.source === nodeId).length,
        [edges]
    );

  // ACTIVIDADES (DETALLADO) 
    const validateActivityConnection = useCallback(
        (connection: Edge | Connection): ValidationResult => {
        const sourceNode = findNode(connection.source);
        const targetNode = findNode(connection.target);

        // Base: deben existir
        if (!sourceNode || !targetNode) {
            return {
            ok: false,
            severity: "error",
            code: "NODE_NOT_FOUND",
            reason: "No se pudo identificar el nodo origen o destino.",
            };
        }

        const sourceNodeId = sourceNode.id;
        const targetNodeId = targetNode.id;
        const sourceNodeType = sourceNode.type;
        const targetNodeType = targetNode.type;

        // Base: tipos requeridos
        if (!sourceNodeType || !targetNodeType) {
            return {
            ok: false,
            severity: "error",
            code: "NODE_TYPE_MISSING",
            reason: "No se pudo determinar el tipo de nodo (origen o destino).",
            };
        }

        // Un solo handle por conexión
        if (hasAnyHandleUsed(connection)) {
            return {
            ok: false,
            severity: "error",
            code: "HANDLE_ALREADY_USED",
            reason: "Ese punto de conexión (handle) ya está siendo utilizado.",
            };
        }

        // No conectar a uno mismo
        if (sourceNodeId === targetNodeId) {
            return {
            ok: false,
            severity: "error",
            code: "SELF_CONNECTION",
            reason: "No se permite conectar un nodo consigo mismo.",
            };
        }

        // No duplicar A → B
        if (hasEdge(sourceNodeId, targetNodeId)) {
            return {
            ok: false,
            severity: "error",
            code: "DUPLICATE_EDGE",
            reason: "Ya existe una conexión entre esos dos nodos (A → B).",
            };
        }

        // No loops A ↔ B
        if (hasReverseEdge(sourceNodeId, targetNodeId)) {
            return {
            ok: false,
            severity: "error",
            code: "REVERSE_EDGE_LOOP",
            reason: "No se permite un ciclo directo entre dos nodos (A → B y B → A).",
            };
        }

        // Si el source ya termina en final, no puede tener más salidas 
        const isFinalTarget =
            targetNodeType === "finalNode" || targetNodeType === "finalFlowNode";

        const sourceAlreadyEndsInFinal = edges.some((e) => {
            if (e.source !== sourceNodeId) return false;
            const t = findNode(e.target)?.type;
            return t === "finalNode" || t === "finalFlowNode";
        });

        // Si intento conectar a un final, el source NO debe tener salidas previas
        if (isFinalTarget && outgoingCount(sourceNodeId) > 0) {
            return {
            ok: false,
            severity: "error",
            code: "FINAL_TARGET_REQUIRES_NO_OUTGOING",
            reason:
                "No puedes conectar a un nodo final si el nodo origen ya tiene salidas.",
            };
        }

        // Si el source ya termina en final, no puede crear más salidas
        if (sourceAlreadyEndsInFinal) {
            return {
            ok: false,
            severity: "error",
            code: "SOURCE_ALREADY_ENDS_IN_FINAL",
            reason:
                "Este nodo ya finaliza en un nodo final; no puede tener más salidas.",
            };
        }

        // ---------- GRUPO: Acciones ----------
        const actionTypes = ["simpleAction", "callBehavior", "callOperation"];

        const incomingEdgesFromActionGroup = edges.filter((e) => {
            if (e.target !== targetNodeId) return false;
            const sourceType = findNode(e.source)?.type;
            return !!sourceType && actionTypes.includes(sourceType);
        });

        const outgoingEdgesToActionGroup = edges.filter((e) => {
            if (e.source !== sourceNodeId) return false;
            const targetType = findNode(e.target)?.type;
            return !!targetType && actionTypes.includes(targetType);
        });


        // REGLA 1: una acción NO puede tener más de 1 entrada (desde el grupo)
        if (
            actionTypes.includes(targetNodeType) &&
            incomingEdgesFromActionGroup.length > 0
        ) {
            return {
            ok: false,
            severity: "error",
            code: "ACTION_MAX_INCOMING_1",
            reason:
                "Una acción solo puede tener una entrada desde el flujo de acciones.",
            };
        }

        // REGLA 2: una acción NO puede tener más de 1 salida (hacia el grupo)
        if (
            actionTypes.includes(sourceNodeType) &&
            actionTypes.includes(targetNodeType) &&
            outgoingEdgesToActionGroup.length > 0
        ) {
            return {
            ok: false,
            severity: "error",
            code: "ACTION_MAX_OUTGOING_1",
            reason:
                "Una acción solo puede tener una salida hacia el flujo de acciones.",
            };
        }

        // ---------- Decision Control ----------
        if (targetNodeType === "decisionControl" && incomingCount(targetNodeId) > 0) {
            return {
            ok: false,
            severity: "error",
            code: "DECISION_MAX_INCOMING_1",
            reason: "Un nodo de decisión solo puede tener una conexión de entrada.",
            };
        }

        // ---------- Merge Node ----------
        if (sourceNodeType === "mergeNode" && outgoingCount(sourceNodeId) > 0) {
            return {
            ok: false,
            severity: "error",
            code: "MERGE_MAX_OUTGOING_1",
            reason: "Un nodo merge solo puede tener una conexión de salida.",
            };
        }

        // ---------- Initial Node ----------
        if (sourceNodeType === "initialNode" && outgoingCount(sourceNodeId) > 0) {
            return {
            ok: false,
            severity: "error",
            code: "INITIAL_MAX_OUTGOING_1",
            reason: "El nodo inicial solo puede tener una salida.",
            };
        }

        if (targetNodeType === "initialNode") {
            return {
            ok: false,
            severity: "error",
            code: "INITIAL_NO_INCOMING",
            reason: "El nodo inicial no puede recibir conexiones.",
            };
        }

        if (
            sourceNodeType === "initialNode" &&
            (targetNodeType === "objectNode" || targetNodeType === "dataNode")
        ) {
            return {
            ok: false,
            severity: "error",
            code: "INITIAL_CANNOT_CONNECT_TO_OBJECT_OR_DATA",
            reason: "El nodo inicial no puede conectar directamente a Object o Data.",
            };
        }

        // ---------- Final Node ----------
        if (sourceNodeType === "finalNode") {
            return {
            ok: false,
            severity: "error",
            code: "FINAL_NO_OUTGOING",
            reason: "El nodo final no puede tener salidas.",
            };
        }

        // ---------- Final Flow Node ----------
        if (sourceNodeType === "finalFlowNode") {
            return {
            ok: false,
            severity: "error",
            code: "FINAL_FLOW_NO_OUTGOING",
            reason: "El final de flujo no puede tener salidas.",
            };
        }

        // ---------- Connector Node ----------
        if (
            sourceNodeType === "connectorNode" &&
            (incomingCount(sourceNodeId) > 0 || outgoingCount(sourceNodeId) > 0)
        ) {
            return {
            ok: false,
            severity: "error",
            code: "CONNECTOR_SINGLE_CONNECTION_ONLY",
            reason: "El conector no puede tener múltiples conexiones.",
            };
        }

        if (
            targetNodeType === "connectorNode" &&
            (incomingCount(targetNodeId) > 0 || outgoingCount(targetNodeId) > 0)
        ) {
            return {
            ok: false,
            severity: "error",
            code: "CONNECTOR_SINGLE_CONNECTION_ONLY_TARGET",
            reason: "El conector no puede tener múltiples conexiones.",
            };
        }

        // ---------- Data Node ----------
        if (sourceNodeType === "dataNode" && outgoingCount(sourceNodeId) > 0) {
            return {
            ok: false,
            severity: "error",
            code: "DATA_MAX_OUTGOING_1",
            reason: "Un Data Node puede tener múltiples entradas, pero solo una salida.",
            };
        }

        // ---------- Object Node ----------
        if (targetNodeType === "objectNode" && incomingCount(targetNodeId) > 0) {
            return {
            ok: false,
            severity: "error",
            code: "OBJECT_MAX_INCOMING_1",
            reason: "Un Object Node solo puede tener una entrada.",
            };
        }

        // ---------- Exception Handling ----------
        if (
            sourceNodeType === "exceptionHandling" ||
            (targetNodeType === "exceptionHandling" && incomingCount(targetNodeId) > 0)
        ) {
            return {
            ok: false,
            severity: "error",
            code: "EXCEPTION_RULE",
            reason:
                "El manejador de excepción no puede tener salidas y solo puede tener una entrada.",
            };
        }

        return { ok: true };
        },
        [
        findNode,
        hasAnyHandleUsed,
        hasEdge,
        hasReverseEdge,
        incomingCount,
        outgoingCount,
        edges,
        ]
    );

    const isValidActivityConnection = useCallback(
        (connection: Edge | Connection) => validateActivityConnection(connection).ok,
        [validateActivityConnection]
    );

    // ========= SECUENCIA (opcional detallado) =========
    const validateSequenceConnection = useCallback(
        (connection: Edge | Connection): ValidationResult => {
        const sourceNode = findNode(connection.source);
        const targetNode = findNode(connection.target);

        if (!sourceNode || !targetNode) {
            return {
            ok: false,
            severity: "error",
            code: "NODE_NOT_FOUND",
            reason: "No se pudo identificar el nodo origen o destino.",
            };
        }

        const sourceType = sourceNode.type;
        const targetType = targetNode.type;

        if (!sourceType || !targetType) {
            return {
            ok: false,
            severity: "error",
            code: "NODE_TYPE_MISSING",
            reason: "No se pudo determinar el tipo de nodo (origen o destino).",
            };
        }

        const isNoteConnection = sourceType === "note" || targetType === "note";
        const isLifeLineConnection = sourceType === "lifeLine" && targetType === "lifeLine";

        if (!isLifeLineConnection && !isNoteConnection) {
            return {
            ok: false,
            severity: "error",
            code: "SEQ_ONLY_LIFELINE_OR_NOTE",
            reason: "Solo se permiten conexiones LifeLine ↔ LifeLine o Note ↔ LifeLine.",
            };
        }

        if (isNoteConnection && sourceType !== "lifeLine" && targetType !== "lifeLine") {
            return {
            ok: false,
            severity: "error",
            code: "SEQ_NOTE_NEEDS_LIFELINE",
            reason: "Una nota solo puede conectarse con una LifeLine.",
            };
        }

        if (!connection.sourceHandle || !connection.targetHandle) {
            return {
            ok: false,
            severity: "error",
            code: "SEQ_HANDLES_REQUIRED",
            reason: "En secuencia siempre deben usarse handles (puntos de conexión).",
            };
        }

        if (
            connection.source === connection.target &&
            connection.sourceHandle === connection.targetHandle
        ) {
            return {
            ok: false,
            severity: "error",
            code: "SEQ_SAME_HANDLE_SELF_MESSAGE",
            reason: "No se permite un self-message usando el mismo handle.",
            };
        }

        if (
            edges.some(
            (e) =>
                e.sourceHandle === connection.sourceHandle &&
                e.targetHandle === connection.targetHandle
            )
        ) {
            return {
            ok: false,
            severity: "error",
            code: "SEQ_DUPLICATE_MESSAGE",
            reason: "Ya existe un mensaje con esos mismos handles.",
            };
        }

        return { ok: true };
        },
        [edges, findNode]
    );

    const isValidSequenceConnection = useCallback(
        (connection: Edge | Connection) => validateSequenceConnection(connection).ok,
        [validateSequenceConnection]
    );

    return {
        // actividades
        isValidActivityConnection,
        validateActivityConnection,

        // secuencia
        isValidSequenceConnection,
        validateSequenceConnection,
    };
}
