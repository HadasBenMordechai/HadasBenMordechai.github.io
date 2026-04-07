import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as pinia from 'pinia';
import PrimeVue from 'primevue/config';
import App from '@/App.vue';

// Use vi.hoisted to share state between the mock factory and test body
const { viteSSGArgs } = vi.hoisted(() => ({
  viteSSGArgs: { callback: null as ((ctx: { app: any }) => void) | null },
}));

vi.mock('vite-ssg/single-page', () => ({
  ViteSSG: vi.fn((_, callback) => {
    viteSSGArgs.callback = callback;
    return {}; // ViteSSG returns the createApp export
  }),
}));

const mockPinia = { _isMockPinia: true };
vi.mock('pinia', async importOriginal => {
  const actual = await importOriginal<typeof pinia>();
  return { ...actual, createPinia: vi.fn(() => mockPinia) };
});

vi.mock('@/App.vue', () => ({ default: { name: 'AppMock' } }));
vi.mock('@/style.css', () => ({}));

describe('main.ts application entry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    viteSSGArgs.callback = null;
  });

  it('should initialize the app via ViteSSG with Pinia and PrimeVue', async () => {
    await import('@/main.ts');

    const { ViteSSG } = await import('vite-ssg/single-page');

    // Verify ViteSSG was called with the App component
    expect(ViteSSG).toHaveBeenCalledWith(App, expect.any(Function));

    // Verify Pinia was created
    expect(pinia.createPinia).toHaveBeenCalled();

    // Simulate ViteSSG invoking the setup callback with a mock app
    const mockApp = { use: vi.fn().mockReturnThis() };
    expect(viteSSGArgs.callback).not.toBeNull();
    viteSSGArgs.callback!({ app: mockApp });

    // Verify plugins registered inside the callback
    expect(mockApp.use).toHaveBeenCalledWith(mockPinia);
    expect(mockApp.use).toHaveBeenCalledWith(
      PrimeVue,
      expect.objectContaining({ theme: expect.objectContaining({ preset: expect.anything() }) }),
    );
  });
});
