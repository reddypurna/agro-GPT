export const storage = {
  getItem: (key) => {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Unable to read from localStorage', error);
      return null;
    }
  },

  setItem: (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Unable to write to localStorage', error);
    }
  },

  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Unable to remove from localStorage', error);
    }
  }
};

