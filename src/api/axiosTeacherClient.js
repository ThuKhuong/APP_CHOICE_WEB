import axios from "axios";

const axiosTeacherClient = axios.create({
  baseURL: "http://localhost:3000/api/teacher",
});

axiosTeacherClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    console.log("axiosTeacherClient - Token from localStorage:", token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("axiosTeacherClient - Authorization header set:", config.headers.Authorization);
    } else {
      console.log("axiosTeacherClient - No token found in localStorage");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosTeacherClient;
