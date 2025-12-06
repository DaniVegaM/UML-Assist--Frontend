import { type ReactNode, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface ContextMenuPortalProps {
    children: ReactNode;
    event: MouseEvent;
    onClose: () => void;
}

export default function ContextMenuPortal({ children, event, onClose }: ContextMenuPortalProps) {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: globalThis.MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside, true);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside, true);
        };
    }, [onClose]);

    const { clientX, clientY } = event;
    const style = {
        position: 'absolute',
        top: `${clientY}px`,
        left: `${clientX}px`,
        zIndex: 10000,
    } as const;

    return createPortal(
        <div ref={menuRef} style={style}>
            {children}
        </div>,
        document.body
    );
}