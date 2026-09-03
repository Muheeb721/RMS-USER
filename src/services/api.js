import apiClient from './apiClient';

export const request = async (path, options = {}) => {
  const response = await apiClient({
    url: path,
    method: options.method || 'GET',
    data: options.body,
    params: options.params,
    headers: options.headers,
  });
  return response.data;
};

export default apiClient;
