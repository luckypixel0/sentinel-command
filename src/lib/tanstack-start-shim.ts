// Compatibility shim: @tanstack/react-start is not used at runtime in SPA mode.
export function createStart(_fn: any) { return { addMiddleware: () => {} }; }
export function createMiddleware() {
  return { server: (_fn: any) => ({}) };
}
