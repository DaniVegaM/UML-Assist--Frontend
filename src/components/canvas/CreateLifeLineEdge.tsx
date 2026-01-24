import {
    BaseEdge,
    EdgeLabelRenderer,
    type EdgeProps
} from '@xyflow/react';

export function CreateLifeLineEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    style,
    markerEnd,
}: EdgeProps) {
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
            </EdgeLabelRenderer>
        </>
    );
}
