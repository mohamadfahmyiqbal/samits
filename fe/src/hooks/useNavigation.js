import { useState } from 'react';

export const useNavigation = () => {
  const [navigationHistory, setNavigationHistory] = useState([]);

  const addToHistory = (path, title) => {
    setNavigationHistory(prev => [...prev, { path, title, timestamp: Date.now() }]);
  };

  const clearHistory = () => {
    setNavigationHistory([]);
  };

  const getRecentPages = (limit = 5) => {
    return navigationHistory.slice(-limit).reverse();
  };

  return {
    navigationHistory,
    addToHistory,
    clearHistory,
    getRecentPages
  };
};
