import apiClient from '../services/apiClient';

const normalize = (item = {}, fallbackId = Date.now()) => ({
  id: item.id || item._id || `CONTACT-${fallbackId}-${Math.random().toString(16).slice(2)}`,
  fullName: item.fullName || item.name || '',
  email: item.email || '',
  phone: item.phone || item.contact || '',
  propertyName: item.property || '',
  propertyType: item.propertyType || '',
  purpose: item.inquiryType || item.purpose || '',
  message: item.message || '',
  paymentInfo: item.paymentInfo || null,
  status: item.status || 'New',
  createdAt: item.createdAt || new Date().toISOString(),
  updatedAt: item.updatedAt || item.createdAt || new Date().toISOString(),
});

const read = async () => {
  try {
    const res = await apiClient.get('/contact-requests');
    const items = res?.data?.success ? res.data.data || [] : [];
    return Array.isArray(items) ? items.map((p) => normalize(p)) : [];
  } catch (e) {
    console.error('read contact requests failed', e);
    return [];
  }
};

const save = async (records = []) => {
  try {
    const res = await apiClient.post('/contact-requests/batch', { records });
    return res?.data?.success ? res.data.data || records : records;
  } catch (e) {
    console.error('save contact requests failed', e);
    return records;
  }
};

const add = async (req = {}) => {
  try {
    const res = await apiClient.post('/contact-requests', req);
    return res?.data?.success ? normalize(res.data.data) : null;
  } catch (e) {
    console.error('add contact request failed', e);
    return null;
  }
};

const update = async (id, updates = {}) => {
  try {
    const res = await apiClient.put(`/contact-requests/${id}`, updates);
    return res?.data?.success ? normalize(res.data.data) : null;
  } catch (e) {
    console.error('update contact request failed', e);
    return null;
  }
};

const remove = async (id) => {
  try {
    const res = await apiClient.delete(`/contact-requests/${id}`);
    return res?.data?.success ? true : false;
  } catch (e) {
    console.error('remove contact request failed', e);
    return false;
  }
};

export { read, save, add, update, remove };
export default { read, save, add, update, remove };
