const STORAGE_KEY = 'rms_property_verification';

const read = () => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (e) {
    console.error('read property verification', e);
    return {};
  }
};

const save = (map = {}) => {
  if (typeof window === 'undefined') return {};
  const next = map && typeof map === 'object' ? map : {};
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event('rms-property-verification-updated'));
  return next;
};

const setVerified = (propertyId, verified = true) => {
  const all = read();
  all[String(propertyId)] = Boolean(verified);
  return save(all);
};

const isVerified = (propertyId) => {
  const all = read();
  return Boolean(all[String(propertyId)]);
};

export { read, save, setVerified, isVerified };
export default { read, save, setVerified, isVerified };
