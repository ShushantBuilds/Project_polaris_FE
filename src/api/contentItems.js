import apiClient from './client';

export const searchContentItems = (query) => apiClient.get('/content-items/', { params: { search: query } }).then(res => res.data.results || res.data);
export const toggleInteraction = (id, interaction_type) => apiClient.post(`/content-items/${id}/toggle/`, { interaction_type }).then(res => res.data);
export const voteOnItem = (id, vote_type) => apiClient.post(`/content-items/${id}/vote/`, { vote_type }).then(res => res.data);
export const getMyLibrary = () => apiClient.get('/my-library/').then(res => res.data);
export const getDailySearchSuggestions = () =>
  apiClient.get('/daily-search-suggestions/').then(res => res.data);