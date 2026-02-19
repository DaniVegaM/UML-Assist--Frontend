import { useEdges, useNodes } from "@xyflow/react";
import { useCallback, useState } from "react";
import { reviewDiagramWithAI } from "../../services/diagramSerivce";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function AIChatBar({type}: {type: 'actividades' | 'secuencia'}) {
    const [isVisible, setIsVisible] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [initialContext, setInitialContext] = useState("");
    const nodes = useNodes();
    const edges = useEdges();
    const TEXT_AREA_MAX_LEN = 100;

    const onChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (evt.target.value.length >= TEXT_AREA_MAX_LEN) {
            setInitialContext(evt.target.value.trim().slice(0, TEXT_AREA_MAX_LEN));
        } else {
            setInitialContext(evt.target.value);
        }
    }, []);

    const reviewDiagram = async () => {
        setIsThinking(true);

        const intermediateLanguage = `
${type === 'actividades' ? 
`activityDiagram

nodes[${nodes.length}]{id, content, parentNodeId}
${nodes.map(n => `${n.id}, ${(n.data.label as string).replace("\n", " ")}, ${n.parentId || ""}`).join('\n')}

edges[${edges.length}]{id, sourceNode, targetNode, guard}
${edges.map(e => {
    const label = typeof e.label === 'string' ? e.label.slice(1, -1) : '';
    return `${e.id}, ${e.source}, ${e.target}, ${label}`;
}).join('\n')}`

    : 
    
`sequenceDiagram

participants[${nodes.length}]{id, name, x, startY, endEvent}
${nodes
    .sort((a, b) => a.position.x - b.position.x)
    .map(n => {
        const startY = Math.round(n.position.y);
        const endEvent = n.data.hasDestruction ? 'destruction' : 'none';
        return `${n.id}, ${n.data.label}, ${Math.round(n.position.x)}, ${startY}, ${endEvent}`;
    }).join('\n')}

messages[${edges.length}]{id, type, source, target, label, yPos, fragmentId, operand}
${edges
    .map(e => ({ ...e, yPos: e.data?.y || 0 }))
    .sort((a, b) => a.yPos - b.yPos)
    .map(e => {
        let type = e.data?.edgeType || 'async';

        if (e.type === 'lostMessageEdge') type = 'lost';
        if (e.type === 'foundMessageEdge') type = 'found';
        if (e.type === 'createLifeLineEdge') type = 'create';

        if (type === 'response') type = 'reply';
        
        const source = type === 'found' ? '[FOUND]' : e.source;
        const target = type === 'lost' ? '[LOST]' : e.target;
        const label = typeof e.label === 'string' ? e.label : (e.data?.label || '');
        const fragmentNode = nodes.find(n => Array.isArray(n.data.edges) && (n.data.edges as string[]).includes(e.id));
        const fragmentId = fragmentNode?.id || '';
        const operandsArr = fragmentNode?.data?.operands as [string, string][] | undefined;
        const operand = operandsArr?.find(([id]) => id === e.id)?.[1] || '';
        return `${e.id}, ${type}, ${source}, ${target}, ${label}, ${Math.round(e.yPos)}, ${fragmentId}, ${operand}`;
    }).join('\n')}`}
        `;

        console.log("Lenguaje intermedio enviado a la IA:", intermediateLanguage);

        const reviewDiagramData = {
            userPrompt: initialContext,
            diagramType: type === 'actividades' ? 'activities' : 'sequence' as 'activities' | 'sequence',
            intermediateLanguage,
        }

        const reviewDiagramResponse = await reviewDiagramWithAI(reviewDiagramData);
        
        console.log("Respuesta de la IA:", reviewDiagramResponse.data.suggestions);
        
        setTimeout(() => {
            setIsThinking(false);
        }, 3500);
    }

    return (
        <>
            <button onClick={() => setIsVisible(prev => !prev)} className="fixed bottom-28 right-2.5 bg-sky-600 p-2 rounded-full cursor-pointer shadow-lg hover:bg-sky-700 transition-colors z-50 border-1 border-zinc-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="white" className="size-6" viewBox="0 0 24 24"><path fillRule="evenodd" d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5m9-3a.75.75 0 0 1 .728.568l.258 1.036a2.63 2.63 0 0 0 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258a2.63 2.63 0 0 0-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.63 2.63 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.63 2.63 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5M16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395a1.5 1.5 0 0 0-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395a1.5 1.5 0 0 0 .948-.948l.395-1.183A.75.75 0 0 1 16.5 15" clipRule="evenodd" /></svg>
            </button>

            <aside className={`h-3/4 w-80 absolute right-3 z-10 top-2.5 rounded-2xl border-2 border-zinc-400 bg-zinc-50 dark:bg-zinc-800 shadow-lg p-4 transition-all duration-300 ease-in-out ${isVisible ? 'w-80 opacity-100' : 'w-0 opacity-0 pointer-events-none'}`}>
                <section className={`w-full h-full flex-col gap-2 ${isThinking ? 'hidden' : 'flex'}`}>
                    <h2 className="font-bold text-zinc-900 dark:text-white">Asistente Inteligente</h2>

                    <textarea value={initialContext} onChange={onChange} name="chatAI" id="chatAI" placeholder="Contexto del sistema (opcional): Define brevemente qué construyes (ej. 'E-commerce de ropa'). Esto permitirá que las sugerencias para cada componente sean más coherentes entre sí." className="h-full border-1 border-zinc-500 p-1 rounded-lg bg-zinc-100 dark:bg-zinc-700 dark:text-white"></textarea>
                        {
                            <p className="char-counter char-counter-right">{`${initialContext.length}/${TEXT_AREA_MAX_LEN}`}</p>
                        }

                    <button onClick={reviewDiagram} className="flex gap-2 bg-sky-600 p-2 rounded-full cursor-pointer shadow-lg hover:bg-sky-700 transition-colors mt-2 justify-center items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="white" className="size-6" viewBox="0 0 24 24"><path fillRule="evenodd" d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5m9-3a.75.75 0 0 1 .728.568l.258 1.036a2.63 2.63 0 0 0 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258a2.63 2.63 0 0 0-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.63 2.63 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.63 2.63 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5M16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395a1.5 1.5 0 0 0-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395a1.5 1.5 0 0 0 .948-.948l.395-1.183A.75.75 0 0 1 16.5 15" clipRule="evenodd" /></svg>
                        <span className="font-bold text-white uppercase text-sm">Revisar diagrama</span>
                    </button>
                    <p className="font-light text-xs text-zinc-900 dark:text-zinc-200 text-center">Las sugerencias generadas pueden contener errores lógicos o inconsistencias.</p>
                </section>
                {
                    isThinking && (
                        <section className="w-full h-full flex items-center justify-center">
                            <DotLottieReact
                                src="/LoaderAI.lottie"
                                loop
                                autoplay
                            />
                        </section>
                    )
                }
            </aside>
        </>
    )
}