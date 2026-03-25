import React from "react";
import { Nav } from "react-bootstrap";
import { useAssetManagement } from "../context/AssetManagementContext";

const PrimaryTabs = () => {
  const {
    mainTypes,
    assetGroups,
    activeMainType,
    activeAssetGroup,
    handleMainTypeChange,
    handleAssetGroupChange,
  } = useAssetManagement();

  const showMainTypes = Array.isArray(mainTypes) && mainTypes.length > 0;
  const primaryTabs = showMainTypes ? mainTypes : assetGroups || [];
  const activePrimary = showMainTypes ? activeMainType : activeAssetGroup;

  const getTabValue = (item) => {
    if (typeof item === "string") return item;
    return String(item?.main_type_name || "").trim();
  };

  const getTabLabel = (item) => {
    const value = getTabValue(item);
    if (!value) return "";
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const handlePrimaryTabSelect = (key) => {
    if (!key) return;
    // Log removed for production

    if (showMainTypes) {
      const selectedMainType = mainTypes.find((mt) => getTabValue(mt) === key);
      handleMainTypeChange(key, selectedMainType?.asset_main_type_id ?? null);
      return;
    }

    handleAssetGroupChange(key);
  };

  if (!showMainTypes || primaryTabs.length === 0) {
    return (
      <div className="primary-tabs-wrapper">
        <div className="text-muted text-center py-3">
          Loading asset main types...
        </div>
      </div>
    );
  }

  return (
    <div className="primary-tabs-wrapper">
      <Nav
        variant="pills"
        className="asset-utama-primary-tabs"
        activeKey={activePrimary || undefined}
        onSelect={handlePrimaryTabSelect}
      >
        {primaryTabs.map((tab) => {
          const tabValue = getTabValue(tab);
          if (!tabValue) return null;

          return (
            <Nav.Item key={tabValue}>
              <Nav.Link eventKey={tabValue} className="primary-tab-item">
                {getTabLabel(tab)}
              </Nav.Link>
            </Nav.Item>
          );
        })}
      </Nav>
    </div>
  );
};

export default PrimaryTabs;
