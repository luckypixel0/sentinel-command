// Compatibility shim: maps @tanstack/react-router usage to react-router-dom.
import { forwardRef, type ReactNode, type ComponentProps, type AnchorHTMLAttributes } from "react";
import {
  Link as RRLink,
  Outlet as RROutlet,
  useNavigate as useRRNavigate,
  useLocation,
  useParams as useRRParams,
} from "react-router-dom";

function resolvePath(to: string | undefined, params?: Record<string, any>): string {
  if (!to) return "/";
  if (!params) return to;
  return to.replace(/\$([A-Za-z0-9_]+)/g, (_, k) => encodeURIComponent(params[k] ?? ""));
}

type TSLinkProps = {
  to?: string;
  params?: Record<string, any>;
  search?: any;
  activeProps?: any;
  inactiveProps?: any;
  preload?: any;
  activeOptions?: any;
  children?: ReactNode;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

export const Link = forwardRef<HTMLAnchorElement, TSLinkProps>(function Link(
  { to, params, search, activeProps, inactiveProps, preload, activeOptions, ...rest },
  ref,
) {
  const path = resolvePath(to, params);
  return <RRLink ref={ref} to={path} {...(rest as any)} />;
});

export const Outlet = RROutlet;

export function useNavigate() {
  const nav = useRRNavigate();
  return (arg: string | { to?: string; params?: Record<string, any>; replace?: boolean }) => {
    if (typeof arg === "string") return nav(arg);
    if (!arg) return;
    const path = resolvePath(arg.to, arg.params);
    nav(path, { replace: arg.replace });
  };
}

export function useRouterState<T = any>(opts?: { select?: (s: any) => T }): T {
  const loc = useLocation();
  const state = { location: { pathname: loc.pathname, search: loc.search, hash: loc.hash } };
  return opts?.select ? opts.select(state) : (state as any);
}

export function useRouter() {
  const nav = useNavigate();
  return {
    navigate: nav,
    invalidate: () => {},
    history: { back: () => window.history.back() },
  };
}

export function useParams<T = any>(_opts?: { from?: string; strict?: boolean }): T {
  return useRRParams() as any;
}

class NotFoundError extends Error {
  __notFound = true;
  constructor() { super("Not Found"); }
}
export function notFound() { return new NotFoundError(); }
export function redirect(_opts: any) { return _opts; }

export type FileRoute<TPath extends string = string> = {
  path: TPath;
  component?: React.ComponentType<any>;
  loader?: (ctx: any) => any;
  head?: (ctx?: any) => any;
  errorComponent?: React.ComponentType<any>;
  notFoundComponent?: React.ComponentType<any>;
  shellComponent?: React.ComponentType<any>;
  useLoaderData?: () => any;
  useRouteContext?: () => any;
  useParams?: () => any;
  useSearch?: () => any;
};

// createFileRoute("/path")(options) — returns a route descriptor with helper hooks.
export function createFileRoute<TPath extends string>(path: TPath) {
  return (opts: Partial<FileRoute<TPath>>): FileRoute<TPath> => {
    const route: FileRoute<TPath> = { path, ...opts };
    route.useLoaderData = () => {
      // Loader data is exposed via a route-scoped hook. We call the loader
      // synchronously using route params — mock services return promises but
      // components generally re-fetch via react-query. To keep the migration
      // minimal we throw a suspense-like promise once, then cache.
      return useLoaderDataFor(route);
    };
    route.useRouteContext = () => ({ queryClient: (globalThis as any).__sentinelQueryClient });
    route.useParams = () => useRRParams();
    route.useSearch = () => ({});
    return route;
  };
}

// Simple in-memory loader cache keyed by route path + serialized params.
const loaderCache = new Map<string, any>();
const loaderPending = new Map<string, Promise<any>>();

function useLoaderDataFor(route: FileRoute) {
  const params = useRRParams();
  const key = route.path + ":" + JSON.stringify(params);
  if (loaderCache.has(key)) return loaderCache.get(key);
  if (!route.loader) return undefined;
  if (!loaderPending.has(key)) {
    const p = Promise.resolve(route.loader({ params })).then((data) => {
      loaderCache.set(key, data);
      loaderPending.delete(key);
      return data;
    });
    loaderPending.set(key, p);
  }
  throw loaderPending.get(key);
}

// SSR-only helpers become no-ops in the SPA.
export function HeadContent() { return null; }
export function Scripts() { return null; }

export function createRootRouteWithContext<_TCtx = any>() {
  return (opts: any) => opts;
}
export function createRootRoute(opts: any) { return opts; }
export function createRouter(opts: any) { return opts; }
export function RouterProvider(_props: any): any { return null; }

export type LinkProps = ComponentProps<typeof Link>;
