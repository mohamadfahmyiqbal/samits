import React from "react";
import { Nav, Tab, Tabs } from "react-bootstrap";
import AssetTable from "../asset/tables/AssetTable";
import { useAssetManagement } from "../context/AssetManagementContext";

export default function AssetManagementTabs() {
  const {
    isLoading,
    filtered,
    visibleSubTabConfig: subTabConfig,
    visibleTabMeta: tabMeta,
    activeMainTab,
    activeSubTab,
    assetGroups,
    activeAssetGroup,
    sortField,
    sortAsc,
    handleAssetGroupChange: onAssetGroupChange,
    handleMainTabChange: onMainTabChange,
    handleSubTabChange: onSubTabChange,
    toggleSort: onSort,
    handleDetail: onDetail,
    handleUpdate: onUpdate,
    handleDelete: onDelete,
    handleAddNewAsset: onAdd,
  } = useAssetManagement();

  const mainCategories = Object.keys(subTabConfig);
  
  // Filter valid asset groups (exclude 'all' and empty strings)
  const validAssetGroups = Array.isArray(assetGroups) 
    ? assetGroups.filter(group => group && String(group).trim().toLowerCase() !== "all")
    : [];
  
  // Add "All" as first option if there are valid asset groups
  const assetGroupTabs = validAssetGroups.length > 0 
    ? ["All", ...validAssetGroups]
    : [];
  
  const showGroupTabs =
    assetGroupTabs.length > 1 &&
    activeMainTab &&
    activeMainTab !== "All" &&
    activeSubTab &&
    activeSubTab !== "All";
  const formatGroupLabel = (value) => String(value || "").toUpperCase();

  const assetTableProps = {
    data: filtered,
    onSort: onSort,
    sortField: sortField,
    sortAsc: sortAsc,
    onDetail: onDetail,
    onUpdate: onUpdate,
    onDelete: onDelete,
    isLoading: isLoading,
    onAdd: onAdd,
  };

  return (
    <div className="asset-management-tabs-container">
      <Tabs
        id="main-tab-asset-management"
        activeKey={activeMainTab}
        onSelect={(k) => {
          // Log removed for production
          onMainTabChange(k, {
            category_id: k && k !== "All" ? tabMeta?.[k]?.category_id ?? null : null,
            sub_category_id: null,
          });
        }}
        className="mb-3"
      >
        <Tab eventKey="All" title="All">
          <AssetTable {...assetTableProps} />
        </Tab>

        {mainCategories.map((main) => (
          <Tab key={main} eventKey={main} title={main}>
            {subTabConfig[main].length > 0 ? (
              <>
                <Nav
                  variant="tabs"
                  className="mb-3 flex-nowrap"
                  activeKey={activeSubTab || ""}
                  onSelect={(k) => {
                    // Log removed for production
                    onSubTabChange(k || "", {
                      category_id: tabMeta?.[main]?.category_id ?? null,
                      sub_category_id: k ? tabMeta?.[main]?.sub_category_ids?.[k] ?? null : null,
                    });
                  }}
                >
                  <Nav.Item>
                    <Nav.Link eventKey="All">All</Nav.Link>
                  </Nav.Item>
                  {subTabConfig[main].map((sub) => (
                    <Nav.Item key={sub}>
                      <Nav.Link eventKey={sub}>{sub}</Nav.Link>
                    </Nav.Item>
                  ))}
                </Nav>

                {showGroupTabs && (
                  <Nav
                    variant="tabs"
                    className="mb-3 flex-nowrap asset-group-tabs"
                    activeKey={activeAssetGroup || "All"}
                    onSelect={(k) => {
                      // Log removed for production
                      onAssetGroupChange(k || "all");
                    }}
                  >
                    {assetGroupTabs.map((group) => (
                      <Nav.Item key={group}>
                        <Nav.Link eventKey={group}>{formatGroupLabel(group)}</Nav.Link>
                      </Nav.Item>
                    ))}
                  </Nav>
                )}

                {!activeSubTab ? (
                  <p className="text-muted">Pilih sub kategori untuk menampilkan data.</p>
                ) : (
                  <AssetTable {...assetTableProps} />
                )}
              </>
            ) : (
              <AssetTable {...assetTableProps} />
            )}
          </Tab>
        ))}
      </Tabs>
    </div>
  );
}
