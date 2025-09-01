import axios from "axios";

// create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL, // 🔧 change to your backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

// attach token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("Token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // token expired or unauthorized
      localStorage.removeItem("Token");
      window.location.href = "/"; // redirect to login
    }
    return Promise.reject(error);
  }
);

export default api;
