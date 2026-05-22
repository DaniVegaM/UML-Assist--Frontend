/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, type ReactNode } from "react";
import { useUndoRedo, type UndoRedoApi } from "../hooks/useUndoRedo";

const UndoRedoContext = createContext<UndoRedoApi | undefined>(undefined);

/**
 * Provee el historial de undo/redo a todo el lienzo (página + Header + nodos).
 * DEBE montarse dentro de <ReactFlowProvider> porque `useUndoRedo` usa
 * `useReactFlow()`.
 */
export function UndoRedoProvider({ children }: { children: ReactNode }) {
  const api = useUndoRedo();
  return <UndoRedoContext.Provider value={api}>{children}</UndoRedoContext.Provider>;
}

export function useUndoRedoContext() {
  const context = useContext(UndoRedoContext);
  if (context === undefined) {
    throw new Error("useUndoRedoContext must be used within an UndoRedoProvider");
  }
  return context;
}
