import { useEffect, useState } from "react";
import { fetchDiagrams } from "../services/diagramSerivce";
import { useNavigate } from "react-router";
import Header from "../layout/MainLayout/Header";

export type Diagram = {
    id: number;
    title: string;
    user: number;
    created_at: Date;
    updated_at: Date;
    content: Content;
}

export type Content = {
    type: string;
    nodes: Node[];
    edges?: Edge[];
}

export type Edge = {
    id: string;
    type: string;
    source: string;
    target: string;
}

export type Node = {
    id: string;
    data: Data;
    type?: string;
    position: Position;
}

export type Data = {
    label: string;
}

export type Position = {
    x: number;
    y: number;
}

export default function Dashboard() {
    const navigate = useNavigate();

    const [diagrams, setDiagrams] = useState<Diagram[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // TODO: Implementar componente custom de notificacion
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

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
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
                                onClick={() => navigate('/nuevo-diagrama')}
                                className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Crear mi primer diagrama
                            </button>
                        </div>
                    </div>
                )}

                {!loading && !error && diagrams.length > 0 && (
                    <div>
                        <h1 className="text-3xl font-black leading-tight dark:text-white text-center md:text-left uppercase text-gray-800 md:text-4xl mb-3">
                            Tus diagramas
                        </h1>

                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {diagrams.map((diagram) => (
                                <div
                                    key={diagram.id}
                                    onClick={() => navigate(`${diagram.content.type === 'actividades' ? '/crear-diagrama-de-actividades' : '/crear-diagrama-de-secuencia'}`)}
                                    className="group cursor-pointer p-6 rounded-2xl border-2 border-zinc-200/60 dark:border-zinc-700/60 bg-white dark:bg-zinc-800 hover:border-sky-400 dark:hover:border-sky-500 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                                >
                                    {/* Icono */}
                                    <div className="w-14 h-14 rounded-xl bg-sky-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>

                                    {/* Titulo */}
                                    <h3 className="font-bold text-lg dark:text-white mb-2 truncate group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                                        {diagram.title}
                                    </h3>

                                    {/* Fecha de modificaion */}
                                    <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Modificado: {formatDate(diagram.updated_at)}</span>
                                    </div>

                                    {/* Tipo */}
                                    <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                                        <svg className="lucide lucide-file-type-icon lucide-file-type w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" stroke-linejoin="round">
                                            <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
                                            <path d="M14 2v5a1 1 0 0 0 1 1h5" />
                                            <path d="M11 18h2" />
                                            <path d="M12 12v6" />
                                            <path d="M9 13v-.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5v.5" />
                                        </svg>
                                        <span>Tipo: {diagram.content.type === 'actividades' ? 'Actividades' : 'Secuencia'}</span>
                                    </div>

                                    <div className="mt-4 flex items-center gap-2 text-sm text-sky-600 dark:text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="font-semibold">Abrir diagrama</span>
                                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </>
    );
}