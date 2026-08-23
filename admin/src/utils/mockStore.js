import * as mockSeed from '../mocks/mockData';

export const getStore = (key, fallback) => {
  try {
    const data = localStorage.getItem(key);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error(`Error reading ${key} from localStorage`, e);
  }
  return fallback || mockSeed[key] || [];
};

export const setStore = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage`, e);
  }
};

export const resetMockData = () => {
  // Clear only mock store keys to not log out if possible, 
  // or just clear everything and force relogin
  localStorage.clear();
  window.location.href = '/login';
};

window.resetMockData = resetMockData;
