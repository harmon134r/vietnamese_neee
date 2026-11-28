import React from "react";
import { APP_ART } from "../../data/illustrations";

const CHASE_DOG_CELL_W = 340;
const CHASE_CAT_CELL_W = 320;
const CHASE_CELL_H = 240;
const BEAR_CHOP_CELL_W = 320;
const BEAR_CHOP_CELL_H = 260;

const BAMBOO_LEAVES = [
  { id: "l1", side: "left", left: "4%", size: 25, duration: "13.5s", delay: "-2.1s", tone: "sage", variant: "a" },
  { id: "l2", side: "left", left: "11%", size: 20, duration: "15.8s", delay: "-7.4s", tone: "olive", variant: "b" },
  { id: "l3", side: "left", left: "17%", size: 22, duration: "12.4s", delay: "-10.2s", tone: "mist", variant: "a" },
  { id: "l4", side: "left", left: "8%", size: 18, duration: "16.6s", delay: "-4.8s", tone: "sage", variant: "b" },
  { id: "r1", side: "right", right: "5%", size: 24, duration: "14.2s", delay: "-3.3s", tone: "sage", variant: "b" },
  { id: "r2", side: "right", right: "12%", size: 19, duration: "16.1s", delay: "-8.9s", tone: "olive", variant: "a" },
  { id: "r3", side: "right", right: "18%", size: 22, duration: "12.8s", delay: "-11.4s", tone: "mist", variant: "b" },
  { id: "r4", side: "right", right: "9%", size: 18, duration: "15.2s", delay: "-1.5s", tone: "sage", variant: "a" },
];

const FIREFLIES = [
  { id: "f1", left: "6%", top: "24%", size: 5, path: "a", drift: "12.4s", twinkle: "3.4s", delay: "-1.8s" },
  { id: "f2", left: "14%", top: "40%", size: 4, path: "b", drift: "14.8s", twinkle: "4.1s", delay: "-5.2s" },
  { id: "f3", left: "9%", top: "64%", size: 5, path: "c", drift: "11.6s", twinkle: "3.1s", delay: "-8.1s" },
  { id: "f4", left: "21%", top: "29%", size: 3.5, path: "b", drift: "15.5s", twinkle: "4.4s", delay: "-3.7s" },
  { id: "f5", left: "23%", top: "73%", size: 4.5, path: "a", drift: "13.2s", twinkle: "3.7s", delay: "-9.6s" },
  { id: "f6", left: "16%", top: "82%", size: 3.5, path: "c", drift: "14.1s", twinkle: "2.9s", delay: "-6.4s" },
  { id: "f7", left: "93%", top: "26%", size: 5, path: "b", drift: "13.6s", twinkle: "3.5s", delay: "-2.5s" },
  { id: "f8", left: "86%", top: "43%", size: 4, path: "c", drift: "15.2s", twinkle: "4.2s", delay: "-7.3s" },
  { id: "f9", left: "91%", top: "67%", size: 5, path: "a", drift: "11.9s", twinkle: "3.0s", delay: "-4.9s" },
  { id: "f10", left: "79%", top: "28%", size: 3.5, path: "c", drift: "16.0s", twinkle: "4.5s", delay: "-10.5s" },
  { id: "f11", left: "77%", top: "74%", size: 4.5, path: "b", drift: "12.9s", twinkle: "3.6s", delay: "-1.1s" },
  { id: "f12", left: "83%", top: "83%", size: 3.5, path: "a", drift: "14.4s", twinkle: "3.2s", delay: "-6.9s" },
];

function SilkLantern({ variant }) {
  const isLeft = variant === "left";
  const idPrefix = isLeft ? "vfLanternTerracotta" : "vfLanternAmber";
  const bodyColors = isLeft
    ? { start: "#f0a282", mid: "#d97757", end: "#9b4931", rib: "rgba(255, 224, 198, 0.36)", tassel: "#d97757" }
    : { start: "#f8d49b", mid: "#e0a96d", end: "#a56d34", rib: "rgba(255, 240, 206, 0.42)", tassel: "#e0a96d" };

  return (
    <div className={`vf-auth-lantern vf-auth-lantern--${variant}`}>
      <span className={`vf-auth-lantern-halo vf-auth-lantern-halo--${variant}`} />
      <svg
        className="vf-auth-lantern-svg"
        viewBox="0 0 72 146"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id={`${idPrefix}Fill`} cx="50%" cy="46%" r="54%">
            <stop offset="0%" stopColor={bodyColors.start} />
            <stop offset="56%" stopColor={bodyColors.mid} />
            <stop offset="100%" stopColor={bodyColors.end} />
          </radialGradient>
          <radialGradient id={`${idPrefix}Core`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff3d1" stopOpacity="0.72" />
            <stop offset="65%" stopColor="#f5c984" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#f5c984" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Hanging cord */}
        <line
          x1="36"
          y1="0"
          x2="36"
          y2="34"
          stroke="rgba(236, 235, 228, 0.34)"
          strokeWidth="1.4"
        />
        <circle cx="36" cy="34" r="2.2" fill="#e0a96d" opacity="0.85" />

        {/* Top wooden cap */}
        <rect x="25" y="36" width="22" height="5.5" rx="2.5" fill="#463a31" stroke="rgba(236,235,228,0.22)" strokeWidth="0.7" />
        <rect x="28" y="34" width="16" height="2.6" rx="1.2" fill="#635142" />

        {/* Lantern silk body (Hội An curved teardrop-oval silhouette) */}
        <path
          d="M25 41.5 C12 48, 10 82, 25 94.5 L47 94.5 C62 82, 60 48, 47 41.5 Z"
          fill={`url(#${idPrefix}Fill)`}
          stroke="rgba(255, 236, 208, 0.24)"
          strokeWidth="0.9"
        />

        {/* Soft warm inner candle core */}
        <ellipse cx="36" cy="68" rx="14" ry="20" fill={`url(#${idPrefix}Core)`} />

        {/* Curved bamboo ribs */}
        <path d="M30 41.5 C21 53, 21 83, 30 94.5" stroke={bodyColors.rib} strokeWidth="0.9" />
        <path d="M42 41.5 C51 53, 51 83, 42 94.5" stroke={bodyColors.rib} strokeWidth="0.9" />
        <path d="M36 41.5 L36 94.5" stroke={bodyColors.rib} strokeWidth="0.8" />
        <path d="M16.8 59 C28 62.5, 44 62.5, 55.2 59" stroke={bodyColors.rib} strokeWidth="0.75" opacity="0.75" />
        <path d="M16.8 77 C28 80.5, 44 80.5, 55.2 77" stroke={bodyColors.rib} strokeWidth="0.75" opacity="0.75" />

        {/* Bottom wooden cap */}
        <rect x="26" y="94" width="20" height="5" rx="2.2" fill="#463a31" stroke="rgba(236,235,228,0.2)" strokeWidth="0.7" />

        {/* Swinging silk tassel */}
        <g className="vf-auth-lantern-tassel">
          <line x1="36" y1="99" x2="36" y2="108" stroke="#e0a96d" strokeWidth="1.3" />
          <circle cx="36" cy="109.5" r="2.6" fill="#e0a96d" />
          <path
            d="M33.2 112 L38.8 112 L40.5 136 C37.5 138, 34.5 138, 31.5 136 Z"
            fill={bodyColors.tassel}
            opacity="0.86"
          />
          <line x1="35" y1="113" x2="34.2" y2="135" stroke="rgba(255,235,204,0.34)" strokeWidth="0.8" />
          <line x1="37" y1="113" x2="37.8" y2="135" stroke="rgba(255,235,204,0.34)" strokeWidth="0.8" />
        </g>
      </svg>
    </div>
  );
}

function GrassStrip({ className }) {
  return (
    <svg
      className={`vf-auth-grass-layer ${className}`}
      viewBox="0 0 1440 42"
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 42 L0 31 Q18 19 32 32 Q50 14 66 30 Q84 20 100 33 Q122 10 138 31 Q158 18 176 32 Q196 15 214 30 Q235 21 252 33 Q272 12 292 31 Q312 19 332 32 Q355 15 372 30 Q395 22 414 33 Q436 11 454 31 Q476 18 494 32 Q516 14 536 30 Q558 21 576 33 Q598 13 618 31 Q640 19 658 32 Q682 15 700 30 Q724 20 742 33 Q764 11 784 31 Q806 18 824 32 Q846 15 866 30 Q888 21 908 33 Q930 12 950 31 Q972 19 992 32 Q1016 14 1034 30 Q1058 22 1076 33 Q1098 11 1118 31 Q1140 18 1160 32 Q1182 15 1202 30 Q1226 20 1244 33 Q1266 12 1286 31 Q1308 19 1328 32 Q1352 15 1370 30 Q1394 21 1412 33 Q1428 18 1440 28 L1440 42 Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Purely decorative warm-stone Vietnamese twilight scene rendered ONLY behind
 * the mandatory Auth Gate (and auth-check loading screen).
 * Strictly aria-hidden and pointer-events: none; GPU-composited transforms/opacity only.
 */
export default function AuthGateScene() {
  const { src: dogSrc, frames: dogFrames = 4 } = APP_ART.chaseDogSheet;
  const { src: catSrc, frames: catFrames = 4 } = APP_ART.chaseCatSheet;
  const { src: bearSrc, frames: bearFrames = 4 } = APP_ART.authBearChopSheet;
  const { src: villageSrc } = APP_ART.authTwilightVillage;

  return (
    <div className="vf-auth-scene" data-testid="auth-gate-scene" aria-hidden="true">
      {/* a) Breathing Twilight Ambient Glows */}
      <div className="vf-auth-glows">
        <span className="vf-auth-glow vf-auth-glow--terracotta" />
        <span className="vf-auth-glow vf-auth-glow--amber" />
        <span className="vf-auth-glow vf-auth-glow--sage" />
      </div>

      {/* b) Layered Secondary Parallax Clouds */}
      <div className="vf-auth-clouds">
        <img
          src={APP_ART.cloudLeft.src}
          alt=""
          className="vf-auth-cloud vf-auth-cloud--far-left"
          draggable={false}
          decoding="async"
        />
        <img
          src={APP_ART.cloudRight.src}
          alt=""
          className="vf-auth-cloud vf-auth-cloud--far-right"
          draggable={false}
          decoding="async"
        />
      </div>

      {/* c) Swaying Hội An Silk Lanterns */}
      <SilkLantern variant="left" />
      <SilkLantern variant="right" />

      {/* d) Drifting Watercolor Bamboo Leaves */}
      <div className="vf-auth-leaves">
        {BAMBOO_LEAVES.map((leaf) => (
          <span
            key={leaf.id}
            className={`vf-auth-leaf vf-auth-leaf--${leaf.tone} vf-auth-leaf--${leaf.variant}`}
            style={{
              left: leaf.left,
              right: leaf.right,
              width: `${leaf.size}px`,
              animationDuration: leaf.duration,
              animationDelay: leaf.delay,
            }}
          >
            <svg viewBox="0 0 28 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M1 5.4 C7.5 1.1, 18.5 1.0, 27 4.8 C19.2 8.7, 8.2 8.9, 1 5.4 Z"
                fill="currentColor"
              />
              <path
                d="M3.5 5.2 C10.5 4.6, 17.8 4.6, 24.5 4.9"
                stroke="rgba(236, 235, 228, 0.34)"
                strokeWidth="0.65"
                strokeLinecap="round"
              />
            </svg>
          </span>
        ))}
      </div>

      {/* e) Golden Village Fireflies */}
      <div className="vf-auth-fireflies">
        {FIREFLIES.map((fly) => (
          <span
            key={fly.id}
            className={`vf-auth-firefly vf-auth-firefly--${fly.path}`}
            style={{
              left: fly.left,
              top: fly.top,
              animationDuration: fly.drift,
              animationDelay: fly.delay,
            }}
          >
            <span
              className="vf-auth-firefly-dot"
              style={{
                width: `${fly.size}px`,
                height: `${fly.size}px`,
                animationDuration: fly.twinkle,
                animationDelay: fly.delay,
              }}
            />
          </span>
        ))}
      </div>

      {/* f) Twilight Village (Left) & Wood-Chopping Bear (Right) — Desktop >= 1150px */}
      <div className="vf-auth-wing vf-auth-wing--left" data-testid="auth-left-village">
        <div className="vf-auth-village-stage">
          <img
            src={villageSrc}
            alt=""
            className="vf-auth-village-img"
            draggable={false}
            decoding="async"
          />
          <span className="vf-auth-village-glow vf-auth-village-glow--1" />
          <span className="vf-auth-village-glow vf-auth-village-glow--2" />
          <span className="vf-auth-village-glow vf-auth-village-glow--3" />
          <span className="vf-auth-chimney-wisp vf-auth-chimney-wisp--1" />
          <span className="vf-auth-chimney-wisp vf-auth-chimney-wisp--2" />
        </div>
      </div>

      <div className="vf-auth-wing vf-auth-wing--right" data-testid="auth-right-bear">
        <div className="vf-auth-bear-stage" data-testid="auth-woodchop-bear">
          <span className="vf-auth-bear-ground" />
          <span className="vf-auth-bear-shadow" />
          <div className="vf-auth-bear-viewport">
            <img
              src={bearSrc}
              alt=""
              width={BEAR_CHOP_CELL_W * bearFrames}
              height={BEAR_CHOP_CELL_H}
              className="vf-auth-bear-sheet"
              draggable={false}
              decoding="async"
            />
          </div>
          <span className="vf-auth-woodchip vf-auth-woodchip--1" />
          <span className="vf-auth-woodchip vf-auth-woodchip--2" />
          <span className="vf-auth-woodchip vf-auth-woodchip--3" />
        </div>
      </div>

      {/* g) Soft Swaying Grass Horizon + Playful Dog & Cat Chase Sprite Cameo */}
      <div className="vf-auth-meadow">
        <GrassStrip className="vf-auth-grass-layer--back" />
        <GrassStrip className="vf-auth-grass-layer--front" />
      </div>

      <div className="vf-auth-chase-stage">
        <div className="vf-auth-chase-track">
          <div className="vf-auth-chase-flip">
            {/* Chasing dog (behind) */}
            <div className="vf-auth-chase-actor vf-auth-chase-actor--dog">
              <span className="vf-auth-chase-shadow" />
              <span className="vf-auth-chase-dust vf-auth-chase-dust--1" />
              <span className="vf-auth-chase-dust vf-auth-chase-dust--2" />
              <div className="vf-auth-chase-viewport vf-auth-chase-viewport--dog">
                <img
                  src={dogSrc}
                  alt=""
                  width={CHASE_DOG_CELL_W * dogFrames}
                  height={CHASE_CELL_H}
                  className="vf-auth-chase-sheet vf-auth-chase-sheet--dog"
                  draggable={false}
                  decoding="async"
                />
              </div>
            </div>

            {/* Playfully fleeing cat (ahead) */}
            <div className="vf-auth-chase-actor vf-auth-chase-actor--cat">
              <span className="vf-auth-chase-shadow vf-auth-chase-shadow--cat" />
              <span className="vf-auth-chase-dust vf-auth-chase-dust--1" />
              <div className="vf-auth-chase-viewport vf-auth-chase-viewport--cat">
                <img
                  src={catSrc}
                  alt=""
                  width={CHASE_CAT_CELL_W * catFrames}
                  height={CHASE_CELL_H}
                  className="vf-auth-chase-sheet vf-auth-chase-sheet--cat"
                  draggable={false}
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
