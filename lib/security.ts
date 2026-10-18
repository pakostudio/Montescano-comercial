/**
 * Los formularios son públicos, pero sólo aceptan peticiones same-origin
 * desde su propio deployment HTTPS (producción o Vercel Preview).
 * El control real contra abuso permanece en la base (token + rate-limit).
 */
export function isSameOriginFormPost(request: Request): boolean {
  const supplied = request.headers.get('origin');
  if (!supplied || supplied === 'null') return false;
  try {
    const site = new URL(supplied);
    const endpoint = new URL(request.url);
    if (site.origin !== supplied || site.origin !== endpoint.origin) return false;
    if (site.protocol !== 'https:' && !(site.protocol === 'http:' && ['localhost','127.0.0.1'].includes(site.hostname))) return false;
    const fetchSite = request.headers.get('sec-fetch-site');
    return !fetchSite || fetchSite === 'same-origin' || fetchSite === 'none';
  } catch {
    return false;
  }
}
