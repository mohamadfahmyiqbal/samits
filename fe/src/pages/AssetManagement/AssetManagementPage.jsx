import React from 'react';
import AssetManagementTabs from './components/AssetManagementTabs';
import PrimaryTabs from './components/PrimaryTabs';
import AssetManagementModals from './components/AssetManagementModals';
import ErrorBoundary from './components/ErrorBoundary';
import { AssetManagementProvider } from './context/AssetManagementContext';

function AssetManagementPage() {
  return (
    <ErrorBoundary
      homePath='/dashboard'
      title='Asset Management error'
      description='The Asset Management page could not be rendered. Try again or return to the dashboard.'
      homeLabel='Dashboard'
      refreshLabel='Reload Page'
      resultStatus='500'
    >
      <AssetManagementProvider>
        <div className='asset-management-page'>
          <PrimaryTabs />
          <AssetManagementTabs />
          <AssetManagementModals />
        </div>
      </AssetManagementProvider>
    </ErrorBoundary>
  );
}

AssetManagementPage.displayName = 'AssetManagementPage';

export default AssetManagementPage;
