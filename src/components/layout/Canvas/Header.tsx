import { useTheme } from '../../../hooks/useTheme';
import type { HeaderProps } from '../../../types/canvas';
import { useEffect, useRef, useState } from 'react';
import { createDiagram, updateDiagram } from '../../../services/diagramSerivce';
import { toPng } from 'html-to-image';
import './Header.css';

import { useNavigate } from 'react-router';
import { closeAlert, confirmExitUnsaved, errorAlert, loadingAlert, successAlert } from '../../../utils/sweetAlert';
import { selectExportFormatAlert } from '../../../utils/sweetAlert';
import { exportDiagramAsPdf, exportDiagramAsPng } from '../../../utils/exportDiagram';

const AUTO_SAVE_DELAY = 5000;

export default function Header({ diagramTitle = '', diagramId, type, nodes, edges }: HeaderProps) {
    const { isDarkMode, toggleTheme } = useTheme();
    const [title, setTitle] = useState<string>('')
    const [saving, setSaving] = useState<boolean>(false)
    const [loading, setLoading] = useState({ showLoading: false, showConfirmation: false, showError: false });
    const navigate = useNavigate();

    const [isDirty, setIsDirty] = useState(false);
    const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const autoSaveSavedTimerRef = useRef<number | null>(null);

    // Contador de versión para detectar cambios nuevos durante un autosave en vuelo
    const dirtyVersionRef = useRef(0);

    const handleExit = async (path: string) => {
        // Si no hay cambios sin guardar, navega directamente
        if (!isDirty) {
            navigate(path);
            return;
        }
        // Si hay cambios sin guardar, muestra modal de confirmación
        const result = await confirmExitUnsaved();
        if (result.isConfirmed) {
            await saveDiagram();
            navigate(path);
        } else if (result.isDenied) {
            navigate(path);
        }
    };

    const autoSaveTimeoutRef = useRef<number | null>(null);
    const isManualSavingRef = useRef(false);
    const firstRenderRef = useRef(true);

    const autoSaveKey = diagramId
        ? `autosave-${type}-${diagramId}`
        : `autosave-${type}-new`;

    useEffect(() => {
        const savedDraft = localStorage.getItem(autoSaveKey);

        if (savedDraft) {
            try {
                const draft = JSON.parse(savedDraft);
                if (draft.title) {
                    setTitle(draft.title);
                    return;
                }
            } catch {
                console.error('No se pudo leer el título del autoguardado');
            }
        }
        if (diagramTitle?.length > 0)
            setTitle(diagramTitle);
        else {
            setTitle('Diagrama sin título')
        }
    }, [diagramTitle, autoSaveKey])


    const generatePreview = async (): Promise<Blob | null> => {
        const reactFlowElement = document.querySelector('.react-flow');

        if (!reactFlowElement) return null;

        try {
            const dataUrl = await toPng(reactFlowElement as HTMLElement, {
                backgroundColor: '#ffffff'
            });

            const response = await fetch(dataUrl);
            const blob = await response.blob();
            return blob;
        } catch (error) {
            console.error("Error generando preview:", error);
            return null;
        }
    };

    const getCurrentTitle = () => {
        const input = document.querySelector('input[type="text"]') as HTMLInputElement;
        return input?.value || title || 'diagrama';
    };

    const handleExport = async () => {
        await selectExportFormatAlert();
    };

    useEffect(() => {
        const handleExportSelected = async (e: Event) => {
            const detail = (e as CustomEvent).detail;
            const currentTitle = getCurrentTitle();
            try {
                loadingAlert('Exportando diagrama...');
                if (detail === 'png') {
                    await exportDiagramAsPng(nodes, edges, currentTitle);
                } else if (detail === 'pdf') {
                    await exportDiagramAsPdf(nodes, edges, currentTitle);
                }
                closeAlert();
            } catch (error) {
                console.error('Error exportando:', error);
                closeAlert();
                await errorAlert('Error', 'No se pudo exportar el diagrama');
            }
        };

        window.addEventListener('export:selected', handleExportSelected);

        return () => {
            window.removeEventListener('export:selected', handleExportSelected);
        };
    }, [nodes, edges, title]);

    useEffect(() => {
        if (firstRenderRef.current) {
            firstRenderRef.current = false;
            return;
        }

        if (isManualSavingRef.current) return;

        // Incrementar versión para detectar cambios durante un autosave en vuelo
        dirtyVersionRef.current++;
        const versionAtChange = dirtyVersionRef.current;
        setIsDirty(true);

        if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current);
        }

        autoSaveTimeoutRef.current = window.setTimeout(async () => {
            if (diagramId) {
                // Si llegaron cambios nuevos mientras esperábamos, no hacer nada
                // (el próximo timeout se encargará)
                if (dirtyVersionRef.current !== versionAtChange) return;

                setAutoSaveStatus('saving');
                try {
                    const formData = new FormData();
                    formData.append('title', title);
                    formData.append(
                        'content',
                        JSON.stringify({
                            type,
                            canvas: {
                                nodes,
                                edges,
                                totalNodes: nodes.length,
                                totalEdges: edges.length,
                            },
                        })
                    );
                    await updateDiagram(diagramId, formData);

                    // Solo limpiar dirty si no llegaron cambios nuevos durante el request
                    if (dirtyVersionRef.current === versionAtChange) {
                        setIsDirty(false);
                    }
                    setAutoSaveStatus('saved');
                    localStorage.removeItem(autoSaveKey);
                    if (autoSaveSavedTimerRef.current) clearTimeout(autoSaveSavedTimerRef.current);
                    autoSaveSavedTimerRef.current = window.setTimeout(() => {
                        setAutoSaveStatus('idle');
                    }, 3000);
                } catch {
                    setAutoSaveStatus('error');
                }
            } else {
                const draft = {
                    title,
                    type,
                    updatedAt: new Date().toISOString(),
                    content: {
                        type,
                        canvas: {
                            nodes,
                            edges,
                            totalNodes: nodes.length,
                            totalEdges: edges.length,
                        },
                    },
                };
                localStorage.setItem(autoSaveKey, JSON.stringify(draft));
                // Para nuevos diagramas, el localStorage ES el guardado - no marcar como no-dirty
                // hasta que se guarde en el servidor con saveDiagram()
            }
        }, AUTO_SAVE_DELAY);

        return () => {
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }
        };
    }, [title, nodes, edges, type, autoSaveKey, diagramId]);

    const saveDiagram = async () => {
        if (saving) return;
        isManualSavingRef.current = true;

        if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current);
        }
        setSaving(true);

        try {
            loadingAlert('Guardando Diagrama...');
            const minLoadingTime = new Promise(resolve => setTimeout(resolve, 1500));
            const previewBlob = await generatePreview();
            await minLoadingTime;
            const formData = new FormData();
            formData.append("title", title);
            formData.append(
                "content",
                JSON.stringify({
                    type: type,
                    canvas: {
                        nodes: nodes,
                        edges: edges,
                        totalNodes: nodes.length,
                        totalEdges: edges.length
                    }
                })
            );

            if (previewBlob) {
                formData.append("preview_image", previewBlob, "preview.png");
            }
            let response;

            if (!diagramId) {
                response = await createDiagram(formData);
                const newId = response.data.id;

                if (newId) {
                    let basePath = '/crear-diagrama-de-secuencia';

                    if (type === 'actividades') {
                        basePath = '/crear-diagrama-de-actividades';
                    } else if (type === 'secuencia') {
                        basePath = '/crear-diagrama-de-secuencia';
                    }

                    navigate(`${basePath}/${newId}`, { replace: true });
                }
            } else {
                response = await updateDiagram(diagramId, formData);
            }

            closeAlert();
            localStorage.removeItem(autoSaveKey);
            setIsDirty(false);
            setAutoSaveStatus('saved');
            if (autoSaveSavedTimerRef.current) clearTimeout(autoSaveSavedTimerRef.current);
            autoSaveSavedTimerRef.current = window.setTimeout(() => setAutoSaveStatus('idle'), 3000);
            await successAlert('Guardado', `Diagrama: <strong>${title}</strong> guardado con éxito`);
        } catch {
            closeAlert();
            await errorAlert('Error', 'No se pudo guardar el diagrama');
        }
        isManualSavingRef.current = false;
        setSaving(false);
    };
    const closeModal = () => {
        setLoading({ showLoading: false, showConfirmation: false, showError: false });
    }

    return (
        <>
            <section className="h-full bg-sky-600 grid grid-cols-3 gap-4 p-1 items-center">
                <div className="flex items-center justify-start gap-2 pl-2">
                    <div
                        onClick={() => handleExit('/dashboard')}
                        className="mr-4 cursor-pointer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="white" strokeWidth="3" className="size-6" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" /></svg>
                    </div>
                    <div
                        onClick={() => handleExit('/')}
                        className="flex items-center justify-center gap-3 cursor-pointer"
                    >
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
                    </div>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                    <input
                        className="max-w-92 min-w-52 w-full bg-zinc-200 text-zinc-600 ring-1 ring-zinc-200 focus:ring-2 focus:ring-sky-800 outline-none duration-300 placeholder:text-zinc-600 placeholder:opacity-50 rounded-lg px-4 py-1"
                        autoComplete="off"
                        placeholder="Diagrama sin título"
                        value={title || ""}
                        onClick={e => e.currentTarget.select()}
                        onChange={e => setTitle(e.target.value)}
                        type="text"
                    />
                    <div className="h-4 flex items-center">
                        {autoSaveStatus === 'saving' && (
                            <span className="flex items-center gap-1 text-white/60 text-xs">
                                <svg className="animate-spin size-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                                Guardando...
                            </span>
                        )}
                        {autoSaveStatus === 'saved' && (
                            <span className="flex items-center gap-1 text-white/70 text-xs">
                                <svg xmlns="http://www.w3.org/2000/svg" className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                Guardado
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex justify-center gap-4">
                    <button onClick={() => saveDiagram()} className="bg-white dark:bg-neutral-800 py-1 px-4 text-sky-600 dark:text-white font-bold uppercase rounded-full hover:bg-zinc-800 hover:text-white transition-all duration-200 cursor-pointer">Guardar</button>

                <button
                    onClick={handleExport}
                    className="bg-white py-1 dark:bg-neutral-800 px-4 text-sky-600 dark:text-white font-bold uppercase rounded-full hover:bg-zinc-800 hover:text-white transition-all duration-200 cursor-pointer"
                >
                    Exportar
                </button>

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