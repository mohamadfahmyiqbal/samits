import React, { memo } from "react";
import PropTypes from "prop-types";
import AssetManagementTabs from "./components/AssetManagementTabs";
import PrimaryTabs from "./components/PrimaryTabs";
import AssetManagementModals from "./components/AssetManagementModals";
import ErrorBoundary from "./components/ErrorBoundary";
import { AssetManagementProvider } from "./context/AssetManagementContext";

function AssetManagementPage() {
  return (
    <ErrorBoundary>
      <AssetManagementProvider>
        <div className="asset-management-page">
          <PrimaryTabs />
          <AssetManagementTabs />
          <AssetManagementModals />
        </div>
      </AssetManagementProvider>
    </ErrorBoundary>
  );
}

AssetManagementPage.displayName = "AssetManagementPage";

AssetManagementPage.propTypes = {
  children: PropTypes.node
};

export default memo(AssetManagementPage);
