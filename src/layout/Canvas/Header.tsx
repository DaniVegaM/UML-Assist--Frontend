
import { Link } from 'react-router'
import { useTheme } from '../../hooks/useTheme';
import type { HeaderProps } from '../../types/canvas';
import { useEffect, useState } from 'react';
import { createDiagram, updateDiagram } from '../../services/diagramSerivce';
import type { Diagram } from '../../types/diagramsModel';

export default function Header({ diagramTitle='', diagramId, type, nodes, edges }: HeaderProps) {
    const { isDarkMode, toggleTheme } = useTheme();
    const [title, setTitle] = useState<string>('')
    const [saving, setSaving] = useState<boolean>(false)
    
    useEffect(() => {
        if (diagramTitle?.length > 0) 
            setTitle(diagramTitle);
        else {
            setTitle('Diagrama sin título')
        }
    }, [diagramTitle])

    const saveDiagram = async () => {
        if(saving === true) return;
        setSaving(true);
        const diagramData: Diagram = {
            id: diagramId ? diagramId : undefined,
            title: title,
            content: {
                type: type,
                canvas: {
                    nodes: nodes,
                    edges: edges,
                    totalNodes: nodes.length,
                    totalEdges: edges.length
                }
            }
        }
        console.log('Guardando diagrama:', diagramData);
        let response;
        if(!diagramId) {
            response = await createDiagram(diagramData)
        } else{
            response = await updateDiagram(diagramData)
        }
        console.log('Diagrama guardado:', response.data);
        setSaving(false);
    }

    return (
        <section className="h-full bg-sky-600 md:grid grid-cols-3 gap-4 p-1 items-center">
            <div className="flex items-center justify-center gap-2">
                <Link to="/" className="flex items-center justify-center">
                    <svg
                        className="h-8 w-8 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                        <line x1="10" y1="6.5" x2="14" y2="6.5" />
                        <line x1="10" y1="17.5" x2="14" y2="17.5" />
                        <line x1="6.5" y1="10" x2="6.5" y2="14" />
                        <line x1="17.5" y1="10" x2="17.5" y2="14" />
                    </svg>
                </Link>
                <p className="text-center text-white font-bold uppercase">{title}</p>
            </div>
            <input
                className="text-xl min-w-64 text-white focus-visible: outline-none hover:border-b border-white bg-sky-600 text-center col-span-1 placeholder-white"
                type="text"
                placeholder={title || "Diagrama sin título"}
                value={title || ""}
                onClick={e => e.currentTarget.select()}
                onChange = {e => setTitle(e.target.value)}
            />
            <div className="flex justify-center gap-4">
                <button onClick={() => saveDiagram()} className="bg-white dark:bg-neutral-800 py-1 px-4 text-sky-600 dark:text-white font-bold uppercase rounded-full hover:bg-zinc-800 hover:text-white transition-all duration-200 cursor-pointer">Guardar</button>

                <button className="bg-white py-1 dark:bg-neutral-800 px-4 text-sky-600 dark:text-white font-bold uppercase rounded-full hover:bg-zinc-800 hover:text-white transition-all duration-200 cursor-pointer">Exportar</button>

                <label htmlFor="switch" className="bg-white dark:bg-neutral-800 toggle ">
                    <input
                        type="checkbox"
                        className="input"
                        id="switch"
                        checked={!isDarkMode}
                        onChange={toggleTheme}
                    />
                    <div className="icon icon--moon">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            width="18"
                            height="18"
                        >
                            <path
                                fillRule="evenodd"
                                d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"
                                clipRule="evenodd"
                            ></path>
                        </svg>
                    </div>

                    <div className="icon icon--sun">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            width="18"
                            height="18"
                        >
                            <path
                                d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"
                            ></path>
                        </svg>
                    </div>
                </label>
            </div>
        </section>
    )
}
