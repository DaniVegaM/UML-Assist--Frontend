import { useEffect } from "react";
import { useUndoRedoContext } from "../contexts/UndoRedoContext";

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
}

/**
 * Registra los atajos globales de teclado:
 *  - Ctrl/Cmd+Z            -> deshacer
 *  - Ctrl/Cmd+Shift+Z      -> rehacer
 *  - Ctrl+Y                -> rehacer
 *
 * Si el foco está en un campo de texto editable no interceptamos, dejando que
 * el navegador maneje el undo nativo del texto que se está escribiendo.
 */
export function useUndoRedoShortcuts() {
  const { undo, redo } = useUndoRedoContext();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey;
      if (!mod) return;
      if (isEditableTarget(event.target)) return;

      const key = event.key.toLowerCase();

      if (key === "z" && !event.shiftKey) {
        event.preventDefault();
        undo();
      } else if ((key === "z" && event.shiftKey) || key === "y") {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [undo, redo]);
}
