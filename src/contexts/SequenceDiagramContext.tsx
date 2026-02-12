/* eslint-disable react-refresh/only-export-components */

import { createContext, type ReactNode, useState } from "react";
import { type Edge, type Node } from "@xyflow/react";
import { createPrefixedNodeId } from "../utils/idGenerator";

console.log("🔥 CREATE ACTIVITIES FILE LOADED 123");

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
            id: createPrefixedNodeId("lifeLine"),
            type: 'lifeLine', 
            position: { x: 400, y: 100 }, 
            data: { label: "" },
            connectable: true,
            zIndex: -1,
            style: {
                zIndex: -1
            }
        }
    ]
    const [nodes, setNodes] = useState<Node<NodeData>[]>(initialNodes);
    const [edges, setEdges] = useState<Edge[]>([]);

    return (
        <SequenceDiagramContext.Provider value={{ nodes, setNodes, edges, setEdges }}>
            {children}
        </SequenceDiagramContext.Provider>
    );
}