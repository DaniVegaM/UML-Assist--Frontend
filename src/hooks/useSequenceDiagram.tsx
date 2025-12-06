import { useContext } from 'react';
import { SequenceDiagramContext } from '../contexts/SequenceDiagramContext';

export function useSequenceDiagram() {
  const context = useContext(SequenceDiagramContext);
  
  if (context === undefined) {
    throw new Error('useSequenceDiagramContext must be used within a CanvasProvider');
  }
  return context;
}
