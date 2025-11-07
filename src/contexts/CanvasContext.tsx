/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useState, type ReactNode } from 'react';

interface CanvasContextType {
  isZoomOnScrollEnabled: boolean;
  setIsZoomOnScrollEnabled: (enabled: boolean) => void;
  isTryingToConnect: boolean;
  setIsTryingToConnect: (trying: boolean) => void;
  generateUniqueId: () => string;
}

export const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export function CanvasProvider({ children }: { children: ReactNode }) {
  const [isZoomOnScrollEnabled, setIsZoomOnScrollEnabled] = useState(true);
  const [isTryingToConnect, setIsTryingToConnect] = useState(false);

  const generateUniqueId = useCallback(() => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let id = '';
        for (let i = 0; i < 8; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    }, []);

  return (
    <CanvasContext value={{ isZoomOnScrollEnabled, setIsZoomOnScrollEnabled, isTryingToConnect, setIsTryingToConnect, generateUniqueId }}>
      {children}
    </CanvasContext>
  );
}
