import axios from "axios";

const axiosProctorClient = axios.create({
  baseURL: "http://localhost:3000/api/proctor",
});

axiosProctorClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosProctorClient;
