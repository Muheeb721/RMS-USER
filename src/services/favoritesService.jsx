const FAVORITES_STORAGE_KEY = 'rms_favorites';

const getFavoritesStorageKey = (emailOrUser) => {
  const email =
    typeof emailOrUser === 'string' && emailOrUser.trim()
      ? emailOrUser.trim().toLowerCase()
      : emailOrUser && typeof emailOrUser.email === 'string' && emailOrUser.email.trim()
      ? emailOrUser.email.trim().toLowerCase()
      : 'guest';

  return `${FAVORITES_STORAGE_KEY}_${email}`;
};

export const readStoredFavorites = (emailOrUser) => {
  if (typeof window === 'undefined') return [];
  try {
    const key = getFavoritesStorageKey(emailOrUser);
    const stored = window.localStorage.getItem(key);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Unable to read favorites from storage:', error);
    return [];
  }
};

export const saveStoredFavorites = (favorites, emailOrUser) => {
  if (typeof window === 'undefined') return;
  try {
    const key = getFavoritesStorageKey(emailOrUser);
    const next = Array.isArray(favorites) ? Array.from(new Set(favorites)) : [];
    window.localStorage.setItem(key, JSON.stringify(next));
    window.dispatchEvent(new Event('rms-favorites-updated'));
  } catch (error) {
    console.error('Unable to save favorites to storage:', error);
  }
};
