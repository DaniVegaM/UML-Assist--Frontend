import type { Diagram } from "../types/diagramsModel";
import api from "./baseApiService";

export const fetchDiagrams = async () => {
    try {
        const response = await api.get("api/diagram/");
        return response;
    } catch (error) {
        console.error("Error al obtener los diagramas:", error);
        throw error;
    }  
};

export const fetchDiagramById = async (id: string) => {
    try {
        const response = await api.get(`api/diagram/${id}/`);
        return response;
    } catch (error) {
        console.error("Error al obtener el diagrama:", error);
        throw error;
    }
};

export const createDiagram = async (diagramData: Diagram) => {
    try {
        const response = await api.post("api/diagram/", diagramData);
        return response;
    } catch (error) {
        console.error("Error al crear el diagrama:", error);
        throw error;
    }  
};

export const updateDiagram = async (diagramData: Diagram) => {
    if (!diagramData.id) {
        throw new Error("El ID del diagrama es requerido para actualizar.");
    }
    try {
        const response = await api.put(`api/diagram/${diagramData.id}/`, diagramData);
        return response;
    } catch (error) {
        console.error("Error al actualizar el diagrama:", error);
        throw error;
    }
};

export const patchDiagram = async (diagramData: Diagram) => {
    if (!diagramData.id) {
        throw new Error("El ID del diagrama es requerido para actualizar.");
    }
    try {
        const response = await api.patch(`api/diagram/${diagramData.id}/`, diagramData);
        return response;
    } catch (error) {
        console.error("Error al actualizar el diagrama:", error);
        throw error;
    }
};

export const deleteDiagram = async (id: number) => {
    try {
        const response = await api.delete(`api/diagram/${id}/`);
        return response;
    } catch (error) {
        console.error("Error al eliminar el diagrama:", error);
        throw error;
    }
};

