import axiosInstance from './axiosInstance';

export const getProjectsApi = () =>
  axiosInstance.get('/projects');

export const getProjectByIdApi = (id) =>
  axiosInstance.get(`/projects/${id}`);

export const createProjectApi = (data) =>
  axiosInstance.post('/projects', data);

export const updateProjectApi = (id, data) =>
  axiosInstance.put(`/projects/${id}`, data);

export const deleteProjectApi = (id) =>
  axiosInstance.delete(`/projects/${id}`);