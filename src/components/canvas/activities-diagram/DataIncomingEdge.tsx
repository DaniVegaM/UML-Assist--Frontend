import { useState } from "react";
import { Position, BaseEdge, getSmoothStepPath, EdgeLabelRenderer, useReactFlow } from "@xyflow/react";
import type { EdgeProps } from '@xyflow/react';
import { useTheme } from "../../../hooks/useTheme";
import EdgeSuggestionTooltip from '../EdgeSuggestionTooltip';
import type { EdgeDataProps } from '../../../types/canvas';

// Extend the original EdgeProps to properly type our custom data
export type DataIncomingEdgeProps = Omit<EdgeProps, 'data'> & {
    data?: EdgeDataProps;
};

export default function DataIncomingEdge ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data
}: DataIncomingEdgeProps) {
  const { setEdges } = useReactFlow();
  const { isDarkMode } = useTheme();

  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const [showSuggestion, setShowSuggestion] = useState(false);

  const clearSuggestion = () => {
      setEdges((eds) =>
          eds.map((e) => {
              if (e.id === id) {
                  const dataWithoutSuggestion = { ...(e.data || {}) } as Record<string, unknown>;
                  delete dataWithoutSuggestion.suggestion;
                  return { ...e, data: dataWithoutSuggestion };
              }
              return e;
          })
      );
      setShowSuggestion(false);
  };

  // Marker 'arrow'
  const markerEnd: string = isDarkMode 
    ? "url('#1__color=#A1A1AA&height=15&type=arrow&width=15')" 
    : "url('#1__color=#52525B&height=15&type=arrow&width=15')";
  const markerStartId = `rect-marker-start-${id}`;

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

        {/* Marker Start: Rectangulo */}
        <marker
          id={markerStartId}
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
        markerStart={`url(#${markerStartId})`}
        markerEnd={markerEnd}
        style={
          {
            strokeWidth: 2,
            stroke: `${isDarkMode ? '#A1A1AA' : '#52525B'}`,
          }
        }
      />
      {data?.suggestion && (
        <EdgeLabelRenderer>
            <div
                style={{
                    position: 'absolute',
                    transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY - 20}px)`,
                    pointerEvents: 'all',
                    zIndex: 1000, 
                }}
                className="nodrag nopan"
            >
                <button
                    onDoubleClick={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); setShowSuggestion(prev => !prev); }}
                    title="Ver sugerencia de IA"
                    className="w-5 h-5 rounded-full bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold flex items-center justify-center shadow-md transition-colors cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-6" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0m-9 5.25h.008v.008H12z"/>
                  </svg>
                </button>
            </div>
        </EdgeLabelRenderer>
      )}

      <EdgeSuggestionTooltip
          isVisible={showSuggestion}
          suggestionText={typeof data?.suggestion === 'string' ? data.suggestion : ''}
          labelX={labelX}
          labelY={labelY}
          onMinimize={() => setShowSuggestion(false)}
          onDiscard={clearSuggestion}
      />
    </>
  );
}