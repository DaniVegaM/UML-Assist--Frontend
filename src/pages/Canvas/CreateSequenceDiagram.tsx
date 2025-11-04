import { useTheme } from "../../hooks/useTheme";
import { addEdge, Background, Controls, ReactFlow, ReactFlowProvider, applyEdgeChanges, type Connection, applyNodeChanges, type Edge, type NodeChange, type EdgeChange, ConnectionLineType } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ElementsBar } from "../../components/canvas/ElementsBar";
import Header from "../../layout/Canvas/Header";
import { sequenceNodeTypes } from "../../types/nodeTypes";
import { CanvasProvider } from "../../contexts/CanvasContext";
import { useCanvas } from "../../hooks/useCanvas";
import { useCallback, useEffect, useState } from "react";
import { edgeTypes } from "../../types/edgeTypes";
import { SEQUENCE_NODES } from "../../diagrams-elements/sequence-elements";
import { CanvasProvider as SequenceCanvasProvider } from "../../contexts/SequenceDiagramContext";
import { useSequenceDiagram } from "../../hooks/useSequenceDiagram";

function DiagramContent() {
    const { isDarkMode } = useTheme();
    const { isZoomOnScrollEnabled, setIsTryingToConnect } = useCanvas();
    const { nodes, setNodes, setLastLifeLine } = useSequenceDiagram();
    const [edges, setEdges] = useState<Edge[]>([]);

    const onNodesChange = useCallback(
        (changes: NodeChange[]) => {
            setNodes((nodesSnapshot) => {
                const nodes = applyNodeChanges(changes, nodesSnapshot)
                setLastLifeLine(nodes[nodes.length - 1].type === 'lifeLine' ? nodes[nodes.length - 1] : undefined)
                console.log('Nodos actuales:', nodes);
                return nodes;
            });
        },
        [],
    );

    const onEdgesChange = useCallback(
        (changes: EdgeChange[]) => {
            setEdges((edgesSnapshot) => (applyEdgeChanges(changes, edgesSnapshot)));
        },
        [],
    );

    const onConnect = useCallback(
        (params: Connection) => {

            const newEdge: Edge = {
                ...params,
                id: `edge-${params.source}-${params.target}`,
                type: 'smoothstep',
                source: params.source!,
                target: params.target!,
                sourceHandle: params.sourceHandle || null,
                targetHandle: params.targetHandle || null,
            };

            setEdges((edgesSnapshot) => {
                const newEdges = addEdge(newEdge, edgesSnapshot);
                console.log('Conexiones actuales:', newEdges);
                return newEdges;
            });

        },
        [setEdges],
    );

    useEffect(() => {
        setEdges((currentEdges) =>
            currentEdges.map((edge) => ({
                ...edge,
                style: {
                    ...edge.style,
                    stroke: isDarkMode ? '#FFFFFF' : '#171717',
                },
                markerEnd: {
                    type: 'arrow',
                    width: 15,
                    height: 15,
                    color: isDarkMode ? '#A1A1AA' : '#52525B'
                },
                labelStyle: {
                    fill: isDarkMode ? '#FFFFFF' : '#171717', // Color del texto
                    fontWeight: 600,
                },
                labelBgStyle: {
                    fill: isDarkMode ? '#18181B' : '#F3F4F6', // Color del fondo
                    fillOpacity: 0.8,
                },
                labelBgPadding: [4, 4],
                labelBgBorderRadius: 4,
            }))
        );
    }, [isDarkMode]);

    return (
        <div className="h-screen w-full grid grid-rows-[54px_1fr]">
            <Header diagramTitle="Diagrama de Secuencia"/>

            <section className="h-full w-full relative">
                <ReactFlow
                    fitView={false}
                    preventScrolling={true}
                    colorMode={isDarkMode ? 'dark' : 'light'}
                    attributionPosition="bottom-right"
                    edgeTypes={edgeTypes}
                    defaultEdgeOptions={{
                        animated: false,
                        markerEnd: {
                            type: 'arrow',
                            width: 15,
                            height: 15,
                            color: isDarkMode ? '#A1A1AA' : '#52525B'
                        },
                        focusable: true,
                        reconnectable: true,
                        style: {
                            strokeWidth: 2,
                            stroke: isDarkMode ? '#FFFFFF' : '#171717',
                        },
                        type: 'smoothstep',
                    }}
                    connectionLineType={ConnectionLineType.SmoothStep}
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={sequenceNodeTypes}
                    zoomOnScroll={isZoomOnScrollEnabled}
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
