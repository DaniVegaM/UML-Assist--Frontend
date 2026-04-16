import { useEffect, useState, useRef } from "react";
import { deleteDiagram, fetchDiagrams, patchDiagram } from "../services/diagramSerivce";
import { useNavigate } from "react-router";
import Header from "../components/layout/MainLayout/Header";
import type { Diagram } from "../types/diagramsModel";
import MenuWithOptions from "../components/ui/MenuWithOptions";
import '../components/layout/MainLayout/Header.css';
import { customModal, selectDiagramTypeAlert , loadingAlert, successAlert, errorAlert } from "../utils/sweetAlert";


export default function Dashboard() {
    const navigate = useNavigate();

    const [diagrams, setDiagrams] = useState<Diagram[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDiagramCard, setSelectedDiagramCard] = useState<Diagram | null>(null);
    const [showMenu, setShowMenu] = useState<boolean>(false);
    const [menuPosition, setMenuPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const menuRef = useRef<HTMLDivElement>(null);
    const [page, setPage] = useState(1);
    const [ordering, setOrdering] = useState("-updated_at");
    const [nextPage, setNextPage] = useState<string | null>(null);
    const [prevPage, setPrevPage] = useState<string | null>(null);
    

    useEffect(() => {
        const loadDiagrams = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetchDiagrams(page, ordering);
                setDiagrams(response.data.results || []);
                setNextPage(response.data.next);
                setPrevPage(response.data.previous);
            } catch {
                setError("Error al cargar los diagramas.");
                setDiagrams([]);
            } finally {
                setLoading(false);
            }
        };

        loadDiagrams();
    }, [page, ordering]);


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
        const handler = (e: any) => {
            if (e.detail === 'secuencia') {
            navigate('/crear-diagrama-de-secuencia');
            } else if (e.detail === 'actividades') {
            navigate('/crear-diagrama-de-actividades');
            }
        };

        window.addEventListener('diagram:selected', handler);

        return () => {
            window.removeEventListener('diagram:selected', handler);
        };
        }, []);

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



const handleRenameModal = async () => {
    if (!selectedDiagramCard) return;

    const result = await customModal({
        title: 'Renombrar diagrama',
        html: `
            <input 
                id="diagram-name-input"
                class="w-full p-3 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-white outline-none"
                placeholder="Escribe el nuevo nombre..."
                value="${selectedDiagramCard.title}"
            />
        `,
        showCancel: true,
        confirmText: 'Guardar',
        cancelText: 'Cancelar',
    });

    if (result.isConfirmed) {
        const input = document.getElementById('diagram-name-input') as HTMLInputElement;
        const newTitle = input?.value;

        if (!newTitle || newTitle.trim() === '') {
            errorAlert('Error', 'El nombre no puede estar vacío');
            return;
        }

        try {
            loadingAlert('Renombrando...');

            await patchDiagram({
                id: selectedDiagramCard.id,
                title: newTitle,
            });

            const response = await fetchDiagrams(page, ordering);
            setDiagrams(response.data.results || []);

            setDiagrams(prev => 
                prev
                    .map(d => ({
                        ...d,
                        updated_at: d.updated_at ? new Date(d.updated_at) : undefined
                    }))
                    .sort((a, b) => (b.updated_at?.getTime() ?? 0) - (a.updated_at?.getTime() ?? 0))
            );

            await successAlert('Actualizado', 'Nombre cambiado correctamente');

        } catch (err) {
            console.error(err);
            await errorAlert('Error', 'No se pudo renombrar');
        }
    }
};

    const handleDeleteClick = async () => {
        if (!selectedDiagramCard) return;

        const result = await customModal({
            title: '¿Eliminar diagrama?',
            text: `Se eliminará "${selectedDiagramCard.title}"`,
            icon: 'warning',
            showCancel: true,
            confirmText: 'Eliminar',
            cancelText: 'Cancelar',
            isDanger: true,
        });

        if (result.isConfirmed) {
            await confirmDelete();
        }
    };

    const confirmDelete = async () => {
        if (!selectedDiagramCard?.id) return;

        try {
            loadingAlert('Eliminando...');

            await deleteDiagram(selectedDiagramCard.id);

            setDiagrams(diagrams.filter(d => d.id !== selectedDiagramCard.id));

            await successAlert('¡Eliminado!', 'El diagrama se eliminó correctamente');

        } catch (err) {
            console.error('Error al eliminar:', err);

            await errorAlert('Error', 'No se pudo eliminar el diagrama');
        }
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

                {!loading && diagrams.length === 0 && (
                    <div className="py-20"
                        style={{
                            backdropFilter: 'blur(3px) saturate(180%)',
                            WebkitBackdropFilter: 'blur(3px) saturate(180%)',
                            backgroundColor: 'rgba(248, 248, 248, 0.1)',
                            minHeight: '100vh'
                        }}
                    >
                        <div className="text-center max-w-md mx-auto">
                            <div className="w-20 h-20 bg-sky-100 dark:bg-sky-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold dark:text-white mb-3">
                                {error ? 'No se pudieron cargar tus diagramas' : 'No tienes diagramas aún'}
                            </h2>
                            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                                Crea tu primer diagrama UML y comienza a modelar con asistencia inteligente
                            </p>
                            <button
                                onClick={() => selectDiagramTypeAlert()}
                                className="cursor-pointer inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300"
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
                    <div style={{
                        backdropFilter: 'blur(3px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(3px) saturate(180%)',
                        backgroundColor: 'rgba(248, 248, 248, 0.1)',
                        minHeight: '100vh',
                        padding: '40px'
                    }}
                    >
                    <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h1 className="text-3xl font-black leading-tight dark:text-white text-center md:text-left uppercase text-gray-800 md:text-4xl">
                            Mis diagramas
                        </h1>
                        <button
                            onClick={() => selectDiagramTypeAlert()}
                            className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 cursor-pointer"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                            </svg>
                            Nuevo diagrama
                        </button>
                    </div>
                    <div className="flex gap-3">
                        
                        <button
                            onClick={() => {
                                if (ordering === "-updated_at") setOrdering("updated_at")
                                else setOrdering("-updated_at")
                            }}
                            className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200
                            ${
                            ordering === "-updated_at" || ordering === "updated_at"
                            ? "bg-sky-600 text-white"
                            : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600"
                            }`}
                            >

                            {ordering === "updated_at" ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"  viewBox="0 0 16 16">
                                <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z"/>
                                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0"/>
                            </svg>
                            ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z"/>
                            </svg>
                            )}
                        </button>

                        <button
                            onClick={() => {
                                if (ordering === "title") setOrdering("-title")
                                else setOrdering("title")
                            }}
                            className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200
                            ${
                            ordering === "title" || ordering === "-title"
                            ? "bg-sky-600 text-white"
                            : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600"
                            }`}
                            >

                            {ordering === "-title" ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                <path fill-rule="evenodd" d="M10.082 5.629 9.664 7H8.598l1.789-5.332h1.234L13.402 7h-1.12l-.419-1.371zm1.57-.785L11 2.687h-.047l-.652 2.157z"/>
                                <path d="M12.96 14H9.028v-.691l2.579-3.72v-.054H9.098v-.867h3.785v.691l-2.567 3.72v.054h2.645zm-8.46-.5a.5.5 0 0 1-1 0V3.707L2.354 4.854a.5.5 0 1 1-.708-.708l2-1.999.007-.007a.5.5 0 0 1 .7.006l2 2a.5.5 0 1 1-.707.708L4.5 3.707z"/>
                            </svg>
                            ) : (

                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"  viewBox="0 0 16 16">
                                <path fill-rule="evenodd" d="M10.082 5.629 9.664 7H8.598l1.789-5.332h1.234L13.402 7h-1.12l-.419-1.371zm1.57-.785L11 2.687h-.047l-.652 2.157z"/>
                                <path d="M12.96 14H9.028v-.691l2.579-3.72v-.054H9.098v-.867h3.785v.691l-2.567 3.72v.054h2.645zM4.5 2.5a.5.5 0 0 0-1 0v9.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L4.5 12.293z"/>
                            </svg>
                            )}
                        </button>
                    </div>
                </div>

                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 p-10">
                            {diagrams.map((diagram) => (
                                <div
                                    key={diagram.id}
                                    onClick={() => handleDiagramNavigate(diagram)}
                                    onContextMenu={(e) => handleContextMenu(e, diagram)}
                                    className="flex flex-col cursor-pointer p-6 rounded-2xl border-2 border-zinc-200/60 dark:border-zinc-700/60 bg-white dark:bg-zinc-800 hover:border-sky-400 dark:hover:border-sky-500 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="w-full h-40 rounded-xl overflow-hidden mb-4 bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center">
                                            {diagram.preview_image ? (
                                                <img
                                                    src={diagram.preview_image ? new URL(diagram.preview_image).pathname : '/ruta-a-imagen-por-defecto.png'}
                                                    //src={diagram.preview_image}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-sm text-zinc-400">
                                                    Sin preview
                                                </span>
                                            )}
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

                                    <h3 className="font-bold text-lg dark:text-white truncate">
                                        {diagram.title}
                                    </h3>

                                    <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                                        <span>
                                            Modificado: {diagram.updated_at ? formatDate(diagram.updated_at) : '—'}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                                        <span>
                                            Tipo: {
                                                diagram.content?.type?.toLowerCase() === 'actividades'
                                                    ? 'Actividades'
                                                    : diagram.content?.type?.toLowerCase() === 'secuencia'
                                                    ? 'Secuencia'
                                                    : 'Desconocido'
                                            }
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-center items-center gap-6 mt-10">

                            <button
                                disabled={!prevPage}
                                onClick={() => setPage(page - 1)}
                                className="w-12 h-12 flex items-center justify-center rounded-full bg-sky-600 hover:bg-sky-700 text-white transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7"/>
                                </svg>
                            </button>

                            <span className="text-lg font-bold dark:text-white">
                                Página {page}
                            </span>

                            <button
                                disabled={!nextPage}
                                onClick={() => setPage(page + 1)}
                                className="w-12 h-12 flex items-center justify-center rounded-full bg-sky-600 hover:bg-sky-700 text-white transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7"/>
                                </svg>
                            </button>
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
                        left: `${menuPosition.x}px`,
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
                                    handleRenameModal();
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
        </>
    );
}