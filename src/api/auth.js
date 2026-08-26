import apiClient from './client';

export const registerUser = (userData) => apiClient.post('/auth/register/', userData);
export const loginUser = (email, password) => apiClient.post('/auth/login/', { email, password });
export const verifyOtp = (email, otp_code) => apiClient.post('/auth/verify-otp/', { email, otp_code });
export const resendOtp = (email) => apiClient.post('/auth/resend-otp/', { email });
export const sendRegistrationOtp = (email) => apiClient.post('/auth/send-registration-otp/', { email });
export const verifyRegistrationOtp = (email, otp_code) => apiClient.post('/auth/verify-registration-otp/', { email, otp_code });
export const requestPasswordReset = (email) => apiClient.post('/auth/password-reset/request/', { email });
export const confirmPasswordReset = (email, otp_code, new_password, confirm_new_password) =>
  apiClient.post('/auth/password-reset/confirm/', { email, otp_code, new_password, confirm_new_password });