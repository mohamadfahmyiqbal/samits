import React, { useState, useCallback, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import clsx from 'clsx';
import { MenuProvider } from './context/MenuContext';
import { useAuth } from '../context/AuthContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import ErrorBoundary from '../components/shared/ErrorBoundary';
import Loader from '../components/shared/Loader';
import Overlay from './components/Overlay';

export default function MainLayout() {

  const [side, setSide] = useState(false);
  const closeSidebar = useCallback(() => setSide(false), []);
  
  const { userPermissions = [] } = useAuth();

  return (
    <MenuProvider userPermissions={userPermissions}>
      <div className='main-layout h-screen flex flex-col bg-gray-50 dark:bg-gray-900'>
        <Header side={side} handleSidebar={setSide} />

        <div className='layout-shell flex-1 flex flex-col overflow-hidden'>
          {/* Sidebar Area */}
          <aside className={clsx('layout-sidebar flex-shrink-0', {
            'sidebar-open': side
          })}>
            <Sidebar onNavigate={closeSidebar} />
          </aside>

          <div className='layout-body flex-1 flex flex-col overflow-hidden'>
            {side && <Overlay onClose={closeSidebar} />}

            <main className='layout-content flex-1 overflow-y-auto'>
              <Suspense fallback={<Loader tip="Loading page..." />}>
                <ErrorBoundary
                  homePath='/dashboard'
                  title='Page error'
                  description='The current page could not be rendered. Try reloading or return to the dashboard.'
                  homeLabel='Dashboard'
                  refreshLabel='Reload Page'
                  resultStatus='500'
                >
                  <Outlet />
                </ErrorBoundary>
              </Suspense>
            </main>
          </div>
        </div>

        <Footer />
      </div>
    </MenuProvider>
  );
}
