import React from 'react';
import ChecksheetManagementTabs from './components/ChecksheetManagementTabs';
import ChecksheetPrimaryTabs from './components/ChecksheetPrimaryTabs';
import ChecksheetCategoryTabs from './components/ChecksheetCategoryTabs';
import ChecksheetManagementModals from './components/ChecksheetManagementModals';
import ErrorBoundary from './components/ErrorBoundary';
import { ChecksheetManagementProvider } from './context/ChecksheetManagementContext';
import { useChecksheetManagementPage } from './hooks/useChecksheetManagementPage';

function MaintenanceChecksheetContent() {
  const {
    mainTypes,
    categories,
    subCategories,
    activeMainTypeId,
    activeCategoryId,
    activeSubCategoryId,
    handleMainTypeChange,
    handleCategoryChange,
    handleSubCategoryChange,
    loading,
  } = useChecksheetManagementPage();

  if (loading) {
    return <div className="text-center py-5">Loading checklists...</div>;
  }

  return (
    <>
      <ChecksheetPrimaryTabs
        mainTypes={mainTypes}
        activeMainTypeId={activeMainTypeId}
        onMainTypeChange={handleMainTypeChange}
      />
      <ChecksheetCategoryTabs
        categories={categories}
        activeCategoryId={activeCategoryId}
        onCategoryChange={handleCategoryChange}
      />
      <ChecksheetManagementTabs
        activeSubCategoryId={activeSubCategoryId}
        activeCategoryId={activeCategoryId}
        categories={categories}
        subCategories={subCategories}
        onSubCategoryChange={handleSubCategoryChange}
      />
      <ChecksheetManagementModals />
    </>
  );
}

function MaintenanceChecksheet() {
  return (
    <ErrorBoundary>
      <ChecksheetManagementProvider>
        <div className='asset-management-page checksheet-management-page'>
          <div className='asset-utama-page'>
            <MaintenanceChecksheetContent />
          </div>
        </div>
      </ChecksheetManagementProvider>
    </ErrorBoundary>
  );
}

MaintenanceChecksheet.displayName = 'MaintenanceChecksheet';

export default MaintenanceChecksheet;

