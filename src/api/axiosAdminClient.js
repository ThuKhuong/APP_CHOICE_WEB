import axios from "axios";

const axiosAdminClient = axios.create({
  baseURL: "http://localhost:3000/api/admin",
});

axiosAdminClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    console.log("axiosAdminClient - Token from localStorage:", token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("axiosAdminClient - Authorization header set:", config.headers.Authorization);
    } else {
      console.log("axiosAdminClient - No token found in localStorage");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosAdminClient;
