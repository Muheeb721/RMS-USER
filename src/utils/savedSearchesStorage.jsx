const STORAGE_KEY = 'rms_saved_searches';

const normalize = (item = {}, fallbackId = Date.now()) => ({
  id: item.id || `${fallbackId}-${Math.random().toString(16).slice(2)}`,
  name: item.name || `Saved search ${new Date().toLocaleString()}`,
  filters: item.filters || {},
  createdAt: item.createdAt || new Date().toISOString(),
});

const read = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map((p, i) => normalize(p, i + 1)) : [];
  } catch (e) {
    console.error('read saved searches', e);
    return [];
  }
};

const save = (records = []) => {
  if (typeof window === 'undefined') return [];
  const next = Array.isArray(records) ? records.map((r, i) => normalize(r, i + 1)) : [];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event('rms-saved-searches-updated'));
  return next;
};

const add = (search = {}) => {
  const next = [normalize(search, Date.now()), ...read()];
  return save(next);
};

const remove = (id) => {
  const next = read().filter((item) => item.id !== id);
  return save(next);
};

export { read, save, add, remove };
export default { read, save, add, remove };
