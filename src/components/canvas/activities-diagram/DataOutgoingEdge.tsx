import { Position, BaseEdge, getSmoothStepPath } from "@xyflow/react";
import type { EdgeProps } from '@xyflow/react';
import { useTheme } from "../../../hooks/useTheme";

export default function DataOutgoingEdge ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
}: EdgeProps) {
  const { isDarkMode } = useTheme();

  const markerRectId = `rect-marker-${id}`;

  // Flecha predefinida de ReactFlow
  const arrowMarker: string = isDarkMode 
    ? "url('#1__color=#A1A1AA&height=15&type=arrow&width=15')" 
    : "url('#1__color=#52525B&height=15&type=arrow&width=15')";

  // Calcular la rotación para el rectángulo según la posición del handle target
  const getMarkerRotation = (position: Position) => {
    switch (position) {
      case Position.Top:
        return 180; 
      case Position.Right:
        return 270; 
      case Position.Bottom:
        return 0;   
      case Position.Left:
        return 90; 
      default:
        return 0;
    }
  };

  // Calcular el nuevo target para la flecha (15px antes del rectángulo)
  const getAdjustedTarget = (position: Position) => {
    const offset = -10; // Distancia en píxeles antes del rectángulo
    switch (position) {
      case Position.Top:
        return { x: targetX, y: targetY + offset };
      case Position.Right:
        return { x: targetX - offset, y: targetY };
      case Position.Bottom:
        return { x: targetX, y: targetY - offset };
      case Position.Left:
        return { x: targetX + offset, y: targetY };
      default:
        return { x: targetX, y: targetY - offset };
    }
  };

  const adjustedTarget = getAdjustedTarget(targetPosition);

  // Path completo para el edge con rectángulo
  const [pathFull] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  // Path acortado para el edge con flecha
  const [pathShort] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX: adjustedTarget.x,
    targetY: adjustedTarget.y,
    sourcePosition,
    targetPosition,
  });

  const markerRotation = getMarkerRotation(targetPosition);

  return (
    <>
      <defs>
        {/* Marker para el rectángulo */}
        <marker
          id={markerRectId}
          viewBox="-2.5 -2.5 5 5"
          refX="0"
          refY="0"
          markerWidth="10"
          markerHeight="10"
          orient={markerRotation}
        >
          <rect 
            x="-2.5" 
            y="-2.5" 
            width="5" 
            height="5" 
            fill={isDarkMode ? '#A1A1AA' : '#FFFFFF'}
            stroke={isDarkMode ? '#A1A1AA' : '#000000'}
            strokeWidth="1"
          />
        </marker>
      </defs>

      {/* Edge completo con rectángulo al final (se dibuja encima) */}
      <BaseEdge 
        id={id} 
        path={pathFull} 
        markerEnd={`url(#${markerRectId})`}
        style={{
          strokeWidth: 2,
          stroke: isDarkMode ? '#A1A1AA' : '#52525B',
        }}
      />

      {/* Edge acortado con flecha */}
      <BaseEdge
        id={`${id}-arrow`}
        path={pathShort}
        markerEnd={arrowMarker}
        style={{
          strokeWidth: 2,
          stroke: 'transparent',
        }}
      />
    </>
  );
}