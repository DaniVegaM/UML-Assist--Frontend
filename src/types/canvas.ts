export interface DraggableNodeProps {
    className?: string;
    children: React.ReactNode;
    nodeType: string;
    label?: string;
    description?: string;
    svg?: React.ReactNode;
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
}