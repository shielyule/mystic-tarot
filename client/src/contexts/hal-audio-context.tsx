import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getAudioEnabled, setAudioEnabled } from "@/lib/audio-enabled";
import { isHalTtsPlaying, speakHalText, stopHalTts, type HalTtsSpeakResult } from "@/lib/hal-tts";

type HalAudioContextValue = {
  enabled: boolean;
  playing: boolean;
  toggleEnabled: () => void;
  setEnabled: (enabled: boolean) => void;
  stop: () => void;
  speak: (text: string) => Promise<HalTtsSpeakResult>;
};

const HalAudioContext = createContext<HalAudioContextValue | null>(null);

export function HalAudioProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabledState] = useState(() => getAudioEnabled());
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => {
      setPlaying(isHalTtsPlaying());
    }, 200);
    return () => window.clearInterval(id);
  }, []);

  const setEnabled = useCallback((next: boolean) => {
    setEnabledState(next);
    setAudioEnabled(next);
    if (!next) {
      stopHalTts();
      setPlaying(false);
    }
  }, []);

  const toggleEnabled = useCallback(() => {
    setEnabled(!enabled);
  }, [enabled, setEnabled]);

  const stop = useCallback(() => {
    stopHalTts();
    setPlaying(false);
  }, []);

  const speak = useCallback(
    async (text: string): Promise<HalTtsSpeakResult> => {
      if (!enabled) {
        return { ok: false, reason: "empty", message: "Audio output is muted." };
      }
      const result = await speakHalText(text);
      setPlaying(isHalTtsPlaying());
      return result;
    },
    [enabled],
  );

  const value = useMemo(
    () => ({ enabled, playing, toggleEnabled, setEnabled, stop, speak }),
    [enabled, playing, toggleEnabled, setEnabled, stop, speak],
  );

  return <HalAudioContext.Provider value={value}>{children}</HalAudioContext.Provider>;
}

export function useHalAudio(): HalAudioContextValue {
  const ctx = useContext(HalAudioContext);
  if (!ctx) {
    throw new Error("useHalAudio must be used within HalAudioProvider");
  }
  return ctx;
}
