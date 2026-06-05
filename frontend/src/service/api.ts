import axios from 'axios';  // библиотека для HTTP-запросов

const api = axios.create({
    baseURL: 'http://localhost:8080/api',   // все запросы будут идти на этот адрес
    headers: { 'Content-Type': 'application/json' }  // говорим серверу: "я отправляю JSON"
});

// Перехватчик — срабатывает перед каждым запросом
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');  // берём токен из браузера
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;  // добавляем в заголовок
    }
    return config;
});

export default api;