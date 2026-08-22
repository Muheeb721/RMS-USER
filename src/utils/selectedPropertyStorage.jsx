const STORAGE_KEY = 'rmsSelectedProperty';

export function saveSelectedProperty(obj) {
  try {
    if (typeof window === 'undefined') return;
    const toSave = typeof obj === 'string' ? JSON.parse(obj) : obj;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    try { window.localStorage.setItem(STORAGE_KEY, String(obj)); } catch (err) {}
  }
}

export function readSelectedProperty() {
  try {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function clearSelectedProperty() {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (e) {}
}

export default { saveSelectedProperty, readSelectedProperty, clearSelectedProperty };
