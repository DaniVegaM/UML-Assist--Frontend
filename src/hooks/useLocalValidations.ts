import { useCallback } from "react";
import type { Connection, Edge, Node } from "@xyflow/react";

/**
* Hook para validaciones locales de:
* - Actividades (isValidActivityConnection)
* - Secuencia (isValidSequenceConnection)
*/

export type ValidationSeverity = "success" | "error" | "info";

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

        // Validación base: source/target deben existir
        if (!sourceNode || !targetNode) {
            return {
            ok: false,
            severity: "info",
            reason: "No se pudo identificar el nodo origen o destino.",
            };
        }

        const sourceNodeId = sourceNode.id;
        const targetNodeId = targetNode.id;
        const sourceNodeType = sourceNode.type;
        const targetNodeType = targetNode.type;

        // Validación base: tipos requeridos
        if (!sourceNodeType || !targetNodeType) {
            return {
            ok: false,
            severity: "info",
            reason: "No se pudo determinar el tipo de nodo (origen o destino).",
            };
        }

        // Un solo handle por conexión
        if (hasAnyHandleUsed(connection)) {
            return {
            ok: false,
            severity: "info",
            reason: "Ese punto de conexión ya está ocupado. Usa otro punto o elimina la conexión existente.",
            };
        }

        // Evitar conexiones a uno mismo
        if (sourceNodeId === targetNodeId) {
            return {
            ok: false,
            severity: "info",
            reason: "No se permite conectar un nodo consigo mismo.",
            };
        }

        // Evitar múltiples conexiones entre dos nodos (A → B repetido) 
        if (hasEdge(sourceNodeId, targetNodeId)) {
            return {
            ok: false,
            severity: "info",
            reason: "Ya existe una conexión entre estos dos elementos.",
            };
        }

        // Evitar loops entre 2 nodos (A → B y B → A)
        if (hasReverseEdge(sourceNodeId, targetNodeId)) {
            return {
            ok: false,
            severity: "info",
            reason: "No se permite una conexión en ambos sentidos entre los mismos dos elementos.",
            };
        }

        // Si el source ya termina en final, no puede tener más salidas 
        const isFinalTarget =
            targetNodeType === "finalNode" || targetNodeType === "finalFlowNode";

        // ¿El source YA tiene alguna salida hacia algún final?
        const sourceAlreadyEndsInFinal = edges.some((e) => {
            if (e.source !== sourceNodeId) return false;
            const t = findNode(e.target)?.type;
            return t === "finalNode" || t === "finalFlowNode";
        });

        // Si intento conectar a un final, el source NO debe tener salidas previas
        if (isFinalTarget && outgoingCount(sourceNodeId) > 0) {
            return {
            ok: false,
            severity: "info",
            reason:
                "No puedes conectar a un nodo final si el nodo origen ya tiene salidas.",
            };
        }

        // Si el source ya termina en final, no puede crear más salidas
        if (sourceAlreadyEndsInFinal) {
            return {
            ok: false,
            severity: "info",
            reason:
                "Este nodo ya finaliza en un nodo final; no puede tener más salidas.",
            };
        }

        // ---------- GRUPO: Acciones ----------
        const actionTypes = ["simpleAction", "callBehavior", "callOperation"];

        // Entradas al target que vengan del grupo de acciones
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
            severity: "info",
            reason:
                "Una acción solo puede tener una entrada dentro del flujo de control.",
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
            severity: "info",
            reason:
                "Una acción solo puede tener una salida dentro del flujo de control.",
            };
        }

        // ---------- Decision Control ----------
        // Solo 1 conexión de entrada
        if (targetNodeType === "decisionControl" && incomingCount(targetNodeId) > 0) {
            return {
            ok: false,
            severity: "info",
            reason: "Un nodo de decisión solo puede tener una conexión de entrada.",
            };
        }

        // ---------- Merge Node ----------
        // Solo 1 conexión de salida
        if (sourceNodeType === "mergeNode" && outgoingCount(sourceNodeId) > 0) {
            return {
            ok: false,
            severity: "info",
            reason: "Un nodo merge solo puede tener una conexión de salida.",
            };
        }

        // ---------- Initial Node ----------
        // Solo 1 salida
        if (sourceNodeType === "initialNode" && outgoingCount(sourceNodeId) > 0) {
            return {
            ok: false,
            severity: "info",
            reason: "El nodo inicial solo puede tener una salida.",
            };
        }

        if (targetNodeType === "initialNode") {
            return {
            ok: false,
            severity: "info",
            reason: "El nodo inicial no puede recibir conexiones.",
            };
        }

        if (
            sourceNodeType === "initialNode" &&
            (targetNodeType === "objectNode" || targetNodeType === "dataNode")
        ) {
            return {
            ok: false,
            severity: "info",
            reason: "El nodo inicial debe conectarse al flujo de control, no a un nodo de objeto o dato.",
            };
        }

        // ---------- Final Node ----------
        // No acepta salidas
        if (sourceNodeType === "finalNode") {
            return {
            ok: false,
            severity: "info",
            reason: "El nodo final no puede tener salidas.",
            };
        }

        // ---------- Final Flow Node ----------
        // No acepta salidas
        if (sourceNodeType === "finalFlowNode") {
            return {
            ok: false,
            severity: "info",
            reason: "El final de flujo no puede tener salidas.",
            };
        }

        // ---------- Connector Node ----------
        // No múltiples conexiones salientes o entrantes (cualquier lado)
        if (
            sourceNodeType === "connectorNode" &&
            (incomingCount(sourceNodeId) > 0 || outgoingCount(sourceNodeId) > 0)
        ) {
            return {
            ok: false,
            severity: "info",
            reason: "El conector no puede tener múltiples conexiones.",
            };
        }

        if (
            targetNodeType === "connectorNode" &&
            (incomingCount(targetNodeId) > 0 || outgoingCount(targetNodeId) > 0)
        ) {
            return {
            ok: false,
            severity: "info",
            reason: "El conector no puede tener múltiples conexiones.",
            };
        }

        // ---------- Data Node ----------
        // Permitir múltiples entradas y una sola salida
        if (sourceNodeType === "dataNode" && outgoingCount(sourceNodeId) > 0) {
            return {
            ok: false,
            severity: "info",
            reason: "Un nodo de datos puede tener varias entradas, pero solo una salida.",
            };
        }

        // ---------- GRUPO: Object Node ----------
        // Permitir múltiples salidas.
        // Mantener solo 1 entrada (si se requiere en la app).
        if (targetNodeType === "objectNode" && incomingCount(targetNodeId) > 0) {
            return {
            ok: false,
            severity: "info",
            reason: "Un nodo de objeto solo puede tener una entrada.",
            };
        }

        // ---------- Exception Handling ----------
        // Solo una entrada y sin salidas
        if (
            sourceNodeType === "exceptionHandling" ||
            (targetNodeType === "exceptionHandling" && incomingCount(targetNodeId) > 0)
        ) {
            return {
            ok: false,
            severity: "info",
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

        // Validación base: source/target deben existir
        if (!sourceNode || !targetNode) {
            return {
            ok: false,
            severity: "info",
            reason: "No se pudo identificar el nodo origen o destino.",
            };
        }

        const sourceType = sourceNode.type;
        const targetType = targetNode.type;

        // Validación base: tipos requeridos
        if (!sourceType || !targetType) {
            return {
            ok: false,
            severity: "info",
            reason: "No se pudo determinar el tipo de nodo (origen o destino).",
            };
        }

         // Permitir conexiones entre lifelines y también conexiones con notas
        const isNoteConnection = sourceType === "note" || targetType === "note";
        const isLifeLineConnection = sourceType === "lifeLine" && targetType === "lifeLine";

        // Solo permitir conexiones LifeLine <-> LifeLine o Note <-> LifeLine
        if (!isLifeLineConnection && !isNoteConnection) {
            return {
            ok: false,
            severity: "info",
            reason: "Solo se permiten conexiones LifeLine ↔ LifeLine o Note ↔ LifeLine.",
            };
        }

        // Si es conexión con nota, al menos uno debe ser lifeline
        if (isNoteConnection && sourceType !== "lifeLine" && targetType !== "lifeLine") {
            return {
            ok: false,
            severity: "info",
            reason: "Una nota solo puede conectarse con una LifeLine.",
            };
        }

        // En secuencia SIEMPRE debe haber handles
        if (!connection.sourceHandle || !connection.targetHandle) {
            return {
            ok: false,
            severity: "info",
            reason: "En el diagrama de secuencia debes conectar desde un punto de conexión válido en ambos elementos."
            };
        }

        // Self-message: no permitir mismo handle como origen y destino 
        if (
            connection.source === connection.target &&
            connection.sourceHandle === connection.targetHandle
        ) {
            return {
            ok: false,
            severity: "info",
            reason: "No se permite un mensaje a sí mismo usando el mismo punto de conexión.",
            };
        }

        // Evitar duplicar exactamente el mismo mensaje (mismos handles) 
        if (
            edges.some(
            (e) =>
                e.sourceHandle === connection.sourceHandle &&
                e.targetHandle === connection.targetHandle
            )
        ) {
            return {
            ok: false,
            severity: "info",
            reason: "Ya existe un mensaje entre esos mismos puntos de conexión.",
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
