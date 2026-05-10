import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const createSecret = async (secretData) => {
    const response = await api.post(`/secrets`, secretData);
    return response.data;
};

export const getSecret = async (key) => {
    const response = await api.get(`/secrets/${key}`);
    return response.data;
};

export const getAdminOverview = async () => {
    const response = await api.get(`/admin/overview`);
    return response.data;
};

export const clearLegacyLogs = async () => {
    const response = await api.delete(`/admin/logs/legacy`);
    return response.data;
};

export const getSettings = async () => {
    const response = await api.get(`/admin/settings`);
    return response.data;
};

export const updateSettings = async (settingsData) => {
    const response = await api.put(`/admin/settings`, settingsData);
    return response.data;
};

export const getMyVaults = async () => {
    const response = await api.get(`/user/vaults`);
    return response.data;
};

export const getUsers = async () => {
    const response = await api.get(`/admin/users`);
    return response.data;
};

export const deactivateUser = async (userId) => {
    const response = await api.put(`/admin/users/${userId}/deactivate`);
    return response.data;
};

export const getInbox = async () => {
    const response = await api.get('/links/inbox');
    return response.data;
};
