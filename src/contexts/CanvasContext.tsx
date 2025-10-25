/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, type ReactNode } from 'react';

interface CanvasContextType {
  isZoomOnScrollEnabled: boolean;
  setIsZoomOnScrollEnabled: (enabled: boolean) => void;
  isTryingToConnect: {isTrying: boolean, sourceNodeId?: string};
  setIsTryingToConnect: (status: {isTrying: boolean, sourceNodeId?: string}) => void;
}

export const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export function CanvasProvider({ children }: { children: ReactNode }) {
  const [isZoomOnScrollEnabled, setIsZoomOnScrollEnabled] = useState(true);
  const [isTryingToConnect, setIsTryingToConnect] = useState<{isTrying: boolean, sourceNodeId?: string}>({isTrying: false, sourceNodeId: undefined});

  return (
    <CanvasContext value={{ isZoomOnScrollEnabled, setIsZoomOnScrollEnabled, isTryingToConnect, setIsTryingToConnect }}>
      {children}
    </CanvasContext>
  );
}
