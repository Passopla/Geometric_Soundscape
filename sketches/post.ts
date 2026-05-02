// ── POST-PROCESSING CONFIG ────────────────────────────────────────────────────
//
//  grain          film grain intensity          0 = off,  1 = heavy
//  grainSize      grain pixel size (px)         1 = fine, 3 = chunky
//  bloomBlur      bloom spread radius (px)      0 = off,  20 = heavy
//  bloomStrength  bloom layer opacity           0 = off,  1 = full
//  blur           base softness on main canvas  0 = sharp, 4 = dreamy
// ─────────────────────────────────────────────────────────────────────────────
export const POST_CONFIG = {
  grain:         0.12,
  grainSize:     1,
  bloomBlur:     1,
  bloomStrength: 0.0,
  blur:          0,
};
