'use client';

import type { ReactNode } from 'react';

interface AdjustmentSliderProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  icon?: ReactNode;
}

export default function AdjustmentSlider({ label, value, onChange, icon }: AdjustmentSliderProps) {
  return (
    <div className="rounded-xl p-3 hover:bg-bg-muted transition-colors">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-fg-secondary flex items-center gap-2">{icon}{label}</span>
        <span className="text-sm text-fg-muted tabular-nums font-medium">{value}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
