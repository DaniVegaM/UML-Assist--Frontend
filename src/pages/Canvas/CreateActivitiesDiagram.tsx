import { useTheme } from "../../hooks/useTheme";
import { addEdge, Background, Controls, ReactFlow, ReactFlowProvider, applyEdgeChanges, type Connection, applyNodeChanges, type Edge, type Node, type NodeChange, type EdgeChange, ConnectionLineType, ConnectionMode, useReactFlow, useNodes, useEdges, SelectionMode } from '@xyflow/react';
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
import { confirmExitWithoutSaving } from "../../utils/sweetAlert";
import { confirmRestoreAutoSave } from "../../utils/sweetAlert";
import { UndoRedoProvider, useUndoRedoContext } from "../../contexts/UndoRedoContext";
import { useUndoRedoShortcuts } from "../../hooks/useUndoRedoShortcuts";
import type { Snapshot } from "../../hooks/useUndoRedo";

function DiagramContent() {
    const { id: diagramId } = useParams();
    const [diagram, setDiagram] = useState<Diagram | null>(null);
    const { isDarkMode } = useTheme();
    const { isZoomOnScrollEnabled, setIsTryingToConnect, openEdgeContextMenu } = useCanvas();
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const { getIntersectingNodes, getNodes } = useReactFlow();
    const { isValidActivityConnection, validateActivityConnection } = useLocalValidations(nodes, edges);
    const lastInvalidAttemptRef = useRef<{ ts: number; message: string; type: "error" | "success" | "info" } | null>(null);

    // ── Historial undo/redo ──
    const { takeSnapshot, captureSnapshot, commitSnapshot } = useUndoRedoContext();
    useUndoRedoShortcuts();
    const pendingConnectSnapshot = useRef<Snapshot | null>(null);
    const pendingDragSnapshot = useRef<Snapshot | null>(null);

    const restoredFromDraftRef = useRef(false);

    const isValidActivityConnectionWithFeedback = useCallback(
        (conn: Connection) => {
            const sourceNode = nodes.find(n => n.id === conn.source);
            const targetNode = nodes.find(n => n.id === conn.target);
            if (
                sourceNode?.type === "note" ||
                targetNode?.type === "note"
            ) {
                return true;
            }
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
        [validateActivityConnection, nodes]
    );


    const onEdgeContextMenu = useCallback(
        (event: React.MouseEvent, edge: Edge) => {
            event.preventDefault();
            openEdgeContextMenu({ x: event.clientX, y: event.clientY, edgeId: edge.id });
        },
        [openEdgeContextMenu],
    );

    useEffect(() => {
        if (!diagramId) return;
        const controller = new AbortController();
        const loadDiagram = async () => {
            try {
                const response = await fetchDiagramById(diagramId);
                if (!controller.signal.aborted) {
                    setDiagram(response.data);
                }
            } catch {
                // ignorar errores de abort
            }
        };
        loadDiagram();
        return () => controller.abort();
    }, [diagramId]);

    useEffect(() => {
        const restoreDraft = async () => {
            const autoSaveKey = diagramId
                ? `autosave-actividades-${diagramId}`
                : `autosave-actividades-new`;

            const savedDraft = localStorage.getItem(autoSaveKey);
            if (!savedDraft) return;

            const result = await confirmRestoreAutoSave();

            if (!result.isConfirmed) {
                localStorage.removeItem(autoSaveKey);
                return;
            }

            try {
                const draft = JSON.parse(savedDraft);

                setNodes(draft.content?.canvas?.nodes || []);
                setEdges(draft.content?.canvas?.edges || []);

                restoredFromDraftRef.current = true;
                console.log('Autoguardado recuperado');
            } catch {
                console.error('No se pudo recuperar el autoguardado');
            }
        };

        restoreDraft();
    }, [diagramId, setNodes, setEdges]);

    useEffect(() => {

        if (restoredFromDraftRef.current) return;

        if (diagram?.content) {
            setNodes(diagram.content.canvas.nodes);
            setEdges(diagram.content.canvas.edges || []);
        }
    }, [diagram, setNodes, setEdges]);

    useEffect(() => {
        window.history.pushState(null, '', window.location.href);
        const handlePopState = async () => {
            const result = await confirmExitWithoutSaving();
            if (!result.isConfirmed) {
                window.history.pushState(null, '', window.location.href);
            } else {
                window.removeEventListener('popstate', handlePopState);
                window.history.back();
            }
        };
        window.addEventListener('popstate', handlePopState);
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

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

    // Snapshot al iniciar un arrastre; se confirma al soltar solo si hubo movimiento real.
    const onNodeDragStart = useCallback(() => {
        pendingDragSnapshot.current = captureSnapshot();
    }, [captureSnapshot]);

    const onNodeDragStop = useCallback(() => {
        const before = pendingDragSnapshot.current;
        pendingDragSnapshot.current = null;
        if (!before) return;
        const after = getNodes();
        const moved = before.nodes.some((bn) => {
            const an = after.find((n) => n.id === bn.id);
            return (
                an &&
                (an.position.x !== bn.position.x ||
                    an.position.y !== bn.position.y ||
                    an.parentId !== bn.parentId)
            );
        });
        if (moved) commitSnapshot(before);
    }, [getNodes, commitSnapshot]);

     const onNodeDrag = useCallback((_: React.MouseEvent, node: Node) => {
        const intersections = getIntersectingNodes(node);
        const parentNode = intersections.find(n => n.type === 'activity' && n.id !== node.id);

        if (node.type !== 'activity' && parentNode && node.parentId !== parentNode.id) {
            const updatedNode: Node = {
                ...node,
                parentId: parentNode.id,
                extent: 'parent',
                position: {
                    x: node.position.x - parentNode.position.x,
                    y: node.position.y - parentNode.position.y,
                },
            };
            setNodes(nodes => nodes.map(n => n.id === updatedNode.id ? updatedNode : n));
            return;
        }
        setNodes(nodes => nodes.map(n => n.id === node.id ? node : n));
    }, [getIntersectingNodes, setNodes]);


    const onConnect = useCallback(
        (params: Connection) => {
            // Confirma el snapshot tomado en onConnectStart (incluye handles magnéticos
            // generados durante el gesto). Si no hubo gesto previo, snapshot directo.
            if (pendingConnectSnapshot.current) {
                commitSnapshot(pendingConnectSnapshot.current);
                pendingConnectSnapshot.current = null;
            } else {
                takeSnapshot();
            }

            const sourceNode = nodes.find((node) => node.id === params.source);
            const targetNode = nodes.find((node) => node.id === params.target);

            let edgeType = "labeledEdge";
            let defaultLabel = '';


            if (
                sourceNode?.type === 'note' ||
                targetNode?.type === 'note'
            ) {
                edgeType = 'noteEdge';
            }
            // Definir el tipo de edge según el tipo de nodo conectado
            else if (
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
            else if (targetNode?.type === 'decisionControl') {
                defaultLabel = '[Condición]';
            }

            else if (sourceNode?.type === 'decisionControl') {
                defaultLabel = '[Clausula]';
            }

            const newEdge = {
                ...params,
                id: createPrefixedNodeId('edge'),
                type: edgeType,
                label: defaultLabel,
                data: edgeType === "noteEdge" ? { isNoteEdge: true } : undefined,
            };

            setEdges((edgesSnapshot) => {
                const newEdges = addEdge(newEdge, edgesSnapshot);
                // console.log('Conexiones actuales:', newEdges);
                return newEdges;
            });

        },
        [nodes, setEdges, commitSnapshot, takeSnapshot],
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
    
    const handleConnectStart = useCallback(() => {
        setIsTryingToConnect(true);
        // Captura el estado antes de iniciar la conexión (se confirma en onConnect).
        pendingConnectSnapshot.current = captureSnapshot();
    }, [setIsTryingToConnect, captureSnapshot]);

    const handleConnectEnd = useCallback(() => {
        setIsTryingToConnect(false);
        // Si el gesto no terminó en una conexión, descartamos el snapshot pendiente.
        pendingConnectSnapshot.current = null;

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
                    minZoom={0.1}
                    maxZoom={4}
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
                    onNodeDragStart={onNodeDragStart}
                    onNodeDragStop={onNodeDragStop}
                    onSelectionDragStart={onNodeDragStart}
                    onSelectionDragStop={onNodeDragStop}
                    onBeforeDelete={async () => { takeSnapshot(); return true; }}
                    nodeTypes={activitiesNodeTypes}
                    zoomOnScroll={isZoomOnScrollEnabled}
                    selectionOnDrag={true}
                    selectionMode={SelectionMode.Partial}
                    multiSelectionKeyCode={["Shift"]}
                    nodesDraggable={true}
                    onConnect={onConnect}
                    onConnectEnd={handleConnectEnd}
                    onConnectStart={handleConnectStart}
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
                <UndoRedoProvider>
                    <DiagramContent />
                </UndoRedoProvider>
            </CanvasProvider>
        </ReactFlowProvider>

    );
}

