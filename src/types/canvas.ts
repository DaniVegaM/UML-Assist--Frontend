import type { Edge, Node, Position } from "@xyflow/react";

export interface DraggableNodeProps {
    className?: string;
    children: React.ReactNode;
    nodeType: string;
    label?: string;
    description?: string;
    svg?: React.ReactNode;
    // edgeType?: string;
    incomingEdge? : string;
    outgoingEdge? : string;
    setExtendedBar?: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface ElementsBarProps {
    nodes: {
        className?: string;
        svg: React.ReactNode;
        nodeType: string;
        label: string;
        description?: string;
        separator?: string;
        grouped?: boolean;
    }[];
    oneColumn?: boolean;
}

export interface BaseHandleProps {
    id: number | string;
    ref?: React.RefObject<HTMLDivElement>;
    position?: Position;
    className?: string;
    showHandle?: boolean;
}
export interface ActivityHandleProps {
    id: string;
    position?: Position;
    className?: string;
    showHandle?: boolean;
    setSourceHandle?: React.Dispatch<React.SetStateAction<string[] | null>>;
    setTargetHandle?: React.Dispatch<React.SetStateAction<string[] | null>>;
}

export interface HeaderProps {
    diagramTitle?: string;
    diagramId: number | undefined;
    type: string;
    nodes: Node[];
    edges: Edge[];
}