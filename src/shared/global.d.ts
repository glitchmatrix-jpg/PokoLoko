import type { PokoLokoApi } from '../../electron/preload/preload';

declare global {
  interface Window {
    pokoloko: PokoLokoApi;
  }
}

export {};
