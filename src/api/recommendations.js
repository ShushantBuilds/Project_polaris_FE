import apiClient from './client';

export const getRecommendations = () => apiClient.get('/recommendations/').then(res => res.data);