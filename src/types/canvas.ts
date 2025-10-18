export interface DraggableNodeProps {
    className?: string;
    children: React.ReactNode;
    nodeType: string;
    setExtendedBar?: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface ElementsBarProps {
    nodes: {
        className?: string;
        svg: React.ReactNode;
        nodeType: string;
        label: string;
        separator?: string;
        grouped?: boolean;
    }[];
}