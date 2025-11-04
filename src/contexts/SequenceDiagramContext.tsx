/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, type ReactNode } from 'react';
import { type Node } from '@xyflow/react';

interface SequenceDiagramContextType {
    nodes: Node[],
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
    lastLifeLine: Node | undefined,
    setLastLifeLine: React.Dispatch<React.SetStateAction<Node | undefined>>,
}

export const SequenceDiagramContext = createContext<SequenceDiagramContextType | undefined>(undefined);

export function CanvasProvider({ children }: { children: ReactNode }) {
    const initialNodes: Node[] = [
        { id: 'lifeLine_0', type: 'lifeLine', position: { x: 400, y: 100 }, data: {} },
    ]
    const [nodes, setNodes] = useState<Node[]>(initialNodes);
    const [lastLifeLine, setLastLifeLine] = useState<Node>();

    return (
        <SequenceDiagramContext value={{ nodes, setNodes, lastLifeLine, setLastLifeLine }}>
            {children}
        </SequenceDiagramContext>
    );
}
