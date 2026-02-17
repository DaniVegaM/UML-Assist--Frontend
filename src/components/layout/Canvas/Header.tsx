import { Link } from 'react-router'
import { useTheme } from '../../../hooks/useTheme';
import type { HeaderProps } from '../../../types/canvas';
import { useEffect, useState } from 'react';
import { createDiagram, updateDiagram } from '../../../services/diagramSerivce';
import type { Diagram } from '../../../types/diagramsModel';
import './Header.css';
import NotificationBellButton from "./NotificationBellButton";


export default function Header({ diagramTitle = '', diagramId, type, nodes, edges }: HeaderProps) {
    const { isDarkMode, toggleTheme } = useTheme();
    const [title, setTitle] = useState<string>('')
    const [saving, setSaving] = useState<boolean>(false)
    const [loading, setLoading] = useState({ showLoading: false, showConfirmation: false, showError: false });

    useEffect(() => {
        if (diagramTitle?.length > 0)
            setTitle(diagramTitle);
        else {
            setTitle('Diagrama sin título')
        }
    }, [diagramTitle])

    const saveDiagram = async () => {
        if (saving === true) return;
        setLoading({ showLoading: true, showConfirmation: false, showError: false });
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

        const minLoadingTime = new Promise(resolve => setTimeout(resolve, 1500));

        try {
            const savePromise = !diagramId
                ? createDiagram(diagramData)
                : updateDiagram(diagramData);

            await Promise.all([savePromise, minLoadingTime]);

            setLoading({ showLoading: false, showConfirmation: true, showError: false });
            setTimeout(() => {
                setLoading({ showLoading: false, showConfirmation: false, showError: false });
            }, 3000);
        } catch {
            await minLoadingTime;
            setLoading({ showLoading: false, showConfirmation: false, showError: true });
            setTimeout(() => {
                setLoading({ showLoading: false, showConfirmation: false, showError: false });
            }, 3000);
        }
        setSaving(false);
    }

    const closeModal = () => {
        setLoading({ showLoading: false, showConfirmation: false, showError: false });
    }

    return (
        <>
            <section className="h-full bg-sky-600 grid grid-cols-3 gap-4 p-1 items-center">
                <div className="flex items-center justify-start gap-2 pl-2">
                    <Link to="/dashboard" className="mr-4 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="white" strokeWidth="3" className="size-6" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"/></svg>
                    </Link>
                    <Link to="/" className="flex items-center justify-center gap-3">
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
                        <p className="text-center text-white font-bold uppercase">UML Assist</p>
                    </Link>
                </div>
                <div>
                    <input
                        className="max-w-92 min-w-52 w-full bg-zinc-200 text-zinc-600 ring-1 ring-zinc-200 focus:ring-2 focus:ring-sky-800 outline-none duration-300 placeholder:text-zinc-600 placeholder:opacity-50 rounded-lg px-4 py-1"
                        autoComplete="off"
                        placeholder="Diagrama sin título"
                        value={title || ""}
                        onClick={e => e.currentTarget.select()}
                        onChange={e => setTitle(e.target.value)}
                        type="text"
                    />
                </div>
                <div className="flex justify-center gap-4">
                    <button onClick={() => saveDiagram()} className="bg-white dark:bg-neutral-800 py-1 px-4 text-sky-600 dark:text-white font-bold uppercase rounded-full hover:bg-zinc-800 hover:text-white transition-all duration-200 cursor-pointer">Guardar</button>

                    <button className="bg-white py-1 dark:bg-neutral-800 px-4 text-sky-600 dark:text-white font-bold uppercase rounded-full hover:bg-zinc-800 hover:text-white transition-all duration-200 cursor-pointer">Exportar</button>

                    <NotificationBellButton />

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

            {(loading.showLoading || loading.showConfirmation || loading.showError) && (
                <div className="fixed inset-0 bg-black/50 flex items-center gap-5 justify-center z-50 p-4">
                    <div className="bg-white dark:bg-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        {loading.showLoading && (
                            <div className="flex flex-col items-center gap-4">
                                <div className="header-lds-ring"><div></div><div></div><div></div><div></div></div>
                                <p className="text-gray-700 dark:text-gray-300 text-2xl">Guardando...</p>
                            </div>
                        )}
                        {loading.showConfirmation && (
                            <div className="flex flex-col items-center gap-4">
                                <div className="header-dummy-positioning">
                                    <div className="header-success-icon">
                                        <div className="header-success-icon__tip"></div>
                                        <div className="header-success-icon__long"></div>
                                    </div>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 font-medium text-2xl">¡Guardado exitosamente!</p>
                                <button
                                    onClick={closeModal}
                                    className="cursor-pointer bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-6 rounded-full transition-all duration-200"
                                >
                                    OK
                                </button>
                            </div>
                        )}
                        {loading.showError && (
                            <div className="flex flex-col items-center gap-4">
                                <div className="header-icon header-error">
                                    <span className="header-x-mark">
                                        <span className="header-errorLine left"></span>
                                        <span className="header-errorLine right"></span>
                                    </span>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 font-medium text-2xl">Error al guardar</p>
                                <button
                                    onClick={closeModal}
                                    className="cursor-pointer bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-6 rounded-full transition-all duration-200"
                                >
                                    OK
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
