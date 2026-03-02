import { useTheme } from "../../hooks/useTheme";
import { addEdge, Background, Controls, ReactFlow, ReactFlowProvider, applyEdgeChanges, type Connection, applyNodeChanges, type Edge, type Node, type NodeChange, type EdgeChange, ConnectionLineType, ConnectionMode, useReactFlow, useNodes, useEdges } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ElementsBar } from "../../components/canvas/ElementsBar";
import Header from "../../components/layout/Canvas/Header";
import { ACTIVITY_NODES } from "../../diagrams-elements/activities-elements";
import { activitiesNodeTypes } from "../../types/nodeTypes";
import { CanvasProvider } from "../../contexts/CanvasContext";
import { useCanvas } from "../../hooks/useCanvas";
import { useCallback, useEffect, useRef, useState } from "react";
import { edgeTypes } from "../../types/edgeTypes";
import { useParams } from "react-router";
import type { Diagram } from "../../types/diagramsModel";
import { fetchDiagramById } from "../../services/diagramSerivce";
import { SnapConnectionLine } from "../../components/canvas/sequence-diagram/SnapConnectionLine";
import { useLocalValidations } from "../../hooks/useLocalValidations";
import AIChatBar from "../../components/canvas/AIChatBar";
import { notify } from "../../components/ui/NotificationComponent";
import NodeContextMenu from "../../components/canvas/NodeContextMenu";
import EdgeContextMenu from "../../components/canvas/EdgeContextMenu";
import { createPrefixedNodeId } from "../../utils/idGenerator";

function DiagramContent() {
    const { id: diagramId } = useParams();
    const [diagram, setDiagram] = useState<Diagram | null>(null);
    const { isDarkMode } = useTheme();
    const { isZoomOnScrollEnabled, setIsTryingToConnect, openEdgeContextMenu, closeEdgeContextMenu } = useCanvas();
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const { getIntersectingNodes } = useReactFlow();
    const { validateActivityConnection } = useLocalValidations(nodes, edges);
    const lastInvalidAttemptRef = useRef<{ ts: number; message: string; type: "error" | "success" | "info" } | null>(null);

        const isValidActivityConnectionWithFeedback = useCallback(
            (conn: Connection) => {
                const result = validateActivityConnection(conn);

                if (!result.ok) {
                lastInvalidAttemptRef.current = {
                    ts: Date.now(),
                    message: result.reason ?? "Esta relación no cumple las reglas locales del diagrama.",
                    type: result.severity ?? "info",
                };
                }

                return result.ok;
            },
            [validateActivityConnection]
        );


    const onEdgeContextMenu = useCallback(
        (event: React.MouseEvent, edge: Edge) => {
            event.preventDefault();
            openEdgeContextMenu({ x: event.clientX, y: event.clientY, edgeId: edge.id });
        },
        [openEdgeContextMenu],
    );

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
                const nodes = applyNodeChanges(changes, nodesSnapshot)
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

    const onNodeDrag = useCallback((_: React.MouseEvent, node: Node) => {
        const intersections = getIntersectingNodes(node);
        const parentNode = intersections.find(n => n.type === 'activity' && n.id !== node.id);

        if (node.type !== 'activity' && parentNode) {
            // Solo asignar parentId si no lo tenía ya (evitar recalcular en cada drag)
            if (node.parentId !== parentNode.id) {
                node.parentId = parentNode.id;
                node.extent = 'parent';
                // Convertir posición absoluta a relativa al padre
                node.position = {
                    x: node.position.x - parentNode.position.x,
                    y: node.position.y - parentNode.position.y,
                };
            }
        }
        setNodes(nodes => nodes.map(n => n.id === node.id ? node : n));
    }, []);


    const onConnect = useCallback(
        (params: Connection) => {

            const sourceNode = nodes.find((node) => node.id === params.source);
            const targetNode = nodes.find((node) => node.id === params.target);

            let edgeType = "labeledEdge";
            let defaultLabel = '';


            // Definir el tipo de edge según el tipo de nodo conectado
            if (
                (sourceNode?.type === 'acceptEvent' &&
                    nodes.find(
                        n => n.id === sourceNode.parentId && n.type === 'InterruptActivityRegion'
                    )) ||
                (targetNode?.type === 'acceptEvent' &&
                    nodes.find(
                        n => n.id === targetNode.parentId && n.type === 'InterruptActivityRegion'
                    ))
            ) {
                edgeType = 'exceptionHandlingEdge';
            }
            else if (targetNode?.type === 'dataNode') {
                edgeType = targetNode?.data?.incomingEdge || 'dataIncomingEdge';
            }
            else if (sourceNode?.type === 'dataNode') {
                edgeType = sourceNode?.data?.outgoingEdge || 'dataOutgoingEdge';
            }
            else if (targetNode?.type === 'exceptionHandling') {
                edgeType = 'exceptionHandlingEdge';
            }
            else if (
                sourceNode?.type === 'note' ||
                targetNode?.type === 'note'
            ) {
                edgeType = 'noteEdge';
            }
            else {
                edgeType = 'labeledEdge'; // tipo por defecto
            }

            // Definir etiqueta por defecto según el tipo de nodo conectado
            if (targetNode?.type === 'decisionControl') {
                defaultLabel = '[Condición]';
            }

            if (sourceNode?.type === 'decisionControl') {
                defaultLabel = '[Clausula]';
            }

            const newEdge = {
                ...params,
                id: createPrefixedNodeId('edge'),
                type: edgeType,
                label: defaultLabel,
            };

            setEdges((edgesSnapshot) => {
                const newEdges = addEdge(newEdge, edgesSnapshot);
                // console.log('Conexiones actuales:', newEdges);
                return newEdges;
            });

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
                markerEnd:
                    edge.type === 'noteEdge'
                        ? undefined
                        : {
                            type: 'arrow',
                            width: 15,
                            height: 15,
                            color: isDarkMode ? '#A1A1AA' : '#52525B'
                        },
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
            }))
        );
    }, [isDarkMode]);

    const handleConnectEnd = useCallback(() => {
        setIsTryingToConnect(false);

        const info = lastInvalidAttemptRef.current;
        if (info && Date.now() - info.ts < 700) {
                notify(info.type, "Conexión inválida", info.message);
        }
        lastInvalidAttemptRef.current = null;
    }, [setIsTryingToConnect]);

    return (
        <div className="h-screen w-full grid grid-rows-[54px_1fr]">
            <Header
                diagramId={diagramId ? parseInt(diagramId, 10) : undefined}
                diagramTitle={diagram?.title}
                type="actividades"
                nodes={useNodes()}
                edges={useEdges()}
            />

            <section className="h-full w-full relative">
                
                <ReactFlow
                    deleteKeyCode={["Backspace", "Delete"]}
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
                    isValidConnection={isValidActivityConnectionWithFeedback}
                    connectionMode={ConnectionMode.Loose}
                    connectionLineType={ConnectionLineType.SmoothStep}
                    connectionLineComponent={SnapConnectionLine}
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    elevateNodesOnSelect={false}
                    onNodeDrag={onNodeDrag}
                    nodeTypes={activitiesNodeTypes}
                    zoomOnScroll={isZoomOnScrollEnabled}
                    onConnect={onConnect}
                    onConnectEnd={handleConnectEnd}
                    onConnectStart={() => setIsTryingToConnect(true)}
                    onEdgeContextMenu={onEdgeContextMenu}
                >
                    <Background bgColor={isDarkMode ? '#18181B' : '#FAFAFA'} />
                    <Controls
                        showFitView={true}
                        showInteractive={false}
                        aria-label="Controles de lienzo"
                        position="bottom-right"
                    />
                    <NodeContextMenu />
                    <EdgeContextMenu />
                </ReactFlow>
                <ElementsBar nodes={ACTIVITY_NODES} />
                <AIChatBar type="actividades"/>
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

