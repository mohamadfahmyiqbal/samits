import React from 'react';
import { Nav, Tab, Tabs } from 'react-bootstrap';
import { useAssetManagement } from '../context/AssetManagementContext';

const LazyAssetTable = React.lazy(() => import('../asset/tables/AssetTable'));

// Memoized table wrapper to prevent unnecessary re-renders
const TableWithSuspense = React.memo((props) => (
  <React.Suspense
    fallback={
      <div className='table-suspense p-4 text-center text-muted'>Loading asset table...</div>
    }
  >
    <LazyAssetTable {...props} />
  </React.Suspense>
));

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
    ? assetGroups.filter((group) => group && String(group).trim().toLowerCase() !== 'all')
    : [];

  // Add "All" as first option if there are valid asset groups
  const assetGroupTabs = validAssetGroups.length > 0 ? ['All', ...validAssetGroups] : [];

  const showGroupTabs =
    assetGroupTabs.length > 1 &&
    activeMainTab &&
    activeMainTab !== 'All' &&
    activeSubTab &&
    activeSubTab !== 'All';
  const formatGroupLabel = (value) => String(value || '').toUpperCase();

  const assetTableProps = React.useMemo(
    () => ({
      data: filtered,
      onSort: onSort,
      sortField: sortField,
      sortAsc: sortAsc,
      onDetail: onDetail,
      onUpdate: onUpdate,
      onDelete: onDelete,
      onHistory: onDetail, // Menggunakan onDetail sebagai fallback untuk history
      isLoading: isLoading,
      onAdd: onAdd,
    }),
    [filtered, onSort, sortField, sortAsc, onDetail, onUpdate, onDelete, isLoading, onAdd]
  );

  return (
    <div className='asset-management-tabs-container'>
      <Tabs
        id='main-tab-asset-management'
        activeKey={activeMainTab}
        onSelect={(k) => {
          onMainTabChange(k, {
            category_id: k && k !== 'All' ? (tabMeta?.[k]?.category_id ?? null) : null,
            sub_category_id: null,
          });
        }}
        className='mb-3'
      >
        <Tab eventKey='All' title='All'>
          <TableWithSuspense {...assetTableProps} />
        </Tab>

        {mainCategories.map((main) => (
          <Tab key={main} eventKey={main} title={main}>
            {subTabConfig[main].length > 0 ? (
              <>
                <Nav
                  variant='tabs'
                  className='mb-3 flex-nowrap'
                  activeKey={activeSubTab || ''}
                  onSelect={(k) => {
                    onSubTabChange(k || '', {
                      category_id: tabMeta?.[main]?.category_id ?? null,
                      sub_category_id: k ? (tabMeta?.[main]?.sub_category_ids?.[k] ?? null) : null,
                    });
                  }}
                >
                  <Nav.Item>
                    <Nav.Link eventKey='All'>All</Nav.Link>
                  </Nav.Item>
                  {subTabConfig[main].map((sub) => (
                    <Nav.Item key={sub}>
                      <Nav.Link eventKey={sub}>{sub}</Nav.Link>
                    </Nav.Item>
                  ))}
                </Nav>

                {showGroupTabs && (
                  <Nav
                    variant='tabs'
                    className='mb-3 flex-nowrap asset-group-tabs'
                    activeKey={activeAssetGroup || 'All'}
                    onSelect={(k) => {
                      onAssetGroupChange(k || 'all');
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
                  <p className='text-muted'>Pilih sub kategori untuk menampilkan data.</p>
                ) : (
                  <TableWithSuspense {...assetTableProps} />
                )}
              </>
            ) : (
              <TableWithSuspense {...assetTableProps} />
            )}
          </Tab>
        ))}
      </Tabs>
    </div>
  );
}
