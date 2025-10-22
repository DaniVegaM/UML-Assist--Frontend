import { createContext, useState, type ReactNode } from 'react';

interface CanvasContextType {
  isZoomOnScrollEnabled: boolean;
  setIsZoomOnScrollEnabled: (enabled: boolean) => void;
}

export const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export function CanvasProvider({ children }: { children: ReactNode }) {
  const [isZoomOnScrollEnabled, setIsZoomOnScrollEnabled] = useState(true);

  return (
    <CanvasContext value={{ isZoomOnScrollEnabled, setIsZoomOnScrollEnabled }}>
      {children}
    </CanvasContext>
  );
}
