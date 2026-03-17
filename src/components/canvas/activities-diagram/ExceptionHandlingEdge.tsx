import { useState } from "react";
import { BaseEdge, EdgeLabelRenderer, useReactFlow } from "@xyflow/react";
import type { EdgeProps } from '@xyflow/react';
import { useTheme } from "../../../hooks/useTheme";
import EdgeSuggestionTooltip from '../EdgeSuggestionTooltip';
import type { EdgeDataProps } from '../../../types/canvas';

export type ExceptionHandlingEdgeProps = Omit<EdgeProps, 'data'> & {
  data?: EdgeDataProps;
};

export default function ExceptionHandlingEdge ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    data
}: ExceptionHandlingEdgeProps) {
  const { setEdges } = useReactFlow();
  const width = targetX - sourceX;
  const height = targetY - sourceY;

  const { isDarkMode } = useTheme();

  const arrowMarker: string = isDarkMode 
    ? "url('#1__color=#A1A1AA&height=15&type=arrow&width=15')" 
    : "url('#1__color=#52525B&height=15&type=arrow&width=15')";
  
  const centerX = sourceX + width / 2;
  const centerY = sourceY + height / 2;
  
  // Parámetros del zigzag (ajustables)
  const zigzagWidth = Math.abs(width * 0.3); // Ancho del zigzag (30% del total)
  const zigzagMidPoint = sourceY + height * 0.5; // Punto medio en Y
  
  const edgePath = `
    M ${sourceX} ${sourceY}
    L ${centerX + zigzagWidth} ${zigzagMidPoint}
    H ${centerX - zigzagWidth}
    L ${targetX} ${targetY}
  `;

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

  return (
    <>
      <BaseEdge 
        id={id} 
        path={edgePath} 
        style={{
              strokeWidth: 2,
              stroke: isDarkMode ? '#A1A1AA' : '#52525B',
        }}
        markerEnd={arrowMarker}
      />

      <EdgeLabelRenderer>
        {data?.suggestion && (
            <div
                style={{
                    position: 'absolute',
                    transform: `translate(-50%, -50%) translate(${centerX + 20}px, ${centerY - 20}px)`,
                    pointerEvents: 'all',
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
        )}
      </EdgeLabelRenderer>

      <EdgeSuggestionTooltip
          isVisible={showSuggestion}
          suggestionText={typeof data?.suggestion === 'string' ? data.suggestion : ''}
          labelX={centerX}
          labelY={centerY}
          onMinimize={() => setShowSuggestion(false)}
          onDiscard={clearSuggestion}
      />
    </>
  );
}