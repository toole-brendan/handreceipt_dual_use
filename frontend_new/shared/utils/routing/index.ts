/**
 * Routing utilities for path manipulation and navigation
 */

/**
 * Query parameter value types
 */
export type QueryParamValue = string | number | boolean | null | undefined;

/**
 * Query parameters object type
 */
export type QueryParams = Record<string, QueryParamValue | QueryParamValue[]>;

/**
 * Route parameter object type
 */
export type RouteParams = Record<string, string>;

/**
 * Options for building paths
 */
export interface BuildPathOptions {
  /** Whether to encode URI components */
  encode?: boolean;
  /** Whether to preserve null/undefined query params */
  preserveEmptyParams?: boolean;
  /** Whether to include a trailing slash */
  trailingSlash?: boolean;
}

/**
 * Build a URL path with optional parameters and query string
 */
export function buildPath(
  path: string,
  params: RouteParams = {},
  query: QueryParams = {},
  options: BuildPathOptions = {}
): string {
  const {
    encode = true,
    preserveEmptyParams = false,
    trailingSlash = false
  } = options;

  // Replace route parameters
  let result = path;
  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(
      `:${key}`,
      encode ? encodeURIComponent(value) : value
    );
  });

  // Build query string
  const queryString = buildQueryString(query, { encode, preserveEmptyParams });
  if (queryString) {
    result += `?${queryString}`;
  }

  // Add trailing slash if requested
  if (trailingSlash && !result.endsWith('/')) {
    result += '/';
  }

  return result;
}

/**
 * Build a query string from an object
 */
export function buildQueryString(
  params: QueryParams,
  options: BuildPathOptions = {}
): string {
  const { encode = true, preserveEmptyParams = false } = options;

  return Object.entries(params)
    .filter(([_, value]) => preserveEmptyParams || value != null)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value
          .map(v => `${encode ? encodeURIComponent(key) : key}=${encode ? encodeURIComponent(String(v)) : v}`)
          .join('&');
      }
      return `${encode ? encodeURIComponent(key) : key}=${encode ? encodeURIComponent(String(value)) : value}`;
    })
    .join('&');
}

/**
 * Parse a query string into an object
 */
export function parseQueryString(queryString: string): QueryParams {
  if (!queryString) return {};

  const params = queryString.startsWith('?')
    ? queryString.slice(1)
    : queryString;

  return params.split('&').reduce((acc, param) => {
    const [key, value] = param.split('=').map(decodeURIComponent);
    
    if (key in acc) {
      // Convert to array if multiple values
      const existing = acc[key];
      acc[key] = Array.isArray(existing)
        ? [...existing, value]
        : [existing as string, value];
    } else {
      acc[key] = value;
    }
    
    return acc;
  }, {} as QueryParams);
}

/**
 * Extract route parameters from a path pattern and URL
 */
export function extractRouteParams(pattern: string, path: string): RouteParams {
  const params: RouteParams = {};
  
  const patternParts = pattern.split('/');
  const pathParts = path.split('/');
  
  patternParts.forEach((part, index) => {
    if (part.startsWith(':')) {
      const paramName = part.slice(1);
      params[paramName] = decodeURIComponent(pathParts[index]);
    }
  });
  
  return params;
}

/**
 * Check if a path matches a pattern
 */
export function matchPath(pattern: string, path: string): boolean {
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = path.split('/').filter(Boolean);
  
  if (patternParts.length !== pathParts.length) {
    return false;
  }
  
  return patternParts.every((part, index) =>
    part.startsWith(':') || part === pathParts[index]
  );
}

/**
 * Join multiple path segments
 */
export function joinPaths(...paths: string[]): string {
  return paths
    .map(path => path.trim().replace(/^\/+|\/+$/g, ''))
    .filter(Boolean)
    .join('/');
}

/**
 * Get the relative path between two absolute paths
 */
export function getRelativePath(from: string, to: string): string {
  const fromParts = from.split('/').filter(Boolean);
  const toParts = to.split('/').filter(Boolean);
  
  let commonPrefixLength = 0;
  while (
    commonPrefixLength < fromParts.length &&
    commonPrefixLength < toParts.length &&
    fromParts[commonPrefixLength] === toParts[commonPrefixLength]
  ) {
    commonPrefixLength++;
  }
  
  const upCount = fromParts.length - commonPrefixLength;
  const relativeParts = [
    ...Array(upCount).fill('..'),
    ...toParts.slice(commonPrefixLength)
  ];
  
  return relativeParts.join('/') || '.';
}

/**
 * Check if a path is absolute
 */
export function isAbsolutePath(path: string): boolean {
  return path.startsWith('/');
}

/**
 * Normalize a path by removing redundant slashes and dots
 */
export function normalizePath(path: string): string {
  // Remove redundant slashes
  const normalized = path.replace(/\/+/g, '/');
  
  // Split into parts
  const parts = normalized.split('/').filter(Boolean);
  const result: string[] = [];
  
  // Process . and ..
  parts.forEach(part => {
    if (part === '.') {
      return;
    }
    if (part === '..') {
      result.pop();
      return;
    }
    result.push(part);
  });
  
  // Reconstruct path
  const final = result.join('/');
  return normalized.startsWith('/')
    ? `/${final}`
    : final;
}

/**
 * Get query parameters as a typed object
 */
export function getQueryParams<T extends QueryParams>(search: string): T {
  return parseQueryString(search) as T;
}

/**
 * Update query parameters while preserving existing ones
 */
export function updateQueryParams(
  currentSearch: string,
  updates: QueryParams
): string {
  const current = parseQueryString(currentSearch);
  return buildQueryString({ ...current, ...updates });
}

/**
 * Remove query parameters
 */
export function removeQueryParams(
  search: string,
  params: string[]
): string {
  const current = parseQueryString(search);
  params.forEach(param => delete current[param]);
  return buildQueryString(current);
}
