import { useCallback, useRef, useState } from "react";
import { useReactFlow, type Edge, type Node } from "@xyflow/react";

export type Snapshot = { nodes: Node[]; edges: Edge[] };

// Tope de pasos guardados en el historial. Al excederlo se descarta el más viejo.
const MAX_HISTORY = 100;

// Tipos de nodo transitorios/UI que NO forman parte del diagrama y por tanto se
// excluyen del historial (p. ej. los botones "+" para agregar lifelines, que
// aparecen y desaparecen al pasar el mouse). Si se capturaran, generarían pasos
// de undo/redo "vacíos" sin cambio visible.
const TRANSIENT_NODE_TYPES = new Set<string>(["addLifeLineBtn"]);

/**
 * Copia profunda de los nodos/edges para un snapshot.
 * Usamos JSON (igual que el autosave) porque garantiza que el estado del
 * historial es serializable y, por tanto, idéntico al que se persiste.
 */
function cloneState<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/**
 * Huella de un snapshot que ignora campos volátiles de React Flow
 * (selección, medición, dimensiones, estilos del tema, etc.). Se usa para
 * detectar pasos "vacíos": si dos estados tienen la misma huella, deshacer entre
 * ellos no produciría ningún cambio visible para el usuario.
 */
function fingerprint(snapshot: Snapshot): string {
  const nodes = snapshot.nodes.map((n) => ({
    id: n.id,
    type: n.type,
    position: n.position,
    parentId: n.parentId,
    data: n.data,
  }));
  const edges = snapshot.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    sourceHandle: e.sourceHandle,
    targetHandle: e.targetHandle,
    type: e.type,
    label: e.label,
    data: e.data,
  }));
  return JSON.stringify({ nodes, edges });
}

/**
 * Núcleo de undo/redo basado en snapshots sobre la instancia de React Flow.
 *
 * Principio: NO grabamos cada cambio de estado, sino que tomamos un snapshot
 * en las fronteras de acción del usuario (antes de mutar). Esto evita pasos
 * "fantasma" generados por los effects de sincronización de los nodos.
 *
 * Sirve igual para ambos diagramas porque se apoya en `useReactFlow()`.
 */
export function useUndoRedo() {
  const { getNodes, getEdges, setNodes, setEdges } = useReactFlow();

  const past = useRef<Snapshot[]>([]);
  const future = useRef<Snapshot[]>([]);

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Se incrementa en cada undo/redo. Los nodos lo observan para reconciliar su
  // estado local (texto, handles) desde `data` tras una restauración.
  const [historyVersion, setHistoryVersion] = useState(0);

  // True mientras se aplica una restauración. Los effects `local -> data` de los
  // nodos pueden consultarlo para evitar re-escribir estado viejo (race guard).
  const isRestoring = useRef(false);

  const syncFlags = useCallback(() => {
    setCanUndo(past.current.length > 0);
    setCanRedo(future.current.length > 0);
  }, []);

  /** Copia el estado actual sin empujarlo a ninguna pila (omite nodos transitorios). */
  const captureSnapshot = useCallback(
    (): Snapshot => ({
      nodes: cloneState(getNodes().filter((n) => !TRANSIENT_NODE_TYPES.has(n.type ?? ""))),
      edges: cloneState(getEdges()),
    }),
    [getNodes, getEdges],
  );

  /** Empuja un snapshot dado a `past` y limpia `future`. */
  const commitSnapshot = useCallback(
    (snapshot: Snapshot) => {
      past.current.push(snapshot);
      if (past.current.length > MAX_HISTORY) past.current.shift();
      future.current = [];
      syncFlags();
    },
    [syncFlags],
  );

  /** Captura + commit del estado actual (acciones discretas: agregar, borrar, conectar...). */
  const takeSnapshot = useCallback(() => {
    commitSnapshot(captureSnapshot());
  }, [captureSnapshot, commitSnapshot]);

  const restore = useCallback(
    (target: Snapshot) => {
      isRestoring.current = true;
      setNodes(cloneState(target.nodes));
      setEdges(cloneState(target.edges));
      setHistoryVersion((v) => v + 1);
      // Se libera tras el render/effects de la restauración.
      requestAnimationFrame(() => {
        isRestoring.current = false;
      });
    },
    [setNodes, setEdges],
  );

  const undo = useCallback(() => {
    if (past.current.length === 0) return;
    const current = captureSnapshot();
    const currentFp = fingerprint(current);

    // Saltar pasos sin cambio visible (solo diferencias de selección/medición/etc.)
    // para que cada pulsación de deshacer produzca un cambio real.
    let target: Snapshot | undefined;
    while (past.current.length > 0) {
      const candidate = past.current.pop()!;
      if (fingerprint(candidate) !== currentFp) {
        target = candidate;
        break;
      }
    }

    if (!target) {
      syncFlags();
      return;
    }
    future.current.push(current);
    restore(target);
    syncFlags();
  }, [captureSnapshot, restore, syncFlags]);

  const redo = useCallback(() => {
    if (future.current.length === 0) return;
    const current = captureSnapshot();
    const currentFp = fingerprint(current);

    let target: Snapshot | undefined;
    while (future.current.length > 0) {
      const candidate = future.current.pop()!;
      if (fingerprint(candidate) !== currentFp) {
        target = candidate;
        break;
      }
    }

    if (!target) {
      syncFlags();
      return;
    }
    past.current.push(current);
    restore(target);
    syncFlags();
  }, [captureSnapshot, restore, syncFlags]);

  return {
    takeSnapshot,
    captureSnapshot,
    commitSnapshot,
    undo,
    redo,
    canUndo,
    canRedo,
    historyVersion,
    isRestoring,
  };
}

export type UndoRedoApi = ReturnType<typeof useUndoRedo>;
