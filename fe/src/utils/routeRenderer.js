// utils/routeRenderer.js
import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { encryptPath } from '../router/encryptPath';

export const renderRoutes = (routes, baseUrl = '') => {
  console.log('=== RouteRenderer Debug ===');
  console.log('Rendering routes:', routes.length);
  console.log(
    'Routes:',
    routes.map((r) => ({ path: r.path, encrypted: encryptPath(r.path) }))
  );

  return routes.map(({ path, component: Component }) => (
    <Route key={path} path={`/${encryptPath(path)}`} element={<Component />} />
  ));
};

export const renderRedirects = (redirects, baseUrl = '') => {
  return redirects.map(({ from, to }) => (
    <Route
      key={from}
      path={`/${encryptPath(from)}`}
      element={<Navigate to={`/${encryptPath(to)}`} replace />}
    />
  ));
};
