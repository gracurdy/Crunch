const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** Prefix site-root paths so they work under GitHub Pages `/Crunch`. */
export function withBasePath(path: string): string {
  if (!path) return path;
  if (/^https?:\/\//i.test(path) || path.startsWith("data:")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (!basePath) return normalized;
  if (normalized === basePath || normalized.startsWith(`${basePath}/`)) return normalized;
  return `${basePath}${normalized}`;
}

export { basePath };
