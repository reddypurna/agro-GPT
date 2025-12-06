import { storage } from '../utils/storage';

export const authService = {
  login: async (email, password) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const user = {
      email,
      name: email.split('@')[0],
      id: Date.now()
    };

    storage.setItem('user', user);
    return user;
  },

  signup: async (email, password, name) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const user = {
      email,
      name,
      id: Date.now()
    };

    storage.setItem('user', user);
    return user;
  },

  logout: () => {
    storage.removeItem('user');
  },

  getStoredUser: () => {
    return storage.getItem('user');
  }
};

