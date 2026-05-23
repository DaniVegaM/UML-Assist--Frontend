import type { ReactNode } from "react";
import { ACTIVITY_NODES } from "../../../diagrams-elements/activities-elements";

export interface GameNode {
  id: string;
  label: string;
  kind: "valid" | "error";
  svg: ReactNode;
}

// Subset curado de nodos reales del diagrama de actividades.
// Se reutiliza su `svg` tal cual para que sean idénticos a los del lienzo
// (heredan modo oscuro vía sus clases Tailwind).
const VALID_TYPES = [
  "activity",
  "simpleAction",
  "initialNode",
  "finalNode",
  "decisionControl",
  "parallelizationNode",
  "objectNode",
  "acceptEvent",
];

interface RawNode {
  nodeType?: string;
  label?: string;
  svg?: ReactNode;
  separator?: string;
}

export const VALID_NODES: GameNode[] = (ACTIVITY_NODES as RawNode[])
  .filter((n) => !!n.nodeType && VALID_TYPES.includes(n.nodeType))
  .map((n) => ({
    id: n.nodeType as string,
    label: (n.label as string) ?? "Nodo",
    kind: "valid" as const,
    svg: n.svg,
  }));

// Clases compartidas con los nodos reales para que los impostores se camuflen:
// mismo trazo negro (blanco en oscuro) y relleno gris, strokeWidth 4.
const DECOY_FILL = "fill-gray-200 dark:fill-neutral-700 stroke-neutral-800 dark:stroke-white";
const DECOY_STROKE = "stroke-neutral-800 dark:stroke-white";

// Impostores: figuras que NO son notación UML válida pero comparten el estilo
// del diagrama (negro/gris). A primera vista se confunden con los reales; solo
// quien conoce la notación los detecta. Hay que ESQUIVARLOS (atraparlos resta vida).
export const DECOY_NODES: GameNode[] = [
  {
    id: "decoy-pentagon",
    label: "Impostor",
    kind: "error",
    svg: (
      <svg className="w-full h-full" width="52" height="49" viewBox="0 0 52 49" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="26,3 49,20 40,46 12,46 3,20" className={DECOY_FILL} strokeWidth="4" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "decoy-hexagon",
    label: "Impostor",
    kind: "error",
    svg: (
      <svg className="w-full h-full" width="52" height="48" viewBox="0 0 52 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="14,3 38,3 50,24 38,45 14,45 2,24" className={DECOY_FILL} strokeWidth="4" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "decoy-trapezoid",
    label: "Impostor",
    kind: "error",
    svg: (
      <svg className="w-full h-full" width="52" height="48" viewBox="0 0 52 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="10,4 42,4 50,44 2,44" className={DECOY_FILL} strokeWidth="4" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "decoy-ellipse",
    label: "Impostor",
    kind: "error",
    svg: (
      <svg className="w-full h-full" width="52" height="40" viewBox="0 0 52 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="26" cy="20" rx="23" ry="16" className={DECOY_FILL} strokeWidth="4" />
      </svg>
    ),
  },
  {
    id: "decoy-fake-note",
    label: "Impostor",
    kind: "error",
    svg: (
      <svg className="w-full h-full" width="52" height="44" viewBox="0 0 52 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* parece una nota UML pero sin el doblez de la esquina */}
        <path d="M3 3 H37 L49 15 V41 H3 Z" className={DECOY_FILL} strokeWidth="4" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "decoy-broken-rect",
    label: "Impostor",
    kind: "error",
    svg: (
      <svg className="w-full h-full" width="52" height="40" viewBox="0 0 52 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* rectángulo incompleto: un lado abierto */}
        <path d="M37 3 H49 V37 H3 V3 H21" fill="none" className={DECOY_STROKE} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function randomValidNode(): GameNode {
  return VALID_NODES[Math.floor(Math.random() * VALID_NODES.length)];
}

export function randomDecoyNode(): GameNode {
  return DECOY_NODES[Math.floor(Math.random() * DECOY_NODES.length)];
}
