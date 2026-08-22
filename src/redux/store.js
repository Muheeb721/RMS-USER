import { configureStore, createSlice } from '@reduxjs/toolkit';
import { readStoredNotifications, saveStoredNotifications } from '../utils/notificationsStorage.jsx';
import { readSessionUser, clearSessionUser } from '../services/notificationService.jsx';
import { readStoredFavorites, saveStoredFavorites } from '../services/favoritesService.jsx';

const loadStoredNotifications = () => readStoredNotifications([]);
const storedSessionUser = readSessionUser();
const loadStoredFavorites = (user) => readStoredFavorites(user?.email);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storedSessionUser || {
      name: 'Amina Khan',
      role: 'user',
      isLoggedIn: true,
      email: 'amina@example.com',
      loginDate: 'Today',
      loginTime: 'Now',
    },
    theme: 'light',
    notifications: loadStoredNotifications(),
    favorites: loadStoredFavorites(storedSessionUser),
  },
  reducers: {
    login: (state, action) => {
      state.user = { ...state.user, ...action.payload, isLoggedIn: true };
      state.favorites = loadStoredFavorites(action.payload);
      saveStoredNotifications(state.notifications);
    },
    logout: (state) => {
      state.user = { ...state.user, isLoggedIn: false };
      state.favorites = [];
      clearSessionUser();
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    addFavorite: (state, action) => {
      if (!state.favorites.includes(action.payload)) {
        state.favorites = [...state.favorites, action.payload];
        saveStoredFavorites(state.favorites, state.user);
      }
    },
    removeFavorite: (state, action) => {
      state.favorites = state.favorites.filter((favorite) => favorite !== action.payload);
      saveStoredFavorites(state.favorites, state.user);
    },
    clearFavorites: (state) => {
      state.favorites = [];
      saveStoredFavorites([], state.user);
    },
    addNotification: (state, action) => {
      const next = [action.payload, ...state.notifications];
      state.notifications = next;
      saveStoredNotifications(next);
    },
    setNotifications: (state, action) => {
      state.notifications = Array.isArray(action.payload) ? action.payload : [];
      saveStoredNotifications(state.notifications);
    },
    removeNotification: (state, action) => {
      const next = state.notifications.filter((item) => item.id !== action.payload);
      state.notifications = next;
      saveStoredNotifications(next);
    },
    markNotificationAsRead: (state, action) => {
      state.notifications = state.notifications.map((item) =>
        item.id === action.payload ? { ...item, unread: false } : item,
      );
      saveStoredNotifications(state.notifications);
    },
    markAllNotificationsAsRead: (state) => {
      state.notifications = state.notifications.map((item) => ({ ...item, unread: false }));
      saveStoredNotifications(state.notifications);
    },
    clearNotifications: (state) => {
      state.notifications = [];
      saveStoredNotifications([]);
    },
  }
});

export const { login, logout, toggleTheme, addFavorite, removeFavorite, clearFavorites, addNotification, removeNotification, markNotificationAsRead, markAllNotificationsAsRead, clearNotifications } = authSlice.actions;
export const { setNotifications } = authSlice.actions;

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
  },
});

// Sync notifications from localStorage updates into Redux store
if (typeof window !== 'undefined') {
  window.addEventListener('rms-notifications-updated', () => {
    try {
      const current = readStoredNotifications([]);
      store.dispatch({ type: 'auth/setNotifications', payload: current });
    } catch (e) {
      // ignore
    }
  });
}
