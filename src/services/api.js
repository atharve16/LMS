import axios from "axios";

const BASE_URL = "https://lms-server-2spa.onrender.com/api";
// const BASE_URL = "http://localhost:8080/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error.response?.data || error);
  }
);

export const loginUser = (email, password) =>
  api.post("/auth/login", { email, password });

export const registerUser = (userData) => api.post("/auth/register", userData);

export const getProfile = () => api.get("/auth/profile");

export const getAllEmployees = () => api.get("/employees");

export const getEmployeeById = (id) => api.get(`/employees/${id}`);

export const addEmployee = (employeeData) =>
  api.post("/employees", employeeData);

export const getEmployeeLeaveBalance = (id) =>
  api.get(`/employees/${id}/leave-balance`);

export const applyForLeave = (leaveData) => api.post("/leaves", leaveData);

export const getLeaves = (params = {}) => api.get("/leaves", { params });

export const getLeaveById = (id) => api.get(`/leaves/${id}`);

export const updateLeaveStatus = (id, status, reviewComments) =>
  api.patch(`/leaves/${id}`, { status, reviewComments });

export default api;
