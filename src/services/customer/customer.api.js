import { axiosInstance } from '../../utils/axiosInstance';

export const addCustomer = (body) => {
  return axiosInstance.post('/users', body);
};

export const getCustomers = (params) => {
  return axiosInstance.get(`/users?${params}`);
};

export const getCustomer = (id) => {
  return axiosInstance.get(`/users/${id}`);
};

export const updateCustomer = (id, body) => {
  return axiosInstance.patch(`/users/${id}`, body);
};

export const deleteCustomer = (id) => {
  return axiosInstance.delete(`/users/${id}`);
};
