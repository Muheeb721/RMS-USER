const STORAGE_KEY = 'rms_payments';

const normalize = (item = {}, fallbackId = Date.now()) => ({
  id: item.id || `PAY-${fallbackId}-${Math.random().toString(16).slice(2)}`,
  bookingId: item.bookingId || item.booking?.id || null,
  userId: item.userId || item.user?.id || null,
  userName: item.userName || item.user?.name || item.name || '',
  userEmail: item.userEmail || item.user?.email || item.email || '',
  userPhone: item.userPhone || item.user?.phone || item.phone || '',
  propertyId: item.propertyId || item.property?.id || null,
  propertyName: item.propertyName || item.property?.title || '',
  propertyType: item.propertyType || item.property?.type || '',
  purpose: item.purpose || 'Sale/Rent',
  totalAmount: Number(item.totalAmount || item.amount || 0) || 0,
  advanceAmount: Number(item.advanceAmount || 0) || 0,
  amountPaid: Number(item.amountPaid || 0) || 0,
  remainingAmount: Number(item.remainingAmount || 0) || (Number(item.totalAmount || 0) - Number(item.amountPaid || 0)),
  method: item.method || item.paymentMethod || 'Other',
  status: item.status || 'Pending',
  paymentDate: item.paymentDate || item.date || null,
  dueDate: item.dueDate || null,
  notes: item.notes || '',
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
    console.error('read payments', e);
    return [];
  }
};

const save = (records = []) => {
  if (typeof window === 'undefined') return [];
  const next = Array.isArray(records) ? records.map((r, i) => normalize(r, i + 1)) : [];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event('rms-payments-updated'));
  return next;
};

const add = (payment = {}) => {
  const next = [normalize(payment, Date.now()), ...read()];
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
