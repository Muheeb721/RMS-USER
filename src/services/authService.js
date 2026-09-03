import { data } from 'react-router-dom';
import api from './api';

export const login = async (email, password) => {
  const res = await api.request('/auth/login', { method: 'POST', data : { email, password } });
  return res;
};

export const signup = async (payload) => {
  const res = await api.request('/auth/signup', { method: 'POST', data : payload });
  return res;
};

export const me = async () => {
  const res = await api.request('/auth/me', { method: 'GET' });
  return res;
};

export default { login, signup, me };
