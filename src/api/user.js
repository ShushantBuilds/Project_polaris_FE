import apiClient from './client';

export const getMe = () => apiClient.get('/auth/me/').then(res => res.data);
export const updateMe = (data) => apiClient.patch('/auth/me/', data).then(res => res.data);
export const uploadProfilePicture = (file) => {
  const formData = new FormData();
  formData.append('profile_picture', file);
  return apiClient.patch('/auth/me/', formData).then(res => res.data);
};
export const requestEmailChange = (new_email) => apiClient.post('/auth/change-email/request/', { new_email });
export const confirmEmailChange = (new_email, otp_code) =>
  apiClient.post('/auth/change-email/confirm/', { new_email, otp_code }).then(res => res.data);