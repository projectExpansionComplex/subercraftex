import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:4000', // Replace with your backend URL
    timeout: 1000,
    headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;