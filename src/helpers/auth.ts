
import type { UserData } from '../types/auth';

export const setTokens = (accessToken: string, refreshToken: string) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
}

export const setUserData = (userData: UserData) => {
    localStorage.setItem('user_data', JSON.stringify(userData));
};


export const getLoggedUser = (): UserData | null => {
    const userData = localStorage.getItem('user_data');
    if (!userData) return null;

    try {
        return JSON.parse(userData) as UserData;
    } catch (e) {
        console.error("Error parsing user data from localStorage", e);
        return null;
    }
};

export const getUserData = () => {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
}

export const getAccessToken = () => {
    return localStorage.getItem('access_token');
}

export const getRefreshToken = () => {
    return localStorage.getItem('refresh_token');
}

export const isAuthenticated = () => {
    return !!getAccessToken();
}

export const clearStorage = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
}
