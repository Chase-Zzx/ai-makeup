'use client';

import { useRef, useState } from 'react';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';

const features = [
  {
    step: '01',
    title: 'Upload a selfie',
    desc: 'Take a photo or pick from your gallery. Our AI detects your facial features, skin tone and face shape instantly.',
    points: ['Works in any lighting', 'Auto face detection', 'Privacy-first — nothing stored'],
    accent: '#b8908f',
  },
  {
    step: '02',
    title: '8 looks, generated for you',
    desc: 'AI analyzes your unique features and creates 8 distinct makeup styles — from everyday natural to full evening glam.',
    points: ['Personalized to your face', 'Natural to dramatic range', 'Ready in under 30 seconds'],
    accent: '#c9a0a0',
  },
  {
    step: '03',
    title: 'Fine-tune every detail',
    desc: 'Pick your favourite and adjust lips, eyes, blush and contour with real-time preview. Make it truly yours.',
    points: ['Real-time CSS filter preview', 'Individual color pickers', 'Before / after comparison'],
    accent: '#d4b5b4',
  },
  {
    step: '04',
    title: 'Download & share',
    desc: 'Export your perfected look in high resolution. Send it to your makeup artist or share it with friends.',
    points: ['High-res PNG export', 'One-click share', 'Save to your collection'],
    accent: '#956b6a',
  },
];

/* ---- Mockup illustrations ---- */

function MockUpload() {
  return (
    <div className="card p-6 w-full max-w-sm mx-auto glow-border">
      <div className="border-2 border-dashed border-accent/20 rounded-2xl py-14 flex flex-col items-center gap-3 relative overflow-hidden">
        {/* Scanning line */}
        <motion.div
          className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent"
          animate={{ y: [-20, 180, -20] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#b8908f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </motion.div>
        <p className="text-sm text-fg-secondary font-medium">Drop image or click to browse</p>
        <p className="text-xs text-fg-muted">JPEG, PNG, WebP · up to 10 MB</p>
      </div>
      <motion.div
        className="mt-4 flex items-center gap-2 text-xs text-green-600 font-medium"
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: 4, repeat: Infinity, times: [0, 0.2, 0.8, 1] }}
      >
        <motion.div
          className="w-2 h-2 rounded-full bg-green-500"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        Face detected — 98% confidence
      </motion.div>
    </div>
  );
}

function MockGenerate() {
  const palettes = [
    ['#F5CBA7','#E8A87C'], ['#474787','#706FD3'], ['#D4A843','#B8860B'],
    ['#C0392B','#FF6B6B'], ['#F8B4C8','#D4878A'], ['#CD853F','#DAA520'],
  ];
  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-sm mx-auto">
      {palettes.map(([a, b], i) => (
        <motion.div
          key={i}
          className="rounded-2xl overflow-hidden border border-black/[0.05] shadow-sm"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            delay: i * 0.1,
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1] as const,
          }}
          whileHover={{ scale: 1.05, y: -4 }}
        >
          <motion.div
            className="aspect-[3/4]"
            style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}
            animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
            transition={{ duration: 6 + i, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      ))}
    </div>
  );
}

function MockFinetune() {
  const bars = [
    { label: 'Lips', pct: 65, color: '#c0686a' },
    { label: 'Eyes', pct: 42, color: '#8a7560' },
    { label: 'Blush', pct: 55, color: '#d4a0a0' },
    { label: 'Contour', pct: 38, color: '#8a7a6e' },
  ];
  return (
    <div className="card p-6 w-full max-w-sm mx-auto space-y-5">
      {bars.map((b, i) => (
        <div key={b.label}>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-fg-secondary font-medium">{b.label}</span>
            <motion.span
              className="text-fg-muted tabular-nums"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
            >
              {b.pct}%
            </motion.span>
          </div>
          <div className="h-2 rounded-full bg-bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full relative overflow-hidden"
              style={{ backgroundColor: b.color }}
              initial={{ width: 0 }}
              animate={{ width: `${b.pct}%` }}
              transition={{ duration: 1.2, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] as const }}
            >
              {/* shimmer on the bar */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 + i * 0.3 }}
              />
            </motion.div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MockExport() {
  return (
    <div className="card p-8 w-full max-w-sm mx-auto text-center">
      <motion.div
        className="w-20 h-20 mx-auto rounded-2xl bg-accent-bg flex items-center justify-center mb-5 relative"
        animate={{ boxShadow: ['0 0 0 0 rgba(184,144,143,0)', '0 0 0 12px rgba(184,144,143,0.1)', '0 0 0 0 rgba(184,144,143,0)'] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <motion.svg
          width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#956b6a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1, scale: [0.8, 1.1, 1] }}
          transition={{ duration: 0.8 }}
        >
          <path d="M20 6L9 17l-5-5"/>
        </motion.svg>
      </motion.div>
      <p className="text-sm font-semibold mb-1">Your look is ready</p>
      <p className="text-xs text-fg-muted mb-6">High-resolution PNG</p>
      <div className="flex gap-2 justify-center">
        <motion.span
          className="btn-primary text-xs px-5 py-2.5"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Download
        </motion.span>
        <span className="btn-secondary text-xs px-5 py-2.5">Share</span>
      </div>
    </div>
  );
}

const mocks = [MockUpload, MockGenerate, MockFinetune, MockExport];

/* ---- Sparkle dots floating around ---- */
function Sparkles() {
  const dots = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: `${5 + (i * 37) % 90}%`,
    top: `${8 + (i * 53) % 84}%`,
    size: 2 + (i % 3) * 1.5,
    delay: i * 0.7,
    dur: 3 + (i % 4) * 1.5,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {dots.map((d) => (
        <motion.div
          key={d.id}
          className="absolute rounded-full bg-accent/40"
          style={{ left: d.left, top: d.top, width: d.size, height: d.size }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: d.dur,
            repeat: Infinity,
            delay: d.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

/* ---- Animated decorative curves ---- */
function DecorativeCurves({ active }: { active: number }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 1440 900"
      fill="none"
      preserveAspectRatio="none"
    >
      <motion.path
        d="M-100,450 Q360,200 720,450 T1540,450"
        stroke="rgba(184,144,143,0.08)"
        strokeWidth="1"
        fill="none"
        animate={{ d: active % 2 === 0
          ? 'M-100,450 Q360,200 720,450 T1540,450'
          : 'M-100,450 Q360,700 720,450 T1540,450'
        }}
        transition={{ duration: 2, ease: 'easeInOut' }}
      />
      <motion.path
        d="M-100,300 Q480,500 720,300 T1540,300"
        stroke="rgba(184,144,143,0.06)"
        strokeWidth="1"
        fill="none"
        animate={{ d: active < 2
          ? 'M-100,300 Q480,500 720,300 T1540,300'
          : 'M-100,600 Q480,400 720,600 T1540,600'
        }}
        transition={{ duration: 2.5, ease: 'easeInOut' }}
      />
      <motion.circle
        cx="720" cy="450" r="250"
        stroke="rgba(184,144,143,0.04)"
        strokeWidth="1"
        fill="none"
        animate={{ r: [250, 280, 250], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
    </svg>
  );
}

export default function StickyShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setActive(Math.min(Math.floor(v * features.length), features.length - 1));
  });

  return (
    <div ref={ref} style={{ height: `${features.length * 100}vh` }} className="relative">
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        {/* Animated mesh background */}
        <div className="absolute inset-0 mesh-bg" />

        {/* Dot grid overlay */}
        <motion.div
          className="absolute inset-0 dot-grid"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Multiple accent orbs */}
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full pointer-events-none blur-[150px]"
          animate={{
            backgroundColor: features[active].accent,
            opacity: 0.12,
            x: active % 2 === 0 ? '55%' : '15%',
            y: active < 2 ? '10%' : '55%',
          }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full pointer-events-none blur-[120px]"
          animate={{
            backgroundColor: features[(active + 2) % 4].accent,
            opacity: 0.07,
            x: active % 2 === 0 ? '10%' : '65%',
            y: active < 2 ? '60%' : '10%',
          }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[300px] h-[300px] rounded-full pointer-events-none blur-[100px]"
          animate={{
            backgroundColor: '#d4b5b4',
            opacity: 0.06,
            x: '40%',
            y: ['30%', '50%', '30%'],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Decorative animated curves */}
        <DecorativeCurves active={active} />

        {/* Floating sparkles */}
        <Sparkles />

        {/* Top & bottom section fade for smooth blend */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#faf9f6] to-transparent z-[1]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#faf9f6] to-transparent z-[1]" />

        {/* Animated horizontal line that slides across */}
        <motion.div
          className="absolute h-px w-[200px] bg-gradient-to-r from-transparent via-accent/30 to-transparent pointer-events-none"
          animate={{ x: ['-200px', 'calc(100vw + 200px)'] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
          style={{ top: '25%' }}
        />
        <motion.div
          className="absolute h-px w-[150px] bg-gradient-to-r from-transparent via-accent/20 to-transparent pointer-events-none"
          animate={{ x: ['calc(100vw + 150px)', '-150px'] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear', repeatDelay: 3 }}
          style={{ top: '75%' }}
        />

        <div className="w-full max-w-6xl mx-auto px-6 lg:px-12 relative z-[2]">
          {/* Section label */}
          <motion.p
            className="text-center text-xs text-fg-muted tracking-[0.2em] uppercase mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            How it works
          </motion.p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Left — text */}
            <div className="relative min-h-[280px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 30, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -20, filter: 'blur(4px)' }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
                >
                  {/* Step number with animated underline */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-mono text-fg-muted tracking-widest">STEP {features[active].step}</span>
                    <motion.div
                      className="h-px bg-accent/40 flex-1 origin-left"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    />
                  </div>

                  <h3 className="text-3xl md:text-[2.8rem] font-semibold leading-tight tracking-[-0.03em] mb-5">
                    {features[active].title}
                  </h3>
                  <p className="text-fg-secondary leading-relaxed mb-7 max-w-md text-[15px]">{features[active].desc}</p>
                  <ul className="space-y-3">
                    {features[active].points.map((p, pi) => (
                      <motion.li
                        key={p}
                        className="flex items-center gap-3 text-sm text-fg-secondary"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + pi * 0.1 }}
                      >
                        <motion.div
                          className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.4 + pi * 0.1, type: 'spring', stiffness: 400 }}
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#b8908f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                        </motion.div>
                        {p}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right — mockup */}
            <div className="relative min-h-[400px] flex items-center">
              <AnimatePresence mode="wait">
                {mocks.map((M, i) =>
                  i === active ? (
                    <motion.div
                      key={i}
                      className="absolute inset-0 flex items-center justify-center"
                      initial={{ opacity: 0, scale: 0.9, rotateY: 8 }}
                      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                      exit={{ opacity: 0, scale: 0.9, rotateY: -8 }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
                    >
                      <M />
                    </motion.div>
                  ) : null
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Progress indicator — vertical pills */}
          <div className="hidden lg:flex flex-col gap-3 fixed right-8 top-1/2 -translate-y-1/2 z-30">
            {features.map((f, i) => (
              <motion.div
                key={i}
                className="relative cursor-pointer group"
                onClick={() => {
                  /* scroll to step */
                  if (ref.current) {
                    const h = ref.current.offsetHeight;
                    const top = ref.current.offsetTop + (i / features.length) * h;
                    window.scrollTo({ top, behavior: 'smooth' });
                  }
                }}
              >
                <motion.div
                  className="w-2 rounded-full"
                  animate={{
                    height: i === active ? 28 : 8,
                    backgroundColor: i === active ? f.accent : 'rgba(0,0,0,0.1)',
                  }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
                />
                {i === active && (
                  <motion.div
                    className="absolute -left-1 -top-1 w-4 rounded-full"
                    style={{ height: 30, backgroundColor: f.accent }}
                    animate={{ opacity: [0.3, 0.1, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    layoutId="dot-glow"
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
