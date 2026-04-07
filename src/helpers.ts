export async function fetchWithFallback(
  url: string,
  fallbackUrl: string,
  timeout: number = 3,
  options?: RequestInit,
): Promise<Response> {
  options = options || {};

  try {
    const response = await fetch(url, { ...options, signal: AbortSignal.timeout(timeout * 1000) });

    // Treat non-2xx HTTP responses (like 404 or 500) as failures
    if (!response.ok) {
      throw new Error(`Primary request failed with status: ${response.status}`);
    }

    return response;
  } catch (error: any) {
    // This catches network errors, non-OK statuses, and the timeout
    const isTimeout = error.name === 'TimeoutError' || error.name === 'AbortError';
    console.warn(
      `Primary fetch failed (${isTimeout ? 'Timed out' : error.message}). Trying fallback URL...`,
    );

    // Attempt the fallback request
    try {
      const response = await fetch(fallbackUrl, options);

      if (!response.ok) {
        throw new Error(`Fallback request failed with status: ${response.status}`);
      }

      return response;
    } catch (fallbackError: any) {
      // Both requests failed
      throw new Error(
        `Both primary and fallback requests failed. Fallback error: ${fallbackError.message}`,
      );
    }
  }
}

export function scrollToId(id: string) {
  const elm = document.getElementById(id);
  if (!elm) return;

  const getPos = () => elm.getBoundingClientRect().top + window.scrollY;

  const x = (n: number = 0) => {
    if (n > 3) return;

    const pos = getPos();
    window.scrollTo({ top: pos, behavior: 'smooth' });
    setTimeout(() => {
      if (getPos() !== pos) x(n + 1);
    }, 550);
  };

  x();
}
