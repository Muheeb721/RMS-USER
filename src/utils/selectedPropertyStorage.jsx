import apiClient from '../services/apiClient';

export async function saveSelectedProperty(obj) {
  try {
    const res = await apiClient.put('/users/profile', { profile: { selectedProperty: obj } });
    return res?.data?.success ? res.data.data?.profile || null : null;
  } catch (e) {
    console.error('saveSelectedProperty failed', e);
    return null;
  }
}

export async function readSelectedProperty() {
  try {
    const res = await apiClient.get('/users/profile');
    return res?.data?.success ? res.data.data?.profile?.selectedProperty || null : null;
  } catch (e) {
    console.error('readSelectedProperty failed', e);
    return null;
  }
}

export async function clearSelectedProperty() {
  try {
    const res = await apiClient.put('/users/profile', { profile: {} });
    return res?.data?.success ? true : false;
  } catch (e) {
    console.error('clearSelectedProperty failed', e);
    return false;
  }
}

export default { saveSelectedProperty, readSelectedProperty, clearSelectedProperty };
