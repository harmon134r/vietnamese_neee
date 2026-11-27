import React from "react";
import { APP_ART } from "../../data/illustrations";

/**
 * Purely decorative animated trio (duckling, terrier puppy, and kid carrying veggies)
 * patrolling left <-> right continuously along the bottom of the viewport.
 */
export default function BottomRunner() {
  return (
    <div className="vf-runner-stage" aria-hidden="true">
      <div className="vf-runner-track">
        <div className="vf-runner-flip">
          <img
            src={APP_ART.runnerTrio.src}
            alt=""
            className="vf-runner-sprite"
            draggable={false}
            decoding="async"
          />
        </div>
      </div>
    </div>
  );
}
