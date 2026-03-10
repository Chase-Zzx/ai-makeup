import type { Variants } from 'framer-motion';

const ease = [0.22, 1, 0.36, 1] as const;

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 100, damping: 20 },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.85, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 200, damping: 25 },
  },
};

export const slideFromRight: Variants = {
  hidden: { x: 80, opacity: 0, filter: 'blur(6px)' },
  visible: {
    x: 0,
    opacity: 1,
    filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
};

export const slideFromLeft: Variants = {
  hidden: { x: -80, opacity: 0, filter: 'blur(6px)' },
  visible: {
    x: 0,
    opacity: 1,
    filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerContainerSlow: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

export const pageTransition = {
  initial: {
    opacity: 0,
    y: 24,
    scale: 0.98,
    filter: 'blur(8px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
    filter: 'blur(8px)',
    transition: { duration: 0.35, ease },
  },
};

export const cardHoverSpring = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 30,
};

export const heroTextStagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

export const heroTextChild: Variants = {
  hidden: { opacity: 0, y: 40, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 100, damping: 20, duration: 0.8 },
  },
};
