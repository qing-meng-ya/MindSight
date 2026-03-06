import React, { createContext, useContext, useMemo, useState } from 'react';

const CURRENT_USER_KEY = 'forenhub.currentUser';
const ACCOUNTS_KEY = 'forenhub.accounts';

const AuthContext = createContext(null);

const readJson = (key, fallback) => {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
};

const writeJson = (key, value) => {
  window.localStorage.setItem(key, JSON.stringify(value));
};

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => readJson(CURRENT_USER_KEY, null));

  const login = async (username, password) => {
    const accounts = readJson(ACCOUNTS_KEY, []);
    const account = accounts.find(
      (item) => item.username === username && item.password === password
    );

    if (!account) {
      throw new Error('用户名或密码错误');
    }

    const nextUser = {
      username: account.username,
      name: account.name,
      role: account.role,
      email: account.email || '',
      phone: account.phone || '',
    };

    setUser(nextUser);
    writeJson(CURRENT_USER_KEY, nextUser);
    return nextUser;
  };

  const register = async (payload) => {
    const accounts = readJson(ACCOUNTS_KEY, []);
    const duplicated = accounts.some((item) => item.username === payload.username);
    if (duplicated) {
      throw new Error('用户名已存在');
    }

    const newAccount = {
      username: payload.username,
      password: payload.password,
      name: payload.name,
      role: payload.role || 'forensic',
      email: payload.email || '',
      phone: payload.phone || '',
    };

    const nextAccounts = [...accounts, newAccount];
    writeJson(ACCOUNTS_KEY, nextAccounts);

    const nextUser = {
      username: newAccount.username,
      name: newAccount.name,
      role: newAccount.role,
      email: newAccount.email,
      phone: newAccount.phone,
    };

    setUser(nextUser);
    writeJson(CURRENT_USER_KEY, nextUser);
    return nextUser;
  };

  const logout = () => {
    setUser(null);
    window.localStorage.removeItem(CURRENT_USER_KEY);
  };

  const value = useMemo(
    () => ({
      user,
      setUser,
      login,
      register,
      logout,
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
