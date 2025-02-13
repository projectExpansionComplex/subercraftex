import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'https://subercraftex.com', // Replace with your backend URL
    timeout: 1000,
    headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;