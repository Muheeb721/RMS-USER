import api from './api';

export const createBooking = async (payload) => {
  try {
    const res = await api.request('/bookings', { method: 'POST', body: payload });
    return res;
  } catch (error) {
    console.warn('Create booking failed', error);
    return { success: false, message: 'API unavailable' };
  }
};

export const myBookings = async () => {
  try {
    const res = await api.request('/bookings/me');
    return res;
  } catch (error) {
    console.warn('List my bookings failed', error);
    return { success: false, message: 'API unavailable' };
  }
};

export default { createBooking, myBookings };
