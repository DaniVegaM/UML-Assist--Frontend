import type { Position } from "@xyflow/react";

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
    id: number;
    type: 'source' | 'target';
    showSourceHandleOptions: boolean;
    showTargetHandleOptions: boolean;
    position?: Position;
    maxSourceConnections?: number;
    maxTargetConnections?: number;
    className?: string;
}

export interface HeaderProps {
    diagramTitle?: string;
}