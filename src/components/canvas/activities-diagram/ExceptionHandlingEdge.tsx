import { BaseEdge } from "@xyflow/react";
import type { EdgeProps } from '@xyflow/react';

export default function ExceptionHandlingEdge ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY 
}: EdgeProps) {
  const width = targetX - sourceX;
  const height = targetY - sourceY;
  
  const centerX = sourceX + width / 2;
  
  // Parámetros del zigzag (ajustables)
  const zigzagWidth = Math.abs(width * 0.3); // Ancho del zigzag (30% del total)
  const zigzagMidPoint = sourceY + height * 0.5; // Punto medio en Y
  
  const edgePath = `
    M ${sourceX} ${sourceY}
    L ${centerX - zigzagWidth} ${zigzagMidPoint}
    H ${centerX + zigzagWidth}
    L ${targetX} ${targetY}
  `;

  return <BaseEdge id={id} path={edgePath} />;
}