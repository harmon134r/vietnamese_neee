import React from "react";
import { APP_ART } from "../../data/illustrations";

const CELL_WIDTH = 360;
const CELL_HEIGHT = 240;

/**
 * Purely decorative animated trio (duckling, terrier puppy, and kid carrying veggies)
 * patrolling slowly left <-> right along the bottom edge with a 4-frame hand-drawn run cycle.
 */
export default function BottomRunner() {
  const { src, frames = 4 } = APP_ART.runnerTrioSheet;

  return (
    <div className="vf-runner-stage" aria-hidden="true">
      <div className="vf-runner-track">
        <div className="vf-runner-flip">
          <span className="vf-runner-shadow" />
          <span className="vf-runner-dust vf-runner-dust--1" />
          <span className="vf-runner-dust vf-runner-dust--2" />
          <div className="vf-runner-viewport">
            <img
              src={src}
              alt=""
              width={CELL_WIDTH * frames}
              height={CELL_HEIGHT}
              className="vf-runner-sheet"
              draggable={false}
              decoding="async"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
