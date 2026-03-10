'use client';

import { useEffect, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { ISourceOptions } from '@tsparticles/engine';

const particleOptions: ISourceOptions = {
  fullScreen: false,
  fpsLimit: 60,
  particles: {
    color: {
      value: ['#D4A843', '#B76E79'],
    },
    move: {
      enable: true,
      speed: 0.4,
      direction: 'none',
      random: true,
      straight: false,
      outModes: { default: 'out' },
    },
    number: {
      value: 45,
      density: {
        enable: true,
      },
    },
    opacity: {
      value: { min: 0.2, max: 0.5 },
      animation: {
        enable: true,
        speed: 0.3,
        sync: false,
      },
    },
    size: {
      value: { min: 2, max: 4 },
    },
    shape: {
      type: 'circle',
    },
    links: {
      enable: false,
    },
  },
  interactivity: {
    events: {
      onHover: {
        enable: true,
        mode: 'repulse',
      },
    },
    modes: {
      repulse: {
        distance: 100,
        duration: 0.4,
      },
    },
  },
  detectRetina: true,
};

export default function ParticleBackground() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setReady(true));
  }, []);

  if (!ready) return null;

  return (
    <div className="absolute inset-0 z-0">
      <Particles
        id="hero-particles"
        options={particleOptions}
        className="h-full w-full"
      />
    </div>
  );
}
