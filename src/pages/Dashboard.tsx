import { useEffect, useState, useRef } from "react";
import { deleteDiagram, fetchDiagrams, patchDiagram } from "../services/diagramSerivce";
import { useNavigate } from "react-router";
import Header from "../layout/MainLayout/Header";
import type { Diagram } from "../types/diagramsModel";
import MenuWithOptions from "../components/ui/MenuWithOptions";

export default function Dashboard() {
    const navigate = useNavigate();

    const [diagrams, setDiagrams] = useState<Diagram[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [selectedDiagramCard, setSelectedDiagramCard] = useState<Diagram | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
    const [showMenu, setShowMenu] = useState<boolean>(false);
    const [menuPosition, setMenuPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const inputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

    useEffect(() => {
        const loadDiagrams = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetchDiagrams();
                const data: Diagram[] = response.data;
                setDiagrams(data || []);
            } catch (err) {
                setError("Error al cargar los diagramas.");
                setDiagrams([]);
            } finally {
                setLoading(false);
            }
        };

        loadDiagrams();
    }, []);

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && showModal) {
                setShowModal(false);
            }
        };

        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [showModal]);

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleDiagramNavigate = (diagram: Diagram) => {
        const route = diagram.content?.type === 'actividades'
            ? `/crear-diagrama-de-actividades/${diagram.id}`
            : `/crear-diagrama-de-secuencia/${diagram.id}`;

        navigate(route);
    };

    const handleContextMenu = (event: React.MouseEvent, diagram: Diagram) => {
        event.preventDefault();
        event.stopPropagation();
        setSelectedDiagramCard(diagram);
        setMenuPosition({ x: event.clientX, y: event.clientY });
        setShowMenu(true);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };

        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMenu]);


    useEffect(() => {
        if (isEditingTitle && selectedDiagramCard?.id) {
            const input = inputRefs.current[selectedDiagramCard.id];
            if (input) {
                input.focus();
                input.select(); // Opcionalmente seleccionar todo el texto
            }
        }
    }, [isEditingTitle, selectedDiagramCard?.id]);

    const handleRename = async (diagramId: number, diagramTitle: string) => {
        // TODO: Actualizar el nombre al presiioinar botón enter
        if (selectedDiagramCard) {
            const diagramData: Diagram = {
                id: diagramId ? diagramId : undefined,
                title: diagramTitle,
                
            }
            try {
                await patchDiagram(diagramData);
            } catch (err) {
                console.error('Error al renombrar el diagrama:', err);
            }
                
            setDiagrams(diagrams.map(diagram => {
                if (diagram.id === selectedDiagramCard.id) {
                    return { ...diagram, title: diagram.title };
                } else {
                    return diagram;
                }
            }))
        }
        setIsEditingTitle(false)
    };

    const handleDeleteClick = () => {
        if (selectedDiagramCard) {
            setShowDeleteConfirm(true);
        }
    };

    const confirmDelete = async () => {
        if (!selectedDiagramCard?.id) return;

        try {
            await deleteDiagram(selectedDiagramCard.id);
            setDiagrams(diagrams.filter(d => d.id !== selectedDiagramCard.id));
            setShowDeleteConfirm(false);
            setSelectedDiagramCard(null);
        } catch (err) {
            console.error('Error al eliminar el diagrama:', err);
        }
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
        setSelectedDiagramCard(null);
    };

    return (
        <>
            <Header />

            <main className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 my-8 space-y-8">

                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="inline-block w-12 h-12 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-zinc-600 dark:text-zinc-400">Cargando diagramas...</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800">
                        <div className="flex items-center gap-3">
                            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-red-700 dark:text-red-300 font-semibold">{error}</p>
                        </div>
                    </div>
                )}

                {!loading && !error && diagrams.length === 0 && (
                    <div className="py-20">
                        <div className="text-center max-w-md mx-auto">
                            <div className="w-20 h-20 bg-sky-100 dark:bg-sky-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold dark:text-white mb-3">
                                No tienes diagramas aún
                            </h2>
                            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                                Crea tu primer diagrama UML y comienza a modelar con asistencia inteligente
                            </p>
                            <button
                                onClick={() => setShowModal(true)}
                                className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                                </svg>
                                Crear mi primer diagrama
                            </button>
                        </div>
                    </div>
                )}

                {!loading && !error && diagrams.length > 0 && (
                    <div>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                            <h1 className="text-3xl font-black leading-tight dark:text-white text-center md:text-left uppercase text-gray-800 md:text-4xl mb-3">
                                Mis diagramas
                            </h1>
                            <button
                                onClick={() => setShowModal(true)}
                                className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 cursor-pointer"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                                </svg>
                                Nuevo diagrama
                            </button>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 p-10"
                            style={{
                                backdropFilter: 'blur(3px) saturate(180%)',
                                WebkitBackdropFilter: 'blur(3px) saturate(180%)',
                                backgroundColor: 'rgba(248, 248, 248, 0.1)',
                            }}
                        >
                            {diagrams.map((diagram) => (
                                <div
                                    key={diagram.id}
                                    onClick={() => handleDiagramNavigate(diagram)}
                                    className="flex flex-col cursor-pointer p-6 rounded-2xl border-2 border-zinc-200/60 dark:border-zinc-700/60 bg-white dark:bg-zinc-800 hover:border-sky-400 dark:hover:border-sky-500 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="w-14 h-14 rounded-xl bg-sky-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <button
                                            onClick={(e) => handleContextMenu(e, diagram)}
                                            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 dark:text-white">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-3 my-2">
                                        <input
                                            className={`font-bold text-lg dark:text-white truncate group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors p-1 ${isEditingTitle && selectedDiagramCard?.id === diagram.id ? 'outline-1 outline-sky-600' : 'outline-0'}`}
                                            disabled={!isEditingTitle} type="text" value={diagram?.title}
                                            onClick={(e) => e.stopPropagation()}
                                            onBlur={() => setIsEditingTitle(false)}
                                            ref={(el) => {
                                                if (diagram.id) {
                                                    inputRefs.current[diagram.id] = el;
                                                }
                                            }}
                                            onChange={(evt) => {
                                                setDiagrams(diagrams => diagrams.map(diagram => {
                                                    if (diagram.id === selectedDiagramCard?.id) {
                                                        return { ...diagram, title: evt.target.value }
                                                    } else {
                                                        return diagram
                                                    }
                                                }))
                                            }}

                                        />

                                        <button
                                            className={`bg-sky-600 flex justify-center items-center p-2 w-[30px] h-[30px] hover:bg-sky-700 duration-300 cursor-pointer ${isEditingTitle && selectedDiagramCard?.id === diagram.id ? 'opactiy-100' : 'opacity-0'}`}
                                            onClick={(evt) => {
                                                evt.stopPropagation();
                                                handleRename(diagram.id!, diagram.title!);
                                            }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="white" className="size-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                            </svg>

                                        </button>

                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Modificado: {formatDate(diagram.updated_at!)}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                                        <svg className="lucide lucide-file-type-icon lucide-file-type w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" stroke-linejoin="round">
                                            <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
                                            <path d="M14 2v5a1 1 0 0 0 1 1h5" />
                                            <path d="M11 18h2" />
                                            <path d="M12 12v6" />
                                            <path d="M9 13v-.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5v.5" />
                                        </svg>
                                        <span>Tipo: {diagram.content?.type.toLowerCase() === 'actividades' ? 'Actividades' : diagram.content?.type.toLowerCase() === 'secuencia' ? 'Secuencia' : 'desconocido'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main >

            {showMenu && (
                <div
                    ref={menuRef}
                    style={{
                        position: 'fixed',
                        top: `${menuPosition.y}px`,
                        left: `${menuPosition.x - 150}px`,
                        zIndex: 1000,
                    }}
                >
                    <MenuWithOptions
                        options={[
                            {
                                title: 'Renombrar',
                                svg: (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                    </svg>
                                ),
                                onClick: () => {
                                    setShowMenu(false);
                                    setIsEditingTitle(true);
                                }
                            },
                            {
                                title: 'Eliminar',
                                svg: (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                    </svg>
                                ),
                                onClick: () => {
                                    handleDeleteClick();
                                    setShowMenu(false);
                                }
                            }
                        ]}
                    />
                </div>
            )}

            {showDeleteConfirm && selectedDiagramCard && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold dark:text-white">
                                    ¿Eliminar diagrama?
                                </h3>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                    Esta acción no se puede deshacer
                                </p>
                            </div>
                        </div>

                        <p className="text-zinc-700 dark:text-zinc-300 mb-6">
                            ¿Estás seguro de que deseas eliminar <span className="font-semibold">"{selectedDiagramCard.title}"</span>?
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={cancelDelete}
                                className="cursor-pointer flex-1 py-2 px-4 rounded-lg border-2 border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="cursor-pointer flex-1 py-2 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-all"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-zinc-800 rounded-2xl max-w-2xl w-full p-8 shadow-2xl">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-black dark:text-white mb-3">
                                ¿Qué tipo de diagrama deseas crear?
                            </h2>
                            <p className="text-zinc-600 dark:text-zinc-400">
                                Selecciona el tipo de diagrama UML que necesitas
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <button
                                onClick={() => navigate('/crear-diagrama-de-secuencia')}
                                className="group p-6 rounded-2xl border-2 border-sky-200/60 dark:border-sky-700/60 hover:border-sky-400 dark:hover:border-sky-500 transition-all duration-300 hover:shadow-xl text-left cursor-pointer"
                            >
                                <div className="w-14 h-14 rounded-xl bg-sky-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                    </svg>
                                </div>
                                <h3 className="font-bold text-xl dark:text-white mb-2 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                                    Diagrama de Secuencia
                                </h3>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                    Modela interacciones entre objetos a lo largo del tiempo
                                </p>
                            </button>

                            <button
                                onClick={() => navigate('/crear-diagrama-de-actividades')}
                                className="group p-6 rounded-2xl border-2 border-sky-200/60 dark:border-sky-700/60 hover:border-sky-400 dark:hover:border-sky-500 transition-all duration-300 hover:shadow-xl text-left cursor-pointer"
                            >
                                <div className="w-14 h-14 rounded-xl bg-sky-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                    </svg>
                                </div>
                                <h3 className="font-bold text-xl dark:text-white mb-2 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                                    Diagrama de Actividades
                                </h3>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                    Representa flujos de trabajo y procesos de negocio
                                </p>
                            </button>
                        </div>

                        <button
                            onClick={() => setShowModal(false)}
                            className="w-full py-3 px-6 rounded-xl border-2 border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all duration-300 cursor-pointer"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )
            }
        </>
    );
}