/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { useState, useRef } from 'react';
import { P5Canvas } from './components/P5Canvas';
import AudioControls from './components/AudioControls';
import TechnicalOverlay from './components/TechnicalOverlay';
import PostOverlay from './components/PostOverlay';
import { SURFACE_SKETCH, SURFACE_CONFIG } from './sketches/surface';
import { MOUNTAIN_SKETCH, MOUNTAIN_CONFIG } from './sketches/mountain';
import { CUBE_SKETCH, CUBE_CONFIG } from './sketches/cube';
import { POST_CONFIG } from './sketches/post';

// Expose configs to the p5 sketch runtime via window
(window as any).SURFACE_CONFIG = SURFACE_CONFIG;
(window as any).MOUNTAIN_CONFIG = MOUNTAIN_CONFIG;
(window as any).CUBE_CONFIG = CUBE_CONFIG;
(window as any).POST_CONFIG = POST_CONFIG;

const ACOUSTIC_SURFACE_CODE = [
  `
  let cols = 40;
  let rows = 40;
  let size = 500;
  let t = 0;
  let song;
  let fft;
  let isPlaying = false;
  let prevMode = 'surface';

  let history = [];
  const maxHistory = 80;

  let retro_rotY = CUBE_CONFIG.rotY;
  let retro_distance = CUBE_CONFIG.distance;
  let retro_dynMax = 1;
  let firstFrame = true;

  // Pre-allocate terrain grid to avoid per-frame array allocation
  let terrain = [];
  for (let x = 0; x < 40; x++) {
    terrain[x] = new Float32Array(40);
  }

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
    p.stroke(255);
    p.noFill();
    fft = new window.p5.FFT(0.8, 256);
  };

  p.loadUserAudio = (file) => {
    if (song) song.stop();
    song = p.loadSound(file, () => {
      fft.setInput(song);
      if (window.__onAudioReady) window.__onAudioReady();
    });
  };

  p.togglePlayback = (play) => {
    if (!song) return;
    if (play) {
      let ctx = p.getAudioContext ? p.getAudioContext() : null;
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().then(() => { song.play(); isPlaying = true; });
      } else {
        song.play();
        isPlaying = true;
      }
    } else {
      song.stop();
      isPlaying = false;
    }
  };

  p.draw = () => {
    let mode = window.__vizMode || 'surface';

    if (mode !== prevMode) {
      if (mode === 'retro') {
        history = Array.from({ length: 55 }, () => new Array(64).fill(0));
      } else {
        history = [];
      }
      firstFrame = true;
      prevMode = mode;
      if (mode === 'surface')  console.log('[SURFACE config]',  JSON.parse(JSON.stringify(window.SURFACE_CONFIG)));
      if (mode === 'mountain') console.log('[MOUNTAIN config]', JSON.parse(JSON.stringify(window.MOUNTAIN_CONFIG)));
      if (mode === 'retro')    console.log('[RETRO config]',    JSON.parse(JSON.stringify(window.CUBE_CONFIG)));
    }

    p.background(0);

    let spectrum = fft.analyze();
    let bass = fft.getEnergy("bass");
    let mid = fft.getEnergy("mid");
    let treble = fft.getEnergy("treble");

    if (mode === 'surface') {
  `,
  SURFACE_SKETCH,
  `} else if (mode === 'retro') {`,
  CUBE_SKETCH,
  `} else if (mode === 'mountain') {`,
  MOUNTAIN_SKETCH,
  `}
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };

  let _wheelTimer = null;

  function _logCam() {
    let mode = window.__vizMode || 'surface';
    if (mode === 'surface' || mode === 'mountain') {
      let cam = p._renderer && p._renderer._curCamera;
      if (cam) {
        console.log('[' + mode.toUpperCase() + ' camera]', {
          eyeX: +cam.eyeX.toFixed(2),
          eyeY: +cam.eyeY.toFixed(2),
          eyeZ: +cam.eyeZ.toFixed(2),
        });
      }
    }
    if (mode === 'retro') {
      console.log('[RETRO config]', { ...JSON.parse(JSON.stringify(window.CUBE_CONFIG)), rotY: +retro_rotY.toFixed(4), distance: +retro_distance.toFixed(2) });
    }
  }

  p.mouseDragged = (event) => {
    if ((window.__vizMode || 'surface') === 'retro') {
      retro_rotY += (p.mouseX - p.pmouseX) * 0.006;
      return false;
    }
  };

  p.mouseReleased = () => { _logCam(); };

  p.mouseWheel = (event) => {
    if ((window.__vizMode || 'surface') === 'retro') {
      retro_distance = Math.max(100, retro_distance + event.delta * 0.5);
    }
    clearTimeout(_wheelTimer);
    _wheelTimer = setTimeout(_logCam, 300);
  };
  `,
].join('\n');

export default function App() {
  const [vizMode, setVizMode] = useState<'surface' | 'mountain' | 'retro'>('surface');
  const canvasRef = useRef<any>(null);

  const changeMode = (m: 'surface' | 'mountain' | 'retro') => {
    setVizMode(m);
    (window as any).__vizMode = m;
  };

  return (
    <div className="h-screen w-screen bg-black overflow-hidden relative selection:bg-neutral-800 font-sans">
      {/* Main Canvas */}
      <div id="p5-wrapper" className="absolute inset-0 flex items-center justify-center">
         <P5Canvas code={ACOUSTIC_SURFACE_CODE} ref={canvasRef} />
      </div>

      {/* Post-processing: glow + grain */}
      <PostOverlay />

      {/* Technical UI — top left, inside frame border */}
      <div className="absolute top-12 left-12 pointer-events-none z-50">
        <TechnicalOverlay mode={vizMode} />
      </div>

      {/* Header Label — top right, inside frame border */}
      <div className="absolute top-12 right-12 text-right pointer-events-none z-50">
        <h1 className="text-white text-lg font-bold tracking-tighter opacity-80">GEOMETRIC SOUNDSCAPE</h1>
        <p className="text-[10px] text-neutral-500 font-mono tracking-widest">EXPERIMENTAL AUDIO ENGINE</p>
      </div>

      {/* Controls */}
      <AudioControls />

      {/* Viz Mode Buttons */}
      <div className="absolute right-10 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-50">
        <button
          onClick={() => changeMode('surface')}
          className={`flex items-center gap-2 px-4 py-2 border rounded-full transition-all duration-300 text-xs font-mono uppercase tracking-widest ${vizMode === 'surface' ? 'bg-white text-black border-white' : 'bg-neutral-900 border-neutral-800 hover:bg-neutral-800 text-white'}`}
        >
          Surface
        </button>
        <button
          onClick={() => changeMode('mountain')}
          className={`flex items-center gap-2 px-4 py-2 border rounded-full transition-all duration-300 text-xs font-mono uppercase tracking-widest ${vizMode === 'mountain' ? 'bg-white text-black border-white' : 'bg-neutral-900 border-neutral-800 hover:bg-neutral-800 text-white'}`}
        >
          Mountain
        </button>
        <button
          onClick={() => changeMode('retro')}
          className={`flex items-center gap-2 px-4 py-2 border rounded-full transition-all duration-300 text-xs font-mono uppercase tracking-widest ${vizMode === 'retro' ? 'bg-white text-black border-white' : 'bg-neutral-900 border-neutral-800 hover:bg-neutral-800 text-white'}`}
        >
          Cube
        </button>
      </div>

      {/* Decorative Frames */}
      <div className="absolute inset-0 border-[20px] border-black pointer-events-none z-[60]" />
      <div className="absolute inset-10 border border-neutral-900 pointer-events-none z-[60]" />
    </div>
  );
}
