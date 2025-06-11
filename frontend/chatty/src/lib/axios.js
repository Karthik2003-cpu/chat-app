import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URLS || "http://localhost:3001/api",
    withCredentials: true,
});

export default axiosInstance;