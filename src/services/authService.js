// src/services/authService.js
import { storage } from '../utils/storage';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000';

function parseJsonSafe(text) {
  try { return JSON.parse(text); } catch { return null; }
}

export const authService = {
  signup: async (email, password, name) => {
    const payload = { username: name, email, password };
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    const data = parseJsonSafe(text);

    if (!res.ok) {
      const detail = data?.detail || data?.message || text || 'Signup failed';
      throw new Error(detail);
    }

    const user = { id: data.user_id, name, email };
    storage.setItem('user', user);
    return user;
  },

  login: async (email, password) => {
    const payload = { email, password };
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    const data = parseJsonSafe(text);

    if (!res.ok) {
      const detail = data?.detail || data?.message || text || 'Login failed';
      throw new Error(detail);
    }

    // backend returns {"message":"Login successful","user_id":N}
    const user = { id: data.user_id, email, name: email.split('@')[0] };
    storage.setItem('user', user);
    return user;
  },

  googleLogin: async (credentialResponse) => {
    if (!credentialResponse?.credential) throw new Error('Missing Google credential');
    try {
      const decoded = JSON.parse(atob(credentialResponse.credential.split('.')[1] || '{}'));
      const user = { email: decoded.email, name: decoded.name, id: decoded.sub };
      storage.setItem('user', user);
      return user;
    } catch {
      throw new Error('Invalid Google credential');
    }
  },

  logout: () => storage.removeItem('user'),
  getStoredUser: () => storage.getItem('user'),
};
