import React from "react";
import AssetManagementTabs from "./components/AssetManagementTabs";
import PrimaryTabs from "./components/PrimaryTabs";
import AssetManagementModals from "./components/AssetManagementModals";
import ErrorBoundary from "./components/ErrorBoundary";
import { AssetManagementProvider } from "./context/AssetManagementContext";

function AssetManagementPage() {
  return (
    <ErrorBoundary>
      <AssetManagementProvider>
        <div className="AssetManagement asset-utama-page">
          <PrimaryTabs />
          <AssetManagementTabs />
          <AssetManagementModals />
        </div>
      </AssetManagementProvider>
    </ErrorBoundary>
  );
}

export default AssetManagementPage;
