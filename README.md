# Geometric Soundscape

An audio-reactive 3D visualization engine built with React, p5.js, and WebGL. Load any audio file and watch it come alive as interactive wireframe geometry — with film grain, bloom, and orbital camera controls.

## What It Does

Geometric Soundscape analyzes audio in real-time using FFT and maps frequency data — bass, mid, and treble bands — onto 3D surfaces you can orbit and explore. A post-processing layer adds bloom glow and film grain over the top.

### Visualization Modes

**Surface** — A spinning wireframe landscape that ripples and deforms to the music. Louder sounds push the surface higher, and the whole thing slowly rotates. Click and drag to look around, scroll to zoom.
<img width="1873" height="966" alt="image" src="https://github.com/user-attachments/assets/4fe7001f-225a-4d39-8e20-0d2d81125fbf" />

**Mountain** — A rolling mountain range that builds up over time. Each moment of audio becomes a new ridge, pushing older ones into the background. When the music stops, the mountains gradually flatten back down.
<img width="1873" height="966" alt="image" src="https://github.com/user-attachments/assets/8079b2a5-4942-46b8-955d-9033a8e0b418" />

**Cube** — Audio waveforms stacked inside a 3D cube, filling it from front to back like layers in a box. The louder the music, the taller the lines. Drag to spin the cube, scroll to zoom in and out.
<img width="1873" height="966" alt="image" src="https://github.com/user-attachments/assets/2d403d39-d323-4921-99f3-1773b1ac3634" />

### Post-Processing

A separate overlay system runs on top of the p5 canvas, adding configurable bloom (blurred bright copy of the scene, screen-blended) and film grain (pre-baked randomized pixel frames cycled each tick). These are controlled via `sketches/post.ts`.

### Controls

Mode buttons sit on the right edge of the screen. The bottom bar handles audio — click "Upload MP3" to load a file, then "Sequence" to play. A loading state prevents playback before the audio is fully decoded.

## Tech Stack

- **React 19** + **TypeScript** — UI components and state
- **p5.js 1.9** with **p5.sound** — WebGL canvas, 3D geometry, FFT audio analysis
- **Tailwind CSS** — Styling via CDN
- **Vite 6** — Dev server and builds
- **Lucide React** — Icons

## Project Structure

```
audiovisualizer/
  App.tsx                    Main component — assembles sketch code, mode switching
  index.tsx                  React entry point
  index.html                 HTML shell with CDN imports
  index.css                  Stylesheet
  components/
    P5Canvas.tsx             p5.js instance-mode wrapper with React ref forwarding
    AudioControls.tsx        File upload, play/pause, loading state
    TechnicalOverlay.tsx     HUD-style status display (mode, FFT info, sample rate)
    PostOverlay.tsx          Bloom glow + film grain post-processing canvases
  sketches/
    surface.ts               Surface mesh config and sketch code
    mountain.ts              Mountain waterfall config and sketch code
    cube.ts                  Cube spectrum config and sketch code
    post.ts                  Post-processing config (grain, bloom, blur)
  vite.config.ts             Vite configuration
  tsconfig.json              TypeScript configuration
  metadata.json              App metadata
```

## Running Locally

Prerequisites: Node.js (v18+)

```bash
npm install
npm run dev
```

Opens at `http://localhost:3000`. Load an audio file through the UI to start visualizing.

### Other Commands

```bash
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # TypeScript type checking
```

## Configuration

Each visualization mode has a config object at the top of its sketch file in `sketches/`. Edit the values and save — Vite hot-reloads the changes instantly.

**Surface** (`sketches/surface.ts`) — tilt angle, spin speed, audio sensitivity, camera position.

**Mountain** (`sketches/mountain.ts`) — tilt, lean, slice spread/depth, camera position.

**Cube** (`sketches/cube.ts`) — camera orbit, elevation, distance, cube size, line weight, max amplitude.

**Post-processing** (`sketches/post.ts`) — grain intensity/size, bloom blur/strength, base canvas blur.

## How It Works

The three sketch modules export config objects and code strings. `App.tsx` stitches them into a single p5 sketch with shared state (FFT, playback, history buffers) and mode-switching via `window.__vizMode`. The `P5Canvas` component compiles this string into a p5 instance-mode sketch at runtime.

Audio is loaded through `p5.sound`, analyzed with `p5.FFT` (256 bands, 0.8 smoothing), and the resulting spectrum drives vertex positions in the WebGL canvas each frame. The React layer manages UI state and communicates with the p5 instance through `window.__p5Instance`.

The `PostOverlay` component runs a separate animation loop on two overlay canvases — one for bloom (screen-blended, blurred copy of the scene) and one for grain (pre-baked randomized pixel frames cycled each tick to avoid per-frame generation cost).

## Inspi
<img width="680" height="498" alt="image" src="https://github.com/user-attachments/assets/8c93a2af-b26c-4afc-91aa-04f6bbc2eb9a" />

## License

MIT
