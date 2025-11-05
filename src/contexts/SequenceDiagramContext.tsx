/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, type ReactNode } from 'react';
import { type Node, type Handle } from '@xyflow/react';

interface SequenceDiagramContextType {
    nodes: Node[],
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
    lastLifeLine: Node | undefined,
    setLastLifeLine: React.Dispatch<React.SetStateAction<Node | undefined>>,
    nodesPerLifeLine: Array<{lifeLineId: string, nodes: Array<Node | Handle>}> | undefined,
    setNodesPerLifeLine: React.Dispatch<React.SetStateAction<Array<{lifeLineId: string, nodes: Array<Node | Handle>}> | undefined>>
}

export const SequenceDiagramContext = createContext<SequenceDiagramContextType | undefined>(undefined);

export function CanvasProvider({ children }: { children: ReactNode }) {
    const initialNodes: Node[] = [
        { id: 'lifeLine_0', type: 'lifeLine', position: { x: 400, y: 100 }, data: {} },
    ]
    const [nodes, setNodes] = useState<Node[]>(initialNodes);
    const [lastLifeLine, setLastLifeLine] = useState<Node>();
    const [nodesPerLifeLine, setNodesPerLifeLine] = useState<Array<{lifeLineId: string, nodes: Array<Node | Handle>}>>();

    return (
        <SequenceDiagramContext value={{ nodes, setNodes, lastLifeLine, setLastLifeLine, nodesPerLifeLine, setNodesPerLifeLine }}>
            {children}
        </SequenceDiagramContext>
    );
}
