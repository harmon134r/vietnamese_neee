import React from "react";
import { APP_ART } from "../../data/illustrations";

/**
 * Purely decorative swaying watercolor bamboo groves and softly wind-drifting
 * upper watercolor clouds anchored along the far left and far right empty
 * desktop margins. Zero pointer interference.
 */
export default function BambooFrame() {
  return (
    <div className="vf-bamboo-frame" aria-hidden="true">
      <img
        src={APP_ART.cloudLeft.src}
        alt=""
        className="vf-cloud vf-cloud--left"
        draggable={false}
        decoding="async"
      />
      <img
        src={APP_ART.cloudRight.src}
        alt=""
        className="vf-cloud vf-cloud--right"
        draggable={false}
        decoding="async"
      />

      <div className="vf-bamboo-side vf-bamboo-side--left">
        <img
          src={APP_ART.bambooRight.src}
          alt=""
          className="vf-bamboo-stalk vf-bamboo-stalk--left-back"
          draggable={false}
          decoding="async"
        />
        <img
          src={APP_ART.bambooLeft.src}
          alt=""
          className="vf-bamboo-stalk vf-bamboo-stalk--left-front"
          draggable={false}
          decoding="async"
        />
      </div>

      <div className="vf-bamboo-side vf-bamboo-side--right">
        <img
          src={APP_ART.bambooLeft.src}
          alt=""
          className="vf-bamboo-stalk vf-bamboo-stalk--right-back"
          draggable={false}
          decoding="async"
        />
        <img
          src={APP_ART.bambooRight.src}
          alt=""
          className="vf-bamboo-stalk vf-bamboo-stalk--right-front"
          draggable={false}
          decoding="async"
        />
      </div>
    </div>
  );
}
