// ── CUBE CONFIG ───────────────────────────────────────────────────────────────
//  Edit these values and save — changes appear instantly in the browser.
//
//  rotY        horizontal camera angle  (radians)  drag also updates this at runtime
//  elevation   how high the camera is  (radians)  0 = eye-level, PI/2 = top-down
//  distance    camera distance/zoom    (px)       higher = further away
//  offsetX     horizontal position     (px)       negative = left,  positive = right
//  offsetY     vertical position       (px)       negative = up,    positive = down
//  cubeSize    size of the cube        (px)       equal on all sides
// ─────────────────────────────────────────────────────────────────────────────
export const CUBE_CONFIG = {
  rotY:         0.43,
  elevation:    0.40,
  distance:     720,
  offsetX:      0,
  offsetY:      0,
  cubeSize:     300,
  lineWeight:   1.5,
  maxAmplitude: 0.25,  // fraction of cubeSize the loudest frequency reaches
};

export const CUBE_SKETCH = `
    let eyeX = retro_distance * Math.sin(retro_rotY) * Math.cos(CUBE_CONFIG.elevation);
    let eyeY = -retro_distance * Math.sin(CUBE_CONFIG.elevation);
    let eyeZ = retro_distance * Math.cos(retro_rotY) * Math.cos(CUBE_CONFIG.elevation);
    p.camera(eyeX, eyeY, eyeZ, CUBE_CONFIG.offsetX, CUBE_CONFIG.offsetY, 0, 0, 1, 0);
    p.push();

    let S = CUBE_CONFIG.cubeSize;
    let maxSlices = 55;

    if (isPlaying) {
        let raw = [];
        let frameMax = 0;
        for (let i = 0; i < 64; i++) {
            let v = spectrum[i * 4];
            if (v > frameMax) frameMax = v;
            raw.push(v);
        }
        retro_dynMax = Math.max(retro_dynMax * 0.998, frameMax, 1);
        let frame = raw.map(v => p.map(v, 0, retro_dynMax, 0, S * CUBE_CONFIG.maxAmplitude));
        history.unshift(frame);
        if (history.length > maxSlices) history.pop();
    } else {
        // Decay toward flat, keep all slices populated
        for (let i = 0; i < history.length; i++) {
            for (let j = 0; j < history[i].length; j++) {
                history[i][j] *= 0.93;
            }
        }
        while (history.length < maxSlices) {
            history.push(new Array(64).fill(0));
        }
    }

    // All cube faces filled black — drawn before slices so lines render on top
    p.noStroke();
    p.fill(0);

    // Front (z = -S/2)
    p.beginShape();
    p.vertex(-S/2, -S/2, -S/2); p.vertex( S/2, -S/2, -S/2);
    p.vertex( S/2,  S/2, -S/2); p.vertex(-S/2,  S/2, -S/2);
    p.endShape(p.CLOSE);

    // Back (z = S/2)
    p.beginShape();
    p.vertex(-S/2, -S/2,  S/2); p.vertex( S/2, -S/2,  S/2);
    p.vertex( S/2,  S/2,  S/2); p.vertex(-S/2,  S/2,  S/2);
    p.endShape(p.CLOSE);

    // Left (x = -S/2)
    p.beginShape();
    p.vertex(-S/2, -S/2, -S/2); p.vertex(-S/2, -S/2,  S/2);
    p.vertex(-S/2,  S/2,  S/2); p.vertex(-S/2,  S/2, -S/2);
    p.endShape(p.CLOSE);

    // Right (x = S/2)
    p.beginShape();
    p.vertex( S/2, -S/2, -S/2); p.vertex( S/2, -S/2,  S/2);
    p.vertex( S/2,  S/2,  S/2); p.vertex( S/2,  S/2, -S/2);
    p.endShape(p.CLOSE);

    // Top (y = -S/2)
    p.beginShape();
    p.vertex(-S/2, -S/2, -S/2); p.vertex( S/2, -S/2, -S/2);
    p.vertex( S/2, -S/2,  S/2); p.vertex(-S/2, -S/2,  S/2);
    p.endShape(p.CLOSE);

    // Bottom (y = S/2)
    p.beginShape();
    p.vertex(-S/2,  S/2, -S/2); p.vertex( S/2,  S/2, -S/2);
    p.vertex( S/2,  S/2,  S/2); p.vertex(-S/2,  S/2,  S/2);
    p.endShape(p.CLOSE);

    p.noFill();

    // Bottom face edges
    p.strokeWeight(1);
    p.stroke(255);
    p.line(-S/2,  S/2,  S/2,  S/2,  S/2,  S/2);

    // Stacked spectrum slices — always maxSlices, flat at rest, rise with music
    let count = Math.min(history.length, maxSlices);
    for (let i = count - 1; i >= 0; i--) {
        let z = p.map(i, 0, maxSlices - 1, S/2, -S/2);
        let alpha = p.map(i, count - 1, 0, 40, 230);
        p.strokeWeight(CUBE_CONFIG.lineWeight);
        p.stroke(255, alpha);

        p.line(-S/2, S/2, z, -S/2, -S/2 - history[i][0], z);
        p.line( S/2, S/2, z,  S/2, -S/2 - history[i][history[i].length - 1], z);

        p.beginShape();
        for (let j = 0; j < history[i].length; j++) {
            let x = p.map(j, 0, history[i].length - 1, -S/2, S/2);
            let y = -S/2 - history[i][j];
            p.vertex(x, y, z);
        }
        p.endShape();
    }
    p.strokeWeight(1);
    p.pop();
`;
