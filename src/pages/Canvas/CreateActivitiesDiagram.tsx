import { useTheme } from "../../hooks/useTheme";
import { addEdge, Background, useUpdateNodeInternals, Controls, ControlButton, ReactFlow, ReactFlowProvider, applyEdgeChanges, type Connection, applyNodeChanges, type Edge, type Node, type NodeChange, type EdgeChange, ConnectionLineType, ConnectionMode, useReactFlow, useNodes, useEdges } from '@xyflow/react';
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

function DiagramContent() {
    const { id: diagramId } = useParams();
    const [diagram, setDiagram] = useState<Diagram | null>(null);
    const { isDarkMode } = useTheme();
    const { isZoomOnScrollEnabled, setIsTryingToConnect, openEdgeContextMenu } = useCanvas();
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const { getIntersectingNodes } = useReactFlow();
    const { isValidActivityConnection } = useLocalValidations(nodes, edges);
    const { validateActivityConnection } = useLocalValidations(nodes, edges);
    const lastInvalidAttemptRef = useRef<{ ts: number; message: string; type: "error" | "success" | "info" } | null>(null);
    const [history, setHistory] = useState<{
        past: { nodes: Node[]; edges: Edge[] }[];
        present: { nodes: Node[]; edges: Edge[] };
        future: { nodes: Node[]; edges: Edge[] }[];
    }>({
        past: [],
        present: { nodes: [], edges: [] },
        future: [],
    });
    const MAX_HISTORY = 10;
    const saveToHistory = (newNodes: Node[], newEdges: Edge[]) => {
        if (isUndoRedoRef.current) return;
        setHistory((h) => {
            const isSame =
                JSON.stringify(h.present.nodes) === JSON.stringify(newNodes) &&
                JSON.stringify(h.present.edges) === JSON.stringify(newEdges);

            if (isSame) return h; // 👈 evita duplicados

            const newPast = [...h.past, h.present];

            return {
                past: newPast.slice(-MAX_HISTORY),
                present: { nodes: newNodes, edges: newEdges },
                future: [],
            };
        });
    };


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
            const initialNodes = diagram.content.canvas.nodes;
            const initialEdges = diagram.content.canvas.edges || [];

            setNodes(initialNodes);
            setEdges(initialEdges);

            // 👇 AGREGA ESTO
            setHistory({
                past: [],
                present: { nodes: initialNodes, edges: initialEdges },
                future: [],
            });
        }
    }, [diagram]);

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

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

    const isUndoRedoRef = useRef(false);
    const updateNodeInternals = useUpdateNodeInternals();

    const undo = useCallback(() => {
        isUndoRedoRef.current = true;
        setHistory((h) => {
            if (h.past.length === 0) {
                isUndoRedoRef.current = false;
                return h;
            }

            const previous = h.past[h.past.length - 1];

            setNodes([...previous.nodes]);
            setEdges([...previous.edges]);
            setTimeout(() => {
                previous.nodes.forEach(node => {
                    updateNodeInternals(node.id);
                });
                isUndoRedoRef.current = false;
            }, 0);

            return {
                past: h.past.slice(0, -1),
                present: previous,
                future: [h.present, ...h.future],
            };
        });
        setTimeout(() => {
            isUndoRedoRef.current = false;
        }, 0);
    }, [updateNodeInternals]);


    const redo = useCallback(() => {
        isUndoRedoRef.current = true;
        setHistory((h) => {
            if (h.future.length === 0) {
                isUndoRedoRef.current = false;
                return h;
            }

            const next = h.future[0];
            setNodes([...next.nodes]);
            setEdges([...next.edges]);
            setTimeout(() => {
                next.nodes.forEach(node => {
                    updateNodeInternals(node.id);
                });
                isUndoRedoRef.current = false;
            }, 0);

            return {
                past: [...h.past, h.present],
                present: next,
                future: h.future.slice(1),
            };
        });

        setTimeout(() => {
            isUndoRedoRef.current = false;
        }, 0);
    }, [updateNodeInternals]);

        useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key.toLowerCase() === 'z') {
                e.preventDefault();
                undo();
            }

            if (e.ctrlKey && e.key.toLowerCase() === 'y') {
                e.preventDefault();
                redo();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [undo, redo]);

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
            saveToHistory([...nodes], newEdges);
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
                    onNodeDragStop={(e, node) => {
                        onNodeDrag(e, node);

                        setTimeout(() => {
                            saveToHistory([...nodes], [...edges]);
                        }, 0);
                    }}
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
                    >
                        <ControlButton onClick={undo} title="Deshacer (Ctrl+Z)">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                                <path fillRule="evenodd" d="M7.793 2.232a.75.75 0 0 1-.025 1.06L3.622 7.25h10.003a5.375 5.375 0 0 1 0 10.75H10.75a.75.75 0 0 1 0-1.5h2.875a3.875 3.875 0 0 0 0-7.75H3.622l4.146 3.957a.75.75 0 0 1-1.036 1.085l-5.5-5.25a.75.75 0 0 1 0-1.085l5.5-5.25a.75.75 0 0 1 1.06.025Z" clipRule="evenodd" />
                            </svg>
                        </ControlButton>

                        <ControlButton onClick={redo} title="Rehacer (Ctrl+Y)">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                                <path fillRule="evenodd" d="M12.207 2.232a.75.75 0 0 0 .025 1.06l4.146 3.958H6.375a5.375 5.375 0 0 0 0 10.75H9.25a.75.75 0 0 0 0-1.5H6.375a3.875 3.875 0 0 1 0-7.75h10.003l-4.146 3.957a.75.75 0 0 0 1.036 1.085l5.5-5.25a.75.75 0 0 0 0-1.085l-5.5-5.25a.75.75 0 0 0-1.06.025Z" clipRule="evenodd" />
                            </svg>
                        </ControlButton>
                    </Controls>
                    <NodeContextMenu />
                    <EdgeContextMenu />
                </ReactFlow>
                <ElementsBar nodes={ACTIVITY_NODES} saveToHistory={saveToHistory} />
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

