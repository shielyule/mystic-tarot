import { useMemo } from "react";
import type { Transition } from "framer-motion";

/** Scale-only motion; CSS (`hal-lens-glow-pulse`, `hal-lens-core-pulse`) owns breathing. */
export type HalLensMotionProps = {
  animate: { scale: number | number[] };
  transition: Transition;
  onAnimationComplete?: () => void;
};

/** Visual lens holder — no speech coupling (voice archived under `_archived/hal-voice`). */
export function useHalLensPulse(): HalLensMotionProps {
  return useMemo(
    () => ({
      animate: { scale: 1 },
      transition: { duration: 0.45, ease: "easeOut" },
    }),
    [],
  );
}
