import { useCallback, useRef } from "react";
import { useUndoRedoContext } from "../contexts/UndoRedoContext";
import type { Snapshot } from "./useUndoRedo";

/**
 * Maneja el historial de la edición de texto de un nodo con granularidad de
 * "sesión completa": un Ctrl+Z revierte todo lo escrito desde que se entró a
 * editar hasta el blur.
 *
 * Uso en un nodo:
 *   const { onEditStart, onEditCommit } = useUndoableText(value);
 *   // en handleDoubleClick / onFocus, antes de empezar a editar: onEditStart()
 *   // en handleBlur: onEditCommit()
 *
 * Solo confirma un paso en el historial si el texto realmente cambió, de modo
 * que entrar y salir de edición sin escribir no genera pasos vacíos.
 */
export function useUndoableText(value: string) {
  const { captureSnapshot, commitSnapshot } = useUndoRedoContext();

  // Mantiene el valor vivo sin recrear callbacks.
  const valueRef = useRef(value);
  valueRef.current = value;

  const preEditSnapshot = useRef<Snapshot | null>(null);
  const preEditValue = useRef("");

  const onEditStart = useCallback(() => {
    preEditSnapshot.current = captureSnapshot();
    preEditValue.current = valueRef.current;
  }, [captureSnapshot]);

  const onEditCommit = useCallback(() => {
    if (preEditSnapshot.current && valueRef.current !== preEditValue.current) {
      commitSnapshot(preEditSnapshot.current);
    }
    preEditSnapshot.current = null;
  }, [commitSnapshot]);

  return { onEditStart, onEditCommit };
}
