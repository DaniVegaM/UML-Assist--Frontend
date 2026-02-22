import { type Node, type Edge } from "@xyflow/react";

export type Diagram = {
    id?: number;
    title: string;
    user?: number;
    created_at?: Date;
    updated_at?: Date;
    content?: Content;
    preview_image?: string;
}

export type Content = {
    type: string;
    canvas: Canvas;
}

export type Canvas = {
    nodes: Node[];
    edges: Edge[];
    totalNodes: number;
    totalEdges: number;
}

export type MarkerEnd = {
    type: string;
    width: number;
    height: number;
    color: string;
}

export type Style = {
    strokeWidth: number;
    stroke: string;
}


export type Data = {
    label: string;
    incomingEdge: string;
    outgoingEdge: string;
}

export type Measured = {
    width: number;
    height: number;
}

export type Position = {
    x: number;
    y: number;
}

export type ReviewDiagramData = {
    userPrompt: string;
    diagramType: 'activities' | 'sequence';
    intermediateLanguage: string;
}