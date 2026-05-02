export {};

import type { SURFACE_CONFIG } from './sketches/surface';
import type { MOUNTAIN_CONFIG } from './sketches/mountain';
import type { CUBE_CONFIG } from './sketches/cube';

declare global {
  interface Window {
    __p5Instance: any;
    __vizMode: 'surface' | 'mountain' | 'retro';
    __onAudioReady: (() => void) | null;
    SURFACE_CONFIG: typeof SURFACE_CONFIG;
    MOUNTAIN_CONFIG: typeof MOUNTAIN_CONFIG;
    CUBE_CONFIG: typeof CUBE_CONFIG;
  }
}
