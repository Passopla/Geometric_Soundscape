# Geometric Soundscape

An audio-reactive 3D visualization engine built with React, p5.js, and WebGL. Load any audio file and watch it come alive as interactive wireframe geometry.

## What It Does

Geometric Soundscape analyzes audio in real-time using FFT (Fast Fourier Transform) and maps frequency data — bass, mid, and treble bands — onto 3D surfaces you can orbit and explore.

### Visualization Modes

**Surface Mesh** — A 40x40 wireframe grid that warps and ripples in response to audio frequencies. Bass drives the rotation speed, mids shape the surface displacement, and treble controls the stroke opacity. The result is an undulating terrain that breathes with the music.

**Spectrum Waterfall** — A time-series spectrogram rendered in 3D. Each frame of the frequency spectrum is pushed back in space, building up a mountain range of sound history (up to 80 frames deep). Recent data is bright, older data fades to transparency.

### Controls

The left sidebar switches between modes. The bottom bar handles audio: click "Initialize Stream" to load an MP3 or other audio file, then "Sequence" to play. You can orbit the 3D scene by clicking and dragging anywhere on the canvas.

## Tech Stack

- **React 19** + **TypeScript** — UI and state management
- **p5.js 1.9** with **p5.sound** — Canvas rendering, WebGL, and FFT audio analysis
- **Tailwind CSS** — Styling via CDN
- **Vite 6** — Dev server and build tooling
- **Lucide React** — Icon set

## Project Structure

```
audiovisualizer/
  App.tsx              Main component — visualization code, UI, and controls
  index.tsx            React DOM entry point
  index.html           HTML shell with CDN imports (p5.js, Tailwind)
  index.css            Stylesheet (Tailwind handles most styling)
  components/
    P5Canvas.tsx       p5.js instance mode wrapper with React ref forwarding
  vite.config.ts       Vite configuration
  tsconfig.json        TypeScript configuration
  metadata.json        App metadata
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

## How It Works

The visualization lives as a p5.js sketch string in `App.tsx` (`ACOUSTIC_SURFACE_CODE`). The `P5Canvas` component compiles this into a p5 instance-mode sketch at runtime. Audio is loaded via `p5.sound`, analyzed with `p5.FFT`, and the resulting spectrum data drives vertex positions in the WebGL canvas each frame.

The React layer handles UI state (play/pause, mode selection, file upload) and communicates with the p5 instance through methods exposed on `window.p5.instance`.

## License

Apache-2.0
