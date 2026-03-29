import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUserRole } from '../hooks/useUserRole';
import { Spinner } from 'react-bootstrap';

/**
 * ProtectedRoute - Komponen untuk melindungi routes berdasarkan role
 *
 * Props:
 * - children: Komponen yang akan dirender jika user memiliki akses
 * - allowedRoles: Array role yang diizinkan, contoh: ['administrator', 'asset controller']
 * - fallback: Komponen fallback jika tidak memiliki akses (default: redirect ke dashboard)
 */
export default function ProtectedRoute({ children, allowedRoles, fallback = null }) {
  const { userRole, hasRole, isLoading } = useUserRole();
  const location = useLocation();

  // Loading state
  if (isLoading) {
    return (
      <div
        className='d-flex justify-content-center align-items-center'
        style={{ minHeight: '200px' }}
      >
        <Spinner animation='border' variant='primary' />
      </div>
    );
  }

  // User tidak login
  if (!userRole) {
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  // Cek apakah user punya role yang diizinkan
  if (!hasRole(allowedRoles)) {
    // Jika ada fallback component, render itu
    if (fallback) {
      return fallback;
    }

    // Default redirect ke dashboard dengan pesan
    return <Navigate to='/dashboard' replace />;
  }

  // User memiliki akses, render children
  return children;
}

/**
 * Hook untuk mengecek akses di dalam komponen
 */
export function useAccessControl() {
  const { userRole, hasRole, isLoading } = useUserRole();

  return {
    canAccess: (allowedRoles) => hasRole(allowedRoles),
    isSuperAdmin: () => userRole === 'SUPERADMIN',
    isAssetController: () => userRole === 'ASSET_CONTROLLER',
    isMaintenance: () => userRole === 'MAINTENANCE',
    isUser: () => userRole === 'USER',
    isApprover: () => userRole === 'APPROVER',
    userRole,
    isLoading,
  };
}
