import { useTheme } from "../../hooks/useTheme";
import { addEdge, Background, Controls, ReactFlow, ReactFlowProvider, applyEdgeChanges, type Connection, applyNodeChanges, type Edge, type Node, type NodeChange, type EdgeChange, ConnectionLineType } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ElementsBar } from "../../components/canvas/ElementsBar";
import Header from "../../layout/Canvas/Header";
import { ACTIVITY_NODES } from "../../diagrams-elements/activities-elements";
import { activitiesNodeTypes } from "../../types/nodeTypes";
import { CanvasProvider } from "../../contexts/CanvasContext";
import { useCanvas } from "../../hooks/useCanvas";
import { useCallback, useEffect, useState } from "react";
import { edgeTypes } from "../../types/edgeTypes";

function DiagramContent() {
    const { isDarkMode } = useTheme();
    const { isZoomOnScrollEnabled, setIsTryingToConnect } = useCanvas();
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);

    const onNodesChange = useCallback(
        (changes: NodeChange[]) => {
            setNodes((nodesSnapshot) => {
                const nodes = applyNodeChanges(changes, nodesSnapshot)
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
                const sourceNode = nodes.find((node) => node.id === params.source);
                const targetNode = nodes.find((node) => node.id === params.target);

                let defaultLabel = '';

                if (targetNode?.type === 'decisionControl') {
                    defaultLabel = '[Condición]';
                }

                if (sourceNode?.type === 'decisionControl') {
                    defaultLabel = '[Clausula]';
                }

                const newEdge = {
                    ...params,
                    label: defaultLabel,
                    type: 'labeledEdge',
                };

                setEdges((edgesSnapshot) => addEdge(newEdge, edgesSnapshot));
                console.log('Conexion actual:', newEdge);
        },
        [nodes, setEdges],
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
            <Header />

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
                        type: 'labeledEdge',
                    }}
                    connectionLineType={ConnectionLineType.SmoothStep}
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={activitiesNodeTypes}
                    zoomOnScroll={isZoomOnScrollEnabled}
                    onConnectStart={() => setIsTryingToConnect({ isTrying: true })}
                    onConnectEnd={() => setIsTryingToConnect({ isTrying: false })}
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
                <ElementsBar nodes={ACTIVITY_NODES} />
            </section>
        </div>
    )
}

export default function CreateActivitiesDiagram() {
    return (
        <ReactFlowProvider>
            <CanvasProvider>
                <DiagramContent />
            </CanvasProvider>
        </ReactFlowProvider>
    );
}
