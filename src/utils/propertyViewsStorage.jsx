const STORAGE_KEY = 'rms_property_views';

const read = () => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (e) {
    console.error('read property views', e);
    return {};
  }
};

const save = (map = {}) => {
  if (typeof window === 'undefined') return {};
  const next = map && typeof map === 'object' ? map : {};
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event('rms-property-views-updated'));
  return next;
};

const increment = (propertyId) => {
  if (!propertyId) return read();
  const all = read();
  const key = String(propertyId);
  all[key] = (all[key] || 0) + 1;
  return save(all);
};

const getCount = (propertyId) => {
  const all = read();
  return all[String(propertyId)] || 0;
};

export { read, save, increment, getCount };
export default { read, save, increment, getCount };
