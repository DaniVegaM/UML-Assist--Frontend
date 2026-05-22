import { useCallback, useEffect, useRef } from "react";
import { useUndoableText } from "./useUndoableText";
import { useUndoRedoContext } from "../contexts/UndoRedoContext";
import type { HandleData } from "./useHandle";
import type { Snapshot } from "./useUndoRedo";

/**
 * Maneja el historial del texto (label) de un nodo:
 *  - Snapshot al iniciar la edición / confirmación al salir (vía useUndoableText).
 *  - Reconciliación: tras un undo/redo, re-deriva el `value` local desde `data.label`
 *    (el componente no se remonta, así que su useState no se entera del cambio en data).
 *
 * Devuelve onEditStart/onEditCommit para enganchar en doble clic/focus y blur.
 */
export function useUndoableNodeLabel(
  value: string,
  setValue: (v: string) => void,
  dataLabel: string | undefined,
  isEditing: boolean,
) {
  const { onEditStart, onEditCommit } = useUndoableText(value);
  const { historyVersion } = useUndoRedoContext();

  useEffect(() => {
    if (historyVersion > 0 && !isEditing) {
      setValue(dataLabel ?? "");
    }
    // Solo debe correr cuando cambia historyVersion (undo/redo).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyVersion]);

  return { onEditStart, onEditCommit };
}

/**
 * Reconcilia los handles dinámicos locales (useHandle) desde `data.handles`
 * después de un undo/redo.
 */
export function useReconcileHandlesOnHistory(
  setHandles: (handles: HandleData[]) => void,
  dataHandles: HandleData[] | undefined,
) {
  const { historyVersion } = useUndoRedoContext();

  useEffect(() => {
    if (historyVersion > 0 && dataHandles && dataHandles.length > 0) {
      setHandles(dataHandles);
    }
    // Solo debe correr cuando cambia historyVersion (undo/redo).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyVersion]);
}

/**
 * Historial del label de una arista. Las aristas pintan su `label` directamente
 * desde el estado de React Flow, así que no necesitan reconciliación: basta con
 * tomar un snapshot al iniciar la edición y confirmarlo al guardar si cambió.
 *
 *   const { begin, commit } = useUndoableEdgeLabel();
 *   // al entrar a editar: begin(labelActual)
 *   // al guardar:        commit(labelNuevo)
 */
export function useUndoableEdgeLabel() {
  const { captureSnapshot, commitSnapshot } = useUndoRedoContext();
  const snapshot = useRef<Snapshot | null>(null);
  const startLabel = useRef<string>("");

  const begin = useCallback(
    (currentLabel: string) => {
      snapshot.current = captureSnapshot();
      startLabel.current = currentLabel;
    },
    [captureSnapshot],
  );

  const commit = useCallback(
    (newLabel: string) => {
      if (snapshot.current && newLabel !== startLabel.current) {
        commitSnapshot(snapshot.current);
      }
      snapshot.current = null;
    },
    [commitSnapshot],
  );

  return { begin, commit };
}
