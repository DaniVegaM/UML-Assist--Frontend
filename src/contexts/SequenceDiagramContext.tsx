/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, type ReactNode } from 'react';
import { type Node, type Edge } from '@xyflow/react';

interface SequenceDiagramContextType {
    nodes: Node[],
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
    edges: Edge[],
    setEdges: React.Dispatch<React.SetStateAction<Edge[]>>,
}

export const SequenceDiagramContext = createContext<SequenceDiagramContextType | undefined>(undefined);

export function CanvasProvider({ children }: { children: ReactNode }) {
    const initialNodes: Node[] = [
        { id: 'lifeLine_0', type: 'lifeLine', position: { x: 400, y: 100 }, data: {} },
    ]
    const [nodes, setNodes] = useState<Node[]>(initialNodes);
    const [edges, setEdges] = useState<Edge[]>([]);

    return (
        <SequenceDiagramContext value={{ nodes, setNodes, edges, setEdges }}>
            {children}
        </SequenceDiagramContext>
    );
}
