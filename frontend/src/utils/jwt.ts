export function decodeJwt<T = any>(token: string | null | undefined): T | null {
  try {
    if (!token) return null;
    const [, payload] = token.split('.');
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
}


