import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchWithFallback, scrollToId } from '@/helpers';

const okResponse = (body = 'ok') => new Response(body, { status: 200 });
const errorResponse = (status: number) => new Response(null, { status });

describe('fetchWithFallback', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('returns the primary response when it succeeds', async () => {
    const primary = okResponse('primary');
    fetchMock.mockResolvedValueOnce(primary);

    const res = await fetchWithFallback('/primary', '/fallback');

    expect(res).toBe(primary);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      '/primary',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('passes the given options to both requests', async () => {
    fetchMock.mockResolvedValueOnce(errorResponse(500)).mockResolvedValueOnce(okResponse());
    const options = { headers: { 'X-Test': '1' } };

    await fetchWithFallback('/primary', '/fallback', 3, options);

    expect(fetchMock).toHaveBeenNthCalledWith(1, '/primary', expect.objectContaining(options));
    expect(fetchMock).toHaveBeenNthCalledWith(2, '/fallback', options);
  });

  it('uses the timeout argument (in seconds) for the primary request', async () => {
    const timeoutSpy = vi.spyOn(AbortSignal, 'timeout');
    fetchMock.mockResolvedValueOnce(okResponse());

    await fetchWithFallback('/primary', '/fallback', 7);

    expect(timeoutSpy).toHaveBeenCalledWith(7000);
  });

  it('falls back when the primary response is not ok', async () => {
    const fallback = okResponse('fallback');
    fetchMock.mockResolvedValueOnce(errorResponse(404)).mockResolvedValueOnce(fallback);

    const res = await fetchWithFallback('/primary', '/fallback');

    expect(res).toBe(fallback);
    expect(fetchMock).toHaveBeenLastCalledWith('/fallback', {});
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('status: 404'));
  });

  it('falls back on a network error', async () => {
    const fallback = okResponse('fallback');
    fetchMock
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(fallback);

    await expect(fetchWithFallback('/primary', '/fallback')).resolves.toBe(fallback);
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Failed to fetch'));
  });

  it.each(['TimeoutError', 'AbortError'])('reports a %s as a timeout', async name => {
    fetchMock
      .mockRejectedValueOnce(new DOMException('aborted', name))
      .mockResolvedValueOnce(okResponse());

    await fetchWithFallback('/primary', '/fallback');

    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Timed out'));
  });

  it('throws when the fallback response is not ok', async () => {
    fetchMock.mockResolvedValueOnce(errorResponse(500)).mockResolvedValueOnce(errorResponse(503));

    await expect(fetchWithFallback('/primary', '/fallback')).rejects.toThrow(
      'Both primary and fallback requests failed. Fallback error: Fallback request failed with status: 503',
    );
  });

  it('chains the fallback and primary errors as causes when the fallback is not ok', async () => {
    const primaryError = new Error('primary down');
    fetchMock.mockRejectedValueOnce(primaryError).mockResolvedValueOnce(errorResponse(503));

    const error = await fetchWithFallback('/primary', '/fallback').catch(e => e);

    expect(error.cause).toBeInstanceOf(Error);
    expect(error.cause.message).toBe('Fallback request failed with status: 503');
    expect(error.cause.cause).toBe(primaryError);
  });

  it('throws when the fallback request rejects', async () => {
    const fallbackError = new Error('fallback down');
    fetchMock.mockRejectedValueOnce(new Error('primary down')).mockRejectedValueOnce(fallbackError);

    const error = await fetchWithFallback('/primary', '/fallback').catch(e => e);

    expect(error.message).toBe(
      'Both primary and fallback requests failed. Fallback error: fallback down',
    );
    expect(error.cause).toBe(fallbackError);
  });
});

describe('scrollToId', () => {
  let top: number;
  let scrollToMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    top = 500;
    scrollToMock = vi.fn();
    window.scrollTo = scrollToMock as unknown as typeof window.scrollTo;

    const elm = document.createElement('section');
    elm.id = 'target';
    elm.getBoundingClientRect = () => ({ top }) as DOMRect;
    document.body.appendChild(elm);
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('does nothing when the element does not exist', () => {
    scrollToId('missing');

    expect(scrollToMock).not.toHaveBeenCalled();
  });

  it('smooth-scrolls to the element position', () => {
    scrollToId('target');

    expect(scrollToMock).toHaveBeenCalledExactlyOnceWith({ top: 500, behavior: 'smooth' });
  });

  it('does not scroll again when the position is stable', () => {
    scrollToId('target');
    vi.advanceTimersByTime(5000);

    expect(scrollToMock).toHaveBeenCalledTimes(1);
  });

  it('re-scrolls while the position keeps shifting (e.g. lazy content loading)', () => {
    scrollToId('target');

    top = 800;
    vi.advanceTimersByTime(550);
    expect(scrollToMock).toHaveBeenCalledTimes(2);
    expect(scrollToMock).toHaveBeenLastCalledWith({ top: 800, behavior: 'smooth' });

    // Position stabilizes - no more scrolling
    vi.advanceTimersByTime(5000);
    expect(scrollToMock).toHaveBeenCalledTimes(2);
  });

  it('gives up after a limited number of retries', () => {
    scrollToId('target');

    for (let i = 0; i < 10; i++) {
      top += 100;
      vi.advanceTimersByTime(550);
    }

    // Initial call + 3 retries (n = 0..3, stops when n > 3)
    expect(scrollToMock).toHaveBeenCalledTimes(4);
  });
});
