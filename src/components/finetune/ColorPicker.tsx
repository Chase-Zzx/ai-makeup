'use client';

import { motion } from 'framer-motion';

interface ColorPickerProps {
  colors: { name: string; value: string }[];
  selectedColor: string;
  onChange: (color: string) => void;
  label: string;
}

export default function ColorPicker({ colors, selectedColor, onChange, label }: ColorPickerProps) {
  return (
    <div>
      <p className="text-sm text-fg-secondary mb-3">{label}</p>
      <div className="flex gap-3 flex-wrap">
        {colors.map((color) => (
          <motion.button
            key={color.value}
            type="button"
            title={color.name}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(color.value)}
            className={`w-8 h-8 rounded-full cursor-pointer transition-all duration-200 ${
              selectedColor === color.value
                ? 'ring-2 ring-[#1a1a1a] ring-offset-2 ring-offset-[#faf9f6] scale-110'
                : 'opacity-80 hover:opacity-100 hover:scale-110'
            }`}
            style={{ backgroundColor: color.value }}
          />
        ))}
      </div>
    </div>
  );
}
