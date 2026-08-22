const STORAGE_KEY = 'rms_dashboard_submissions';

const sortByNewestFirst = (items = []) =>
  [...items].sort((a, b) => new Date(b.submittedAt || b.createdAt || 0).getTime() - new Date(a.submittedAt || a.createdAt || 0).getTime());

const notifyDashboardUpdate = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('rms-dashboard-update'));
  }
};

const normalizeSubmission = (item = {}, fallbackId = Date.now()) => {
  const submittedAt = item.submittedAt || item.createdAt || new Date().toISOString();

  return {
    id: item.id || `${fallbackId}-${Math.random().toString(16).slice(2)}`,
    source: item.source || 'general',
    formType: item.formType || item.source || 'General Form',
    title: item.title || item.subject || 'New submission',
    category: item.category || 'General',
    status: item.status || 'New',
    userName: item.userName || item.fullName || item.name || 'RMS User',
    email: item.email || '',
    phone: item.phone || '',
    propertyType: item.propertyType || item.type || '',
    location: item.location || item.address || item.area || '',
    price: item.price || item.budget || item.monthlyFee || item.rentPrice || item.salePrice || '',
    description: item.description || item.message || '',
    submittedAt,
    createdAt: item.createdAt || submittedAt,
    meta: item.meta || {},
  };
};

export const readDashboardSubmissions = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    return sortByNewestFirst(parsed.map((item, index) => normalizeSubmission(item, index + 1)));
  } catch (error) {
    console.error('Unable to load dashboard submissions:', error);
    return [];
  }
};

export const saveDashboardSubmissions = (records = []) => {
  if (typeof window === 'undefined') {
    return [];
  }

  const nextRecords = sortByNewestFirst(records.map((item, index) => normalizeSubmission(item, index + 1)));
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextRecords));
  notifyDashboardUpdate();
  return nextRecords;
};

export const addDashboardSubmission = (submission = {}) => {
  const nextRecords = [...readDashboardSubmissions(), normalizeSubmission(submission, Date.now())];
  return saveDashboardSubmissions(nextRecords);
};

export const recordDashboardSubmission = (submission = {}) => addDashboardSubmission(submission);

export const removeDashboardSubmission = (id) => {
  const nextRecords = readDashboardSubmissions().filter((item) => item.id !== id);
  return saveDashboardSubmissions(nextRecords);
};

export const clearDashboardSubmissions = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  window.localStorage.removeItem(STORAGE_KEY);
  notifyDashboardUpdate();
  return [];
};

export const updateDashboardSubmission = (id, updates = {}) => {
  const nextRecords = readDashboardSubmissions().map((item) =>
    item.id === id ? normalizeSubmission({ ...item, ...updates, id }, id) : item,
  );
  return saveDashboardSubmissions(nextRecords);
};
