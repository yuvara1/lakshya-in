import axiosInstance from './axiosInstance';

export const getTasksApi = (projectId) =>
  axiosInstance.get(`/projects/${projectId}/tasks`);

export const getTaskByIdApi = (projectId, taskId) =>
  axiosInstance.get(`/projects/${projectId}/tasks/${taskId}`);

export const createTaskApi = (projectId, data) =>
  axiosInstance.post(`/projects/${projectId}/tasks`, data);

export const updateTaskApi = (projectId, taskId, data) =>
  axiosInstance.put(`/projects/${projectId}/tasks/${taskId}`, data);

export const deleteTaskApi = (projectId, taskId) =>
  axiosInstance.delete(`/projects/${projectId}/tasks/${taskId}`);

export const getAllMyTasksApi = () =>
  axiosInstance.get('/tasks/my');