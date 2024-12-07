import axios from "axios";

// Define the base URL for your API
const API_BASE_URL = "http://127.0.0.1:5000/api";

// Configure Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add Authorization header with JWT
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwt_token"); // Retrieve token from localStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response, // Pass through successful responses
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or unauthorized, redirect to login
      localStorage.removeItem("jwt_token"); // Remove invalid token
      window.location.href = "/"; // Redirect to login page
    }
    return Promise.reject(error);
  }
);

// Login API
export const login = (credentials) => {
  return apiClient.post("/login", credentials);
};

// Users APIs

// Add a new user
export const addUser = (data) => {
  return apiClient.post("/users", data);
};

// Fetch all users
export const getUser = () => {
  return apiClient.get("/users");
};

// Update an existing user by email
export const updateUser = (email, data) => {
  return apiClient.put(`/users/${email}`, data);
};

// Delete a user by email
export const deleteUser = (email) => {
  return apiClient.delete(`/users/${email}`);
};

// Patients APIs

// Add a new patient
export const addPatient = async (data) => {
  return await apiClient.post(`/patients`, data);
};

// Fetch all patients
export const getPatient = async () => {
  return await apiClient.get(`/patients`);
};

// Update an existing patient
export const updatePatient = async (patient_id, data) => {
  return await apiClient.put(`/patients/${patient_id}`, data);
};

// Delete a patient
export const deletePatient = async (patient_id) => {
  return await apiClient.delete(`/patients/${patient_id}`);
};

// Tasks APIs

// Fetch all tasks from the database
export const fetchTasks = async () => {
  try {
    const response = await apiClient.get("/tasks");
    return response.data;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
};

// Fetch all tasks in the in-memory priority queue
export const fetchHeapTasks = async () => {
  try {
    const response = await apiClient.get("/tasks/heap");
    console.log(response.data);
    return response.data;

  } catch (error) {
    console.error("Error fetching heap tasks:", error);
    throw error;
  }
};

// Synchronize the in-memory priority queue with the database
export const syncHeapWithDB = async () => {
  try {
    const response = await apiClient.post("/tasks/sync");
    return response.data;
  } catch (error) {
    console.error("Error syncing heap with database:", error);
    throw error;
  }
};

// Fetch the highest-priority task from the in-memory queue
export const fetchHighestPriorityTask = async () => {
  try {
    const response = await apiClient.get("/tasks/priority");
    return response.data;
  } catch (error) {
    console.error("Error fetching highest priority task:", error);
    throw error;
  }
};

// Add a new task to the database and in-memory queue
export const addTask = async (taskData) => {
  try {
    const response = await apiClient.post("/tasks", taskData);
    return response.data;
  } catch (error) {
    console.error("Error adding task:", error);
    throw error;
  }
};

// Update an existing task in the database and in-memory queue
export const updateTask = async (taskId, taskData) => {
  try {
    const response = await apiClient.put(`/tasks/${taskId}`, taskData);
    return response.data;
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
};

// Delete a task from the database and in-memory queue
export const deleteTask = async (taskId) => {
  try {
    const response = await apiClient.delete(`/tasks/${taskId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
};
// Logs API

export const getLogs = async (filters) => {
  return await apiClient.get("/logs", { params: filters });
};