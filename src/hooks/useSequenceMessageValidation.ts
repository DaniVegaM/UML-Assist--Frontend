import { useCallback, useMemo, useState } from "react";


const SEQUENCE_MESSAGE_REGEX =
    /^\s*(?:(?<variable>[A-Za-z_]\w*)\s*=\s*)?(?<name>[A-Za-z_]\w*)(?:\s*\((?<params>[^)]*)\))?\s*(?::\s*(?<return>[A-Za-z_]\w*))?\s*$/;

function parseMessageParts(value: string) {
    const trimmed = value.trim();

    const draft = trimmed.match(/^\s*(?:[A-Za-z_]\w*\s*=\s*)?(?<name>[A-Za-z_]\w*)/);
    const draftName = (draft?.groups as any)?.name || "";

    const hasEquals = /=/.test(trimmed);
    const hasOpenParen = /\(/.test(trimmed);
    const hasCloseParen = /\)/.test(trimmed);
    const hasColon = /:/.test(trimmed);

    const match = trimmed.match(SEQUENCE_MESSAGE_REGEX);
    const g: any = match?.groups || {};

    const paramsText = (g.params ?? "").trim();
    const paramsOk =
        paramsText === "" ||
        paramsText.split(",").every((p) => /^[A-Za-z_]\w*$/.test(p.trim()));

    return {
        hasEquals,
        hasOpenParen,
        hasCloseParen,
        hasColon,

        variable: g.variable || "",
        name: g.name || "",
        params: paramsText,
        returnType: g.return || "",

        variableOk: !!g.variable,
        nameOk: !!g.name,
        paramsOk,
        returnOk: !!g.return,
        matchOk: !!match,
        draftName,
        draftNameOk: !!draftName,
    };
}

export function useSequenceMessageValidation(editingLabel: string) {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const parts = useMemo(() => parseMessageParts(editingLabel), [editingLabel]);

    const validateLive = useCallback((rawValue: string) => {
        const trimmed = rawValue.trim();

            if (!trimmed) {
                setErrorMessage(null);
                return false;
            }

        const p = parseMessageParts(rawValue);

        // “Se ve terminado” cuando ya hay nombre y:
        // - cerró paréntesis, o
        // - ya puso ':', o
        // - ni siquiera abrió paréntesis (solo nombre)
        const looksFinished =
            p.nameOk && (p.hasCloseParen || p.hasColon || (!p.hasOpenParen && !p.hasCloseParen));

        if (looksFinished && !SEQUENCE_MESSAGE_REGEX.test(trimmed)) {
            setErrorMessage("Mensaje inválido. Revisa el formato.");
            return false;
        }

        setErrorMessage(null);
        return SEQUENCE_MESSAGE_REGEX.test(trimmed);
    }, []);

    const isValidFinal = useCallback((raw: string) => {
        const trimmed = raw.trim();
        if (!trimmed) return false;

        // debe cumplir regex y parámetros válidos
        return SEQUENCE_MESSAGE_REGEX.test(trimmed) && parseMessageParts(trimmed).paramsOk;
    }, []);

    return {
        parts,
        errorMessage,
        validateLive,
        isValidFinal,
        SEQUENCE_MESSAGE_REGEX,
    };
}
