import { useMemo } from "react";

type Options = {
    required?: boolean;
    max?: number;
    forbiddenChars?: RegExp;
    forbiddenMessage?: string;
    enableVerbGuide?: boolean; 
    enableRoleClassGuide?: boolean;
};

export function useLiveTextValidation(value: string, opts?: Options) {
    const required = opts?.required ?? true;
    const max = opts?.max;

    const trimmed = useMemo(() => value.trim(), [value]);

    const isEmpty = required && trimmed.length === 0;
    const tooLong = typeof max === "number" && value.length > max;
    const hasForbidden =
        !!opts?.forbiddenChars && opts.forbiddenChars.test(value);

    const isValid = !isEmpty && !tooLong && !hasForbidden;

    const error = isEmpty
        ? "No puede estar vacío."
        : tooLong
        ? `Máximo ${max} caracteres.`
        : hasForbidden
            ? (opts?.forbiddenMessage ??
            "El texto contiene caracteres no permitidos.")
            : null;

    const verbGuide = useMemo(() => {
        if (!opts?.enableVerbGuide) return null;

        const t = trimmed;
            if (!t) {
                return {
                    verb: "",
                    complement: "",
                    verbOk: false,
                    complementOk: false,
                };
            }

    const parts = t.split(/\s+/);
    const verb = parts[0] ?? "";
    const complement = parts.slice(1).join(" ");

    return {
        verb,
        complement,
        verbOk: verb.length > 0,
        complementOk: complement.length > 0,
    };
    }, [trimmed, opts?.enableVerbGuide]);

    const roleClassGuide = useMemo(() => {
        if (!opts?.enableRoleClassGuide) return null;

        const t = trimmed;
        if (!t) {
            return {
            role: "",
            clazz: "",
            hasColon: false,
            roleOk: false,
            classOk: false,
            };
        }

        const hasColon = t.includes(":");
        const [roleRaw, classRaw] = t.split(":", 2);

        const role = (roleRaw ?? "").trim();
        const clazz = (classRaw ?? "").trim();

        return {
            role,
            clazz,
            hasColon,
            roleOk: role.length > 0,
            classOk: clazz.length > 0,
        };
    }, [trimmed, opts?.enableRoleClassGuide]);


    return {
        isValid,
        error,
        isEmpty,
        tooLong,
        hasForbidden,
        verbGuide,
        roleClassGuide,
    };
}
