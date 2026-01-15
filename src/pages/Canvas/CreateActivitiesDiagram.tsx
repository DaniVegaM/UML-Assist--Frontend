import { useTheme } from "../../hooks/useTheme";
import { addEdge, Background, Controls, ReactFlow, ReactFlowProvider, applyEdgeChanges, type Connection, applyNodeChanges, type Edge, type Node, type NodeChange, type EdgeChange, ConnectionLineType, ConnectionMode, useReactFlow, useNodes, useEdges } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ElementsBar } from "../../components/canvas/ElementsBar";
import Header from "../../layout/Canvas/Header";
import { ACTIVITY_NODES } from "../../diagrams-elements/activities-elements";
import { activitiesNodeTypes } from "../../types/nodeTypes";
import { CanvasProvider } from "../../contexts/CanvasContext";
import { useCanvas } from "../../hooks/useCanvas";
import { useCallback, useEffect, useState } from "react";
import { edgeTypes } from "../../types/edgeTypes";
import { useParams } from "react-router";
import DataNodeContextMenu from "../../components/canvas/activities-diagram/contextMenu/DataNodeContextMenu";
import type { Diagram } from "../../types/diagramsModel";
import { fetchDiagramById } from "../../services/diagramSerivce";
import { SnapConnectionLine } from "../../components/canvas/sequence-diagram/SnapConnectionLine";

function DiagramContent() {
    const { id: diagramId } = useParams();
    const [diagram, setDiagram] = useState<Diagram | null>(null);
    const { isDarkMode } = useTheme();
    const { isZoomOnScrollEnabled, setIsTryingToConnect } = useCanvas();
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const { getIntersectingNodes } = useReactFlow();

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
            console.log('Diagrama cargado:', diagram);
            setNodes(diagram.content.canvas.nodes);
            setEdges(diagram.content.canvas.edges || []);
        }
    }, [diagram]);

    const onNodesChange = useCallback(
        (changes: NodeChange[]) => {
            setNodes((nodesSnapshot) => {
                const nodes = applyNodeChanges(changes, nodesSnapshot)
                // console.log('Nodos actuales:', nodes);
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
        const intersections = getIntersectingNodes(node).map((n) => n.id);
        // console.log('Nodos que intersectan con el nodo arrastrado:', intersections);

        if (node.type !== 'activity' && intersections.some(nodeId => nodeId.startsWith('activity'))) {
            node.parentId = intersections.find(nodeId => nodeId.startsWith('activity')) || undefined;
            node.extent = 'parent';
        }
        setNodes(nodes => nodes.map(n => n.id === node.id ? node : n));

    }, []);

    const onConnect = useCallback(
        (params: Connection) => {
            const sourceNode = nodes.find((node) => node.id === params.source);
            const targetNode = nodes.find((node) => node.id === params.target);

            let edgeType = {};
            let defaultLabel = '';

            // Definir el tipo de edge según el tipo de nodo conectado
            if (targetNode?.type === 'dataNode') {
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
                id: `edge-${params.source}-${params.target}`,
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

    const isValidConnection = useCallback(
        (connection: Edge | Connection) => {
            const sourceNode = nodes.find((node) => node.id === connection.source);
            const targetNode = nodes.find((node) => node.id === connection.target);

            // console.log('connection ', connection);

            if (!sourceNode || !targetNode) {
                return false;
            }

            const sourceNodeId = sourceNode.id;
            const targetNodeId = targetNode.id;
            const sourceNodeType = sourceNode.type;
            const targetNodeType = targetNode.type;

            if (!targetNodeType || !sourceNodeType) {
                return false;
            }

            // Un solo handle por conexion
            if (edges.some(edge =>
                edge.sourceHandle === connection.sourceHandle
                || edge.sourceHandle === connection.targetHandle
                || edge.targetHandle === connection.targetHandle
                || edge.targetHandle === connection.sourceHandle)) {
                return false;
            }

            // Evitar conexiones a uno mismo
            if (sourceNodeId === targetNodeId) {
                return false;
            }

            // Evitar multiples conexiones entre dos nodos
            if (edges.some(edge => edge.source === sourceNodeId && edge.target === targetNodeId)) {
                return false;
            }

            // Evitar loops entre 2 nodos
            if (edges.some(edge => edge.source === targetNodeId && edge.target === sourceNodeId)) {
                return false;
            }

            // Obtener las conexiones entrantes al nodo objetivo del mismo grupo (simpleAction, callBehavior, callOperation)
            const relevantTypes = ['simpleAction', 'callBehavior', 'callOperation'];
            const incomingEdgesFromGroup = edges.filter(edge =>
                edge.target === targetNodeId &&
                relevantTypes.some(type => edge.source.includes(type))
            );

            // Obtener las conexiones salientes del nodo fuente hacia el mismo grupo
            const outgoingEdgesToGroup = edges.filter(edge =>
                edge.source === sourceNodeId &&
                relevantTypes.some(type => edge.target.includes(type))
            );

            // REGLA 1: Un nodo NO puede tener más de una conexión entrante de estos 3 tipos de nodos
            if (relevantTypes.includes(targetNodeType) && incomingEdgesFromGroup.length > 0) {
                return false;
            }

            // REGLA 2: Un simpleAction NO puede tener múltiples conexiones salientes hacia estos 3 tipos de nodos
            if (sourceNodeType === 'simpleAction' &&
                relevantTypes.includes(targetNodeType) &&
                outgoingEdgesToGroup.length > 0) {
                return false;
            }
            if (sourceNodeType === 'callBehavior' &&
                relevantTypes.includes(targetNodeType) &&
                outgoingEdgesToGroup.length > 0) {
                return false;
            }
            if (sourceNodeType === 'callOperation' &&
                relevantTypes.includes(targetNodeType) &&
                outgoingEdgesToGroup.length > 0) {
                return false;
            }

            // VALIDACIONES PARA DECISION CONTROLS
            // Hacer que solo tenga 1 conexion de entrada
            if (targetNodeType === 'decisionControl' && edges.some(edge => edge.target === targetNodeId)) {
                return false;
            }

            // VALIDACIONES PARA MERGE NODE
            // Hacer que solo tenga 1 conexion de salida
            if (sourceNodeType === 'mergeNode' && edges.some(edge => edge.source === sourceNodeId)) {
                return false;
            }

            // VALIDACIONES PARA INITIAL NODE
            // Hacer que solo tenga 1 conexion de salida
            if (sourceNodeType === 'initialNode' && edges.some(edge => edge.source === sourceNodeId)) {
                return false;
            }
            //Hacer que no acepte conexiones entrantes
            if (targetNodeType === 'initialNode') {
                return false;
            }

            // VALIDACIONES PARA FINAL NODE
            // Hacer que no acepte conexiones salientes
            if (sourceNodeType === 'finalNode') {
                return false;
            }
            // Hacer que solo tenga 1 conexion de entrada
            if (targetNodeType === 'finalNode' && edges.some(edge => edge.target === targetNodeId)) {
                return false;
            }

            // VALIDACIONES PARA FINAL FLOW NODE
            // Hacer que no acepte conexiones salientes
            if (sourceNodeType === 'finalFlowNode') {
                return false;
            }
            // Hacer que solo tenga 1 conexion de entrada
            if (targetNodeType === 'finalFlowNode' && edges.some(edge => edge.target === targetNodeId)) {
                return false;
            }

            // VALIDACIONES PARA CONNECTOR NODE
            // Hacer que no acepte multiples conexiones salientes
            if (sourceNodeType === 'connectorNode' && edges.some(edge => edge.source === sourceNodeId || edge.target === sourceNodeId)) {
                return false;
            }
            // Hacer que no acepte multiples conexiones entrantes
            if (targetNodeType === 'connectorNode' && edges.some(edge => edge.source === targetNodeId || edge.target === targetNodeId)) {
                return false;
            }

            // VALIDACIONES PARA DATA NODE
            // Permitir multiples entradas y una sola salida
            if (sourceNodeType === 'dataNode' && edges.some(edge => edge.source === sourceNodeId)) {
                return false;
            }

            // VALIDACIONES PARA OBJECT NODE
            // Solo permitir una entrada y una salida
            if (sourceNodeType === 'objectNode' && edges.some(edge => edge.source === sourceNodeId)
                || targetNodeType === 'objectNode' && edges.some(edge => edge.target === targetNodeId)) {
                return false;
            }

            //VALIDACIONES PARA EXCEPTION HANDLING
            // Permitir solo una entrada y sin salidas
            if (sourceNodeType === 'exceptionHandling' || (targetNodeType === 'exceptionHandling' && edges.some(edge => edge.target == targetNodeId))) {
                return false;
            }

            return true;
        }
        , [edges, nodes]
    )

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
                    isValidConnection={isValidConnection}
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
                    onConnectStart={() => setIsTryingToConnect(true)}
                    onConnectEnd={() => setIsTryingToConnect(false)}
                >
                    <Background bgColor={isDarkMode ? '#18181B' : '#FAFAFA'} />
                    <Controls
                        showFitView={true}
                        showInteractive={false}
                        aria-label="Controles de lienzo"
                        position="bottom-right"
                    />
                    <DataNodeContextMenu />
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
