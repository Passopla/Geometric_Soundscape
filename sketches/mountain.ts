// ── MOUNTAIN / WATERFALL CONFIG ───────────────────────────────────────────────
//  Edit these values and save — changes appear instantly in the browser.
//
//  tiltX         forward/back tilt of the mesh  (radians)  PI/4 ≈ 45°
//  sideTiltZ     left/right lean of the mesh    (radians)  negative = lean left
//  offsetX       mesh horizontal position       (px)       negative = left
//  offsetY       mesh vertical position         (px)       negative = up
//  offsetZ       mesh depth offset              (px)       negative = push back
//  spread        depth between slices           (px)       higher = more spread out
//  camRotY       camera left/right angle        (radians)  drag also updates this
//  camElevation  camera up/down angle           (radians)  0 = eye-level
//  camDistance   camera zoom                    (px)       higher = further away
// ─────────────────────────────────────────────────────────────────────────────
export const MOUNTAIN_CONFIG = {
  tiltX:        0.785,   // PI / 4
  sideTiltZ:   -0.393,   // -PI / 8
  offsetX:      0,
  offsetY:      100,
  offsetZ:     -100,
  spread:       12,
  eyeX:         105.03,
  eyeY:        -302.51,
  eyeZ:         166.36,
};

export const MOUNTAIN_SKETCH = `
    if (firstFrame) { p.camera(MOUNTAIN_CONFIG.eyeX, MOUNTAIN_CONFIG.eyeY, MOUNTAIN_CONFIG.eyeZ, 0, 0, 0, 0, 1, 0); firstFrame = false; }
    p.orbitControl();
    p.push();
    p.rotateX(MOUNTAIN_CONFIG.tiltX);
    p.rotateZ(MOUNTAIN_CONFIG.sideTiltZ);
    p.translate(MOUNTAIN_CONFIG.offsetX, MOUNTAIN_CONFIG.offsetY, MOUNTAIN_CONFIG.offsetZ);

    if (isPlaying) {
        let currentFrame = [];
        for(let i = 0; i < spectrum.length; i += 4) {
           currentFrame.push(p.map(spectrum[i], 0, 255, 0, 150));
        }
        history.unshift(currentFrame);
        if (history.length > maxHistory) history.pop();
    } else {
        // Decay all frames toward zero so the stack flattens back to the baseline
        let allFlat = true;
        for (let i = 0; i < history.length; i++) {
            for (let j = 0; j < history[i].length; j++) {
                history[i][j] *= 0.93;
                if (history[i][j] > 0.5) allFlat = false;
            }
        }
        if (allFlat) {
            history = [new Array(64).fill(0)];
        }
    }

    p.stroke(255);
    p.noFill();

    for(let i = 0; i < history.length; i++) {
        let z = -i * MOUNTAIN_CONFIG.spread;
        let alpha = p.map(i, 0, history.length, 255, 0);
        p.stroke(255, alpha);

        p.line(-size/2, 0, z, -size/2, -history[i][0], z);

        p.beginShape();
        for(let j = 0; j < history[i].length; j++) {
            let x = p.map(j, 0, history[i].length - 1, -size/2, size/2);
            let y = -history[i][j];
            p.vertex(x, y, z);
        }
        p.endShape();

        if (i === 0) {
            let avgAmp = history[0].reduce((s, v) => s + v, 0) / history[0].length;
            let baseAlpha = p.constrain(p.map(avgAmp, 0, 8, 50, 0), 0, 50);
            p.stroke(255, 50);
            p.line(size/2, 0, z, size/2, -history[i][history[i].length-1], z);
            p.stroke(255, baseAlpha);
            p.line(-size/2, 0, z, size/2, 0, z);
        }
    }
    p.pop();
`;
