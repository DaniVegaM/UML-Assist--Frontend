import { useDraggable } from '@neodrag/react';
import { useReactFlow, type XYPosition } from '@xyflow/react';
import { useRef, useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import type { DraggableNodeProps, ElementsBarProps } from '../../types/canvas';

let id = 0;
const getId = () => `dndnode_${id++}`;

function DraggableNode({ className, children, nodeType }: DraggableNodeProps) {
    const draggableRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<XYPosition>({ x: 0, y: 0 });
    const { setNodes, screenToFlowPosition } = useReactFlow();

    useDraggable(draggableRef as React.RefObject<HTMLElement>, {
        position: position,
        onDrag: ({ offsetX, offsetY }) => {
            setPosition({
                x: offsetX,
                y: offsetY,
            });
        },
        onDragEnd: ({ event }) => {
            setPosition({ x: 0, y: 0 });

            const flow = document.querySelector('.react-flow');
            const flowRect = flow?.getBoundingClientRect();
            const screenPosition = { x: event.clientX, y: event.clientY };

            // Revisar que el elemento se haya soltado dentro del lienzo
            const isInFlow =
                flowRect &&
                screenPosition.x >= flowRect.left &&
                screenPosition.x <= flowRect.right &&
                screenPosition.y >= flowRect.top &&
                screenPosition.y <= flowRect.bottom;

            // Si sí está dentro entonces se agrega el nodo
            if (isInFlow) {
                const flowPosition = screenToFlowPosition(screenPosition);

                // Creamos el nodo
                const newNode = {
                    id: getId(),
                    type: nodeType,
                    position: flowPosition,
                    data: { label: `${nodeType} node` },
                };
                // Agregamos el nodo
                setNodes((nds) => nds.concat(newNode));
            }
        },
    });

    return (
        <div className={`${className} cursor-grab active:cursor-grabbing`} ref={draggableRef}>
            {children}
        </div>
    );
}

export function ElementsBar({ nodes }: ElementsBarProps) {
    const { isDarkMode } = useTheme();
    const [extendedBar, setExtendedBar] = useState(false);

    return (
        <aside className={`absolute inset-y-3 left-3 z-10 bg-white dark:bg-zinc-800 rounded-2xl shadow-lg py-4 px-2 transition-all duration-300 ease-in-out ${extendedBar ? 'w-52' : 'w-16'}`}>
            <button className='transition-all duration-1000 w-full mb-4 cursor-pointer' onClick={() => setExtendedBar(!extendedBar)}>
                <svg className={extendedBar ? '' : 'mx-auto'} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M3 11.325c0-3.59 0-5.385.966-6.61a4.5 4.5 0 0 1 .748-.749C5.94 3 7.734 3 11.325 3h1.35c3.59 0 5.386 0 6.61.966.279.22.53.47.749.748C21 5.94 21 7.734 21 11.325v1.35c0 3.59 0 5.386-.966 6.61-.22.279-.47.53-.748.749-1.226.966-3.02.966-6.611.966h-1.35c-3.59 0-5.385 0-6.61-.966a4.497 4.497 0 0 1-.749-.748C3 18.06 3 16.266 3 12.675v-1.35ZM11.325 4.5H13.5v15h-2.175c-1.83 0-3.076-.002-4.021-.111-.914-.105-1.356-.293-1.661-.533a3.004 3.004 0 0 1-.499-.499c-.24-.305-.428-.747-.533-1.661-.109-.945-.111-2.19-.111-4.021v-1.35c0-1.83.002-3.076.11-4.021.106-.914.293-1.356.534-1.661a3 3 0 0 1 .499-.499c.305-.24.747-.428 1.661-.533.945-.109 2.19-.111 4.021-.111ZM15 19.486c.666-.014 1.22-.042 1.696-.097.914-.105 1.356-.293 1.661-.533.186-.146.353-.314.499-.499.24-.305.428-.747.533-1.661.109-.945.111-2.19.111-4.021v-1.657H15v8.468Zm4.494-9.968c-.01-.904-.037-1.619-.105-2.214-.105-.914-.293-1.356-.533-1.661a3.004 3.004 0 0 0-.499-.499c-.305-.24-.747-.428-1.661-.533A18.58 18.58 0 0 0 15 4.514v5.004h4.494Z" fill={isDarkMode ? "white" : "black"}></path>
                </svg>
            </button>
            <div className='flex flex-col gap-2'>
                {nodes.map(node => {
                    if (node.separator) {
                        return (
                            <div key={node.separatorLabel} className='mt-2'>
                                <hr className='border-gray-300 dark:border-neutral-700' />
                                <p className={`text-xs text-gray-500 dark:text-neutral-400 mt-1 px-1 transition-opacity duration-300 ${extendedBar ? 'opacity-100' : 'opacity-0'}`}>
                                    {extendedBar ? node.separatorLabel : null}
                                </p>
                            </div>
                        );
                    } else {
                        return (
                            <DraggableNode
                                className={`${node.className} border border-gray-300 dark:border-neutral-900 rounded-lg p-2 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-zinc-600 flex h-10 text-zinc-400
                        ${extendedBar ? 'flex-row justify-between' : 'flex-col gap-2'}`
                                }
                                nodeType={node.nodeType}
                                key={node.label.trim()}
                            >
                                <div className={`h-full`}>
                                    {node.svg}
                                </div>
                                <p className={`transition-all duration-1000 ${extendedBar ? 'opacity-100' : 'opacity-0'}`}>{extendedBar ? node.label : null}</p>
                            </DraggableNode>
                        );
                    }
                })}
            </div>
        </aside>
    );
}