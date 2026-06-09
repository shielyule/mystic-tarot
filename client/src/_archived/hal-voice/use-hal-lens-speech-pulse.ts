import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Transition } from "framer-motion";
import { HAL_LENS_SPEECH_EVENT, type HalLensSpeechDetail } from "./hal-greeting";

/** Scale-only motion so CSS (`hal-lens-glow-pulse`) owns glow / variable-duration breathing. */
export type HalLensMotionProps = {
  animate: {
    scale: number | number[];
  };
  transition: Transition;
  onAnimationComplete?: () => void;
};

/**
 * Listens to HAL speech events and returns Framer Motion props so the lens can
 * nudge on word boundaries (when the browser fires `boundary`) with a softer
 * fallback rhythm when boundaries are missing.
 */
export function useHalLensSpeechPulse(): HalLensMotionProps {
  const [speechSession, setSpeechSession] = useState(false);
  const [utteranceActive, setUtteranceActive] = useState(false);
  const [wordPulse, setWordPulse] = useState<{ peak: number; duration: number } | null>(null);

  const fallbackRef = useRef<number | null>(null);
  const boundarySeenRef = useRef(false);
  const utteranceActiveRef = useRef(false);

  const clearFallback = useCallback(() => {
    if (fallbackRef.current !== null) {
      window.clearInterval(fallbackRef.current);
      fallbackRef.current = null;
    }
  }, []);

  const scheduleFallback = useCallback(() => {
    clearFallback();
    fallbackRef.current = window.setInterval(() => {
      const w = 3 + Math.floor(Math.random() * 10);
      const peak = Math.min(1.16, 1.05 + w * 0.008);
      const duration = Math.min(0.72, 0.24 + w * 0.038);
      setWordPulse({ peak, duration });
    }, 380 + Math.floor(Math.random() * 220));
  }, [clearFallback]);

  useEffect(() => {
    const onSpeech = (e: Event) => {
      const detail = (e as CustomEvent<HalLensSpeechDetail>).detail;

      switch (detail.kind) {
        case "session-start":
          setSpeechSession(true);
          break;
        case "session-end":
          clearFallback();
          boundarySeenRef.current = false;
          utteranceActiveRef.current = false;
          setSpeechSession(false);
          setUtteranceActive(false);
          setWordPulse(null);
          break;
        case "utterance-start":
          boundarySeenRef.current = false;
          utteranceActiveRef.current = true;
          setUtteranceActive(true);
          window.setTimeout(() => {
            if (!boundarySeenRef.current && utteranceActiveRef.current) {
              scheduleFallback();
            }
          }, 500);
          break;
        case "boundary":
          boundarySeenRef.current = true;
          clearFallback();
          {
            const len = Math.max(1, detail.charLength);
            const peak = Math.min(1.24, 1.06 + len * 0.012);
            const duration = Math.min(1, 0.14 + len * 0.048);
            setWordPulse({ peak, duration });
          }
          break;
        case "utterance-end":
          clearFallback();
          utteranceActiveRef.current = false;
          setUtteranceActive(false);
          setWordPulse(null);
          break;
        default:
          break;
      }
    };

    window.addEventListener(HAL_LENS_SPEECH_EVENT, onSpeech as EventListener);
    return () => window.removeEventListener(HAL_LENS_SPEECH_EVENT, onSpeech as EventListener);
  }, [clearFallback, scheduleFallback]);

  return useMemo((): HalLensMotionProps => {
    if (wordPulse) {
      return {
        animate: {
          scale: [1, wordPulse.peak, 1],
        },
        transition: {
          duration: wordPulse.duration,
          times: [0, 0.38, 1],
          ease: "easeInOut",
        },
        onAnimationComplete: () => {
          setWordPulse(null);
        },
      };
    }

    if (utteranceActive || speechSession) {
      return {
        animate: { scale: 1 },
        transition: { duration: 0.35, ease: "easeOut" },
      };
    }

    return {
      animate: { scale: 1 },
      transition: { duration: 0.45, ease: "easeOut" },
    };
  }, [wordPulse, utteranceActive, speechSession]);
}
