import { useState } from "react";

export function useNode() {
    const [showSourceHandleOptions, setShowSourceHandleOptions] = useState(false);
    const [showTargetHandleOptions, setShowTargetHandleOptions] = useState(false);

    return {
        showSourceHandleOptions,
        setShowSourceHandleOptions,
        showTargetHandleOptions,
        setShowTargetHandleOptions,
    };
}