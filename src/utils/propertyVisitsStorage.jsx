const STORAGE_KEY = 'rms_property_visits';

const normalize = (item = {}, fallbackId = Date.now()) => ({
  id: item.id || `${fallbackId}-${Math.random().toString(16).slice(2)}`,
  name: item.name || item.fullName || '',
  phone: item.phone || item.contact || '',
  email: item.email || '',
  propertyId: item.propertyId || item.property?.id || null,
  propertyTitle: item.propertyTitle || (item.property && item.property.title) || '',
  date: item.date || null,
  time: item.time || null,
  message: item.message || '',
  status: item.status || 'Pending',
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
    console.error('read property visits', e);
    return [];
  }
};

const save = (records = []) => {
  if (typeof window === 'undefined') return [];
  const next = Array.isArray(records) ? records.map((r, i) => normalize(r, i + 1)) : [];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event('rms-property-visits-updated'));
  return next;
};

const add = (visit = {}) => {
  const next = [normalize(visit, Date.now()), ...read()];
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
