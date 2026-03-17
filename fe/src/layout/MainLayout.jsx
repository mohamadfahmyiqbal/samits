import React, { useState, useContext } from "react";
import { Outlet } from "react-router-dom";
import { MenuProvider } from "../context/MenuContext";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";


export default function MainLayout() {
  const [side, setSide] = useState(false);
  const closeSidebar = () => setSide(false);
  
  const userPermissions = ['user.basic', 'asset.view', 'maintenance.view'];

  return (
    <MenuProvider userPermissions={userPermissions}>
      <div className="main-layout h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <Header side={side} handleSidebar={setSide} />

        <div className="layout-shell flex-1 flex flex-col overflow-hidden">
          {/* Sidebar Area */}
          <aside className={`layout-sidebar flex-shrink-0 ${side ? "sidebar-open" : ""}`}>
            <Sidebar onNavigate={closeSidebar} />
          </aside>

          <div className="layout-body flex-1 flex flex-col overflow-hidden">
            {side && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" 
                   onClick={closeSidebar} 
                   aria-label="Tutup sidebar" />
            )}

            <main className="layout-content flex-1 overflow-y-auto">
              <Outlet />
            </main>
          </div>
        </div>

        <Footer />
      </div>
    </MenuProvider>
  );
}

