'use client';

interface GlowOrbProps {
  color: string;
  size?: number;
  className?: string;
  animate?: boolean;
}

export default function GlowOrb({
  color,
  size = 400,
  className = '',
  animate = false,
}: GlowOrbProps) {
  return (
    <div
      className={`absolute rounded-full blur-3xl pointer-events-none ${animate ? 'glow-pulse' : ''} ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        opacity: 0.15,
      }}
    />
  );
}
