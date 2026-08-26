import apiClient from './client';

// the profiles endpoint is filtered to the logged-in user, so this always returns one item
export const getMyProfile = () => apiClient.get('/profiles/').then(res => res.data[0]);

export const updateProfile = (id, data) => apiClient.patch(`/profiles/${id}/`, data).then(res => res.data);