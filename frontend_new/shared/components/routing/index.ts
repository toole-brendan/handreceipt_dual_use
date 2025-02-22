import { RouteRenderer } from './RouteRenderer';

export interface RouteConfig {
  path: string;
  element: React.ReactNode;
  children?: RouteConfig[];
}

export interface RouteRendererProps {
  routes: RouteConfig[];
  notFoundPath: string;
}

export { RouteRenderer };
