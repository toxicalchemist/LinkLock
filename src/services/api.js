import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const createSecret = async (secretData) => {
    const response = await axios.post(`${API_URL}/secrets`, secretData);
    return response.data;
};

export const getSecret = async (key) => {
    const response = await axios.get(`${API_URL}/secrets/${key}`);
    return response.data;
};

export const getAdminOverview = async () => {
    const response = await axios.get(`${API_URL}/admin/overview`);
    return response.data;
};

export const clearLegacyLogs = async () => {
    const response = await axios.delete(`${API_URL}/admin/logs/legacy`);
    return response.data;
};
