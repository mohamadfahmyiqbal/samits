// utils/routeRenderer.js
import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { encryptPath } from '../router/encryptPath';

export const renderRoutes = (routes, baseUrl = '') => {
// Clean production

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
