import apiClient from './client';

export const getTags = () => apiClient.get('/tags/').then(res => res.data);