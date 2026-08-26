import apiClient from './client';

export const logInteraction = (contentItemId, interactionType) =>
  apiClient.post('/interactions/', { content_item: contentItemId, interaction_type: interactionType });