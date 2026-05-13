/**
 * Shared animation variants for Motion (motion.dev).
 * Use with motion components: initial/animate/exit and variants.
 */

export const defaultTransition = {
  duration: 0.3,
  ease: [0.25, 0.1, 0.25, 1] as const,
};

/** Fade in (opacity only) */
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

/** Fade in + move up (good for modals, cards) */
export const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

/** Scale in (good for popovers, tooltips) */
export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
};

/** Stagger container: delays children so they animate one after another */
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    transition: { staggerChildren: 0.03, staggerDirection: -1 },
  },
};

/** Single item used inside a stagger container */
export const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
};

/** Slide in from left (e.g. drawer) */
export const slideInLeft = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -16 },
};

/** Slide in from right */
export const slideInRight = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 16 },
};
