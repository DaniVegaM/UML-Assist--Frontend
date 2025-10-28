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

  const [path] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const markerEnd = `rect-marker-start-${id}`;

  // Calcular la rotación del marker según la posición del handle target
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

  const markerRotation = getMarkerRotation(targetPosition);

  return (
    <>
      <defs>

        {/* Marker End: Rectangulo */}
        <marker
          id={markerEnd}
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
      
      <BaseEdge 
        id={id} 
        path={path} 
        markerEnd={`url(#${markerEnd})`}
        style={
          {
            strokeWidth: 2,
            stroke: `${isDarkMode ? '#A1A1AA' : '#52525B'}`,
          }
        }
      />
    </>
  );
}