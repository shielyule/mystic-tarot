const STORAGE_KEY = "discovery-one:hal-voice";

export type HalVoiceSettings = {
  rate: number;
  pitch: number;
  volume: number;
  pauseBetweenMs: number;
  /** `null` = auto-pick a calm English voice */
  voiceURI: string | null;
  greetingDelayMs: number;
  autoSpeakGreeting: boolean;
};

const defaults: HalVoiceSettings = {
  rate: 0.72,
  pitch: 0.84,
  volume: 1,
  pauseBetweenMs: 1100,
  voiceURI: null,
  greetingDelayMs: 3000,
  autoSpeakGreeting: true,
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function getHalVoiceSettings(): HalVoiceSettings {
  if (typeof window === "undefined") {
    return { ...defaults };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaults };
    const p = JSON.parse(raw) as Partial<HalVoiceSettings>;
    return {
      rate: clamp(Number(p.rate) || defaults.rate, 0.4, 1.2),
      pitch: clamp(Number(p.pitch) || defaults.pitch, 0.5, 1.5),
      volume: clamp(Number(p.volume) ?? defaults.volume, 0.2, 1),
      pauseBetweenMs: clamp(
        Number(p.pauseBetweenMs) || defaults.pauseBetweenMs,
        300,
        4000,
      ),
      voiceURI:
        typeof p.voiceURI === "string" && p.voiceURI.length > 0
          ? p.voiceURI
          : p.voiceURI === "" || p.voiceURI === null
            ? null
            : defaults.voiceURI,
      greetingDelayMs: clamp(
        Number(p.greetingDelayMs) || defaults.greetingDelayMs,
        0,
        20000,
      ),
      autoSpeakGreeting:
        typeof p.autoSpeakGreeting === "boolean"
          ? p.autoSpeakGreeting
          : defaults.autoSpeakGreeting,
    };
  } catch {
    return { ...defaults };
  }
}

export function setHalVoiceSettings(patch: Partial<HalVoiceSettings>): HalVoiceSettings {
  const next = { ...getHalVoiceSettings(), ...patch };
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("hal-voice-settings-changed"));
  }
  return next;
}

export function resetHalVoiceSettings(): HalVoiceSettings {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event("hal-voice-settings-changed"));
  }
  return { ...defaults };
}
