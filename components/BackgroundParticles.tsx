"use client";

import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import type { Engine } from "tsparticles-engine";

export default function BackgroundParticles() {
  const particlesInit = async (engine: Engine) => {
    await loadSlim(engine);
  };

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: { enable: true, zIndex: -1 },
        background: { color: "transparent" },
        particles: {
          number: { value: 70 },
          color: { value: "#ffffff" },
          opacity: { value: 0.15 },
          size: { value: 2 },
          move: {
            enable: true,
            speed: 0.6,
          },
          links: {
            enable: true,
            distance: 140,
            color: "#8b5cf6",
            opacity: 0.2,
          },
        },
      }}
    />
  );
}