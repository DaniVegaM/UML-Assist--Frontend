import { useTheme } from "../../hooks/useTheme";
import { addEdge, Background, Controls, ReactFlow, ReactFlowProvider, applyEdgeChanges, type Connection, applyNodeChanges, type Edge, type NodeChange, type EdgeChange, ConnectionLineType, ConnectionMode, MarkerType, useNodes, useEdges } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ElementsBar } from "../../components/canvas/ElementsBar";
import Header from "../../components/layout/Canvas/Header";
import { sequenceNodeTypes } from "../../types/nodeTypes";
import { CanvasProvider } from "../../contexts/CanvasContext";
import { useCanvas } from "../../hooks/useCanvas";
import { useCallback, useEffect, useState } from "react";
import { edgeTypes } from "../../types/edgeTypes";
import { SEQUENCE_NODES } from "../../diagrams-elements/sequence-elements";
import { CanvasProvider as SequenceCanvasProvider } from "../../contexts/SequenceDiagramContext";
import { useSequenceDiagram } from "../../hooks/useSequenceDiagram";
import { useAddLifeLinesBtns } from "../../hooks/useAddLifeLinesBtns";
import { SnapConnectionLine } from "../../components/canvas/sequence-diagram/SnapConnectionLine";
import { useParams } from "react-router";
import { fetchDiagramById } from "../../services/diagramSerivce";
import type { Diagram } from "../../types/diagramsModel";
import { useLocalValidations } from "../../hooks/useLocalValidations";
import AIChatBar from "../../components/canvas/AIChatBar";

function DiagramContent() {
    const { id: diagramId } = useParams();
    const [diagram, setDiagram] = useState<Diagram | null>(null);
    const { isDarkMode } = useTheme();
    const { isZoomOnScrollEnabled, setIsTryingToConnect } = useCanvas();
    const { nodes, setNodes, edges, setEdges } = useSequenceDiagram();

    const { handleMouseMove } = useAddLifeLinesBtns(); // Activa la actualización automática de botones de addLifeLines
    const { isValidSequenceConnection } = useLocalValidations(nodes, edges);

    useEffect(() => {
        const loadDiagram = async () => {
            if (diagramId) {
                const response = await fetchDiagramById(diagramId);
                const data = response.data;
                setDiagram(data);
            }
        };
        loadDiagram();
    }, [diagramId]);

    useEffect(() => {
        if (diagram?.content) {
            setNodes(diagram.content.canvas.nodes);
            setEdges(diagram.content.canvas.edges || []);
        }
    }, [diagram]);

    const onNodesChange = useCallback(
        (changes: NodeChange[]) => {
            setNodes((nodesSnapshot) => {
                //Guardamos las posiciones Y originales antes de aplicar cambios
                const originalYPositions = new Map(
                    nodesSnapshot.map(node => [node.id, node.position.y])
                );

                //Aplicamos los cambios a los nodos
                const updatedNodes = applyNodeChanges(changes, nodesSnapshot);

                // Tipos de nodos que pueden moverse libremente en ambas dimensiones
                const freeMovementNodeTypes = [
                    'altFragment',
                    'optFragment',
                    'loopFragment',
                    'breakFragment',
                    'seqFragment',
                    'strictFragment',
                    'parFragment',
                    'note'
                ];

                //Restaurar las posiciones Y originales para mantener nodos en su línea horizontal
                return updatedNodes.map(node => {
                    if (freeMovementNodeTypes.includes(node.type || '')) {
                        return node;
                    }
                    return {
                        ...node,
                        position: {
                            ...node.position,
                            y: originalYPositions.get(node.id) ?? node.position.y
                        }
                    };
                });
            });
        },
        [setNodes],
    );

    const onEdgesChange = useCallback(
        (changes: EdgeChange[]) => {
            setEdges((edgesSnapshot) => (applyEdgeChanges(changes, edgesSnapshot)));
        },
        [setEdges],
    );

    const onConnect = useCallback(
        (params: Connection) => {

            const sourceNode = nodes.find(n => n.id === params.source);
            const targetNode = nodes.find(n => n.id === params.target);

            const isSelfMessage = params.source === params.target;

            // Obtener la posición Y del handle de origen
            let handleY = 0;
            if (params.sourceHandle) {
                const sourceHandleElement = document.querySelector(`[data-handleid="${params.sourceHandle}"]`);
                const sourceNodeElement = document.querySelector(`[data-id="${params.source}"]`);
                if (sourceHandleElement && sourceNodeElement) {
                    const handleRect = sourceHandleElement.getBoundingClientRect();
                    const nodeRect = sourceNodeElement.getBoundingClientRect();
                    handleY = handleRect.top - nodeRect.top;
                }
            }

            const isNoteConnection = sourceNode?.type === 'note' || targetNode?.type === 'note';
            const newEdge: Edge = {
                ...params,
                id: `edge-${params.sourceHandle}-${params.targetHandle}`,
                type: isNoteConnection
                    ? 'noteEdge'
                    : (isSelfMessage ? 'selfMessageEdge' : 'messageEdge'),
                source: params.source!,
                target: params.target!,
                sourceHandle: params.sourceHandle || null,
                targetHandle: params.targetHandle || null,
                data: {
                    edgeType: 'async',
                    mustFillLabel: !isSelfMessage && !isNoteConnection,
                    y: Math.round(handleY),
                },
                style: {
                    strokeWidth: isNoteConnection ? 1.5 : 2,
                    stroke: isDarkMode ? '#FFFFFF' : '#171717',
                    strokeDasharray: isNoteConnection ? '6 4' : 'none',
                },
                markerEnd: isNoteConnection
                    ? undefined
                    : {
                        type: MarkerType.Arrow,
                        width: 20,
                        height: 20,
                        color: isDarkMode ? '#FFFFFF' : '#171717'
                    }
            };

            setEdges((edgesSnapshot) => {
                const newEdges = addEdge(newEdge, edgesSnapshot);
                return newEdges;
            });

            

        },
        [setEdges, isDarkMode, nodes],
    );

    useEffect(() => {
        setEdges((currentEdges) =>
            currentEdges.map((edge) => {
                const newMarkerEnd = typeof edge.markerEnd === 'object'
                    ? { ...edge.markerEnd, color: isDarkMode ? '#FFFFFF' : '#171717' }
                    : edge.markerEnd;

                return {
                    ...edge,
                    style: {
                        ...edge.style,
                        stroke: isDarkMode ? '#FFFFFF' : '#171717',
                    },
                    markerEnd: newMarkerEnd,
                    labelStyle: {
                        fill: isDarkMode ? '#FFFFFF' : '#171717',
                        fontWeight: 600,
                    },
                    labelBgStyle: {
                        fill: isDarkMode ? '#18181B' : '#F3F4F6',
                        fillOpacity: 0.8,
                    },
                    labelBgPadding: [4, 4],
                    labelBgBorderRadius: 4,
                };
            })
        );
    }, [isDarkMode, setEdges]);

    return (
        <div className="h-screen w-full grid grid-rows-[54px_1fr]">
            <Header
                diagramId={diagramId ? parseInt(diagramId, 10) : undefined}
                diagramTitle={diagram?.title}
                type="secuencia"
                nodes={useNodes()}
                edges={useEdges()}
            />

            <section className="h-full w-full relative" onMouseMove={handleMouseMove}>

                
                <ReactFlow
                    fitView={false}
                    preventScrolling={true}
                    colorMode={isDarkMode ? 'dark' : 'light'}
                    attributionPosition="bottom-right"
                    connectionMode={ConnectionMode.Loose}
                    edgeTypes={edgeTypes}
                    defaultEdgeOptions={{
                        animated: false,
                        markerEnd: {
                            type: 'arrowclosed',
                            width: 15,
                            height: 15,
                            color: isDarkMode ? '#A1A1AA' : '#52525B'
                        },
                        focusable: true,
                        reconnectable: true,
                        selectable: true,
                        style: {
                            strokeWidth: 2,
                            stroke: isDarkMode ? '#FFFFFF' : '#171717',
                        },
                        type: 'messageEdge',
                    }}
                    connectionLineType={ConnectionLineType.Straight}
                    connectionLineComponent={SnapConnectionLine}
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={sequenceNodeTypes}
                    zoomOnScroll={isZoomOnScrollEnabled}
                    isValidConnection={isValidSequenceConnection}
                    onConnectStart={() => setIsTryingToConnect(true)}
                    onConnectEnd={() => setIsTryingToConnect(false)}
                    onConnect={onConnect}
                >
                    <Background bgColor={isDarkMode ? '#18181B' : '#FAFAFA'} />
                    <Controls
                        showFitView={true}
                        showInteractive={false}
                        aria-label="Controles de lienzo"
                        position="bottom-right"
                    />
                </ReactFlow>
                <ElementsBar nodes={SEQUENCE_NODES} oneColumn={true} />
                <AIChatBar type="secuencia"/>
            </section>
        </div>
    )
}

export default function CreateSequenceDiagram() {
    return (
        <ReactFlowProvider>
            <CanvasProvider>
                <SequenceCanvasProvider>
                    <DiagramContent />
                </SequenceCanvasProvider>
            </CanvasProvider>
        </ReactFlowProvider>
    );
}
