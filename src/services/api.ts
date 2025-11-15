import axios from 'axios';

// Define a URL base do nosso backend
const API_URL = 'http://localhost:3001'; 

export const api = axios.create({
  baseURL: API_URL,
});

// Esta é a parte "mágica": um Interceptor
// Ele é executado ANTES de CADA pedido à API
api.interceptors.request.use(
  (config) => {
    // 1. Procura o token no localStorage
    const token = localStorage.getItem('authToken');
    
    // 2. Se o token existir, adiciona-o ao cabeçalho 'Authorization'
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 3. Retorna a configuração do pedido
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);