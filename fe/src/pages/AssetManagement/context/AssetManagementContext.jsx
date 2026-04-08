import React, { createContext, useContext } from 'react';
import useAssetManagementPage from '../hooks/useAssetManagementPage';

const AssetManagementContext = createContext(null);

export const useAssetManagement = () => {
  const context = useContext(AssetManagementContext);
  if (!context) {
    throw new Error('useAssetManagement must be used within an AssetManagementProvider');
  }
  return context;
};

export const AssetManagementProvider = ({ children }) => {
  const vm = useAssetManagementPage();

  // useAssetManagementPage already handles internal memoization
  // No need for additional useMemo here since vm object identity
  // is stable when underlying state doesn't change

  return <AssetManagementContext.Provider value={vm}>{children}</AssetManagementContext.Provider>;
};
