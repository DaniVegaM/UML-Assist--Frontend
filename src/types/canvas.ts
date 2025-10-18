export interface DraggableNodeProps {
    className?: string;
    children: React.ReactNode;
    nodeType: string;
}

export interface ElementsBarProps {
    nodes: {
        className?: string;
        svg: React.ReactNode;
        nodeType: string;
        label: string;
        separator?: boolean;
        separatorLabel?: string;
    }[];
}