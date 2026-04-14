import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { encryptPath } from './pathEncoding';

export const renderRoutes = (routes) =>
  routes.map(({ path, component: Component }) => (
    <Route key={path} path={`/${encryptPath(path)}`} element={<Component />} />
  ));

export const renderRedirects = (redirects) =>
  redirects.map(({ from, to }) => (
    <Route
      key={from}
      path={`/${encryptPath(from)}`}
      element={<Navigate to={`/${encryptPath(to)}`} replace />}
    />
  ));
