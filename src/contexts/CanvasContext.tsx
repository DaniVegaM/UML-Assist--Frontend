/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useState, type ReactNode } from 'react';
export interface ContextMenuState {
  x: number;
  y: number;
  nodeId: string;
}

export interface EdgeContextMenuState {
  x: number;
  y: number;
  edgeId: string;
}

interface CanvasContextType {
  isZoomOnScrollEnabled: boolean;
  setIsZoomOnScrollEnabled: (enabled: boolean) => void;
  isTryingToConnect: boolean;
  setIsTryingToConnect: (trying: boolean) => void;
  generateUniqueId: () => string;
  contextMenu: ContextMenuState | null;
  openContextMenu: (data: ContextMenuState) => void;
  closeContextMenu: () => void;
  edgeContextMenu: EdgeContextMenuState | null;
  openEdgeContextMenu: (data: EdgeContextMenuState) => void;
  closeEdgeContextMenu: () => void;
}

export const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export function CanvasProvider({ children }: { children: ReactNode }) {
  const [isZoomOnScrollEnabled, setIsZoomOnScrollEnabled] = useState(true);
  const [isTryingToConnect, setIsTryingToConnect] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [edgeContextMenu, setEdgeContextMenu] = useState<EdgeContextMenuState | null>(null);

  const generateUniqueId = useCallback(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 8; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  }, []);

  const openContextMenu = useCallback((data: ContextMenuState) => {
    setContextMenu(data);
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const openEdgeContextMenu = useCallback((data: EdgeContextMenuState) => {
    setEdgeContextMenu(data);
  }, []);

  const closeEdgeContextMenu = useCallback(() => {
    setEdgeContextMenu(null);
  }, []);

  return (
    <CanvasContext.Provider
      value={{
        isZoomOnScrollEnabled,
        setIsZoomOnScrollEnabled,
        isTryingToConnect,
        setIsTryingToConnect,
        generateUniqueId,
        contextMenu,
        openContextMenu,
        closeContextMenu,
        edgeContextMenu,
        openEdgeContextMenu,
        closeEdgeContextMenu,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
}
