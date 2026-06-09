import { getHalVoiceSettings } from "./hal-voice-settings";

/** Dispatched on `window` while HAL speech runs so the lens UI can pulse with words. */
export const HAL_LENS_SPEECH_EVENT = "hal-lens-speech" as const;

export type HalLensSpeechDetail =
  | { kind: "session-start" }
  | { kind: "session-end" }
  | { kind: "utterance-start" }
  | { kind: "utterance-end" }
  | { kind: "boundary"; charIndex: number; charLength: number };

function dispatchHalLens(detail: HalLensSpeechDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(HAL_LENS_SPEECH_EVENT, { detail }));
}

/** Single source of truth for the spoken greeting (also used by Voice lab default test line). */
export const HAL_GREETING_LINES = [
  "Hello friend, how are you today?",
  "The world did not end over night and we have another fine day",
  "What is your name",
  "If you can tell me your name I can open the pod bay doors and let you in",

] as const;

let scheduledGreetingTimeout: number | null = null;
let greetingPlayGeneration = 0;

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const list = () => speechSynthesis.getVoices();
    const voices = list();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }
    const onVoices = () => {
      speechSynthesis.removeEventListener("voiceschanged", onVoices);
      resolve(list());
    };
    speechSynthesis.addEventListener("voiceschanged", onVoices);
  });
}

function pickHalVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const score = (v: SpeechSynthesisVoice) => {
    const s = `${v.name} ${v.lang}`.toLowerCase();
    let n = 0;
    if (s.includes("daniel")) n += 5;
    if (s.includes("uk") && s.includes("en")) n += 4;
    if (s.includes("british")) n += 3;
    if (s.includes("male") && s.includes("en-gb")) n += 3;
    if (s.includes("en-gb")) n += 2;
    if (s.includes("english") && s.includes("united kingdom")) n += 2;
    if (s.startsWith("en")) n += 1;
    return n;
  };
  const sorted = [...voices].sort((a, b) => score(b) - score(a));
  return sorted[0] ?? null;
}

function resolveVoice(
  voices: SpeechSynthesisVoice[],
  voiceURI: string | null,
): SpeechSynthesisVoice | null {
  if (voiceURI) {
    const chosen = voices.find((v) => v.voiceURI === voiceURI);
    if (chosen) return chosen;
  }
  return pickHalVoice(voices);
}

function speakLine(
  text: string,
  voice: SpeechSynthesisVoice | null,
  rate: number,
  pitch: number,
  volume: number,
): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      resolve();
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.rate = rate;
    u.pitch = pitch;
    u.volume = volume;
    if (voice) u.voice = voice;
    u.onstart = () => {
      dispatchHalLens({ kind: "utterance-start" });
    };
    u.onboundary = (ev: SpeechSynthesisEvent) => {
      dispatchHalLens({
        kind: "boundary",
        charIndex: ev.charIndex,
        charLength: ev.charLength,
      });
    };
    const finish = () => {
      dispatchHalLens({ kind: "utterance-end" });
      resolve();
    };
    u.onend = finish;
    u.onerror = finish;
    speechSynthesis.speak(u);
  });
}

export async function playTestUtterance(text: string): Promise<void> {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  greetingPlayGeneration++;
  speechSynthesis.cancel();
  try {
    const s = getHalVoiceSettings();
    const voices = await loadVoices();
    const voice = resolveVoice(voices, s.voiceURI);
    dispatchHalLens({ kind: "session-start" });
    await speakLine(text.trim() || "Testing.", voice, s.rate, s.pitch, s.volume);
  } finally {
    dispatchHalLens({ kind: "session-end" });
  }
}

export async function playHalGreeting(): Promise<void> {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  greetingPlayGeneration++;
  const runId = greetingPlayGeneration;
  speechSynthesis.cancel();

  const s = getHalVoiceSettings();
  const voices = await loadVoices();
  if (runId !== greetingPlayGeneration) return;

  const voice = resolveVoice(voices, s.voiceURI);

  dispatchHalLens({ kind: "session-start" });
  try {
    for (let i = 0; i < HAL_GREETING_LINES.length; i++) {
      if (runId !== greetingPlayGeneration) return;
      const line = HAL_GREETING_LINES[i];
      await speakLine(line, voice, s.rate, s.pitch, s.volume);
      if (i < HAL_GREETING_LINES.length - 1) {
        if (runId !== greetingPlayGeneration) return;
        await delay(s.pauseBetweenMs);
      }
    }
  } finally {
    dispatchHalLens({ kind: "session-end" });
  }
}

export function stopHalSpeech(): void {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    greetingPlayGeneration++;
    speechSynthesis.cancel();
    dispatchHalLens({ kind: "session-end" });
  }
}

export function scheduleHalGreeting(options: { signal: AbortSignal }): void {
  const { signal } = options;

  if (scheduledGreetingTimeout !== null) {
    window.clearTimeout(scheduledGreetingTimeout);
    scheduledGreetingTimeout = null;
  }

  const start = () => {
    scheduledGreetingTimeout = null;
    if (signal.aborted) return;
    if (!getHalVoiceSettings().autoSpeakGreeting) return;
    void playHalGreeting();
  };

  const delayMs = getHalVoiceSettings().greetingDelayMs;
  scheduledGreetingTimeout = window.setTimeout(start, delayMs);

  signal.addEventListener(
    "abort",
    () => {
      if (scheduledGreetingTimeout !== null) {
        window.clearTimeout(scheduledGreetingTimeout);
        scheduledGreetingTimeout = null;
      }
      stopHalSpeech();
    },
    { once: true },
  );
}
