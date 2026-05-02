// ── SURFACE CONFIG ────────────────────────────────────────────────────────────
//  Edit these values and save — changes appear instantly in the browser.
//
//  tiltX         forward/back tilt of the mesh  (radians)  PI/3 ≈ 60°
//  spinOffset    starting rotation of the mesh  (radians)  PI/4 ≈ 45°
//  spinSpeed     how fast the mesh spins        (float)    0 = frozen
//  camRotY       camera left/right angle        (radians)  drag also updates this
//  camElevation  camera up/down angle           (radians)  0 = eye-level
//  camDistance   camera zoom                    (px)       higher = further away
// ─────────────────────────────────────────────────────────────────────────────
export const SURFACE_CONFIG = {
  tiltX:        1.047,   // PI / 3
  spinOffset:   0.785,   // PI / 4
  spinSpeed:    0.01,
  sensitivity:  3,     // audio reaction strength  0 = none, 2 = heavy
  eyeX:         0,
  eyeY:        -400,
  eyeZ:         800,
};

export const SURFACE_SKETCH = `
    if (firstFrame) { p.camera(SURFACE_CONFIG.eyeX, SURFACE_CONFIG.eyeY, SURFACE_CONFIG.eyeZ, 0, 0, 0, 0, 1, 0); firstFrame = false; }
    p.orbitControl();
    p.push();
    p.rotateX(SURFACE_CONFIG.tiltX);
    p.rotateZ(SURFACE_CONFIG.spinOffset + t * SURFACE_CONFIG.spinSpeed);
    t += 0.05 + ((bass + mid + treble) / 3000) * SURFACE_CONFIG.sensitivity;

    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        let dist = p.dist(x, y, cols/2, rows/2);
        let baseWave = p.sin(dist * 0.2 - t) * 20;
        let audioDisplace = 0;
        if (isPlaying) {
          audioDisplace = p.map(spectrum[p.floor(dist * 2) % spectrum.length], 0, 255, 0, 60 * SURFACE_CONFIG.sensitivity);
          audioDisplace *= (mid / 255);
        }
        terrain[x][y] = baseWave + audioDisplace;
      }
    }

    p.push();
    p.translate(-size/2, -size/2, -50);
    p.stroke(255, 30);
    for(let i = 0; i <= 10; i++) {
       let pos = p.map(i, 0, 10, 0, size);
       p.line(pos, 0, pos, size);
       p.line(0, pos, size, pos);
    }
    p.pop();

    p.push();
    p.translate(-size/2, -size/2);
    for (let y = 0; y < rows - 1; y++) {
      let alpha = p.map(treble, 0, 255, 100, 255);
      p.stroke(255, alpha);
      p.beginShape(p.TRIANGLE_STRIP);
      for (let x = 0; x < cols; x++) {
        let xPos = p.map(x, 0, cols, 0, size);
        let yPos = p.map(y, 0, rows, 0, size);
        let yPosNext = p.map(y + 1, 0, rows, 0, size);
        p.vertex(xPos, yPos, terrain[x][y]);
        p.vertex(xPos, yPosNext, terrain[x][y+1]);
      }
      p.endShape();
    }
    p.pop();
    p.pop();
`;
