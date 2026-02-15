import { useCallback } from "react";
import type { Connection, Edge, Node } from "@xyflow/react";

/**
 * Hook para validaciones locales de:
 * - Actividades (isValidActivityConnection)
 * - Secuencia (isValidSequenceConnection)
 */
export function useLocalValidations(nodes: Node[], edges: Edge[]) {
    //Helpers internos (para no repetir lógica)

    const findNode = useCallback(
        (id?: string | null) => nodes.find((n) => n.id === id),
        [nodes]
    );

    const hasAnyHandleUsed = useCallback(
        (conn: Connection | Edge) =>
        edges.some(
            (e) =>
            e.sourceHandle === conn.sourceHandle ||
            e.sourceHandle === conn.targetHandle ||
            e.targetHandle === conn.targetHandle ||
            e.targetHandle === conn.sourceHandle
        ),
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

    

    //ACTIVIDADES
    
    const isValidActivityConnection = useCallback(
        (connection: Edge | Connection) => {
        const sourceNode = findNode(connection.source);
        const targetNode = findNode(connection.target);

        // Validación base: source/target deben existir
        if (!sourceNode || !targetNode) return false;

        const sourceNodeId = sourceNode.id;
        const targetNodeId = targetNode.id;
        const sourceNodeType = sourceNode.type;
        const targetNodeType = targetNode.type;

        // Validación base: tipos requeridos
        if (!sourceNodeType || !targetNodeType) return false;

        // Un solo handle por conexión
        if (hasAnyHandleUsed(connection)) return false;

        // Evitar conexiones a uno mismo
        if (sourceNodeId === targetNodeId) return false;

        // Evitar múltiples conexiones entre dos nodos (A → B repetido)
        if (hasEdge(sourceNodeId, targetNodeId)) return false;

        // Evitar loops entre 2 nodos (A → B y B → A)
        if (hasReverseEdge(sourceNodeId, targetNodeId)) return false;

        // ---------- Si el source ya termina en un final, no puede tener más salidas 
        const isFinalTarget =
        targetNodeType === "finalNode" || targetNodeType === "finalFlowNode";

        // ¿El source YA tiene alguna salida hacia algún final?
        const sourceAlreadyEndsInFinal = edges.some((e) => {
            if (e.source !== sourceNodeId) return false;
            const t = findNode(e.target)?.type;
            return t === "finalNode" || t === "finalFlowNode";
        });

        //Si intento conectar a un final, el source NO debe tener salidas previas
        if (isFinalTarget && outgoingCount(sourceNodeId) > 0) {
            return false;
        }

        // Si el source ya termina en final, entonces NO puede crear más salidas (a cualquier nodo)
        if (sourceAlreadyEndsInFinal) {
            return false;
        }


        // ---------- GRUPO: Acciones (simpleAction/callBehavior/callOperation) ----------
        const actionTypes = ["simpleAction", "callBehavior", "callOperation"];

        // Entradas al target que vengan del grupo de acciones
        const incomingEdgesFromActionGroup = edges.filter(
            (e) =>
            e.target === targetNodeId &&
            actionTypes.some((t) => String(e.source).includes(t))
        );

        // Salidas del source hacia el grupo de acciones
        const outgoingEdgesToActionGroup = edges.filter(
            (e) =>
            e.source === sourceNodeId &&
            actionTypes.some((t) => String(e.target).includes(t))
        );

        // REGLA 1: una acción NO puede tener más de 1 entrada (desde el grupo)
        if (actionTypes.includes(targetNodeType) && incomingEdgesFromActionGroup.length > 0) {
            return false;
        }

        // REGLA 2: una acción NO puede tener más de 1 salida (hacia el grupo)
        if (actionTypes.includes(sourceNodeType) && actionTypes.includes(targetNodeType) && outgoingEdgesToActionGroup.length > 0) {
            return false;
        }

        // ---------- GRUPO: Decision Control ----------
        // Solo 1 conexión de entrada
        if (targetNodeType === "decisionControl" && incomingCount(targetNodeId) > 0) {
            return false;
        }

        // ---------- GRUPO: Merge Node ----------
        // Solo 1 conexión de salida
        if (sourceNodeType === "mergeNode" && outgoingCount(sourceNodeId) > 0) {
            return false;
        }


        // ---------- GRUPO: Initial Node ----------
        // Solo 1 salida
        if (sourceNodeType === "initialNode" && outgoingCount(sourceNodeId) > 0) {
            return false;
        }
        // No acepta entradas
        if (targetNodeType === "initialNode") {
            return false;
        }
        //Initial NO puede conectar directo a Object o Data
        if (
            sourceNodeType === "initialNode" &&
            (targetNodeType === "objectNode" || targetNodeType === "dataNode")
        ) {
            return false;
        }



        // ---------- GRUPO: Final Node ----------
        // No acepta salidas
        if (sourceNodeType === "finalNode") {
            return false;
        }
      
        // ---------- GRUPO: Final Flow Node ----------
        // No acepta salidas
        if (sourceNodeType === "finalFlowNode") {
            return false;
        }
      
        // ---------- GRUPO: Connector Node ----------
        // No múltiples conexiones salientes o entrantes (cualquier lado)
        if (sourceNodeType === "connectorNode" && (incomingCount(sourceNodeId) > 0 || outgoingCount(sourceNodeId) > 0)) {
            return false;
        }
        if (targetNodeType === "connectorNode" && (incomingCount(targetNodeId) > 0 || outgoingCount(targetNodeId) > 0)) {
            return false;
        }

        // ---------- GRUPO: Data Node ----------
        // Permitir múltiples entradas y una sola salida
        if (sourceNodeType === "dataNode" && outgoingCount(sourceNodeId) > 0) {
            return false;
        }

        // ---------- GRUPO: Object Node ----------
        // Permitir múltiples salidas.
        // Mantener solo 1 entrada (si se requiere en la app).
        if (targetNodeType === "objectNode" && incomingCount(targetNodeId) > 0) {
        return false;
        }

        // ---------- GRUPO: Exception Handling ----------
        // Solo una entrada y sin salidas
        if (
            sourceNodeType === "exceptionHandling" ||
            (targetNodeType === "exceptionHandling" && incomingCount(targetNodeId) > 0)
        ) {
            return false;
        }

        return true;
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

    
    // SECUENCIA
    const isValidSequenceConnection = useCallback(
        (connection: Edge | Connection) => {
            const sourceNode = findNode(connection.source);
            const targetNode = findNode(connection.target);

            // Validación base: source/target deben existir
            if (!sourceNode || !targetNode) return false;

            const sourceType = sourceNode.type;
            const targetType = targetNode.type;

            // Validación base: tipos requeridos
            if (!sourceType || !targetType) return false;

            // Permitir conexiones entre lifelines y también conexiones con notas
            const isNoteConnection = sourceType === 'note' || targetType === 'note';
            const isLifeLineConnection = sourceType === "lifeLine" && targetType === "lifeLine";

            // Solo permitir conexiones LifeLine <-> LifeLine o Note <-> LifeLine
            if (!isLifeLineConnection && !isNoteConnection) return false;

            // Si es conexión con nota, al menos uno debe ser lifeline
            if (isNoteConnection && sourceType !== "lifeLine" && targetType !== "lifeLine") {
                return false;
            }

            // En secuencia SIEMPRE debe haber handles
            if (!connection.sourceHandle || !connection.targetHandle) return false;

            // Self-message: no permitir mismo handle como origen y destino
            if (
                connection.source === connection.target &&
                connection.sourceHandle === connection.targetHandle
            ) {
                return false;
            }

            // Evitar duplicar exactamente el mismo mensaje (mismos handles)
            if (
            edges.some(
                (e) =>
                    e.sourceHandle === connection.sourceHandle &&
                    e.targetHandle === connection.targetHandle
            )
            ) {
                return false;
            }

            return true;
        },
        [edges, findNode]
    );


    return {
        isValidActivityConnection,
        isValidSequenceConnection
    };
}
