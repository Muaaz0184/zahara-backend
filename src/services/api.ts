import axios from 'axios';
import { io } from 'socket.io-client';

const API_BASE_URL = 'http://127.0.0.1:5000';

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('zahara_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const socket = io(API_BASE_URL);