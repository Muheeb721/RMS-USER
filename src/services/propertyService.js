import api from './api';

export const listProperties = async (params = {}) => {
  // request a larger default limit so demo pages receive all seeded demo properties
  const q = params.q ? `&q=${encodeURIComponent(params.q)}` : '';
  const limit = params.limit || 1000;
  const url = `/properties?limit=${limit}${q}`;
  try {
    const res = await api.request(url);
    return res;
  } catch (error) {
    console.warn('Properties API unavailable, falling back to dummy data', error);
    // fallback: keep using existing dummyData where used elsewhere
    return { success: false, message: 'API unavailable' };
  }
};

export const getPropertyById = async (id) => {
  if (!id) return { success: false, message: 'Missing id' };
  try {
    const res = await api.request(`/properties/${id}`);
    return res;
  } catch (error) {
    console.warn('Get property failed', error);
    return { success: false, message: 'API unavailable' };
  }
};

export const recommendProperties = async (preferences = {}) => {
  try {
    const res = await api.request('/properties/recommend', { method: 'POST', body: preferences });
    return res;
  } catch (error) {
    console.warn('Recommend properties failed', error);
    return { success: false, message: 'API unavailable' };
  }
};

export const createProperty = async (payload = {}) => {
  try {
    const res = await api.request('/properties', { method: 'POST', body: payload });
    return res;
  } catch (error) {
    console.warn('Create property failed', error);
    return { success: false, message: 'API unavailable' };
  }
};

export const updateProperty = async (id, updates = {}) => {
  if (!id) return { success: false, message: 'Missing id' };
  try {
    const res = await api.request(`/properties/${id}`, { method: 'PUT', body: updates });
    return res;
  } catch (error) {
    console.warn('Update property failed', error);
    return { success: false, message: 'API unavailable' };
  }
};

export default { listProperties, getPropertyById, recommendProperties };
