interface TechnicalOverlayProps {
  mode: string;
}

export default function TechnicalOverlay({ mode }: TechnicalOverlayProps) {
  return (
    <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 space-y-1">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
        <span className="text-white font-bold">Sonic Resonance Mapper v1.2</span>
      </div>
      <div className="opacity-50">Signal Input: MP3/ALAC Buffer — Mode: {mode}</div>
      <div className="opacity-50">FFT BANDS: 1024</div>
      <div className="opacity-50">SMPL RATE: 44.1 KHZ</div>
    </div>
  );
}
