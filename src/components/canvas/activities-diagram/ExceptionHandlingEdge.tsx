import { BaseEdge } from "@xyflow/react";
import type { EdgeProps } from '@xyflow/react';
import { useTheme } from "../../../hooks/useTheme";

export default function ExceptionHandlingEdge ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY 
}: EdgeProps) {
  const width = targetX - sourceX;
  const height = targetY - sourceY;

  const { isDarkMode } = useTheme();

  const arrowMarker: string = isDarkMode 
    ? "url('#1__color=#A1A1AA&height=15&type=arrow&width=15')" 
    : "url('#1__color=#52525B&height=15&type=arrow&width=15')";
  
  const centerX = sourceX + width / 2;
  
  // Parámetros del zigzag (ajustables)
  const zigzagWidth = Math.abs(width * 0.3); // Ancho del zigzag (30% del total)
  const zigzagMidPoint = sourceY + height * 0.5; // Punto medio en Y
  
  const edgePath = `
    M ${sourceX} ${sourceY}
    L ${centerX + zigzagWidth} ${zigzagMidPoint}
    H ${centerX - zigzagWidth}
    L ${targetX} ${targetY}
  `;

  return <BaseEdge 
    id={id} 
    path={edgePath} 
    style={{
          strokeWidth: 2,
          stroke: isDarkMode ? '#A1A1AA' : '#52525B',
    }}
    markerEnd={arrowMarker}
  />;
}