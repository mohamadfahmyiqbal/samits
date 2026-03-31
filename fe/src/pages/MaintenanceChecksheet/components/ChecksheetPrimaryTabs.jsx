import React from "react";
import { Nav } from "react-bootstrap";

const ChecksheetPrimaryTabs = ({
  mainTypes = [],
  activeMainTypeId,
  onMainTypeChange,
}) => {
  if (!mainTypes.length) {
    return (
      <div className="primary-tabs-wrapper">
        <div className="text-muted text-center py-3">
          Loading checklist main types...
        </div>
      </div>
    );
  }

  const handlePrimaryTabSelect = (key) => {
    if (!key) return;
    onMainTypeChange(Number(key));
  };

  return (
    <div className="primary-tabs-wrapper">
      <Nav
        variant="pills"
        className="asset-utama-primary-tabs checksheet-primary-tabs"
        activeKey={activeMainTypeId ? String(activeMainTypeId) : undefined}
        onSelect={handlePrimaryTabSelect}
      >
        {mainTypes.map((tab) => {
          const tabValue = tab.asset_main_type_id || tab.id;
          if (!tabValue) return null;
          const label =
            tab.main_type_name || tab.name || tab.asset_main_type_name || "Main Type";
          return (
            <Nav.Item key={tabValue}>
              <Nav.Link eventKey={String(tabValue)} className="primary-tab-item">
                {label}
              </Nav.Link>
            </Nav.Item>
          );
        })}
      </Nav>
    </div>
  );
};

export default ChecksheetPrimaryTabs;
