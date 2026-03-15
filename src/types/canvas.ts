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
    title?: string;
    onMouseEnter?: (e: React.MouseEvent<HTMLDivElement>) => void;
    onMouseLeave?: (e: React.MouseEvent<HTMLDivElement>) => void;
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
    ref?: React.Ref<HTMLDivElement | null>;
    position?: Position;
    left?: number;
    top?: number;
    className?: string;
    showHandle?: boolean;
    onContextMenu?: (e: React.MouseEvent<Element, MouseEvent>) => void;
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

export interface DataProps{
    data:{
        handles: {id: number, left?: number, top?: number, position: Position}[], 
        incomingEdge?: string, 
        outgoingEdge?: string,
        label?: string
        destroyHandleIndex?: number,
        isCreatedLifeLine?: boolean,
        orderedHandles?: {id: string, order: number}[],
        sourceBoxesLength?: number,
        targetBoxesLength?: number,
        suggestion?: string;
    }
}

export interface AltFragmentData {
    firstOperand?: string;
    separatorValues?: string[];
    separatorPositions?: number[];
    suggestion?: string;
    [key: string]: unknown;
}

export interface ParFragmentData {
    separatorPositions?: number[];
    suggestion?: string;
    [key: string]: unknown;
}

export interface EdgeDataProps {
    suggestion?: string;
    [key: string]: unknown;
}
