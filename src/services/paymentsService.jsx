import { add as addPaymentRecord, read as readPayments, update as updatePaymentRecord, remove as removePaymentRecord } from '../utils/paymentsStorage.jsx';
import { createNotification } from './notificationService.jsx';
import { addStoredNotification } from '../utils/notificationsStorage.jsx';

const generatePaymentId = () => `PAY-${Date.now().toString().slice(-6)}-${Math.random().toString(16).slice(2,8)}`;

const calcStatus = (total, paid, dueDate) => {
  const t = Number(total || 0);
  const p = Number(paid || 0);
  if (p <= 0) {
    if (dueDate && new Date(dueDate) < new Date()) return 'Overdue';
    return 'Pending';
  }
  if (p >= t) return 'Paid';
  return 'Partial Payment';
};

export const createPayment = (payload = {}) => {
  const id = payload.id || generatePaymentId();
  const total = Number(payload.totalAmount || payload.total || 0);
  const amount = Number(payload.amountPaid || payload.amount || 0);
  const advance = Number(payload.advanceAmount || 0);
  const remaining = Math.max(0, total - amount);
  const status = calcStatus(total, amount, payload.dueDate);

  const record = {
    ...payload,
    id,
    totalAmount: total,
    amountPaid: amount,
    advanceAmount: advance,
    remainingAmount: remaining,
    status,
    paymentDate: payload.paymentDate || new Date().toISOString(),
    createdAt: payload.createdAt || new Date().toISOString(),
  };

  addPaymentRecord(record);

  try {
    const note = createNotification({ type: 'payment', title: 'Payment recorded', message: `${record.userName || 'A user'} paid ${record.amountPaid}` });
    addStoredNotification(note);
  } catch (e) {}

  return record;
};

export const getPayments = () => readPayments();

export const getPaymentsByBooking = (bookingId) => getPayments().filter((p) => String(p.bookingId) === String(bookingId));

export const updatePayment = (id, updates = {}) => {
  const next = updatePaymentRecord(id, updates);
  return next;
};

export const deletePayment = (id) => removePaymentRecord(id);

export default { createPayment, getPayments, getPaymentsByBooking, updatePayment, deletePayment };
