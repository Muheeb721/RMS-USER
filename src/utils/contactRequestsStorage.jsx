const STORAGE_KEY = 'rms_contact_requests';

const normalize = (item = {}, fallbackId = Date.now()) => ({
  id: item.id || `CONTACT-${fallbackId}-${Math.random().toString(16).slice(2)}`,
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

const read = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map((p, i) => normalize(p, i + 1)) : [];
  } catch (e) {
    console.error('read contact requests', e);
    return [];
  }
};

const save = (records = []) => {
  if (typeof window === 'undefined') return [];
  const next = Array.isArray(records) ? records.map((r, i) => normalize(r, i + 1)) : [];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event('rms-contact-requests-updated'));
  return next;
};

const add = (req = {}) => {
  const next = [normalize(req, Date.now()), ...read()];
  return save(next);
};

const update = (id, updates = {}) => {
  const next = read().map((item) => (item.id === id ? normalize({ ...item, ...updates, updatedAt: new Date().toISOString() }, id) : item));
  return save(next);
};

const remove = (id) => {
  const next = read().filter((item) => item.id !== id);
  return save(next);
};

export { read, save, add, update, remove };
export default { read, save, add, update, remove };
