/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';

export interface P5CanvasRef {
  downloadPng: (filename: string) => void;
}

interface P5CanvasProps {
  code: string;
}

export const P5Canvas = forwardRef<P5CanvasRef, P5CanvasProps>(({ code }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    downloadPng: (filename: string) => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.saveCanvas(filename, 'png');
      }
    }
  }));

  useEffect(() => {
    if (!containerRef.current || !window.p5) return;

    if (p5InstanceRef.current) {
      p5InstanceRef.current.remove();
      window.__p5Instance = null;
    }

    setError(null);

    let sketchFunction: Function;
    try {
      const cleanCode = code.replace(/```javascript/g, '').replace(/```/g, '').trim();
      sketchFunction = new Function('p', cleanCode);
    } catch (e) {
      setError(`Compilation error: ${(e as Error).message}`);
      return;
    }

    try {
      p5InstanceRef.current = new window.p5((p: any) => {
        window.__p5Instance = p;

        p.setup = () => {
          const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
          canvas.style('display', 'block');
          p.background(0);
        };

        try {
          sketchFunction(p);
        } catch (e) {
          setError(`Sketch error: ${(e as Error).message}`);
          console.error('Sketch error:', e);
        }
      }, containerRef.current);
    } catch (e) {
      setError(`p5 init error: ${(e as Error).message}`);
      console.error('p5 init error:', e);
    }

    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        window.__p5Instance = null;
      }
    };
  }, [code]);

  return (
    <div ref={containerRef} className="w-full h-full">
      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="bg-red-950 border border-red-800 text-red-300 font-mono text-xs px-6 py-4 rounded-lg max-w-lg text-center">
            {error}
          </div>
        </div>
      )}
    </div>
  );
});

P5Canvas.displayName = 'P5Canvas';
