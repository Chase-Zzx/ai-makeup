'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/stores/appStore';

const steps = [
  { key: 'upload', label: 'Upload' },
  { key: 'generate', label: 'Generate' },
  { key: 'finetune', label: 'Fine-tune' },
] as const;

function getStepIndex(step: string): number {
  return steps.findIndex((s) => s.key === step);
}

export default function StepIndicator() {
  const currentStep = useAppStore((s) => s.currentStep);
  const activeIndex = getStepIndex(currentStep);

  if (currentStep === 'landing') return null;

  return (
    <div className="flex items-center justify-center gap-1">
      {steps.map((step, index) => {
        const isActive = index === activeIndex;
        const isCompleted = index < activeIndex;

        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div
                  className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                    isActive
                      ? 'bg-fg'
                      : isCompleted
                        ? 'bg-fg/50'
                        : 'bg-black/[0.12]'
                  }`}
                />
                {isActive && (
                  <motion.div
                    layoutId="step-indicator"
                    className="absolute inset-0 w-3 h-3 rounded-full bg-fg"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 w-3 h-3 rounded-full bg-fg/40"
                    animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </div>
              {isActive && (
                <motion.span
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[10px] text-fg mt-1 font-medium whitespace-nowrap"
                >
                  {step.label}
                </motion.span>
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-8 h-px mx-1 ${
                  index < activeIndex ? 'bg-fg/30' : 'bg-black/[0.08]'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
