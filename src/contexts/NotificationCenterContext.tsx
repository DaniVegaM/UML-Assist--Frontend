import React, { createContext, useContext, useMemo, useState } from "react";

export type NotificationCenterType = "success" | "error" | "info" | "warning";

export interface NotificationCenterItem {
    id: string;
    type: NotificationCenterType;
    title: string;
    description?: string;
    createdAt: number;
}

type Ctx = {
    history: NotificationCenterItem[];
    isOpen: boolean;
    toggle: () => void;
    clear: () => void;
    push: (n: Omit<NotificationCenterItem, "id" | "createdAt">) => void;
    remove: (id: string) => void;
};

const NotificationCenterContext = createContext<Ctx | null>(null);
const MAX_HISTORY = 50;

export function NotificationCenterProvider({ children }: { children: React.ReactNode }) {
    const [history, setHistory] = useState<NotificationCenterItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    const toggle = () => setIsOpen(v => !v);
    const clear = () => setHistory([]);
    const remove = (id: string) => setHistory(prev => prev.filter(x => x.id !== id));

    const push: Ctx["push"] = (n) => {
        const item: NotificationCenterItem = {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        ...n,
        };
    setHistory(prev => [item, ...prev].slice(0, MAX_HISTORY));
};

    const value = useMemo(() => ({ history, isOpen, toggle, clear, push, remove }), [history, isOpen]);

    return (
    <NotificationCenterContext.Provider value={value}>
        {children}
    </NotificationCenterContext.Provider>
    );
}

export function useNotificationCenter() {
    const ctx = useContext(NotificationCenterContext);
    if (!ctx) throw new Error("useNotificationCenter debe usarse dentro de NotificationCenterProvider");
    return ctx;
}
