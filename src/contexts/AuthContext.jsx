import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

// Device Fingerprint Helper
function generateDeviceFingerprint() {
  const components = [
    navigator.userAgent,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.language
  ];
  const str = components.join('|');
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return ((h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0'));
}

function getOrGenerateFingerprint() {
  let fp = localStorage.getItem('device_fingerprint');
  if (!fp) {
    fp = generateDeviceFingerprint();
    localStorage.setItem('device_fingerprint', fp);
  }
  return fp;
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [pendingShares, setPendingShares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPendingShares = async () => {
    if (!user) return;
    try {
      const res = await api.get('/sharing/pending');
      setPendingShares(res.data.pendingShares || []);
    } catch (err) {
      console.error('Failed to fetch pending share invitations:', err.message);
      setPendingShares([]);
    }
  };

  // Check auth session on startup
  const checkAuth = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/profile');
      setUser(res.data.user);
      setError(null);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!user) {
      setPendingShares([]);
      return;
    }
    fetchPendingShares();
  }, [user]);

  // Inactivity session timeout listener
  useEffect(() => {
    if (!user) return;
    
    let inactivityTimer = null;
    const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 mins
    
    const resetTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        logout();
        alert('SECURITY NOTICE: Your session has expired due to inactivity.');
      }, INACTIVITY_LIMIT);
    };

    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [user]);

  const login = async (email, password, mfaCode = '') => {
    setError(null);
    try {
      const fingerprint = getOrGenerateFingerprint();
      const res = await api.post('/auth/login', { 
        email, 
        password,
        mfa_code: mfaCode || undefined,
        device_fingerprint: fingerprint 
      });
      setUser(res.data.user);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to authenticate.';
      setError(msg);
      const authError = new Error(msg);
      authError.mfaRequired = !!err.response?.data?.mfa_required;
      throw authError;
    }
  };

  const register = async (email, password, fullName) => {
    setError(null);
    try {
      const res = await api.post('/auth/register', { email, password, full_name: fullName });
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err.message);
    } finally {
      setUser(null);
      setPendingShares([]);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      pendingShares,
      loading,
      error,
      login,
      register,
      logout,
      checkAuth,
      fetchPendingShares,
      pendingShareCount: pendingShares.length,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};
export default AuthContext;
