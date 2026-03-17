import React, { createContext, useContext, useMemo } from "react";
import useAssetManagementPage from "../hooks/useAssetManagementPage";

const AssetManagementContext = createContext();

export const useAssetManagement = () => {
  const context = useContext(AssetManagementContext);
  if (!context) {
    throw new Error("useAssetManagement must be used within an AssetManagementProvider");
  }
  return context;
};

export const AssetManagementProvider = ({ children }) => {
  const vm = useAssetManagementPage();
  
  // Memoize the value to prevent unnecessary re-renders of all consumers
  // when the parent component re-renders but the VM state hasn't changed its identity.
  // Note: Since vm is currently a large object from a hook, 
  // we use vm directly if it's already stable or wrap it if needed.
  const value = useMemo(() => vm, [vm]);

  return (
    <AssetManagementContext.Provider value={value}>
      {children}
    </AssetManagementContext.Provider>
  );
};
