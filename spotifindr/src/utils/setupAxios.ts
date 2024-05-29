import axios from 'axios';

export default axios.create({
    baseURL: import.meta.env.VITE_API_ROUTE || 'http://localhost:3000/',
    withCredentials: true,
    headers: {
        'ngrok-skip-browser-warning': true,
    }
});