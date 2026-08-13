export function normalizeApiBase(rawValue: string | undefined): string {
  const value = rawValue?.trim().replace(/^['"]|['"]$/g, '') || '/api';
  const withoutTrailingSlash = value.replace(/\/+$/, '');

  if (/^https?:\/\//i.test(withoutTrailingSlash)) {
    const url = new URL(withoutTrailingSlash);
    const path = url.pathname.replace(/\/+$/, '');
    url.pathname = path.endsWith('/api') ? path : `${path}/api`;
    url.search = '';
    url.hash = '';
    return url.toString().replace(/\/$/, '');
  }

  return withoutTrailingSlash.endsWith('/api') ? withoutTrailingSlash : `${withoutTrailingSlash}/api`;
}
