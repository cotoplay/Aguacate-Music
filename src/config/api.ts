/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Utility to resolve API endpoints for both:
 * 1. Web application (relative URLs `/api/...` when running on the same host)
 * 2. Capacitor Android APK (configured remote backend `https://...` or custom URL stored in localStorage)
 */

export const getApiBaseUrl = (): string => {
  // 1. Check custom user-configured backend in localStorage (e.g. from APK settings)
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('aguacate_custom_api_url');
    if (custom && custom.trim()) {
      return custom.trim().replace(/\/+$/, '');
    }
  }

  // 2. Check Vite build-time environment variable (e.g. VITE_API_BASE_URL)
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) {
    return (import.meta.env.VITE_API_BASE_URL as string).trim().replace(/\/+$/, '');
  }

  // 3. If running inside a Capacitor native app context without custom URL configured
  if (typeof window !== 'undefined') {
    const isCapacitor =
      (window as any).Capacitor !== undefined ||
      window.location.protocol === 'capacitor:' ||
      window.location.hostname === 'localhost';

    // In web dev server or same-domain production, relative path '' works directly
    if (!isCapacitor) {
      return '';
    }
  }

  return '';
};

export const setApiBaseUrl = (url: string): void => {
  if (typeof window !== 'undefined') {
    if (!url || !url.trim()) {
      localStorage.removeItem('aguacate_custom_api_url');
    } else {
      localStorage.setItem('aguacate_custom_api_url', url.trim().replace(/\/+$/, ''));
    }
    // Dispatch custom event so reactive UI components can update status
    window.dispatchEvent(new Event('aguacate_api_url_changed'));
  }
};

/**
 * Returns a full URL for the given API path.
 * If base URL is defined: https://my-backend.onrender.com/api/search
 * If base URL is empty: /api/search
 */
export const apiUrl = (endpoint: string): string => {
  const base = getApiBaseUrl();
  const cleanPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return base ? `${base}${cleanPath}` : cleanPath;
};

/**
 * Ping the server to check connectivity and health
 */
export const testApiConnection = async (urlOverride?: string): Promise<{ ok: boolean; message: string; latency?: number }> => {
  const base = urlOverride !== undefined ? urlOverride.trim().replace(/\/+$/, '') : getApiBaseUrl();
  const testUrl = base ? `${base}/api/health` : '/api/health';
  const start = performance.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(testUrl, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const latency = Math.round(performance.now() - start);

    if (res.ok) {
      return { ok: true, message: `Conexión exitosa (${latency} ms)`, latency };
    }
    return { ok: false, message: `El servidor respondió con código ${res.status}` };
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return { ok: false, message: 'Tiempo de espera agotado (timeout de 6s).' };
    }
    return { ok: false, message: 'No se pudo conectar al servidor. Verifica la URL e internet.' };
  }
};
