import axios from 'axios';
import type { SignupData, SigninData } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://notes-app-mern-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't automatically redirect on 401 errors
    // Let components handle authentication errors individually
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  sendSignupOTP: (data: { email: string; fullName: string; dateOfBirth: string }) =>
    api.post('/auth/signup/send-otp', data),
  
  verifySignupOTP: (data: SignupData) =>
    api.post('/auth/signup/verify-otp', data),
  
  sendSigninOTP: (data: { email: string }) =>
    api.post('/auth/signin/send-otp', data),
  
  verifySigninOTP: (data: SigninData) =>
    api.post('/auth/signin/verify-otp', data),
  
  logout: () =>
    api.post('/auth/logout'),
  
  getProfile: () =>
    api.get('/auth/profile'),
};

// Notes API
export const notesAPI = {
  editComment: (noteId: string, commentId: string, text: string) =>
    api.put(`/notes/${noteId}/comment/${commentId}`, { text }),

  deleteComment: (noteId: string, commentId: string) =>
    api.delete(`/notes/${noteId}/comment/${commentId}`),
  getNotes: () =>
    api.get('/notes'),
  
  createNote: (data: { title: string; content: string; createdBy?: string; photo?: File | null }) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('content', data.content);
    if (data.createdBy) formData.append('createdBy', data.createdBy);
    if (data.photo) formData.append('photo', data.photo);
    return api.post('/notes', formData);
  },
  
  updateNote: (id: string, data: { title: string; content: string; photo?: File | null }) => {
    // If photo is present, use FormData
    if (data.photo) {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('content', data.content);
      formData.append('photo', data.photo);
      return api.put(`/notes/${id}`, formData);
    } else {
      return api.put(`/notes/${id}`, { title: data.title, content: data.content });
    }
  },
  
  deleteNote: (id: string) =>
    api.delete(`/notes/${id}`),

  likeNote: (id: string) =>
    api.post(`/notes/${id}/like`),

  unlikeNote: (id: string) =>
    api.post(`/notes/${id}/unlike`),

  addComment: (id: string, text: string) =>
    api.post(`/notes/${id}/comment`, { text }),
};

export default api;