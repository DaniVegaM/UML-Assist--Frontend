import { getAccessToken } from "../helpers/auth";
import api from "./baseApiService";

export const fetchDiagrams = async () => {
    try {
        const response = await api.get("api/diagram/", {
            headers: {
                Authorization: `Bearer ${getAccessToken()}`,
            },
        });
        return response;
    } catch (error) {
        console.error("Error al obtener los diagramas:", error);
        throw error;
    }  
};

