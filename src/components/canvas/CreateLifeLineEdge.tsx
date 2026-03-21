import { useState } from 'react';
import {
    BaseEdge,
    EdgeLabelRenderer,
    useReactFlow,
    type EdgeProps as ReactFlowEdgeProps
} from '@xyflow/react';
import EdgeSuggestionTooltip from './EdgeSuggestionTooltip';
import type { EdgeDataProps } from '../../types/canvas';

// Extend the original EdgeProps to properly type our custom data
export type CreateLifeLineEdgeProps = Omit<ReactFlowEdgeProps, 'data'> & {
    data?: EdgeDataProps;
};

export function CreateLifeLineEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    style,
    markerEnd,
    data
}: CreateLifeLineEdgeProps) {
    const { setEdges } = useReactFlow();
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

    // El ancho del header de la lifeline es 200px, así que restamos 100 para llegar al borde izquierdo
    const adjustedTargetX = targetX - 100;
    
    // Mantener la línea horizontal usando sourceY para ambos puntos
    const edgePath = `M ${sourceX} ${sourceY} L ${adjustedTargetX} ${sourceY}`;

    // Posición del label en el centro del edge
    const labelX = (sourceX + adjustedTargetX) / 2;
    const labelY = sourceY;

    return (
        <>
            <BaseEdge
                id={id}
                path={edgePath}
                style={{
                    ...style,
                    strokeDasharray: '5,5',
                }}
                markerEnd={markerEnd}
            />
            <EdgeLabelRenderer>
                <div
                    className="absolute nodrag nopan pointer-events-none"
                    style={{
                        transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                    }}
                >
                    <div
                        style={{
                            background: '#F3F4F6',
                            padding: '2px 4px',
                            fontSize: '14px',
                            borderRadius: '2px',
                        }}
                    >
                        new
                    </div>
                </div>

                {data?.suggestion && (
                    <div
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${labelX + 30}px, ${labelY - 20}px)`,
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
                labelX={labelX}
                labelY={labelY}
                onMinimize={() => setShowSuggestion(false)}
                onDiscard={clearSuggestion}
            />
        </>
    );
}
