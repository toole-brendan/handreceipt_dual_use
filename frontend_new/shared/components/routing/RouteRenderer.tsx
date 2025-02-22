import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

interface RouteConfig {
  path: string;
  element: React.ReactNode;
  children?: RouteConfig[];
}

interface RouteRendererProps {
  routes: RouteConfig[];
  notFoundPath: string;
}

export const RouteRenderer: React.FC<RouteRendererProps> = ({ routes, notFoundPath }) => {
  const renderRoutes = (routeConfigs: RouteConfig[]) => {
    return routeConfigs.map((route) => (
      <Route
        key={route.path}
        path={route.path}
        element={route.element}
      >
        {route.children && renderRoutes(route.children)}
      </Route>
    ));
  };

  return (
    <Routes>
      {renderRoutes(routes)}
      <Route path="*" element={<Navigate to={notFoundPath} replace />} />
    </Routes>
  );
};
