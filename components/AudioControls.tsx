import { useState, useRef } from 'react';
import { Upload, Play, Square } from 'lucide-react';

export default function AudioControls() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const blobUrlRef = useRef<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const p5 = window.__p5Instance as any;
    if (!p5?.loadUserAudio) return;

    // Revoke previous blob URL to avoid memory leak
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
    }

    const url = URL.createObjectURL(file);
    blobUrlRef.current = url;

    setLoading(true);
    setAudioLoaded(false);
    setIsPlaying(false);

    // Wait for the sound to fully load before enabling playback
    window.__onAudioReady = () => {
      setAudioLoaded(true);
      setLoading(false);
      window.__onAudioReady = null;
    };

    p5.loadUserAudio(url);
  };

  const togglePlay = () => {
    const p5 = window.__p5Instance as any;
    if (!p5?.togglePlayback) return;
    p5.togglePlayback(!isPlaying);
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 z-50">
      <label className="flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-white rounded-full cursor-pointer transition-all duration-300">
        <Upload size={16} />
        <span className="text-xs font-mono uppercase tracking-widest">
          {loading ? 'Loading...' : 'Upload MP3'}
        </span>
        <input type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} />
      </label>

      {audioLoaded && (
        <button
          onClick={togglePlay}
          className="flex items-center gap-3 px-8 py-3 bg-white text-black hover:bg-neutral-200 rounded-full transition-all duration-300 font-bold shadow-[0_0_40px_rgba(255,255,255,0.15)] group"
        >
          {isPlaying
            ? <Square size={18} fill="black" />
            : <Play size={18} fill="black" className="group-hover:scale-110 transition-transform" />}
          <span className="text-[11px] font-mono uppercase tracking-[0.2em]">
            Play / Pause
          </span>
        </button>
      )}
    </div>
  );
}
