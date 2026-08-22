const STORAGE_KEY = 'rms_price_history';

const normalize = (item = {}, fallbackId = Date.now()) => ({
  id: item.id || `${fallbackId}-${Math.random().toString(16).slice(2)}`,
  propertyId: item.propertyId || null,
  previousPrice: item.previousPrice || null,
  newPrice: item.newPrice || null,
  changedAt: item.changedAt || new Date().toISOString(),
});

const read = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map((p, i) => normalize(p, i + 1)) : [];
  } catch (e) {
    console.error('read price history', e);
    return [];
  }
};

const save = (records = []) => {
  if (typeof window === 'undefined') return [];
  const next = Array.isArray(records) ? records.map((r, i) => normalize(r, i + 1)) : [];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event('rms-price-history-updated'));
  return next;
};

const add = (entry = {}) => {
  const next = [normalize(entry, Date.now()), ...read()];
  return save(next);
};

const listForProperty = (propertyId) => read().filter((p) => String(p.propertyId) === String(propertyId));

export { read, save, add, listForProperty };
export default { read, save, add, listForProperty };
