/* eslint-disable react-refresh/only-export-components */

import { createContext, type ReactNode, useState } from "react";
import { type Edge, type Node } from "@xyflow/react";

// Define el tipo para los handles
interface Handle {
    id: string;
    order: number;
}

// Extiende el tipo de data del nodo para incluir orderedHandles
interface NodeData {
    orderedHandles?: Handle[];
    [key: string]: any;
}

interface SequenceDiagramContextType {
    nodes: Node<NodeData>[],
    setNodes: React.Dispatch<React.SetStateAction<Node<NodeData>[]>>,
    edges: Edge[],
    setEdges: React.Dispatch<React.SetStateAction<Edge[]>>,
}

export const SequenceDiagramContext = createContext<SequenceDiagramContextType | undefined>(undefined);

export function CanvasProvider({ children }: { children: ReactNode }) {
    const initialNodes: Node<NodeData>[] = [
        { 
            id: 'lifeLine_0', 
            type: 'lifeLine', 
            position: { x: 400, y: 100 }, 
            data: { orderedHandles: [] },
            connectable: true,
            zIndex: -1,
            style: {
                zIndex: -1
            }
        },
        { 
            id: 'addLifeLineBtn_0', 
            type: 'addLifeLineBtn', 
            position: { x: 210, y: 100 }, //Le restamos 200 para centrar el botón respecto a la LifeLine
            data: {},
            connectable: false,
            zIndex: 10,
            style: {
                zIndex: 10
            }
        },
        { 
            id: 'addLifeLineBtn_1', 
            type: 'addLifeLineBtn', 
            position: { x: 750, y: 100 }, //Le sumamos 170 para centrar el botón respecto a la LifeLine
            data: {},
            connectable: false,
            zIndex: 10,
            style: {
                zIndex: 10
            }
        },
    ]
    const [nodes, setNodes] = useState<Node<NodeData>[]>(initialNodes);
    const [edges, setEdges] = useState<Edge[]>([]);

    return (
        <SequenceDiagramContext.Provider value={{ nodes, setNodes, edges, setEdges }}>
            {children}
        </SequenceDiagramContext.Provider>
    );
}