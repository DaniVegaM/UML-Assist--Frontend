import { useTheme } from "../../hooks/useTheme";
import { addEdge, Background, Controls, ReactFlow, ReactFlowProvider, applyEdgeChanges, type Connection, applyNodeChanges, type Edge, type Node, type NodeChange, type EdgeChange } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ElementsBar } from "../../components/canvas/ElementsBar";
import Header from "../../layout/Canvas/Header";
import { ACTIVITY_NODES } from "../../diagrams-elements/activities-elements";
import { activitiesNodeTypes } from "../../types/nodeTypes";
import { CanvasProvider } from "../../contexts/CanvasContext";
import { useCanvas } from "../../hooks/useCanvas";
import { useCallback, useState } from "react";

function DiagramContent() {
    const { isDarkMode } = useTheme();
    const { isZoomOnScrollEnabled, setIsTryingToConnect } = useCanvas();
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);

    const onNodesChange = useCallback(
        (changes: NodeChange[]) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
        [],
    );

    const onEdgesChange = useCallback(
        (changes: EdgeChange[]) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
        [],
    );

    const onConnect = useCallback(
        (params: Connection) => {
            setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot))},
        [],
    );

    return (
        <div className="h-screen w-full grid grid-rows-[54px_1fr]">
            <Header />

            <section className="h-full w-full relative">
                <ReactFlow
                    fitView={false}
                    preventScrolling={true}
                    colorMode={isDarkMode ? 'dark' : 'light'}
                    attributionPosition="bottom-right"
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
